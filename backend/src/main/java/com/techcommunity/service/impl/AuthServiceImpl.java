package com.techcommunity.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.techcommunity.common.Constants;
import com.techcommunity.common.ErrorCode;
import com.techcommunity.config.JwtConfig;
import com.techcommunity.dto.request.LoginRequest;
import com.techcommunity.dto.request.RegisterRequest;
import com.techcommunity.dto.response.LoginResponse;
import com.techcommunity.dto.response.UserResponse;
import com.techcommunity.entity.Role;
import com.techcommunity.entity.User;
import com.techcommunity.entity.UserRole;
import com.techcommunity.exception.BusinessException;
import com.techcommunity.mapper.RoleMapper;
import com.techcommunity.mapper.UserMapper;
import com.techcommunity.mapper.UserRoleMapper;
import com.techcommunity.security.JwtTokenProvider;
import com.techcommunity.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;
    private final RoleMapper roleMapper;
    private final UserRoleMapper userRoleMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtConfig jwtConfig;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        Long existCount = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername())
        );
        if (existCount > 0) {
            throw new BusinessException(ErrorCode.USER_EXISTS);
        }

        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            Long emailCount = userMapper.selectCount(
                    new LambdaQueryWrapper<User>().eq(User::getEmail, request.getEmail())
            );
            if (emailCount > 0) {
                throw new BusinessException(ErrorCode.EMAIL_EXISTS);
            }
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setEmail(request.getEmail());
        user.setStatus(Constants.USER_STATUS_NORMAL);
        user.setLoginFailCount(0);

        userMapper.insert(user);

        Role userRole = roleMapper.selectOne(
                new LambdaQueryWrapper<Role>().eq(Role::getRoleCode, Constants.ROLE_USER)
        );
        if (userRole != null) {
            UserRole ur = new UserRole();
            ur.setUserId(user.getId());
            ur.setRoleId(userRole.getId());
            userRoleMapper.insert(ur);
        }
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, request.getUsername())
        );

        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        if (user.getStatus() == Constants.USER_STATUS_DISABLED) {
            throw new BusinessException(ErrorCode.USER_DISABLED);
        }

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.USER_LOCKED);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            int failCount = user.getLoginFailCount() + 1;
            user.setLoginFailCount(failCount);

            if (failCount >= Constants.MAX_LOGIN_FAIL_COUNT) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(Constants.LOGIN_LOCK_MINUTES));
                userMapper.updateById(user);
                throw new BusinessException(ErrorCode.LOGIN_FAIL_LIMIT);
            }

            userMapper.updateById(user);
            throw new BusinessException(ErrorCode.PASSWORD_ERROR);
        }

        user.setLoginFailCount(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(LocalDateTime.now());
        userMapper.updateById(user);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getUsername());

        String tokenKey = "token:" + user.getId();
        String refreshTokenKey = "refresh_token:" + user.getId();
        redisTemplate.opsForValue().set(tokenKey, token, jwtConfig.getExpiration(), TimeUnit.MILLISECONDS);
        redisTemplate.opsForValue().set(refreshTokenKey, refreshToken, jwtConfig.getRefreshExpiration(), TimeUnit.MILLISECONDS);

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setRefreshToken(refreshToken);
        response.setExpiresIn(jwtConfig.getExpiration() / 1000);
        response.setUser(buildUserResponse(user));

        return response;
    }

    @Override
    public LoginResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        Long userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);

        String refreshTokenKey = "refresh_token:" + userId;
        Object storedRefreshToken = redisTemplate.opsForValue().get(refreshTokenKey);
        if (storedRefreshToken == null || !storedRefreshToken.toString().equals(refreshToken)) {
            log.warn("无效的refreshToken, userId: {}", userId);
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        User user = userMapper.selectById(userId);
        if (user == null || user.getStatus() != Constants.USER_STATUS_NORMAL) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        String newToken = jwtTokenProvider.generateToken(userId, username);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(userId, username);

        String tokenKey = "token:" + userId;
        redisTemplate.opsForValue().set(tokenKey, newToken, jwtConfig.getExpiration(), TimeUnit.MILLISECONDS);
        redisTemplate.opsForValue().set(refreshTokenKey, newRefreshToken, jwtConfig.getRefreshExpiration(), TimeUnit.MILLISECONDS);

        LoginResponse response = new LoginResponse();
        response.setToken(newToken);
        response.setRefreshToken(newRefreshToken);
        response.setExpiresIn(jwtConfig.getExpiration() / 1000);
        response.setUser(buildUserResponse(user));

        return response;
    }

    @Override
    public void logout() {
        String username = SecurityUtils.getCurrentUsername();
        if (username != null) {
            User user = userMapper.selectOne(
                    new LambdaQueryWrapper<User>().eq(User::getUsername, username)
            );
            if (user != null) {
                String tokenKey = "token:" + user.getId();
                String refreshTokenKey = "refresh_token:" + user.getId();
                redisTemplate.delete(tokenKey);
                redisTemplate.delete(refreshTokenKey);
            }
        }
    }

    @Override
    public UserResponse getCurrentUser() {
        String username = SecurityUtils.getCurrentUsername();
        if (username == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }

        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, username)
        );
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }

        return buildUserResponse(user);
    }

    private UserResponse buildUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setNickname(user.getNickname());
        response.setAvatar(user.getAvatar());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setBio(user.getBio());
        response.setStatus(user.getStatus());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        response.setLastLoginAt(user.getLastLoginAt());

        List<UserRole> userRoles = userRoleMapper.selectList(
                new LambdaQueryWrapper<UserRole>().eq(UserRole::getUserId, user.getId())
        );

        List<String> roles = userRoles.stream()
                .map(ur -> roleMapper.selectById(ur.getRoleId()))
                .filter(role -> role != null)
                .map(Role::getRoleCode)
                .collect(Collectors.toList());
        response.setRoles(roles);

        return response;
    }
}
