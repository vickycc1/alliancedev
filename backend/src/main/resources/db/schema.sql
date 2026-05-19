-- TechCommunity 数据库初始化脚本
-- 数据库: tech_community
-- 编码: utf8mb4
-- 版本: 1.0.0

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `tech_community` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `tech_community`;

-- ============================================
-- 1. 用户表 t_user
-- ============================================
DROP TABLE IF EXISTS `t_user`;
CREATE TABLE `t_user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码(BCrypt加密)',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    `avatar` VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `bio` VARCHAR(500) DEFAULT NULL COMMENT '个人简介',
    `cas_id` VARCHAR(100) DEFAULT NULL COMMENT 'CAS统一身份标识',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0禁用 1正常 2禁言',
    `login_fail_count` INT NOT NULL DEFAULT 0 COMMENT '登录失败次数',
    `locked_until` DATETIME DEFAULT NULL COMMENT '锁定截止时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
    `deleted` TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除: 0未删除 1已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`),
    UNIQUE KEY `uk_email` (`email`),
    UNIQUE KEY `uk_cas_id` (`cas_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 2. 角色表 t_role
-- ============================================
DROP TABLE IF EXISTS `t_role`;
CREATE TABLE `t_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '角色ID',
    `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称',
    `role_code` VARCHAR(50) NOT NULL COMMENT '角色编码',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '角色描述',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- ============================================
-- 3. 用户角色关联表 t_user_role
-- ============================================
DROP TABLE IF EXISTS `t_user_role`;
CREATE TABLE `t_user_role` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_role` (`user_id`, `role_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- ============================================
-- 4. 权限表 t_permission
-- ============================================
DROP TABLE IF EXISTS `t_permission`;
CREATE TABLE `t_permission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '权限ID',
    `permission_name` VARCHAR(100) NOT NULL COMMENT '权限名称',
    `permission_code` VARCHAR(100) NOT NULL COMMENT '权限编码',
    `resource_type` VARCHAR(20) DEFAULT NULL COMMENT '资源类型: MENU/BUTTON/API',
    `parent_id` BIGINT DEFAULT 0 COMMENT '父权限ID',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_permission_code` (`permission_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- ============================================
-- 5. 角色权限关联表 t_role_permission
-- ============================================
DROP TABLE IF EXISTS `t_role_permission`;
CREATE TABLE `t_role_permission` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    `permission_id` BIGINT NOT NULL COMMENT '权限ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`),
    KEY `idx_role_id` (`role_id`),
    KEY `idx_permission_id` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- ============================================
-- 6. 板块表 t_category
-- ============================================
DROP TABLE IF EXISTS `t_category`;
CREATE TABLE `t_category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '板块ID',
    `parent_id` BIGINT NOT NULL DEFAULT 0 COMMENT '父板块ID(0为顶级)',
    `name` VARCHAR(100) NOT NULL COMMENT '板块名称',
    `icon` VARCHAR(500) DEFAULT NULL COMMENT '板块图标URL',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '板块描述',
    `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序值(越小越靠前)',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0禁用 1启用',
    `post_count` INT NOT NULL DEFAULT 0 COMMENT '帖子数量(冗余)',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_status_sort` (`status`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='板块表';

-- ============================================
-- 7. 帖子表 t_post
-- ============================================
DROP TABLE IF EXISTS `t_post`;
CREATE TABLE `t_post` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '帖子ID',
    `category_id` BIGINT NOT NULL COMMENT '板块ID',
    `user_id` BIGINT NOT NULL COMMENT '作者ID',
    `title` VARCHAR(200) NOT NULL COMMENT '帖子标题',
    `content` LONGTEXT NOT NULL COMMENT '帖子内容(富文本HTML)',
    `summary` VARCHAR(500) DEFAULT NULL COMMENT '摘要(自动截取)',
    `view_count` INT NOT NULL DEFAULT 0 COMMENT '浏览量',
    `like_count` INT NOT NULL DEFAULT 0 COMMENT '点赞数',
    `comment_count` INT NOT NULL DEFAULT 0 COMMENT '评论数',
    `favorite_count` INT NOT NULL DEFAULT 0 COMMENT '收藏数',
    `share_count` INT NOT NULL DEFAULT 0 COMMENT '分享数',
    `is_top` TINYINT NOT NULL DEFAULT 0 COMMENT '是否置顶: 0否 1是',
    `is_essence` TINYINT NOT NULL DEFAULT 0 COMMENT '是否加精: 0否 1是',
    `ai_requested` TINYINT NOT NULL DEFAULT 0 COMMENT '是否请求AI回答: 0否 1是',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0草稿 1正常 2屏蔽 3删除',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_category_id` (`category_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_status_created` (`status`, `created_at`),
    KEY `idx_is_top` (`is_top`),
    KEY `idx_is_essence` (`is_essence`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子表';

-- ============================================
-- 8. 评论表 t_comment
-- ============================================
DROP TABLE IF EXISTS `t_comment`;
CREATE TABLE `t_comment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '评论ID',
    `post_id` BIGINT NOT NULL COMMENT '帖子ID',
    `user_id` BIGINT NOT NULL COMMENT '评论者ID',
    `parent_id` BIGINT NOT NULL DEFAULT 0 COMMENT '父评论ID(0为顶级评论)',
    `reply_to_user_id` BIGINT DEFAULT NULL COMMENT '引用回复的目标用户ID',
    `content` TEXT NOT NULL COMMENT '评论内容',
    `like_count` INT NOT NULL DEFAULT 0 COMMENT '点赞数',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0屏蔽 1正常 2删除',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_post_id` (`post_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_parent_id` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ============================================
-- 9. 点赞表 t_like
-- ============================================
DROP TABLE IF EXISTS `t_like`;
CREATE TABLE `t_like` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `target_id` BIGINT NOT NULL COMMENT '目标ID(帖子ID/评论ID)',
    `target_type` TINYINT NOT NULL COMMENT '目标类型: 1帖子 2评论',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_target` (`user_id`, `target_id`, `target_type`),
    KEY `idx_target` (`target_id`, `target_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='点赞表';

-- ============================================
-- 10. 收藏表 t_favorite
-- ============================================
DROP TABLE IF EXISTS `t_favorite`;
CREATE TABLE `t_favorite` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `post_id` BIGINT NOT NULL COMMENT '帖子ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_user_post` (`user_id`, `post_id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_post_id` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- ============================================
-- 11. 分享记录表 t_share
-- ============================================
DROP TABLE IF EXISTS `t_share`;
CREATE TABLE `t_share` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `user_id` BIGINT DEFAULT NULL COMMENT '用户ID',
    `post_id` BIGINT NOT NULL COMMENT '帖子ID',
    `channel` VARCHAR(50) DEFAULT NULL COMMENT '分享渠道: WECHAT/LINK/COPY等',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_post_id` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分享记录表';

-- ============================================
-- 12. 消息通知表 t_notification
-- ============================================
DROP TABLE IF EXISTS `t_notification`;
CREATE TABLE `t_notification` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '通知ID',
    `receiver_id` BIGINT NOT NULL COMMENT '接收用户ID',
    `sender_id` BIGINT DEFAULT NULL COMMENT '发送用户ID(系统通知为空)',
    `type` TINYINT NOT NULL COMMENT '类型: 1评论 2点赞 3收藏 4系统 5AI回答完成 6举报处理',
    `title` VARCHAR(200) DEFAULT NULL COMMENT '通知标题',
    `content` VARCHAR(500) DEFAULT NULL COMMENT '通知内容',
    `related_id` BIGINT DEFAULT NULL COMMENT '关联ID(帖子ID/评论ID等)',
    `is_read` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已读: 0未读 1已读',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_receiver_id` (`receiver_id`),
    KEY `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息通知表';

-- ============================================
-- 13. 举报表 t_report
-- ============================================
DROP TABLE IF EXISTS `t_report`;
CREATE TABLE `t_report` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '举报ID',
    `reporter_id` BIGINT NOT NULL COMMENT '举报人ID',
    `target_id` BIGINT NOT NULL COMMENT '目标ID',
    `target_type` TINYINT NOT NULL COMMENT '目标类型: 1帖子 2评论 3用户',
    `reason` VARCHAR(500) NOT NULL COMMENT '举报原因',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0待处理 1已屏蔽 2已忽略 3已警告',
    `handler_id` BIGINT DEFAULT NULL COMMENT '处理人ID',
    `handle_result` VARCHAR(500) DEFAULT NULL COMMENT '处理结果说明',
    `handled_at` DATETIME DEFAULT NULL COMMENT '处理时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_reporter_id` (`reporter_id`),
    KEY `idx_target` (`target_id`, `target_type`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='举报表';

-- ============================================
-- 14. AI回答记录表 t_ai_response
-- ============================================
DROP TABLE IF EXISTS `t_ai_response`;
CREATE TABLE `t_ai_response` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `post_id` BIGINT NOT NULL COMMENT '帖子ID',
    `content` LONGTEXT DEFAULT NULL COMMENT 'AI回答内容(Markdown)',
    `model` VARCHAR(100) DEFAULT NULL COMMENT '使用的AI模型名称',
    `prompt_tokens` INT DEFAULT NULL COMMENT '提示Token消耗',
    `completion_tokens` INT DEFAULT NULL COMMENT '补全Token消耗',
    `status` TINYINT NOT NULL DEFAULT 0 COMMENT '状态: 0生成中 1已完成 2失败',
    `error_message` VARCHAR(500) DEFAULT NULL COMMENT '错误信息',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_post_id` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI回答记录表';

-- ============================================
-- 15. 敏感词表 t_sensitive_word
-- ============================================
DROP TABLE IF EXISTS `t_sensitive_word`;
CREATE TABLE `t_sensitive_word` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `word` VARCHAR(100) NOT NULL COMMENT '敏感词',
    `category` VARCHAR(50) DEFAULT NULL COMMENT '分类',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_word` (`word`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='敏感词表';

-- ============================================
-- 16. 系统配置表 t_system_config
-- ============================================
DROP TABLE IF EXISTS `t_system_config`;
CREATE TABLE `t_system_config` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `config_key` VARCHAR(100) NOT NULL COMMENT '配置键',
    `config_value` TEXT DEFAULT NULL COMMENT '配置值',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '配置描述',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- ============================================
-- 17. 搜索记录表 t_search_record
-- ============================================
DROP TABLE IF EXISTS `t_search_record`;
CREATE TABLE `t_search_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `keyword` VARCHAR(200) NOT NULL COMMENT '搜索关键词',
    `user_id` BIGINT DEFAULT NULL COMMENT '用户ID',
    `result_count` INT DEFAULT 0 COMMENT '结果数量',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_keyword` (`keyword`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='搜索记录表';
