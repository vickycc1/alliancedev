package com.techcommunity.controller;

import com.techcommunity.annotation.RateLimit;
import com.techcommunity.common.PageResult;
import com.techcommunity.common.Result;
import com.techcommunity.dto.request.PostCreateRequest;
import com.techcommunity.dto.response.PostResponse;
import com.techcommunity.security.SecurityUtils;
import com.techcommunity.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping
    @RateLimit(limit = 10, period = 3600, message = "发帖频率超限，请稍后重试")
    public Result<Long> create(@Valid @RequestBody PostCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Long postId = postService.createPost(request, userId);
        return Result.success(postId);
    }

    @GetMapping("/{id}")
    public Result<PostResponse> getDetail(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserIdOrNull();
        PostResponse post = postService.getPostDetail(id, currentUserId);
        return Result.success(post);
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody PostCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        postService.updatePost(id, request, userId);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        postService.deletePost(id, userId);
        return Result.success();
    }

    @GetMapping
    public Result<PageResult<PostResponse>> getList(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, defaultValue = "LATEST") String sortBy,
            @RequestParam(required = false) Boolean isTop,
            @RequestParam(required = false) Boolean isEssence,
            @RequestParam(required = false) Long authorId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        PageResult<PostResponse> result = postService.getPostList(
                categoryId, keyword, sortBy, isTop, isEssence, authorId, page, size
        );
        return Result.success(result);
    }

    @PutMapping("/{id}/top")
    public Result<Void> top(@PathVariable Long id, @RequestParam Integer isTop) {
        postService.topPost(id, isTop);
        return Result.success();
    }

    @PutMapping("/{id}/essence")
    public Result<Void> essence(@PathVariable Long id, @RequestParam Integer isEssence) {
        postService.essencePost(id, isEssence);
        return Result.success();
    }
}
