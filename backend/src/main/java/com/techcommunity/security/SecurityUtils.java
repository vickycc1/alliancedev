package com.techcommunity.security;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.techcommunity.common.Constants;
import com.techcommunity.common.ErrorCode;
import com.techcommunity.entity.User;
import com.techcommunity.exception.BusinessException;
import com.techcommunity.mapper.UserMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    private static UserMapper userMapper;

    public SecurityUtils(UserMapper userMapper) {
        SecurityUtils.userMapper = userMapper;
    }

    public static Long getCurrentUserId() {
        String username = getCurrentUsername();
        if (username == null) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, username)
        );
        if (user == null) {
            throw new BusinessException(ErrorCode.USER_NOT_FOUND);
        }
        return user.getId();
    }

    public static Long getCurrentUserIdOrNull() {
        String username = getCurrentUsername();
        if (username == null) {
            return null;
        }
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, username)
        );
        return user != null ? user.getId() : null;
    }

    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            return ((UserDetails) authentication.getPrincipal()).getUsername();
        }
        return null;
    }

    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal());
    }

    public static boolean hasRole(String role) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals(role));
    }

    public static boolean isAdmin() {
        return hasRole("ROLE_" + Constants.ROLE_ADMIN);
    }

    public static boolean isModerator() {
        return hasRole("ROLE_" + Constants.ROLE_MODERATOR) || isAdmin();
    }
}
