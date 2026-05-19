package com.techcommunity.service;

public interface InteractionService {

    boolean toggleLike(Long userId, Long targetId, Integer targetType);

    boolean toggleFavorite(Long userId, Long postId);

    void recordShare(Long userId, Long postId, String channel);

    boolean isLiked(Long userId, Long targetId, Integer targetType);

    boolean isFavorited(Long userId, Long postId);
}
