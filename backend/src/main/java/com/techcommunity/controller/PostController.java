package com.techcommunity.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.techcommunity.common.Constants;
import com.techcommunity.common.ErrorCode;
import com.techcommunity.common.PageResult;
import com.techcommunity.common.Result;
import com.techcommunity.dto.request.PostCreateRequest;
import com.techcommunity.dto.response.PostResponse;
import com.techcommunity.entity.User;
import com.techcommunity.exception.BusinessException;
import com.techcommunity.mapper.UserMapper;
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
    private final UserMapper userMapper;

    @PostMapping
    public Result<Long> create(@Valid @RequestBody PostCreateRequest request) {
        Long userId = getCurrentUserId();
        Long postId = postService.createPost(request, userId);
        return Result.success(postId);
    }

    @GetMapping("/{id}")
    public Result<PostResponse> getDetail(@PathVariable Long id) {
        Long currentUserId = getCurrentUserId();
        PostResponse post = postService.getPostDetail(id, currentUserId);
        return Result.success(post);
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @Valid @RequestBody PostCreateRequest request) {
        Long userId = getCurrentUserId();
        postService.updatePost(id, request, userId);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        Long userId = getCurrentUserId();
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
