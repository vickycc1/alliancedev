package com.techcommunity.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.techcommunity.common.ErrorCode;
import com.techcommunity.common.Result;
import com.techcommunity.dto.request.LikeToggleRequest;
import com.techcommunity.entity.User;
import com.techcommunity.exception.BusinessException;
import com.techcommunity.mapper.UserMapper;
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
    private final UserMapper userMapper;

    @PostMapping("/like")
    public Result<Boolean> toggleLike(@Valid @RequestBody LikeToggleRequest request) {
        Long userId = getCurrentUserId();
        boolean liked = interactionService.toggleLike(userId, request.getTargetId(), request.getTargetType());
        return Result.success(liked);
    }

    @PostMapping("/favorite")
    public Result<Boolean> toggleFavorite(@RequestParam Long postId) {
        Long userId = getCurrentUserId();
        boolean favorited = interactionService.toggleFavorite(userId, postId);
        return Result.success(favorited);
    }

    @PostMapping("/share")
    public Result<Void> recordShare(@RequestParam Long postId, @RequestParam(required = false) String channel) {
        Long userId = getCurrentUserId();
        interactionService.recordShare(userId, postId, channel);
        return Result.success();
    }

    @GetMapping("/liked")
    public Result<Boolean> isLiked(@RequestParam Long targetId, @RequestParam Integer targetType) {
        Long userId = getCurrentUserId();
        boolean liked = interactionService.isLiked(userId, targetId, targetType);
        return Result.success(liked);
    }

    @GetMapping("/favorited")
    public Result<Boolean> isFavorited(@RequestParam Long postId) {
        Long userId = getCurrentUserId();
        boolean favorited = interactionService.isFavorited(userId, postId);
        return Result.success(favorited);
    }

    private Long getCurrentUserId() {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, username)
        );
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        return user.getId();
    }
}
