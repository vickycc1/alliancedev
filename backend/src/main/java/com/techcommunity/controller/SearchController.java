package com.techcommunity.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.techcommunity.common.Result;
import com.techcommunity.entity.Post;
import com.techcommunity.mapper.PostMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final PostMapper postMapper;

    @GetMapping("/hot-keywords")
    public Result<List<String>> getHotKeywords() {
        LambdaQueryWrapper<Post> wrapper = new LambdaQueryWrapper<Post>()
                .eq(Post::getStatus, 1)
                .gt(Post::getViewCount, 0)
                .orderByDesc(Post::getViewCount)
                .select(Post::getTitle)
                .last("LIMIT 10");

        List<Post> posts = postMapper.selectList(wrapper);
        List<String> keywords = posts.stream()
                .map(Post::getTitle)
                .collect(Collectors.toList());

        return Result.success(keywords);
    }
}
