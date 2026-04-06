-- 切换到 ctrip_assistant 数据库
USE ctrip_assistant;

-- 创建用户表
CREATE TABLE IF NOT EXISTS t_usermodel (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(20)  NOT NULL UNIQUE        COMMENT '用户名',
    password    VARCHAR(200) NOT NULL               COMMENT '密码（bcrypt hash）',
    phone       VARCHAR(20)  NULL                   COMMENT '手机号码',
    email       VARCHAR(50)  NULL                   COMMENT '邮箱地址',
    real_name   VARCHAR(50)  NULL                   COMMENT '真实姓名',
    icon        VARCHAR(100) NULL
                DEFAULT '/static/user_icon/default.jpg' COMMENT '头像路径',
    create_time DATETIME     DEFAULT NOW()          COMMENT '创建时间',
    update_time DATETIME     DEFAULT NOW()
                ON UPDATE NOW()                     COMMENT '最后修改时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 插入一个测试账号（密码明文：meng12798，bcrypt hash）
INSERT IGNORE INTO t_usermodel (username, password, email)
VALUES (
    'admin',
    '$2b$12$KIXbMbFbgFTMQjkFqhMnOOQBkFqhMnOO.example.hash.here',
    'admin@tripmind.ai'
);
