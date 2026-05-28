package com.techcommunity.service;

import com.techcommunity.common.PageResult;
import com.techcommunity.entity.Notification;

public interface NotificationService {

    void sendNotification(Long receiverId, Long senderId, Integer type, String title, String content, Long relatedId);

    Long getUnreadCount(Long userId);

    PageResult<Notification> getNotifications(Long userId, Integer type, Integer page, Integer size);

    void markAsRead(Long userId, Long notificationId);

    void markAllAsRead(Long userId);
}
