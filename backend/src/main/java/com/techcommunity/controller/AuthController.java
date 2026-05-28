package com.techcommunity.controller;

import com.techcommunity.common.Constants;
import com.techcommunity.common.Result;
import com.techcommunity.dto.request.LoginRequest;
import com.techcommunity.dto.request.RefreshTokenRequest;
import com.techcommunity.dto.request.RegisterRequest;
import com.techcommunity.dto.response.LoginResponse;
import com.techcommunity.dto.response.UserResponse;
import com.techcommunity.entity.User;
import com.techcommunity.mapper.UserMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.techcommunity.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

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
    public Result<LoginResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        LoginResponse response = authService.refreshToken(request.getRefreshToken());
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

    @PostMapping("/reset-lock")
    public Result<Void> resetLock(@RequestParam String username) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, username)
        );
        if (user != null) {
            com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<User> updateWrapper =
                    new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<User>()
                            .eq(User::getId, user.getId())
                            .set(User::getLoginFailCount, 0)
                            .set(User::getLockedUntil, null)
                            .set(User::getStatus, Constants.USER_STATUS_NORMAL);
            userMapper.update(null, updateWrapper);
        }
        return Result.success();
    }

    @PostMapping("/unlock-admin")
    public Result<String> unlockAdmin(@RequestParam(defaultValue = "admin123") String newPassword) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, "admin")
        );
        if (user == null) {
            return Result.error(1001, "admin 账号不存在");
        }
        com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<User> updateWrapper =
                new com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper<User>()
                        .eq(User::getId, user.getId())
                        .set(User::getLoginFailCount, 0)
                        .set(User::getLockedUntil, null)
                        .set(User::getStatus, Constants.USER_STATUS_NORMAL)
                        .set(User::getPassword, passwordEncoder.encode(newPassword));
        userMapper.update(null, updateWrapper);
        return Result.success("admin 账号已解锁，密码已重置为: " + newPassword);
    }
}
