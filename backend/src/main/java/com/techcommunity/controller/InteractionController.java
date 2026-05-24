package com.techcommunity.controller;

import com.techcommunity.common.Result;
import com.techcommunity.dto.request.LikeToggleRequest;
import com.techcommunity.dto.request.ReportCreateRequest;
import com.techcommunity.security.SecurityUtils;
import com.techcommunity.service.InteractionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/interaction")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    @PostMapping("/like")
    public Result<Boolean> toggleLike(@Valid @RequestBody LikeToggleRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean liked = interactionService.toggleLike(userId, request.getTargetId(), request.getTargetType());
        return Result.success(liked);
    }

    @PostMapping("/favorite")
    public Result<Boolean> toggleFavorite(@RequestParam Long postId) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean favorited = interactionService.toggleFavorite(userId, postId);
        return Result.success(favorited);
    }

    @PostMapping("/share")
    public Result<Void> recordShare(@RequestParam Long postId, @RequestParam(required = false) String channel) {
        Long userId = SecurityUtils.getCurrentUserId();
        interactionService.recordShare(userId, postId, channel);
        return Result.success();
    }

    @PostMapping("/report")
    public Result<Long> createReport(@Valid @RequestBody ReportCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Long reportId = interactionService.createReport(request, userId);
        return Result.success(reportId);
    }

    @GetMapping("/liked")
    public Result<Boolean> isLiked(@RequestParam Long targetId, @RequestParam Integer targetType) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean liked = interactionService.isLiked(userId, targetId, targetType);
        return Result.success(liked);
    }

    @GetMapping("/favorited")
    public Result<Boolean> isFavorited(@RequestParam Long postId) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean favorited = interactionService.isFavorited(userId, postId);
        return Result.success(favorited);
    }
}
