package com.techcommunity.controller;

import com.techcommunity.annotation.RateLimit;
import com.techcommunity.common.PageResult;
import com.techcommunity.common.Result;
import com.techcommunity.dto.request.CommentCreateRequest;
import com.techcommunity.dto.response.CommentResponse;
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

    @PostMapping
    @RateLimit(limit = 30, period = 3600, message = "评论频率超限，请稍后重试")
    public Result<Long> create(@Valid @RequestBody CommentCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Long commentId = commentService.createComment(request, userId);
        return Result.success(commentId);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
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
}
