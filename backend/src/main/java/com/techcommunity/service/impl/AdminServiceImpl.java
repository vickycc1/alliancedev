package com.techcommunity.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.techcommunity.common.Constants;
import com.techcommunity.common.PageResult;
import com.techcommunity.dto.request.ReportCreateRequest;
import com.techcommunity.dto.response.CommentResponse;
import com.techcommunity.dto.response.PostResponse;
import com.techcommunity.dto.response.UserResponse;
import com.techcommunity.entity.*;
import com.techcommunity.mapper.*;
import com.techcommunity.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final PostMapper postMapper;
    private final CommentMapper commentMapper;
    private final ReportMapper reportMapper;
    private final UserMapper userMapper;
    private final UserRoleMapper userRoleMapper;

    @Override
    public PageResult<PostResponse> getPostList(String keyword, Integer status, Integer page, Integer size) {
        LambdaQueryWrapper<Post> wrapper = new LambdaQueryWrapper<>();

        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(Post::getTitle, keyword).or().like(Post::getContent, keyword));
        }
        if (status != null) {
            wrapper.eq(Post::getStatus, status);
        }
        wrapper.orderByDesc(Post::getCreatedAt);

        Page<Post> pageResult = postMapper.selectPage(new Page<>(page, size), wrapper);

        List<PostResponse> list = pageResult.getRecords().stream()
                .map(this::buildPostResponse)
                .collect(Collectors.toList());

        return PageResult.of(list, pageResult.getTotal(), page, size);
    }

    @Override
    public PageResult<CommentResponse> getCommentList(String keyword, Integer status, Integer page, Integer size) {
        LambdaQueryWrapper<Comment> wrapper = new LambdaQueryWrapper<>();

        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Comment::getContent, keyword);
        }
        if (status != null) {
            wrapper.eq(Comment::getStatus, status);
        }
        wrapper.orderByDesc(Comment::getCreatedAt);

        Page<Comment> pageResult = commentMapper.selectPage(new Page<>(page, size), wrapper);

        List<CommentResponse> list = pageResult.getRecords().stream()
                .map(this::buildCommentResponse)
                .collect(Collectors.toList());

        return PageResult.of(list, pageResult.getTotal(), page, size);
    }

    @Override
    public PageResult<ReportCreateRequest> getReportList(Integer status, Integer page, Integer size) {
        LambdaQueryWrapper<Report> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(Report::getStatus, status);
        }
        wrapper.orderByDesc(Report::getCreatedAt);

        Page<Report> pageResult = reportMapper.selectPage(new Page<>(page, size), wrapper);

        List<ReportCreateRequest> list = pageResult.getRecords().stream()
                .map(this::buildReportResponse)
                .collect(Collectors.toList());

        return PageResult.of(list, pageResult.getTotal(), page, size);
    }

    @Override
    @Transactional
    public void handleReport(Long reportId, Integer status, String handleResult, Long handlerId) {
        Report report = reportMapper.selectById(reportId);
        if (report == null) {
            throw new RuntimeException("举报记录不存在");
        }

        report.setStatus(status);
        report.setHandleResult(handleResult);
        report.setHandlerId(handlerId);
        reportMapper.updateById(report);

        if (status == Constants.REPORT_STATUS_HANDLED && handleResult != null) {
            if (handleResult.contains("删除")) {
                if (report.getTargetType() == Constants.TARGET_TYPE_POST) {
                    Post post = postMapper.selectById(report.getTargetId());
                    if (post != null) {
                        post.setStatus(Constants.POST_STATUS_DELETED);
                        postMapper.updateById(post);
                    }
                } else if (report.getTargetType() == Constants.TARGET_TYPE_COMMENT) {
                    Comment comment = commentMapper.selectById(report.getTargetId());
                    if (comment != null) {
                        comment.setStatus(Constants.COMMENT_STATUS_DELETED);
                        commentMapper.updateById(comment);
                    }
                }
            } else if (handleResult.contains("封禁")) {
                if (report.getTargetType() == Constants.TARGET_TYPE_POST) {
                    Post post = postMapper.selectById(report.getTargetId());
                    if (post != null) {
                        post.setStatus(Constants.POST_STATUS_BLOCKED);
                        postMapper.updateById(post);
                    }
                }
            }
        }
    }

    @Override
    @Transactional
    public void updateUserStatus(Long userId, Integer status) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        user.setStatus(status);
        userMapper.updateById(user);
    }

    @Override
    @Transactional
    public void updateUserRoles(Long userId, List<Long> roleIds) {
        userRoleMapper.delete(
                new LambdaQueryWrapper<UserRole>().eq(UserRole::getUserId, userId)
        );

        for (Long roleId : roleIds) {
            UserRole userRole = new UserRole();
            userRole.setUserId(userId);
            userRole.setRoleId(roleId);
            userRoleMapper.insert(userRole);
        }
    }

    private PostResponse buildPostResponse(Post post) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setCategoryId(post.getCategoryId());
        response.setTitle(post.getTitle());
        response.setContent(post.getContent());
        response.setSummary(post.getSummary());
        response.setViewCount(post.getViewCount());
        response.setLikeCount(post.getLikeCount());
        response.setCommentCount(post.getCommentCount());
        response.setFavoriteCount(post.getFavoriteCount());
        response.setShareCount(post.getShareCount());
        response.setIsTop(post.getIsTop());
        response.setIsEssence(post.getIsEssence());
        response.setAiRequested(post.getAiRequested());
        response.setStatus(post.getStatus());
        response.setCreatedAt(post.getCreatedAt());
        response.setUpdatedAt(post.getUpdatedAt());

        User author = userMapper.selectById(post.getUserId());
        if (author != null) {
            response.setAuthor(buildUserResponse(author));
        }

        return response;
    }

    private CommentResponse buildCommentResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setPostId(comment.getPostId());
        response.setParentId(comment.getParentId());
        response.setContent(comment.getContent());
        response.setLikeCount(comment.getLikeCount());
        response.setStatus(comment.getStatus());
        response.setCreatedAt(comment.getCreatedAt());

        User author = userMapper.selectById(comment.getUserId());
        if (author != null) {
            response.setAuthor(buildUserResponse(author));
        }

        return response;
    }

    private ReportCreateRequest buildReportResponse(Report report) {
        ReportCreateRequest response = new ReportCreateRequest();
        response.setTargetId(report.getTargetId());
        response.setTargetType(report.getTargetType());
        response.setReason(report.getReason());
        return response;
    }

    private UserResponse buildUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setNickname(user.getNickname());
        response.setAvatar(user.getAvatar());
        response.setStatus(user.getStatus());
        return response;
    }
}
