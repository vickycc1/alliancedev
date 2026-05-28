-- TechCommunity 数据初始化脚本
-- 包含: 角色、权限、管理员账号、默认板块、敏感词

USE `tech_community`;

-- ============================================
-- 1. 初始化角色
-- ============================================
INSERT INTO `t_role` (`id`, `role_name`, `role_code`, `description`) VALUES
(1, '超级管理员', 'ADMIN', '拥有所有权限，可管理用户、板块、帖子、系统配置'),
(2, '板块管理员', 'MODERATOR', '管理指定板块的帖子（置顶/加精/屏蔽/移动）'),
(3, '普通用户', 'USER', '发帖、评论、点赞、收藏、分享、举报'),
(4, '禁言用户', 'MUTED', '可浏览内容，不可发帖和评论');

-- ============================================
-- 2. 初始化权限
-- ============================================
INSERT INTO `t_permission` (`id`, `permission_name`, `permission_code`, `resource_type`, `parent_id`, `sort_order`) VALUES
-- 帖子权限
(1, '发布帖子', 'post:create', 'API', 0, 1),
(2, '编辑自己的帖子', 'post:edit:self', 'API', 0, 2),
(3, '删除自己的帖子', 'post:delete:self', 'API', 0, 3),
(4, '置顶帖子', 'post:top', 'API', 0, 4),
(5, '加精帖子', 'post:essence', 'API', 0, 5),
(6, '屏蔽帖子', 'post:block', 'API', 0, 6),
(7, '查看帖子', 'post:view', 'API', 0, 7),
-- 评论权限
(10, '发布评论', 'comment:create', 'API', 0, 10),
(11, '删除自己的评论', 'comment:delete:self', 'API', 0, 11),
(12, '屏蔽评论', 'comment:block', 'API', 0, 12),
-- 互动权限
(20, '点赞', 'like:toggle', 'API', 0, 20),
(21, '收藏', 'favorite:toggle', 'API', 0, 21),
(22, '分享', 'share:create', 'API', 0, 22),
-- 举报权限
(30, '提交举报', 'report:submit', 'API', 0, 30),
(31, '处理举报', 'report:handle', 'API', 0, 31),
-- AI权限
(40, '请求AI回答', 'ai:request', 'API', 0, 40),
-- 用户管理权限
(50, '管理用户', 'user:manage', 'API', 0, 50),
(51, '查看用户', 'user:view', 'API', 0, 51),
-- 板块管理权限
(60, '管理板块', 'category:manage', 'API', 0, 60),
(61, '查看板块', 'category:view', 'API', 0, 61),
-- 系统配置权限
(70, '系统配置', 'system:config', 'API', 0, 70),
-- 通知权限
(80, '查看通知', 'notification:view', 'API', 0, 80),
-- 搜索权限
(90, '搜索', 'search:query', 'API', 0, 90);

-- ============================================
-- 3. 角色权限关联
-- ============================================
-- ADMIN 拥有所有权限
INSERT INTO `t_role_permission` (`role_id`, `permission_id`)
SELECT 1, `id` FROM `t_permission`;

-- MODERATOR 权限
INSERT INTO `t_role_permission` (`role_id`, `permission_id`) VALUES
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7),
(2, 10), (2, 11), (2, 12),
(2, 20), (2, 21), (2, 22),
(2, 30), (2, 31),
(2, 40),
(2, 51), (2, 61), (2, 80), (2, 90);

-- USER 权限
INSERT INTO `t_role_permission` (`role_id`, `permission_id`) VALUES
(3, 1), (3, 2), (3, 3), (3, 7),
(3, 10), (3, 11),
(3, 20), (3, 21), (3, 22),
(3, 30),
(3, 40),
(3, 51), (3, 61), (3, 80), (3, 90);

-- MUTED 权限（仅浏览和点赞收藏）
INSERT INTO `t_role_permission` (`role_id`, `permission_id`) VALUES
(4, 7), (4, 20), (4, 21), (4, 22), (4, 30), (4, 51), (4, 61), (4, 80), (4, 90);

-- ============================================
-- 4. 初始化管理员账号
-- 密码: admin123 (BCrypt加密)
-- ============================================
INSERT INTO `t_user` (`id`, `username`, `password`, `nickname`, `email`, `status`) VALUES
(1, 'admin', '$2a$10$N.zmdr9k7uOCQv37YlQJ.u2rQ9wW8Y3xJZ4K5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z', '系统管理员', 'admin@techcommunity.com', 1);

