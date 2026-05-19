package com.techcommunity.controller;

import com.techcommunity.common.PageResult;
import com.techcommunity.common.Result;
import com.techcommunity.dto.response.CommentResponse;
import com.techcommunity.dto.response.PostResponse;
import com.techcommunity.service.AdminService;
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

    @GetMapping("/posts")
    public Result<PageResult<PostResponse>> getPosts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        PageResult<PostResponse> result = adminService.getPostList(keyword, status, page, size);
        return Result.success(result);
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

    @PutMapping("/users/{id}/status")
    public Result<Void> updateUserStatus(@PathVariable Long id, @RequestParam Integer status) {
        adminService.updateUserStatus(id, status);
        return Result.success();
    }

    @PutMapping("/users/{id}/roles")
    public Result<Void> updateUserRoles(@PathVariable Long id, @RequestBody List<Long> roleIds) {
        adminService.updateUserRoles(id, roleIds);
        return Result.success();
    }
}
