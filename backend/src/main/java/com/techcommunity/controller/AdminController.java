package com.techcommunity.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.techcommunity.common.Constants;
import com.techcommunity.common.PageResult;
import com.techcommunity.common.Result;
import com.techcommunity.dto.request.ReportHandleRequest;
import com.techcommunity.dto.response.*;
import com.techcommunity.entity.SensitiveWord;
import com.techcommunity.entity.SystemConfig;
import com.techcommunity.mapper.SensitiveWordMapper;
import com.techcommunity.mapper.SystemConfigMapper;
import com.techcommunity.service.AdminService;
import com.techcommunity.service.PostService;
import com.techcommunity.config.AiConfig;
import com.techcommunity.config.CasConfig;
import com.techcommunity.service.ContentFilterService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final PostService postService;
    private final SystemConfigMapper systemConfigMapper;
    private final SensitiveWordMapper sensitiveWordMapper;
    private final AiConfig aiConfig;
    private final CasConfig casConfig;
    private final ContentFilterService contentFilterService;

    @GetMapping("/stats")
    public Result<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = adminService.getDashboardStats();
        return Result.success(stats);
    }

    @GetMapping("/users")
    public Result<PageResult<UserResponse>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        PageResult<UserResponse> result = adminService.getUserList(keyword, status, role, page, size);
        return Result.success(result);
    }

    @GetMapping("/users/{id}")
    public Result<UserResponse> getUserDetail(@PathVariable Long id) {
        UserResponse user = adminService.getUserDetail(id);
        return Result.success(user);
    }

    @GetMapping("/posts")
    public Result<PageResult<PostResponse>> getPosts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        PageResult<PostResponse> result = adminService.getPostList(keyword, status, page, size);
        return Result.success(result);
    }

    @PutMapping("/posts/{id}/block")
    public Result<Void> blockPost(@PathVariable Long id) {
        postService.blockPost(id);
        return Result.success();
    }

    @PutMapping("/posts/{id}/move")
    public Result<Void> movePost(@PathVariable Long id, @RequestBody java.util.Map<String, Long> body) {
        postService.movePost(id, body.get("categoryId"));
        return Result.success();
    }

    @DeleteMapping("/posts/{id}")
    public Result<Void> deletePost(@PathVariable Long id) {
        postService.adminDeletePost(id);
        return Result.success();
    }

    @GetMapping("/comments")
    public Result<PageResult<CommentResponse>> getComments(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        PageResult<CommentResponse> result = adminService.getCommentList(keyword, status, page, size);
        return Result.success(result);
    }

    @GetMapping("/reports")
    public Result<PageResult<ReportResponse>> getReports(
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer targetType,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        PageResult<ReportResponse> result = adminService.getReportList(status, targetType, page, size);
        return Result.success(result);
    }

    @GetMapping("/reports/{id}")
    public Result<ReportResponse> getReportDetail(@PathVariable Long id) {
        ReportResponse report = adminService.getReportDetail(id);
        return Result.success(report);
    }

    @PutMapping("/reports/{id}/handle")
    public Result<Void> handleReport(
            @PathVariable Long id,
            @RequestBody ReportHandleRequest request) {
        Integer status;
        switch (request.getAction()) {
            case "BLOCK":
                status = Constants.REPORT_STATUS_BLOCKED;
                break;
            case "WARN":
                status = Constants.REPORT_STATUS_WARNED;
                break;
            default:
                status = Constants.REPORT_STATUS_IGNORED;
                break;
        }
        adminService.handleReport(id, status, request.getReason(), null);
        return Result.success();
    }

    @PutMapping("/users/{id}/status")
    public Result<Void> updateUserStatus(@PathVariable Long id, @RequestParam Integer status) {
        adminService.updateUserStatus(id, status);
        return Result.success();
    }

    @PutMapping("/users/{id}/roles")
    public Result<Void> updateUserRoles(@PathVariable Long id, @RequestBody List<String> roleCodes) {
        adminService.updateUserRolesByCodes(id, roleCodes);
        return Result.success();
    }

    @GetMapping("/config")
    public Result<SystemConfigResponse> getConfig() {
        SystemConfigResponse response = new SystemConfigResponse();
        response.setAiBaseUrl(getConfigValue("ai_base_url", aiConfig.getBaseUrl()));
        response.setAiApiKey(getConfigValue("ai_api_key", aiConfig.getApiKey()));
        response.setAiModel(getConfigValue("ai_model", aiConfig.getModel()));
        response.setAiTemperature(getConfigValueDouble("ai_temperature", aiConfig.getTemperature()));
        response.setAiMaxTokens(getConfigValueInt("ai_max_tokens", aiConfig.getMaxTokens()));
        response.setAiEnabled(Boolean.parseBoolean(getConfigValue("ai_enabled", String.valueOf(aiConfig.getEnabled()))));
        response.setCasServerUrl(getConfigValue("cas_server_url", casConfig.getServerUrl()));
        response.setCasCallbackUrl(getConfigValue("cas_callback_url", casConfig.getClientService()));
        response.setPostRateLimit(getConfigValueInt("post_rate_limit", 10));
        response.setCommentRateLimit(getConfigValueInt("comment_rate_limit", 30));
        response.setNotificationRetentionDays(getConfigValueInt("notification_retention_days", 30));
        return Result.success(response);
    }

    @PutMapping("/config")
    public Result<Void> updateConfig(@RequestBody SystemConfigResponse request) {
        if (request.getAiBaseUrl() != null) setConfigValue("ai_base_url", request.getAiBaseUrl());
        if (request.getAiApiKey() != null) setConfigValue("ai_api_key", request.getAiApiKey());
        if (request.getAiModel() != null) setConfigValue("ai_model", request.getAiModel());
        if (request.getAiTemperature() != null) setConfigValue("ai_temperature", String.valueOf(request.getAiTemperature()));
        if (request.getAiMaxTokens() != null) setConfigValue("ai_max_tokens", String.valueOf(request.getAiMaxTokens()));
        if (request.getAiEnabled() != null) setConfigValue("ai_enabled", String.valueOf(request.getAiEnabled()));
        if (request.getCasServerUrl() != null) setConfigValue("cas_server_url", request.getCasServerUrl());
        if (request.getCasCallbackUrl() != null) setConfigValue("cas_callback_url", request.getCasCallbackUrl());
        if (request.getPostRateLimit() != null) setConfigValue("post_rate_limit", String.valueOf(request.getPostRateLimit()));
        if (request.getCommentRateLimit() != null) setConfigValue("comment_rate_limit", String.valueOf(request.getCommentRateLimit()));
        if (request.getNotificationRetentionDays() != null) setConfigValue("notification_retention_days", String.valueOf(request.getNotificationRetentionDays()));
        return Result.success();
    }

    @GetMapping("/sensitive-words")
    public Result<PageResult<SensitiveWord>> getSensitiveWords(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        LambdaQueryWrapper<SensitiveWord> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(SensitiveWord::getWord, keyword);
        }
        wrapper.orderByDesc(SensitiveWord::getCreatedAt);
        Page<SensitiveWord> pageResult = sensitiveWordMapper.selectPage(new Page<>(page, size), wrapper);
        return Result.success(new PageResult<>(pageResult.getRecords(), pageResult.getTotal(), page, size));
    }

    @PostMapping("/sensitive-words")
    public Result<Void> addSensitiveWord(@RequestBody java.util.Map<String, String> body) {
        String word = body.get("word");
        if (word == null || word.isEmpty()) {
            return Result.error(400, "敏感词不能为空");
        }
        SensitiveWord sw = new SensitiveWord();
        sw.setWord(word);
        sw.setCategory("自定义");
        sensitiveWordMapper.insert(sw);
        contentFilterService.refreshSensitiveWords();
        return Result.success();
    }

    @DeleteMapping("/sensitive-words/{id}")
    public Result<Void> deleteSensitiveWord(@PathVariable Long id) {
        sensitiveWordMapper.deleteById(id);
        contentFilterService.refreshSensitiveWords();
        return Result.success();
    }

    @PostMapping("/sensitive-words/batch")
    public Result<java.util.Map<String, Integer>> batchImportSensitiveWords(@RequestBody java.util.Map<String, java.util.List<String>> body) {
        java.util.List<String> words = body.get("words");
        if (words == null || words.isEmpty()) {
            return Result.error(400, "敏感词列表不能为空");
        }
        int imported = 0;
        for (String w : words) {
            if (w != null && !w.trim().isEmpty()) {
                Long exists = sensitiveWordMapper.selectCount(
                        new LambdaQueryWrapper<SensitiveWord>().eq(SensitiveWord::getWord, w.trim()));
                if (exists == 0) {
                    SensitiveWord sw = new SensitiveWord();
                    sw.setWord(w.trim());
                    sw.setCategory("批量导入");
                    sensitiveWordMapper.insert(sw);
                    imported++;
                }
            }
        }
        contentFilterService.refreshSensitiveWords();
        return Result.success(java.util.Map.of("imported", imported));
    }

    private String getConfigValue(String key, String defaultValue) {
        SystemConfig config = systemConfigMapper.selectOne(
                new LambdaQueryWrapper<SystemConfig>().eq(SystemConfig::getConfigKey, key));
        return config != null ? config.getConfigValue() : defaultValue;
    }

    private Integer getConfigValueInt(String key, Integer defaultValue) {
        String val = getConfigValue(key, null);
        if (val == null) return defaultValue;
        try { return Integer.parseInt(val); } catch (NumberFormatException e) { return defaultValue; }
    }

    private Double getConfigValueDouble(String key, Double defaultValue) {
        String val = getConfigValue(key, null);
        if (val == null) return defaultValue;
        try { return Double.parseDouble(val); } catch (NumberFormatException e) { return defaultValue; }
    }

    private void setConfigValue(String key, String value) {
        SystemConfig config = systemConfigMapper.selectOne(
                new LambdaQueryWrapper<SystemConfig>().eq(SystemConfig::getConfigKey, key));
        if (config != null) {
            config.setConfigValue(value);
            systemConfigMapper.updateById(config);
        } else {
            config = new SystemConfig();
            config.setConfigKey(key);
            config.setConfigValue(value);
            systemConfigMapper.insert(config);
        }
    }
}
