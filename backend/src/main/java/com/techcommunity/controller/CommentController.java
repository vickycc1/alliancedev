package com.techcommunity.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.techcommunity.common.ErrorCode;
import com.techcommunity.common.PageResult;
import com.techcommunity.common.Result;
import com.techcommunity.dto.request.CommentCreateRequest;
import com.techcommunity.dto.response.CommentResponse;
import com.techcommunity.entity.User;
import com.techcommunity.exception.BusinessException;
import com.techcommunity.mapper.UserMapper;
import com.techcommunity.security.SecurityUtils;
import com.techcommunity.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final UserMapper userMapper;

    @PostMapping
    public Result<Long> create(@Valid @RequestBody CommentCreateRequest request) {
        Long userId = getCurrentUserId();
        Long commentId = commentService.createComment(request, userId);
        return Result.success(commentId);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        commentService.deleteComment(id, userId);
        return Result.success();
    }

    @GetMapping("/post/{postId}")
    public Result<PageResult<CommentResponse>> getByPostId(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        PageResult<CommentResponse> result = commentService.getCommentsByPostId(postId, page, size);
        return Result.success(result);
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
