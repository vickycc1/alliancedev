package com.techcommunity.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.techcommunity.common.Constants;
import com.techcommunity.common.PageResult;
import com.techcommunity.dto.request.ReportCreateRequest;
import com.techcommunity.dto.response.CommentResponse;
import com.techcommunity.dto.response.DashboardStatsResponse;
import com.techcommunity.dto.response.DashboardStatsResponse.TrendItem;
import com.techcommunity.dto.response.PostResponse;
import com.techcommunity.dto.response.ReportResponse;
import com.techcommunity.dto.response.UserResponse;
import com.techcommunity.entity.*;
import com.techcommunity.mapper.*;
import com.techcommunity.service.AdminService;
import com.techcommunity.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private final NotificationService notificationService;
    private final AiResponseMapper aiResponseMapper;
    private final RoleMapper roleMapper;

    @Override
    public PageResult<UserResponse> getUserList(String keyword, Integer status, String role, Integer page, Integer size) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like(User::getUsername, keyword).or().like(User::getEmail, keyword));
        }
        if (status != null) {
            wrapper.eq(User::getStatus, status);
        }

        Page<User> userPage = userMapper.selectPage(new Page<>(page, size), wrapper);

        List<UserResponse> list = userPage.getRecords().stream().map(user -> {
            UserResponse resp = new UserResponse();
            resp.setId(user.getId());
            resp.setUsername(user.getUsername());
            resp.setNickname(user.getNickname());
            resp.setAvatar(user.getAvatar());
            resp.setEmail(user.getEmail());
            resp.setPhone(user.getPhone());
            resp.setBio(user.getBio());
            resp.setStatus(user.getStatus());
            resp.setCreatedAt(user.getCreatedAt());
            resp.setUpdatedAt(user.getUpdatedAt());
            resp.setLastLoginAt(user.getLastLoginAt());

            List<UserRole> userRoles = userRoleMapper.selectList(
                    new LambdaQueryWrapper<UserRole>().eq(UserRole::getUserId, user.getId()));
            List<String> roleCodes = userRoles.stream().map(ur -> {
                Role r = roleMapper.selectById(ur.getRoleId());
                return r != null ? r.getRoleCode() : "USER";
            }).collect(Collectors.toList());
            resp.setRoles(roleCodes);

            return resp;
        }).collect(Collectors.toList());

        if (role != null && !role.isEmpty()) {
            list = list.stream().filter(u -> u.getRoles().contains(role)).collect(Collectors.toList());
        }

        return new PageResult<>(list, userPage.getTotal(), page, size);
    }

    @Override
    public UserResponse getUserDetail(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        UserResponse resp = new UserResponse();
        resp.setId(user.getId());
        resp.setUsername(user.getUsername());
        resp.setNickname(user.getNickname());
        resp.setAvatar(user.getAvatar());
        resp.setEmail(user.getEmail());
        resp.setPhone(user.getPhone());
        resp.setBio(user.getBio());
        resp.setStatus(user.getStatus());
        resp.setCreatedAt(user.getCreatedAt());
        resp.setUpdatedAt(user.getUpdatedAt());
        resp.setLastLoginAt(user.getLastLoginAt());

        List<UserRole> userRoles = userRoleMapper.selectList(
                new LambdaQueryWrapper<UserRole>().eq(UserRole::getUserId, user.getId()));
        List<String> roleCodes = userRoles.stream().map(ur -> {
            Role r = roleMapper.selectById(ur.getRoleId());
            return r != null ? r.getRoleCode() : "USER";
        }).collect(Collectors.toList());
        resp.setRoles(roleCodes);

        return resp;
    }

    @Override
    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        stats.setUserTotal(userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getStatus, Constants.USER_STATUS_NORMAL)));

        stats.setPostTotal(postMapper.selectCount(
                new LambdaQueryWrapper<Post>().eq(Post::getStatus, Constants.POST_STATUS_NORMAL)));

        stats.setCommentTotal(commentMapper.selectCount(
                new LambdaQueryWrapper<Comment>().eq(Comment::getStatus, Constants.COMMENT_STATUS_NORMAL)));

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        stats.setUserTodayNew(userMapper.selectCount(
                new LambdaQueryWrapper<User>().ge(User::getCreatedAt, todayStart)));

        stats.setPostTodayNew(postMapper.selectCount(
                new LambdaQueryWrapper<Post>().ge(Post::getCreatedAt, todayStart)));

        stats.setCommentTodayNew(commentMapper.selectCount(
                new LambdaQueryWrapper<Comment>().ge(Comment::getCreatedAt, todayStart)));

        stats.setReportPending(reportMapper.selectCount(
                new LambdaQueryWrapper<Report>().eq(Report::getStatus, Constants.REPORT_STATUS_PENDING)));

        stats.setAiCallCount(aiResponseMapper.selectCount(null));

        Long aiSuccessCount = aiResponseMapper.selectCount(
                new LambdaQueryWrapper<AiResponse>().eq(AiResponse::getStatus, Constants.AI_STATUS_COMPLETED));
        Long aiTotal = stats.getAiCallCount();
        stats.setAiSuccessRate(aiTotal != null && aiTotal > 0
                ? Math.round(aiSuccessCount * 1000.0 / aiTotal) / 10.0 : 0.0);

        List<TrendItem> trend = new java.util.ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();

            TrendItem item = new TrendItem();
            item.setDate(date.toString());
            item.setUsers(Math.toIntExact(userMapper.selectCount(
                    new LambdaQueryWrapper<User>().ge(User::getCreatedAt, dayStart).lt(User::getCreatedAt, dayEnd))));
            item.setPosts(Math.toIntExact(postMapper.selectCount(
                    new LambdaQueryWrapper<Post>().ge(Post::getCreatedAt, dayStart).lt(Post::getCreatedAt, dayEnd))));
            trend.add(item);
        }
        stats.setActiveTrend(trend);

        return stats;
    }

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
    public PageResult<ReportResponse> getReportList(Integer status, Integer targetType, Integer page, Integer size) {
        LambdaQueryWrapper<Report> wrapper = new LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(Report::getStatus, status);
        }
        if (targetType != null) {
            wrapper.eq(Report::getTargetType, targetType);
        }
        wrapper.orderByDesc(Report::getCreatedAt);

        Page<Report> pageResult = reportMapper.selectPage(new Page<>(page, size), wrapper);

        List<ReportResponse> list = pageResult.getRecords().stream()
                .map(this::buildReportResponse)
                .collect(Collectors.toList());

        return new PageResult<>(list, pageResult.getTotal(), page, size);
    }

    @Override
    public ReportResponse getReportDetail(Long reportId) {
        Report report = reportMapper.selectById(reportId);
        if (report == null) {
            throw new RuntimeException("举报记录不存在");
        }
        return buildReportResponse(report);
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
        report.setHandledAt(LocalDateTime.now());
        reportMapper.updateById(report);

        if (status == Constants.REPORT_STATUS_BLOCKED) {
            if (report.getTargetType() != null && report.getTargetType() == Constants.TARGET_TYPE_POST) {
                Post post = postMapper.selectById(report.getTargetId());
                if (post != null) {
                    post.setStatus(Constants.POST_STATUS_BLOCKED);
                    postMapper.updateById(post);
                }
            } else if (report.getTargetType() != null && report.getTargetType() == Constants.TARGET_TYPE_COMMENT) {
                Comment comment = commentMapper.selectById(report.getTargetId());
                if (comment != null) {
                    comment.setStatus(Constants.COMMENT_STATUS_BLOCKED);
                    commentMapper.updateById(comment);
                }
            }
        }

        notificationService.sendNotification(
                report.getReporterId(),
                null,
                Constants.NOTIFICATION_TYPE_REPORT_HANDLED,
                "举报处理通知",
                "你提交的举报已被处理，处理结果：" + (handleResult != null ? handleResult : "已处理"),
                report.getTargetId()
        );

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

    @Override
    @Transactional
    public void updateUserRolesByCodes(Long userId, List<String> roleCodes) {
        userRoleMapper.delete(
                new LambdaQueryWrapper<UserRole>().eq(UserRole::getUserId, userId)
        );

        for (String roleCode : roleCodes) {
            Role role = roleMapper.selectOne(
                    new LambdaQueryWrapper<Role>().eq(Role::getRoleCode, roleCode));
            if (role != null) {
                UserRole userRole = new UserRole();
                userRole.setUserId(userId);
                userRole.setRoleId(role.getId());
                userRoleMapper.insert(userRole);
            }
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

    private ReportResponse buildReportResponse(Report report) {
        ReportResponse response = new ReportResponse();
        response.setId(report.getId());
        response.setReporterId(report.getReporterId());
        response.setTargetType(report.getTargetType());
        response.setTargetId(report.getTargetId());
        response.setReason(report.getReason());
        response.setStatus(report.getStatus());
        response.setHandleResult(report.getHandleResult());
        response.setHandleTime(report.getHandledAt());
        response.setCreatedAt(report.getCreatedAt());

        User reporter = userMapper.selectById(report.getReporterId());
        if (reporter != null) {
            response.setReporterName(reporter.getNickname() != null ? reporter.getNickname() : reporter.getUsername());
        }

        if (report.getHandlerId() != null) {
            User handler = userMapper.selectById(report.getHandlerId());
            if (handler != null) {
                response.setHandlerName(handler.getNickname() != null ? handler.getNickname() : handler.getUsername());
            }
        }

        if (report.getTargetType() != null && report.getTargetType() == Constants.TARGET_TYPE_POST) {
            Post post = postMapper.selectById(report.getTargetId());
            if (post != null) {
                response.setTargetTitle(post.getTitle());
                response.setTargetContent(post.getContent());
            }
        } else if (report.getTargetType() != null && report.getTargetType() == Constants.TARGET_TYPE_COMMENT) {
            Comment comment = commentMapper.selectById(report.getTargetId());
            if (comment != null) {
                response.setTargetTitle("评论");
                response.setTargetContent(comment.getContent());
            }
        }

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
