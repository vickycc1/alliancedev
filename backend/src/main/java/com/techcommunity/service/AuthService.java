package com.techcommunity.service;

import com.techcommunity.common.PageResult;
import com.techcommunity.dto.request.LoginRequest;
import com.techcommunity.dto.request.RegisterRequest;
import com.techcommunity.dto.response.LoginResponse;
import com.techcommunity.dto.response.UserResponse;

public interface AuthService {

    void register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    LoginResponse refreshToken(String refreshToken);

    void logout();

    UserResponse getCurrentUser();
}
