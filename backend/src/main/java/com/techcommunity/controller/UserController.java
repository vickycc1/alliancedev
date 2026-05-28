package com.techcommunity.controller;

import com.techcommunity.common.PageResult;
import com.techcommunity.common.Result;
import com.techcommunity.config.FileConfig;
import com.techcommunity.dto.response.CommentResponse;
import com.techcommunity.dto.response.PostResponse;
import com.techcommunity.entity.Favorite;
import com.techcommunity.entity.User;
import com.techcommunity.mapper.FavoriteMapper;
import com.techcommunity.mapper.UserMapper;
import com.techcommunity.security.SecurityUtils;
import com.techcommunity.service.CommentService;
import com.techcommunity.service.PostService;
import com.techcommunity.util.FileUtils;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final CommentService commentService;
    private final PostService postService;
    private final FavoriteMapper favoriteMapper;
    private final UserMapper userMapper;
    private final FileConfig fileConfig;

    @GetMapping("/comments")
    public Result<PageResult<CommentResponse>> getUserComments(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        PageResult<CommentResponse> result = commentService.getCommentsByUserId(userId, page, size);
        return Result.success(result);
    }

    @GetMapping("/favorites")
    public Result<PageResult<PostResponse>> getUserFavorites(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        List<Favorite> favorites = favoriteMapper.selectList(
                new LambdaQueryWrapper<Favorite>()
                        .eq(Favorite::getUserId, userId)
                        .orderByDesc(Favorite::getCreatedAt)
        );
        List<Long> postIds = favorites.stream().map(Favorite::getPostId).toList();
        PageResult<PostResponse> result = postService.getPostsByIds(postIds, null, page, size);
        return Result.success(result);
    }

    @PostMapping("/avatar")
    public Result<Map<String, String>> uploadAvatar(@RequestParam("avatar") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return Result.error(400, "请选择头像文件");
        }
        if (!FileUtils.isImage(file)) {
            return Result.error(400, "只能上传图片文件");
        }
        if (!FileUtils.isValidImageSize(file)) {
            return Result.error(400, "图片大小不能超过5MB");
        }

        try {
            String filename = FileUtils.saveFile(file, fileConfig.getAvatarPath());
            String url = "/uploads/avatars/" + filename;

            Long userId = SecurityUtils.getCurrentUserId();
            User user = userMapper.selectById(userId);
            if (user != null) {
                user.setAvatar(url);
                userMapper.updateById(user);
            }

            return Result.success(Map.of("url", url));
        } catch (Exception e) {
            return Result.error(500, "头像上传失败");
        }
    }
}