INSERT INTO `t_user_role` (`user_id`, `role_id`) VALUES (1, 1);

-- ============================================
-- 5. 初始化默认板块
-- ============================================
INSERT INTO `t_category` (`id`, `parent_id`, `name`, `description`, `sort_order`, `status`) VALUES
-- 一级板块
(1, 0, '技术交流', '技术问题讨论与经验分享', 1, 1),
(2, 0, '产品与设计', '产品设计、用户体验相关讨论', 2, 1),
(3, 0, '团队与流程', '团队管理、开发流程、敏捷实践', 3, 1),
(4, 0, '职业发展', '职业规划、面试经验、行业动态', 4, 1),
(5, 0, '开源项目', '开源项目分享与协作', 5, 1),

-- 二级板块 - 技术交流
(10, 1, '后端开发', 'Java、Go、Python、Node.js等后端技术', 1, 1),
(11, 1, '前端开发', 'React、Vue、Angular等前端技术', 2, 1),
(12, 1, '移动开发', 'iOS、Android、跨平台开发', 3, 1),
(13, 1, '数据库', 'MySQL、PostgreSQL、Redis、MongoDB等', 4, 1),
(14, 1, '运维与DevOps', 'Docker、K8s、CI/CD、监控运维', 5, 1),
(15, 1, '架构设计', '系统架构、微服务、分布式设计', 6, 1),
(16, 1, 'AI与大数据', '机器学习、深度学习、大数据技术', 7, 1),

-- 二级板块 - 产品与设计
(20, 2, '产品设计', '产品思维、需求分析、原型设计', 1, 1),
(21, 2, 'UI/UX设计', '界面设计、交互设计、设计规范', 2, 1),

-- 二级板块 - 团队与流程
(30, 3, '项目管理', '项目管理方法、工具使用', 1, 1),
(31, 3, '敏捷开发', 'Scrum、Kanban等敏捷实践', 2, 1),
(32, 3, '代码质量', '代码规范、Code Review、重构', 3, 1),

-- 三级板块 - 后端开发细分
(100, 10, 'Java/Spring', 'Java、Spring Boot、Spring Cloud相关', 1, 1),
(101, 10, 'Go', 'Go语言相关技术', 2, 1),
(102, 10, 'Python', 'Python、Django、Flask相关', 3, 1),
(103, 10, 'Node.js', 'Node.js、Express、Nest.js相关', 4, 1),

-- 三级板块 - 前端开发细分
(110, 11, 'React', 'React、Redux、Next.js相关', 1, 1),
(111, 11, 'Vue', 'Vue.js、Vuex、Nuxt.js相关', 2, 1),
(112, 11, '小程序', '微信小程序、支付宝小程序等', 3, 1);

-- ============================================
-- 6. 初始化敏感词
-- ============================================
INSERT INTO `t_sensitive_word` (`word`, `category`) VALUES
(' fuck ', '脏话'),
(' shit ', '脏话'),
(' damn ', '脏话'),
(' ass ', '脏话'),
(' bitch ', '脏话'),
('赌博', '违法'),
('彩票预测', '违法'),
('代开发票', '违法'),
('办证', '违法'),
('刷单', '欺诈'),
('兼职刷单', '欺诈'),
('日赚', '欺诈'),
('加微信', '广告'),
('加QQ', '广告'),
('私聊我', '广告');

-- ============================================
-- 7. 初始化系统配置
-- ============================================
INSERT INTO `t_system_config` (`config_key`, `config_value`, `description`) VALUES
('ai.enabled', 'false', 'AI回答功能是否启用'),
('ai.model', 'gpt-4o-mini', 'AI模型名称'),
('ai.max_tokens', '2000', 'AI最大输出Token数'),
('ai.temperature', '0.7', 'AI生成温度'),
('cas.enabled', 'false', 'CAS统一登录是否启用'),
('cas.server_url', 'https://cas.example.com/cas', 'CAS服务器地址'),
('rate_limit.post_limit', '10', '每小时发帖限制'),
('rate_limit.comment_limit', '30', '每小时评论限制'),
('notification.retention_days', '30', '通知保留天数'),
('content_filter.enabled', 'true', '内容合规校验是否启用'),
('content_filter.mode', 'reject', '敏感词处理模式: reject拦截/replace替换');

-- ============================================
-- 完成
-- ============================================
SELECT 'Database initialization completed!' AS message;
