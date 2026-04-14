USE ctrip_assistant;

-- 旅行预算表
CREATE TABLE IF NOT EXISTS t_travel_budget (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(20)  NOT NULL,
    trip_name   VARCHAR(100) NOT NULL DEFAULT '我的旅行',
    total       DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency    VARCHAR(10)  NOT NULL DEFAULT 'CNY',
    created_at  DATETIME DEFAULT NOW(),
    updated_at  DATETIME DEFAULT NOW() ON UPDATE NOW(),
    KEY idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='旅行预算';

-- 预算消费记录表
CREATE TABLE IF NOT EXISTS t_budget_records (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(20)  NOT NULL,
    budget_id   INT          NOT NULL,
    category    VARCHAR(20)  NOT NULL COMMENT '机票/酒店/租车/餐饮/景点/其他',
    description VARCHAR(200) NOT NULL,
    amount      DECIMAL(10,2) NOT NULL,
    record_date DATETIME DEFAULT NOW(),
    KEY idx_budget (budget_id),
    KEY idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预算消费记录';
