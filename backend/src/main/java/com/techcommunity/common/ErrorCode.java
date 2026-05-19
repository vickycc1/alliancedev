package com.techcommunity.common;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    SUCCESS(200, "操作成功"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未登录或Token已过期"),
    FORBIDDEN(403, "无权限访问"),
    NOT_FOUND(404, "资源不存在"),
    CONFLICT(409, "数据冲突"),
    RATE_LIMITED(429, "请求过于频繁"),
    INTERNAL_ERROR(500, "服务器内部错误"),

    USER_EXISTS(1001, "用户名已存在"),
    USER_NOT_FOUND(1002, "用户不存在"),
    PASSWORD_ERROR(1003, "密码错误"),
    USER_DISABLED(1004, "账号已被禁用"),
    USER_LOCKED(1005, "账号已被锁定"),
    EMAIL_EXISTS(1006, "邮箱已被使用"),
    LOGIN_FAIL_LIMIT(1007, "登录失败次数过多，请稍后重试"),
    OLD_PASSWORD_ERROR(1008, "旧密码错误"),

    POST_NOT_FOUND(2001, "帖子不存在"),
    POST_NO_PERMISSION(2002, "无权操作此帖子"),
    POST_LIMIT_EXCEEDED(2003, "发帖频率超限"),
    POST_BLOCKED(2004, "帖子已被屏蔽"),
    POST_DELETED(2005, "帖子已被删除"),
    CATEGORY_NOT_FOUND(2006, "板块不存在"),
    CATEGORY_NOT_LEAF(2007, "请选择末级板块"),
    CATEGORY_HAS_CHILDREN(2008, "该板块存在子板块，无法删除"),
    CATEGORY_HAS_POSTS(2009, "该板块存在帖子，无法删除"),

    COMMENT_NOT_FOUND(3001, "评论不存在"),
    COMMENT_LIMIT_EXCEEDED(3002, "评论频率超限"),
    COMMENT_BLOCKED(3003, "评论已被屏蔽"),
    COMMENT_NO_PERMISSION(3004, "无权操作此评论"),

    AI_SERVICE_UNAVAILABLE(4001, "AI服务暂不可用"),
    AI_GENERATE_FAILED(4002, "AI回答生成失败"),
    AI_ALREADY_EXISTS(4003, "该帖子已有AI回答"),
    AI_NOT_ENABLED(4004, "AI功能未启用"),

    CONTENT_SENSITIVE(5001, "内容包含违规信息"),

    REPORT_ALREADY_EXISTS(6001, "已举报过该内容"),
    REPORT_NOT_FOUND(6002, "举报记录不存在"),
    REPORT_ALREADY_HANDLED(6003, "举报已处理"),

    FILE_TOO_LARGE(7001, "文件大小超过限制"),
    FILE_TYPE_NOT_ALLOWED(7002, "文件类型不允许");

    private final int code;
    private final String message;
}
