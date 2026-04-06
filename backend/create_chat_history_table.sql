USE ctrip_assistant;

CREATE TABLE IF NOT EXISTS t_chat_history (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(20)  NOT NULL               COMMENT '用户名',
    thread_id   VARCHAR(64)  NOT NULL               COMMENT '会话ID',
    title       VARCHAR(100) NOT NULL DEFAULT ''    COMMENT '会话标题',
    messages    LONGTEXT     NOT NULL               COMMENT '消息列表 JSON',
    updated_at  DATETIME     DEFAULT NOW() ON UPDATE NOW() COMMENT '最后更新时间',
    UNIQUE KEY uk_thread (thread_id),
    KEY idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='对话历史表';
