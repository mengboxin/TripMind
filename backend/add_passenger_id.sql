USE ctrip_assistant;

-- 给用户表加 passenger_id 字段
ALTER TABLE t_usermodel
  ADD COLUMN passenger_id VARCHAR(20) NULL DEFAULT NULL COMMENT '关联的旅客ID（对应tickets表的passenger_id）'
  AFTER email;

-- 给测试用户绑定真实的 passenger_id（数据库里已有的旅客）
-- 先查一下数据库里有哪些 passenger_id：SELECT DISTINCT passenger_id FROM tickets LIMIT 10;
-- 然后把你的账号绑定上去：
-- UPDATE t_usermodel SET passenger_id = '3442 587242' WHERE username = 'mengboxin';
