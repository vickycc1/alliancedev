package com.techcommunity.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class DateUtils {

    private static final DateTimeFormatter DEFAULT_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");

    public static String format(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(DEFAULT_FORMATTER);
    }

    public static String format(LocalDateTime dateTime, String pattern) {
        return dateTime == null ? null : dateTime.format(DateTimeFormatter.ofPattern(pattern));
    }

    public static String formatDate(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(DATE_FORMATTER);
    }

    public static String formatTime(LocalDateTime dateTime) {
        return dateTime == null ? null : dateTime.format(TIME_FORMATTER);
    }

    public static LocalDateTime parse(String dateStr) {
        return StringUtils.isEmpty(dateStr) ? null : LocalDateTime.parse(dateStr, DEFAULT_FORMATTER);
    }

    public static LocalDateTime parse(String dateStr, String pattern) {
        return StringUtils.isEmpty(dateStr) ? null : LocalDateTime.parse(dateStr, DateTimeFormatter.ofPattern(pattern));
    }

    public static String formatRelative(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        long diffSeconds = java.time.Duration.between(dateTime, now).getSeconds();

        if (diffSeconds < 60) {
            return "刚刚";
        } else if (diffSeconds < 3600) {
            return diffSeconds / 60 + "分钟前";
        } else if (diffSeconds < 86400) {
            return diffSeconds / 3600 + "小时前";
        } else if (diffSeconds < 604800) {
            return diffSeconds / 86400 + "天前";
        } else {
            return formatDate(dateTime);
        }
    }
}
