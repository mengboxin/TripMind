USE ctrip_assistant;

-- 向量缓存表，避免每次重启都重新调用 Embedding API
CREATE TABLE IF NOT EXISTS t_vector_cache (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    doc_hash    VARCHAR(64)  NOT NULL UNIQUE  COMMENT 'FAQ文件内容的MD5，用于判断是否需要重建',
    doc_content TEXT         NOT NULL         COMMENT '文档段落内容',
    embedding   LONGBLOB     NOT NULL         COMMENT '向量数据（pickle序列化）',
    created_at  DATETIME     DEFAULT NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='FAQ向量缓存';
