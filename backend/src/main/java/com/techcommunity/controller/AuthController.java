package com.techcommunity.controller;

import com.techcommunity.common.Result;
import com.techcommunity.dto.request.LoginRequest;
import com.techcommunity.dto.request.RegisterRequest;
import com.techcommunity.dto.response.LoginResponse;
import com.techcommunity.dto.response.UserResponse;
import com.techcommunity.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return Result.success();
    }

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return Result.success(response);
    }

    @PostMapping("/refresh")
    public Result<LoginResponse> refreshToken(@RequestBody String refreshToken) {
        LoginResponse response = authService.refreshToken(refreshToken);
        return Result.success(response);
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        authService.logout();
        return Result.success();
    }

    @GetMapping("/me")
    public Result<UserResponse> getCurrentUser() {
        UserResponse user = authService.getCurrentUser();
        return Result.success(user);
    }
}
