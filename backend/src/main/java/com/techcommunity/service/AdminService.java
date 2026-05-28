package com.techcommunity.service;

import com.techcommunity.common.PageResult;
import com.techcommunity.dto.response.CommentResponse;
import com.techcommunity.dto.response.DashboardStatsResponse;
import com.techcommunity.dto.response.PostResponse;
import com.techcommunity.dto.response.ReportResponse;
import com.techcommunity.dto.response.UserResponse;

public interface AdminService {

    DashboardStatsResponse getDashboardStats();

    PageResult<UserResponse> getUserList(String keyword, Integer status, String role, Integer page, Integer size);

    UserResponse getUserDetail(Long userId);

    PageResult<PostResponse> getPostList(String keyword, Integer status, Integer page, Integer size);

    PageResult<CommentResponse> getCommentList(String keyword, Integer status, Integer page, Integer size);

    PageResult<ReportResponse> getReportList(Integer status, Integer targetType, Integer page, Integer size);

    ReportResponse getReportDetail(Long reportId);

    void handleReport(Long reportId, Integer status, String handleResult, Long handlerId);

    void updateUserStatus(Long userId, Integer status);

    void updateUserRoles(Long userId, java.util.List<Long> roleIds);

    void updateUserRolesByCodes(Long userId, java.util.List<String> roleCodes);
}
