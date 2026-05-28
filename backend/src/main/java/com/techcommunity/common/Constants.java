package com.techcommunity.common;

public class Constants {

    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String TOKEN_HEADER = "Authorization";

    public static final int USER_STATUS_DISABLED = 0;
    public static final int USER_STATUS_NORMAL = 1;
    public static final int USER_STATUS_MUTED = 2;

    public static final int POST_STATUS_DRAFT = 0;
    public static final int POST_STATUS_NORMAL = 1;
    public static final int POST_STATUS_BLOCKED = 2;
    public static final int POST_STATUS_DELETED = 3;

    public static final int COMMENT_STATUS_BLOCKED = 0;
    public static final int COMMENT_STATUS_NORMAL = 1;
    public static final int COMMENT_STATUS_DELETED = 2;

    public static final int CATEGORY_STATUS_DISABLED = 0;
    public static final int CATEGORY_STATUS_ENABLED = 1;

    public static final int NOTIFICATION_TYPE_COMMENT = 1;
    public static final int NOTIFICATION_TYPE_LIKE = 2;
    public static final int NOTIFICATION_TYPE_FAVORITE = 3;
    public static final int NOTIFICATION_TYPE_SYSTEM = 4;
    public static final int NOTIFICATION_TYPE_AI_COMPLETED = 5;
    public static final int NOTIFICATION_TYPE_REPORT_HANDLED = 6;

    public static final int REPORT_STATUS_PENDING = 0;
    public static final int REPORT_STATUS_BLOCKED = 1;
    public static final int REPORT_STATUS_IGNORED = 2;
    public static final int REPORT_STATUS_WARNED = 3;
    public static final int REPORT_STATUS_HANDLED = 4;

    public static final int TARGET_TYPE_POST = 1;
    public static final int TARGET_TYPE_COMMENT = 2;
    public static final int TARGET_TYPE_USER = 3;

    public static final int AI_STATUS_GENERATING = 0;
    public static final int AI_STATUS_COMPLETED = 1;
    public static final int AI_STATUS_FAILED = 2;

    public static final int MAX_LOGIN_FAIL_COUNT = 5;
    public static final int LOGIN_LOCK_MINUTES = 30;

    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_MODERATOR = "MODERATOR";
    public static final String ROLE_USER = "USER";
    public static final String ROLE_MUTED = "MUTED";
}
