# TechCommunity Backend

企业级技术交流分享社区后端服务

## 技术栈

- Java 17
- Spring Boot 3.2.5
- Spring Security + JWT
- MyBatis-Plus 3.5.6
- MySQL 8.0
- Redis 7.x

## 项目结构

```
backend/
├── src/main/java/com/techcommunity/
│   ├── TechCommunityApplication.java  # 启动类
│   ├── config/                        # 配置类
│   ├── common/                        # 通用类
│   ├── exception/                     # 异常处理
│   ├── security/                      # 安全模块
│   ├── entity/                        # 实体类
│   ├── mapper/                        # Mapper接口
│   ├── service/                       # 业务逻辑层
│   ├── controller/                    # API控制器
│   └── dto/                           # 数据传输对象
├── src/main/resources/
│   ├── application.yml                # 主配置
│   ├── application-dev.yml            # 开发环境配置
│   ├── application-prod.yml           # 生产环境配置
│   └── db/                            # 数据库脚本
├── Dockerfile                         # Docker镜像构建
├── docker-compose.yml                 # 容器编排
└── pom.xml                            # Maven配置
```

## 快速开始

### 本地开发

1. 安装依赖
```bash
mvn clean install
```

2. 启动MySQL和Redis

3. 初始化数据库
```bash
mysql -u root -p < src/main/resources/db/schema.sql
mysql -u root -p tech_community < src/main/resources/db/data-init.sql
```

4. 启动应用
```bash
mvn spring-boot:run
```

### Docker部署

1. 构建并启动
```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

2. 停止服务
```bash
# Windows
stop.bat

# Linux/Mac
./stop.sh
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| DB_HOST | MySQL主机 | localhost |
| DB_PORT | MySQL端口 | 3306 |
| DB_NAME | 数据库名 | tech_community |
| DB_USERNAME | 数据库用户名 | root |
| DB_PASSWORD | 数据库密码 | root |
| REDIS_HOST | Redis主机 | localhost |
| REDIS_PORT | Redis端口 | 6379 |
| JWT_SECRET | JWT密钥 | - |
| AI_ENABLED | AI功能开关 | false |
| AI_API_KEY | AI API密钥 | - |
| AI_BASE_URL | AI API地址 | https://api.openai.com |
| AI_MODEL | AI模型 | gpt-4o-mini |
| CAS_ENABLED | CAS登录开关 | false |
| CAS_SERVER_URL | CAS服务器地址 | - |

## API文档

启动后访问: http://localhost:8080/api

### 主要接口

- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- POST /api/auth/logout - 退出登录
- GET /api/categories/tree - 板块树
- POST /api/posts - 发布帖子
- GET /api/posts/{id} - 帖子详情
- POST /api/comments - 发布评论
- POST /api/interaction/like - 点赞
- POST /api/interaction/favorite - 收藏

## 默认账号

- 用户名: admin
- 密码: admin123
