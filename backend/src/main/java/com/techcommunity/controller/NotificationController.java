package com.techcommunity.controller;

import com.techcommunity.common.PageResult;
import com.techcommunity.common.Result;
import com.techcommunity.entity.Notification;
import com.techcommunity.security.SecurityUtils;
import com.techcommunity.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/unread-count")
    public Result<Long> getUnreadCount() {
        Long userId = SecurityUtils.getCurrentUserId();
        Long count = notificationService.getUnreadCount(userId);
        return Result.success(count);
    }

    @GetMapping
    public Result<PageResult<Notification>> getNotifications(
            @RequestParam(required = false) Integer type,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        Long userId = SecurityUtils.getCurrentUserId();
        PageResult<Notification> result = notificationService.getNotifications(userId, type, page, size);
        return Result.success(result);
    }

    @PutMapping("/{id}/read")
    public Result<Void> markAsRead(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        notificationService.markAsRead(userId, id);
        return Result.success();
    }

    @PutMapping("/read-all")
    public Result<Void> markAllAsRead() {
        Long userId = SecurityUtils.getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return Result.success();
    }
}
