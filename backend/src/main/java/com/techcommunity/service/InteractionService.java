package com.techcommunity.service;

import com.techcommunity.dto.request.ReportCreateRequest;

public interface InteractionService {

    boolean toggleLike(Long userId, Long targetId, Integer targetType);

    boolean toggleFavorite(Long userId, Long postId);

    void recordShare(Long userId, Long postId, String channel);

    Long createReport(ReportCreateRequest request, Long userId);

    boolean isLiked(Long userId, Long targetId, Integer targetType);

    boolean isFavorited(Long userId, Long postId);
}
