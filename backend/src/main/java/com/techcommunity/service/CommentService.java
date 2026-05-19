package com.techcommunity.service;

import com.techcommunity.common.PageResult;
import com.techcommunity.dto.request.CommentCreateRequest;
import com.techcommunity.dto.response.CommentResponse;

public interface CommentService {

    Long createComment(CommentCreateRequest request, Long userId);

    void deleteComment(Long commentId, Long userId);

    PageResult<CommentResponse> getCommentsByPostId(Long postId, Integer page, Integer size);
}
