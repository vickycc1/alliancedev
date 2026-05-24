package com.techcommunity.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.techcommunity.common.Constants;
import com.techcommunity.dto.request.ReportCreateRequest;
import com.techcommunity.entity.*;
import com.techcommunity.mapper.*;
import com.techcommunity.service.InteractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InteractionServiceImpl implements InteractionService {

    private final LikeMapper likeMapper;
    private final FavoriteMapper favoriteMapper;
    private final ShareMapper shareMapper;
    private final ReportMapper reportMapper;
    private final PostMapper postMapper;
    private final CommentMapper commentMapper;

    @Override
    @Transactional
    public boolean toggleLike(Long userId, Long targetId, Integer targetType) {
        Like existingLike = likeMapper.selectOne(
                new LambdaQueryWrapper<Like>()
                        .eq(Like::getUserId, userId)
                        .eq(Like::getTargetId, targetId)
                        .eq(Like::getTargetType, targetType)
        );

        if (existingLike != null) {
            likeMapper.deleteById(existingLike.getId());
            updateLikeCount(targetId, targetType, -1);
            return false;
        } else {
            Like like = new Like();
            like.setUserId(userId);
            like.setTargetId(targetId);
            like.setTargetType(targetType);
            likeMapper.insert(like);
            updateLikeCount(targetId, targetType, 1);
            return true;
        }
    }

    @Override
    @Transactional
    public boolean toggleFavorite(Long userId, Long postId) {
        Favorite existingFavorite = favoriteMapper.selectOne(
                new LambdaQueryWrapper<Favorite>()
                        .eq(Favorite::getUserId, userId)
                        .eq(Favorite::getPostId, postId)
        );

        if (existingFavorite != null) {
            favoriteMapper.deleteById(existingFavorite.getId());
            updateFavoriteCount(postId, -1);
            return false;
        } else {
            Favorite favorite = new Favorite();
            favorite.setUserId(userId);
            favorite.setPostId(postId);
            favoriteMapper.insert(favorite);
            updateFavoriteCount(postId, 1);
            return true;
        }
    }

    @Override
    @Transactional
    public void recordShare(Long userId, Long postId, String channel) {
        Share share = new Share();
        share.setUserId(userId);
        share.setPostId(postId);
        share.setChannel(channel);
        shareMapper.insert(share);

        Post post = postMapper.selectById(postId);
        if (post != null) {
            post.setShareCount(post.getShareCount() + 1);
            postMapper.updateById(post);
        }
    }

    @Override
    @Transactional
    public Long createReport(ReportCreateRequest request, Long userId) {
        Report report = new Report();
        report.setUserId(userId);
        report.setTargetId(request.getTargetId());
        report.setTargetType(request.getTargetType());
        report.setReason(request.getReason());
        report.setStatus(Constants.REPORT_STATUS_PENDING);
        reportMapper.insert(report);
        return report.getId();
    }

    @Override
    public boolean isLiked(Long userId, Long targetId, Integer targetType) {
        return likeMapper.selectCount(
                new LambdaQueryWrapper<Like>()
                        .eq(Like::getUserId, userId)
                        .eq(Like::getTargetId, targetId)
                        .eq(Like::getTargetType, targetType)
        ) > 0;
    }

    @Override
    public boolean isFavorited(Long userId, Long postId) {
        return favoriteMapper.selectCount(
                new LambdaQueryWrapper<Favorite>()
                        .eq(Favorite::getUserId, userId)
                        .eq(Favorite::getPostId, postId)
        ) > 0;
    }

    private void updateLikeCount(Long targetId, Integer targetType, int delta) {
        if (targetType == Constants.TARGET_TYPE_POST) {
            Post post = postMapper.selectById(targetId);
            if (post != null) {
                post.setLikeCount(Math.max(0, post.getLikeCount() + delta));
                postMapper.updateById(post);
            }
        } else if (targetType == Constants.TARGET_TYPE_COMMENT) {
            Comment comment = commentMapper.selectById(targetId);
            if (comment != null) {
                comment.setLikeCount(Math.max(0, comment.getLikeCount() + delta));
                commentMapper.updateById(comment);
            }
        }
    }

    private void updateFavoriteCount(Long postId, int delta) {
        Post post = postMapper.selectById(postId);
        if (post != null) {
            post.setFavoriteCount(Math.max(0, post.getFavoriteCount() + delta));
            postMapper.updateById(post);
        }
    }
}
