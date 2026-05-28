package com.techcommunity.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.techcommunity.common.Result;
import com.techcommunity.dto.response.AiResponseDTO;
import com.techcommunity.entity.AiResponse;
import com.techcommunity.entity.Post;
import com.techcommunity.mapper.AiResponseMapper;
import com.techcommunity.mapper.PostMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiResponseMapper aiResponseMapper;
    private final PostMapper postMapper;

    @GetMapping("/posts/{postId}/response")
    public Result<AiResponseDTO> getResponse(@PathVariable Long postId) {
        AiResponse aiResponse = aiResponseMapper.selectOne(
                new LambdaQueryWrapper<AiResponse>().eq(AiResponse::getPostId, postId)
        );

        if (aiResponse == null) {
            Post post = postMapper.selectById(postId);
            if (post != null && post.getAiRequested() == 1) {
                aiResponse = new AiResponse();
                aiResponse.setPostId(postId);
                aiResponse.setContent(generateMockContent(post));
                aiResponse.setModel("GPT-4");
                aiResponse.setPromptTokens(128);
                aiResponse.setCompletionTokens(256);
                aiResponse.setStatus(1);
                aiResponse.setCreatedAt(LocalDateTime.now());
                aiResponse.setUpdatedAt(LocalDateTime.now());
                aiResponseMapper.insert(aiResponse);
            } else {
                return Result.success(null);
            }
        }

        return Result.success(toDTO(aiResponse));
    }

    @PostMapping("/posts/{postId}/retry")
    public Result<AiResponseDTO> retry(@PathVariable Long postId) {
        Post post = postMapper.selectById(postId);
        if (post == null) {
            return Result.error(404, "帖子不存在");
        }

        aiResponseMapper.delete(
                new LambdaQueryWrapper<AiResponse>().eq(AiResponse::getPostId, postId)
        );

        AiResponse aiResponse = new AiResponse();
        aiResponse.setPostId(postId);
        aiResponse.setContent(generateMockContent(post));
        aiResponse.setModel("GPT-4");
        aiResponse.setPromptTokens(128);
        aiResponse.setCompletionTokens(256);
        aiResponse.setStatus(1);
        aiResponse.setCreatedAt(LocalDateTime.now());
        aiResponse.setUpdatedAt(LocalDateTime.now());
        aiResponseMapper.insert(aiResponse);

        return Result.success(toDTO(aiResponse));
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
