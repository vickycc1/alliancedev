package com.techcommunity.service;

import com.techcommunity.common.PageResult;
import com.techcommunity.dto.request.ReportCreateRequest;
import com.techcommunity.dto.response.CommentResponse;
import com.techcommunity.dto.response.PostResponse;

public interface AdminService {

    PageResult<PostResponse> getPostList(String keyword, Integer status, Integer page, Integer size);

    PageResult<CommentResponse> getCommentList(String keyword, Integer status, Integer page, Integer size);

    PageResult<ReportCreateRequest> getReportList(Integer status, Integer page, Integer size);

    void handleReport(Long reportId, Integer status, String handleResult, Long handlerId);

    void updateUserStatus(Long userId, Integer status);

    void updateUserRoles(Long userId, java.util.List<Long> roleIds);
}
