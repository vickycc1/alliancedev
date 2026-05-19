package com.techcommunity.service;

import com.techcommunity.common.PageResult;
import com.techcommunity.dto.request.PostCreateRequest;
import com.techcommunity.dto.response.PostResponse;

public interface PostService {

    Long createPost(PostCreateRequest request, Long userId);

    PostResponse getPostDetail(Long postId, Long currentUserId);

    void updatePost(Long postId, PostCreateRequest request, Long userId);

    void deletePost(Long postId, Long userId);

    PageResult<PostResponse> getPostList(Long categoryId, String keyword, String sortBy,
                                          Boolean isTop, Boolean isEssence, Long authorId,
                                          Integer page, Integer size);

    void topPost(Long postId, Integer isTop);

    void essencePost(Long postId, Integer isEssence);

    void blockPost(Long postId);
}
