-- 目的地表
CREATE TABLE IF NOT EXISTS t_destinations (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    dest_id     VARCHAR(50)  NOT NULL UNIQUE,
    name        VARCHAR(50)  NOT NULL,
    country     VARCHAR(50)  NOT NULL,
    region      VARCHAR(20)  NOT NULL,
    tag         VARCHAR(50)  NOT NULL,
    lat         DOUBLE       NOT NULL,
    lon         DOUBLE       NOT NULL,
    img         VARCHAR(500) NOT NULL,
    description TEXT         NOT NULL,
    highlights  TEXT         NOT NULL COMMENT 'JSON 数组',
    food        TEXT         NOT NULL COMMENT 'JSON 数组',
    best_time   VARCHAR(100) NOT NULL,
    flights     VARCHAR(100) NOT NULL,
    is_active   TINYINT(1)   NOT NULL DEFAULT 1,
    sort_order  INT          NOT NULL DEFAULT 0,
    create_time DATETIME     DEFAULT NOW(),
    update_time DATETIME     DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 模型配置表：直接存 api_key 和 base_url，不再依赖 env 变量名
CREATE TABLE IF NOT EXISTS t_model_config (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE COMMENT '配置名称',
    provider    VARCHAR(20)  NOT NULL COMMENT 'openai/tongyi/zhipu/custom',
    model_name  VARCHAR(100) NOT NULL COMMENT '模型名称，如 qwen-plus',
    api_key     VARCHAR(500) NOT NULL COMMENT 'API Key 明文（仅存服务端）',
    base_url    VARCHAR(300) NOT NULL DEFAULT '' COMMENT 'Base URL，留空则用默认',
    temperature FLOAT        NOT NULL DEFAULT 0.7,
    is_active   TINYINT(1)   NOT NULL DEFAULT 0,
    create_time DATETIME     DEFAULT NOW(),
    update_time DATETIME     DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
