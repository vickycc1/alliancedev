package com.techcommunity.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.techcommunity.common.Constants;
import com.techcommunity.common.ErrorCode;
import com.techcommunity.common.PageResult;
import com.techcommunity.dto.request.CommentCreateRequest;
import com.techcommunity.dto.response.CommentResponse;
import com.techcommunity.dto.response.UserResponse;
import com.techcommunity.entity.Comment;
import com.techcommunity.entity.Post;
import com.techcommunity.entity.User;
import com.techcommunity.exception.BusinessException;
import com.techcommunity.mapper.CommentMapper;
import com.techcommunity.mapper.PostMapper;
import com.techcommunity.mapper.UserMapper;
import com.techcommunity.service.CommentService;
import com.techcommunity.service.ContentFilterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentMapper commentMapper;
    private final PostMapper postMapper;
    private final UserMapper userMapper;
    private final ContentFilterService contentFilterService;

    @Override
    @Transactional
    public Long createComment(CommentCreateRequest request, Long userId) {
        Post post = postMapper.selectById(request.getPostId());
        if (post == null) {
            throw new BusinessException(ErrorCode.POST_NOT_FOUND);
        }

        String content = contentFilterService.cleanHtml(request.getContent());
        if (contentFilterService.containsSensitiveWord(content)) {
            throw new BusinessException(ErrorCode.CONTENT_SENSITIVE);
        }

        Comment comment = new Comment();
        comment.setPostId(request.getPostId());
        comment.setUserId(userId);
        comment.setParentId(request.getParentId() != null ? request.getParentId() : 0L);
        comment.setReplyToUserId(request.getReplyToUserId());
        comment.setContent(content);
        comment.setLikeCount(0);
        comment.setStatus(Constants.COMMENT_STATUS_NORMAL);

        commentMapper.insert(comment);

        post.setCommentCount(post.getCommentCount() + 1);
        postMapper.updateById(post);

        return comment.getId();
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentMapper.selectById(commentId);
        if (comment == null) {
            throw new BusinessException(ErrorCode.COMMENT_NOT_FOUND);
        }

        if (!comment.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.COMMENT_NO_PERMISSION);
        }

        comment.setStatus(Constants.COMMENT_STATUS_DELETED);
        commentMapper.updateById(comment);

        Post post = postMapper.selectById(comment.getPostId());
        if (post != null) {
            post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
            postMapper.updateById(post);
        }
    }

    @Override
    public PageResult<CommentResponse> getCommentsByPostId(Long postId, Integer page, Integer size) {
        List<Comment> allComments = commentMapper.selectList(
                new LambdaQueryWrapper<Comment>()
                        .eq(Comment::getPostId, postId)
                        .eq(Comment::getStatus, Constants.COMMENT_STATUS_NORMAL)
                        .orderByAsc(Comment::getCreatedAt)
        );

        Map<Long, List<Comment>> childrenMap = allComments.stream()
                .filter(c -> c.getParentId() != 0L)
                .collect(Collectors.groupingBy(Comment::getParentId));

        List<Comment> rootComments = allComments.stream()
                .filter(c -> c.getParentId() == 0L)
                .collect(Collectors.toList());

        int total = rootComments.size();
        int start = (page - 1) * size;
        int end = Math.min(start + size, total);

        List<Comment> pagedRoots = start < total ? rootComments.subList(start, end) : new ArrayList<>();

        List<CommentResponse> responses = pagedRoots.stream()
                .map(comment -> buildCommentResponse(comment, childrenMap))
                .collect(Collectors.toList());

        return PageResult.of(responses, total, page, size);
    }

    private CommentResponse buildCommentResponse(Comment comment, Map<Long, List<Comment>> childrenMap) {
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

        if (comment.getReplyToUserId() != null) {
            User replyToUser = userMapper.selectById(comment.getReplyToUserId());
            if (replyToUser != null) {
                response.setReplyToUser(buildUserResponse(replyToUser));
            }
        }

        List<Comment> children = childrenMap.get(comment.getId());
        if (children != null && !children.isEmpty()) {
            List<CommentResponse> childResponses = children.stream()
                    .map(child -> buildCommentResponse(child, childrenMap))
                    .collect(Collectors.toList());
            response.setChildren(childResponses);
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
