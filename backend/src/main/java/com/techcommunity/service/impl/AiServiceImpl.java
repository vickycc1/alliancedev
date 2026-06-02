package com.techcommunity.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.techcommunity.common.Constants;
import com.techcommunity.config.AiConfig;
import com.techcommunity.dto.response.AiResponseDTO;
import com.techcommunity.entity.AiResponse;
import com.techcommunity.entity.Post;
import com.techcommunity.entity.SystemConfig;
import com.techcommunity.mapper.AiResponseMapper;
import com.techcommunity.mapper.PostMapper;
import com.techcommunity.mapper.SystemConfigMapper;
import com.techcommunity.service.AiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {

    private final AiResponseMapper aiResponseMapper;
    private final PostMapper postMapper;
    private final AiConfig aiConfig;
    private final SystemConfigMapper systemConfigMapper;
    private final ObjectMapper objectMapper;

    @Override
    public AiResponseDTO getResponse(Long postId) {
        AiResponse aiResponse = aiResponseMapper.selectOne(
                new LambdaQueryWrapper<AiResponse>().eq(AiResponse::getPostId, postId)
        );

        if (aiResponse != null && "Mock-AI".equals(aiResponse.getModel())) {
            aiResponseMapper.deleteById(aiResponse.getId());
            aiResponse = null;
        }

        if (aiResponse == null) {
            Post post = postMapper.selectById(postId);
            if (post != null && post.getAiRequested() == 1) {
                aiResponse = callAiApi(post);
            } else {
                return null;
            }
        }

        return toDTO(aiResponse);
    }

    @Override
    public AiResponseDTO generateResponse(Long postId) {
        Post post = postMapper.selectById(postId);
        if (post == null) {
            return null;
        }

        AiResponse existing = aiResponseMapper.selectOne(
                new LambdaQueryWrapper<AiResponse>().eq(AiResponse::getPostId, postId)
        );
        if (existing != null) {
            return toDTO(existing);
        }

        AiResponse aiResponse = callAiApi(post);
        return toDTO(aiResponse);
    }

    @Override
    public AiResponseDTO retryResponse(Long postId) {
        Post post = postMapper.selectById(postId);
        if (post == null) {
            return null;
        }

        aiResponseMapper.delete(
                new LambdaQueryWrapper<AiResponse>().eq(AiResponse::getPostId, postId)
        );

        AiResponse aiResponse = callAiApi(post);
        return toDTO(aiResponse);
    }

    private AiResponse callAiApi(Post post) {
        AiResponse aiResponse = new AiResponse();
        aiResponse.setPostId(post.getId());
        aiResponse.setStatus(Constants.AI_STATUS_GENERATING);
        aiResponse.setCreatedAt(LocalDateTime.now());
        aiResponse.setUpdatedAt(LocalDateTime.now());
        aiResponseMapper.insert(aiResponse);

        String enabledStr = getDbConfig("ai_enabled");
        boolean enabled = "true".equals(enabledStr) || (enabledStr == null && aiConfig.getEnabled() != null && aiConfig.getEnabled());
        if (!enabled) {
            aiResponse.setContent(generateMockContent(post));
            aiResponse.setModel("Mock-AI");
            aiResponse.setPromptTokens(0);
            aiResponse.setCompletionTokens(0);
            aiResponse.setStatus(Constants.AI_STATUS_COMPLETED);
            aiResponse.setUpdatedAt(LocalDateTime.now());
            aiResponseMapper.updateById(aiResponse);
            return aiResponse;
        }

        try {
            String result = doApiCall(post);
            JsonNode responseJson = objectMapper.readTree(result);

            JsonNode choices = responseJson.get("choices");
            String content = "";
            if (choices != null && choices.isArray() && choices.size() > 0) {
                JsonNode message = choices.get(0).get("message");
                if (message != null && message.get("content") != null) {
                    content = message.get("content").asText();
                }
            }

            JsonNode usage = responseJson.get("usage");
            int promptTokens = 0;
            int completionTokens = 0;
            if (usage != null) {
                promptTokens = usage.has("prompt_tokens") ? usage.get("prompt_tokens").asInt() : 0;
                completionTokens = usage.has("completion_tokens") ? usage.get("completion_tokens").asInt() : 0;
            }

            String model = responseJson.has("model") ? responseJson.get("model").asText() : aiConfig.getModel();

            aiResponse.setContent(content);
            aiResponse.setModel(model);
            aiResponse.setPromptTokens(promptTokens);
            aiResponse.setCompletionTokens(completionTokens);
            aiResponse.setStatus(Constants.AI_STATUS_COMPLETED);
            aiResponse.setUpdatedAt(LocalDateTime.now());
            aiResponseMapper.updateById(aiResponse);

            log.info("AI回答生成成功: postId={}, model={}, promptTokens={}, completionTokens={}",
                    post.getId(), model, promptTokens, completionTokens);

        } catch (Exception e) {
            log.error("AI回答生成失败: postId={}, error={}", post.getId(), e.getMessage(), e);
            aiResponse.setStatus(Constants.AI_STATUS_FAILED);
            aiResponse.setErrorMessage(e.getMessage());
            aiResponse.setUpdatedAt(LocalDateTime.now());
            aiResponseMapper.updateById(aiResponse);
        }

        return aiResponse;
    }

    private String doApiCall(Post post) throws Exception {
        String baseUrl = getDbConfigOrDefault("ai_base_url", aiConfig.getBaseUrl());
        if (baseUrl == null || baseUrl.isEmpty()) {
            throw new RuntimeException("AI API base-url 未配置");
        }
        String apiKey = getDbConfigOrDefault("ai_api_key", aiConfig.getApiKey());
        if (apiKey == null || apiKey.isEmpty()) {
            throw new RuntimeException("AI API key 未配置");
        }
        String model = getDbConfigOrDefault("ai_model", aiConfig.getModel());
        if (model == null || model.isEmpty()) {
            model = "gpt-4o-mini";
        }
        int maxTokens = Integer.parseInt(getDbConfigOrDefault("ai_max_tokens", 
                aiConfig.getMaxTokens() != null ? String.valueOf(aiConfig.getMaxTokens()) : "2000"));
        double temperature = Double.parseDouble(getDbConfigOrDefault("ai_temperature",
                aiConfig.getTemperature() != null ? String.valueOf(aiConfig.getTemperature()) : "0.7"));
        int timeout = Integer.parseInt(getDbConfigOrDefault("ai_timeout",
                aiConfig.getTimeout() != null ? String.valueOf(aiConfig.getTimeout()) : "60000"));

        String url = baseUrl.replaceAll("/+$", "") + "/chat/completions";

        String systemPrompt = "你是一个技术社区的专业AI助手。请针对用户发布的技术问题，给出专业、准确、有深度的回答。" +
                "回答应该包含：1) 问题分析 2) 解决方案 3) 补充建议。使用Markdown格式，结构清晰。";

        String userPrompt = "帖子标题：" + post.getTitle() + "\n\n帖子内容：\n" + stripHtml(post.getContent());

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "max_tokens", maxTokens,
                "temperature", temperature
        );

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpURLConnection conn = (HttpURLConnection) URI.create(url).toURL().openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Authorization", "Bearer " + apiKey);
        conn.setDoOutput(true);
        conn.setConnectTimeout(timeout);
        conn.setReadTimeout(timeout);

        try (OutputStream os = conn.getOutputStream()) {
            os.write(jsonBody.getBytes(StandardCharsets.UTF_8));
        }

        int responseCode = conn.getResponseCode();
        BufferedReader reader;
        if (responseCode >= 200 && responseCode < 300) {
            reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
        } else {
            reader = new BufferedReader(new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8));
            StringBuilder errorBody = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                errorBody.append(line);
            }
            reader.close();
            throw new RuntimeException("AI API调用失败, HTTP " + responseCode + ": " + errorBody);
        }

        StringBuilder responseBody = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            responseBody.append(line);
        }
        reader.close();

        return responseBody.toString();
    }

    private String stripHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]*>", "").replaceAll("&nbsp;", " ")
                .replaceAll("&lt;", "<").replaceAll("&gt;", ">")
                .replaceAll("&amp;", "&").trim();
    }

    private String getDbConfig(String key) {
        SystemConfig config = systemConfigMapper.selectOne(
                new LambdaQueryWrapper<SystemConfig>().eq(SystemConfig::getConfigKey, key));
        return config != null ? config.getConfigValue() : null;
    }

    private String getDbConfigOrDefault(String key, String defaultValue) {
        String value = getDbConfig(key);
        return (value != null && !value.isEmpty()) ? value : defaultValue;
    }

    private String generateMockContent(Post post) {
        return "## AI 分析\n\n"
                + "基于帖子 **" + post.getTitle() + "** 的内容，以下是核心要点分析：\n\n"
                + "### 关键要点\n\n"
                + "- 该问题涉及技术领域的核心概念\n"
                + "- 建议从基础原理出发逐步深入\n"
                + "- 可以参考官方文档和社区最佳实践\n\n"
                + "### 补充建议\n\n"
                + "1. 先确认环境配置是否正确\n"
                + "2. 检查版本兼容性问题\n"
                + "3. 查看相关日志和错误信息\n\n"
                + "希望以上分析对您有所帮助！";
    }

    private AiResponseDTO toDTO(AiResponse entity) {
        AiResponseDTO dto = new AiResponseDTO();
        dto.setId(entity.getId());
        dto.setPostId(entity.getPostId());
        dto.setContent(entity.getContent());
        dto.setModel(entity.getModel());
        dto.setPromptTokens(entity.getPromptTokens());
        dto.setCompletionTokens(entity.getCompletionTokens());
        dto.setStatus(entity.getStatus());
        dto.setErrorMessage(entity.getErrorMessage());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
