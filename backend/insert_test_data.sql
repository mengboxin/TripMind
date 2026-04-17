USE xiecheng_assistant_db;

-- =============================================
-- 酒店数据（覆盖前端目的地：东京、巴黎、巴厘岛、瑞士、纽约、悉尼、迪拜、伦敦、曼谷、新加坡、马尔代夫、罗马）
-- =============================================
INSERT INTO hotels (name, location, price_tier, checkin_date, checkout_date, booked) VALUES
-- 东京
('东京新宿格兰德酒店', '东京', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('东京浅草传统旅馆', '东京', 'Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('东京涩谷精品酒店', '东京', 'Upper Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('东京银座豪华酒店', '东京', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('东京池袋商务酒店', '东京', 'Economy', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
-- 巴黎
('巴黎香榭丽舍精品酒店', '巴黎', 'Upper Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('巴黎埃菲尔铁塔景观酒店', '巴黎', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('巴黎蒙马特艺术旅馆', '巴黎', 'Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('巴黎左岸精品民宿', '巴黎', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
-- 巴厘岛
('巴厘岛乌布丛林度假村', '巴厘岛', 'Upper Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('巴厘岛库塔海滩酒店', '巴厘岛', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('巴厘岛水明漾无边泳池别墅', '巴厘岛', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('巴厘岛金巴兰海景酒店', '巴厘岛', 'Upper Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
-- 瑞士
('苏黎世湖畔豪华酒店', '瑞士', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('因特拉肯少女峰景观酒店', '瑞士', 'Upper Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('日内瓦湖景精品酒店', '瑞士', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('卢塞恩老城区精品旅馆', '瑞士', 'Upper Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
-- 纽约
('纽约曼哈顿中城豪华酒店', '纽约', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('纽约时代广场精品酒店', '纽约', 'Upper Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('纽约布鲁克林设计酒店', '纽约', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
-- 悉尼
('悉尼歌剧院景观酒店', '悉尼', 'Upper Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('悉尼邦迪海滩精品酒店', '悉尼', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('悉尼CBD商务酒店', '悉尼', 'Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
-- 迪拜
('迪拜帆船酒店', '迪拜', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('迪拜棕榈岛度假酒店', '迪拜', 'Upper Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('迪拜市中心豪华酒店', '迪拜', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
-- 伦敦
('伦敦西区精品酒店', '伦敦', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('伦敦泰晤士河景观酒店', '伦敦', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('伦敦肯辛顿花园酒店', '伦敦', 'Upper Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
-- 曼谷
('曼谷暹罗豪华酒店', '曼谷', 'Upper Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('曼谷湄南河景观酒店', '曼谷', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('曼谷素坤逸精品酒店', '曼谷', 'Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
-- 新加坡
('新加坡滨海湾金沙酒店', '新加坡', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('新加坡乌节路精品酒店', '新加坡', 'Upper Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('新加坡圣淘沙度假酒店', '新加坡', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
-- 马尔代夫
('马尔代夫水上屋度假村', '马尔代夫', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('马尔代夫珊瑚礁豪华别墅', '马尔代夫', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
-- 罗马
('罗马斗兽场景观酒店', '罗马', 'Upper Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('罗马西班牙广场精品酒店', '罗马', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('罗马梵蒂冈附近民宿', '罗马', 'Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0);

-- =============================================
-- 租车数据
-- =============================================
INSERT INTO car_rentals (name, location, price_tier, start_date, end_date, booked) VALUES
-- 东京
('丰田凯美瑞 - 东京新宿店', '东京', 'Economy', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('本田CR-V - 东京成田机场店', '东京', 'SUV', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('日产轩逸 - 东京涩谷店', '东京', 'Compact', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
-- 巴黎
('雷诺梅甘娜 - 巴黎戴高乐机场', '巴黎', 'Midsize', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('标致308 - 巴黎市中心', '巴黎', 'Economy', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
-- 巴厘岛
('本田爵士 - 巴厘岛库塔', '巴厘岛', 'Compact', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('丰田阿文扎 - 巴厘岛乌布', '巴厘岛', 'Midsize', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('摩托车租赁 - 巴厘岛水明漾', '巴厘岛', 'Economy', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
-- 瑞士
('大众高尔夫 - 苏黎世机场', '瑞士', 'Midsize', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('宝马3系 - 日内瓦机场', '瑞士', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
-- 纽约
('福特探险者 - 纽约JFK机场', '纽约', 'SUV', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('雪佛兰科鲁兹 - 纽约曼哈顿', '纽约', 'Economy', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
-- 悉尼
('丰田凯美瑞 - 悉尼机场', '悉尼', 'Midsize', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('现代途胜 - 悉尼市中心', '悉尼', 'SUV', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
-- 迪拜
('奔驰E级 - 迪拜国际机场', '迪拜', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('路虎揽胜 - 迪拜棕榈岛', '迪拜', 'Premium', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('丰田陆地巡洋舰 - 迪拜市中心', '迪拜', 'SUV', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
-- 伦敦
('迷你Cooper - 伦敦希思罗机场', '伦敦', 'Compact', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('大众帕萨特 - 伦敦市中心', '伦敦', 'Midsize', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
-- 曼谷
('本田思域 - 曼谷素万那普机场', '曼谷', 'Economy', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('丰田凯美瑞 - 曼谷市中心', '曼谷', 'Midsize', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
-- 新加坡
('丰田凯美瑞 - 新加坡樟宜机场', '新加坡', 'Midsize', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('本田CR-V - 新加坡市中心', '新加坡', 'SUV', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
-- 罗马
('菲亚特500 - 罗马菲乌米奇诺机场', '罗马', 'Compact', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('阿尔法罗密欧 - 罗马市中心', '罗马', 'Premium', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0);

-- =============================================
-- 景点/旅行推荐数据
-- =============================================
INSERT INTO trip_recommendations (name, location, details, keywords, booked) VALUES
-- 东京
('东京迪士尼乐园一日游', '东京', '体验梦幻的迪士尼乐园，包含园区门票及快速通道，适合家庭和情侣出行。', '主题乐园,家庭,娱乐', 0),
('东京筑地市场美食之旅', '东京', '探索世界最大的鱼市场，品尝新鲜寿司和海鲜，由专业导游带领参观。', '美食,文化,市场', 0),
('富士山一日游', '东京', '从东京出发前往富士山，欣赏壮观的火山景色，可选择登山或湖边游览。', '自然,登山,风景', 0),
('东京夜景直升机游览', '东京', '乘坐直升机俯瞰东京璀璨夜景，包含香槟和专业摄影服务。', '夜景,豪华,空中', 0),
-- 巴黎
('卢浮宫深度参观', '巴黎', '专业艺术导游带领参观卢浮宫，重点介绍蒙娜丽莎等世界名作，含优先入场。', '艺术,博物馆,文化', 0),
('塞纳河游船晚餐', '巴黎', '在浪漫的塞纳河游船上享用法式晚餐，欣赏埃菲尔铁塔灯光秀。', '浪漫,美食,夜景', 0),
('凡尔赛宫一日游', '巴黎', '参观路易十四的宫殿和花园，了解法国皇室历史，含导游讲解。', '历史,宫殿,文化', 0),
-- 巴厘岛
('巴厘岛冲浪课程', '巴厘岛', '在库塔海滩由专业教练指导冲浪，适合初学者，含设备租赁。', '运动,海滩,冲浪', 0),
('乌布文化半日游', '巴厘岛', '参观乌布皇宫、传统市场和稻田梯田，体验巴厘岛传统文化。', '文化,传统,自然', 0),
('巴厘岛日落帆船游', '巴厘岛', '乘坐传统帆船欣赏巴厘岛日落，含鸡尾酒和轻食。', '日落,海洋,浪漫', 0),
-- 瑞士
('少女峰登山之旅', '瑞士', '乘坐登山火车前往欧洲之巅少女峰，欣赏阿尔卑斯山壮观雪景。', '登山,雪景,自然', 0),
('瑞士巧克力工厂参观', '瑞士', '参观著名巧克力工厂，了解制作工艺，含品尝和购物。', '美食,文化,工厂', 0),
('日内瓦湖游船', '瑞士', '乘坐游船游览日内瓦湖，欣赏阿尔卑斯山倒影，含午餐。', '湖泊,自然,游船', 0),
-- 纽约
('自由女神像游览', '纽约', '乘船前往自由女神像，登上皇冠俯瞰纽约港，含专业导游。', '历史,地标,文化', 0),
('百老汇音乐剧', '纽约', '观看百老汇经典音乐剧，含优质座位和演出前晚餐。', '艺术,音乐,娱乐', 0),
('纽约直升机游览', '纽约', '乘坐直升机俯瞰曼哈顿天际线，包含专业摄影服务。', '空中,城市,豪华', 0),
-- 悉尼
('悉尼歌剧院导览', '悉尼', '参观世界著名的悉尼歌剧院，了解其建筑历史和演出文化。', '建筑,文化,艺术', 0),
('大堡礁潜水之旅', '悉尼', '前往大堡礁体验浮潜和深潜，探索绚丽的珊瑚礁世界。', '潜水,海洋,自然', 0),
-- 迪拜
('迪拜沙漠越野', '迪拜', '乘坐4WD越野车穿越沙漠，体验沙丘冲浪，含贝都因营地晚餐。', '沙漠,冒险,文化', 0),
('哈利法塔观景台', '迪拜', '登上世界最高建筑哈利法塔，俯瞰迪拜全景，含快速通道。', '地标,城市,豪华', 0),
('迪拜购物节体验', '迪拜', '参观迪拜购物中心，体验室内滑雪和水族馆，含导购服务。', '购物,娱乐,家庭', 0),
-- 伦敦
('伦敦塔历史游', '伦敦', '参观伦敦塔，了解英国皇室历史和珠宝展览，含专业导游。', '历史,皇室,文化', 0),
('哈利波特影城', '伦敦', '参观华纳兄弟哈利波特影城，探索魔法世界的幕后制作。', '电影,娱乐,家庭', 0),
-- 曼谷
('曼谷寺庙文化游', '曼谷', '参观玉佛寺、卧佛寺等著名寺庙，了解泰国佛教文化。', '文化,宗教,历史', 0),
('曼谷夜市美食之旅', '曼谷', '探索曼谷著名夜市，品尝正宗泰国街头美食，含导游讲解。', '美食,夜市,文化', 0),
-- 新加坡
('新加坡环球影城', '新加坡', '体验圣淘沙环球影城，含快速通道和园区餐饮券。', '主题乐园,娱乐,家庭', 0),
('新加坡花园城市游', '新加坡', '参观滨海湾花园和超级树，欣赏灯光秀，了解新加坡绿色城市规划。', '自然,建筑,夜景', 0),
-- 马尔代夫
('马尔代夫浮潜体验', '马尔代夫', '在清澈的印度洋中浮潜，与热带鱼和海龟共游，含设备租赁。', '潜水,海洋,自然', 0),
('马尔代夫日落游船', '马尔代夫', '乘坐传统木船欣赏马尔代夫日落，含海鲜烧烤晚餐。', '日落,浪漫,美食', 0),
-- 罗马
('罗马斗兽场深度游', '罗马', '参观古罗马斗兽场和古罗马广场，了解古罗马历史，含优先入场。', '历史,古迹,文化', 0),
('梵蒂冈博物馆参观', '罗马', '参观梵蒂冈博物馆和西斯廷礼拜堂，欣赏米开朗基罗壁画。', '艺术,宗教,文化', 0),
('罗马美食烹饪课', '罗马', '学习制作正宗意大利面和提拉米苏，含食材和晚餐。', '美食,文化,烹饪', 0);

-- =============================================
-- 航班数据（主要城市间互飞，日期从今天起未来60天内）
-- 机场代码：PEK=北京, SHA=上海, PVG=上海浦东, CAN=广州
-- NRT=东京成田, CDG=巴黎, DPS=巴厘岛, ZRH=苏黎世
-- JFK=纽约, SYD=悉尼, DXB=迪拜, LHR=伦敦
-- BKK=曼谷, SIN=新加坡, MLE=马尔代夫, FCO=罗马
-- =============================================
INSERT INTO flights (flight_no, scheduled_departure, scheduled_arrival, departure_airport, arrival_airport, status, aircraft_code) VALUES
-- 北京 <-> 东京
('CA181', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 4 HOUR), 'PEK', 'NRT', 'Scheduled', '773'),
('CA182', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 4 HOUR), 'NRT', 'PEK', 'Scheduled', '773'),
('NH906', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 4 HOUR), 'PEK', 'NRT', 'Scheduled', '789'),
('NH905', DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 4 DAY), INTERVAL 4 HOUR), 'NRT', 'PEK', 'Scheduled', '789'),
-- 上海 <-> 东京
('MU521', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 3 HOUR), 'PVG', 'NRT', 'Scheduled', '332'),
('MU522', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 3 HOUR), 'NRT', 'PVG', 'Scheduled', '332'),
-- 北京 <-> 巴黎
('AF111', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 11 HOUR), 'PEK', 'CDG', 'Scheduled', '77W'),
('AF112', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 DAY), INTERVAL 10 HOUR), 'CDG', 'PEK', 'Scheduled', '77W'),
('CA851', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 7 DAY), INTERVAL 11 HOUR), 'PEK', 'CDG', 'Scheduled', '359'),
-- 北京 <-> 巴厘岛
('CZ685', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 7 HOUR), 'PEK', 'DPS', 'Scheduled', '321'),
('CZ686', DATE_ADD(NOW(), INTERVAL 8 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 8 DAY), INTERVAL 7 HOUR), 'DPS', 'PEK', 'Scheduled', '321'),
('MU731', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 6 HOUR), 'PVG', 'DPS', 'Scheduled', '320'),
-- 北京 <-> 瑞士
('LX188', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 10 HOUR), 'PEK', 'ZRH', 'Scheduled', '343'),
('LX189', DATE_ADD(NOW(), INTERVAL 9 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 9 DAY), INTERVAL 9 HOUR), 'ZRH', 'PEK', 'Scheduled', '343'),
-- 北京 <-> 纽约
('CA981', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 14 HOUR), 'PEK', 'JFK', 'Scheduled', '77W'),
('CA982', DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 10 DAY), INTERVAL 13 HOUR), 'JFK', 'PEK', 'Scheduled', '77W'),
('AA127', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 DAY), INTERVAL 14 HOUR), 'PEK', 'JFK', 'Scheduled', '789'),
-- 北京 <-> 悉尼
('CA171', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 12 HOUR), 'PEK', 'SYD', 'Scheduled', '773'),
('CA172', DATE_ADD(NOW(), INTERVAL 9 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 9 DAY), INTERVAL 11 HOUR), 'SYD', 'PEK', 'Scheduled', '773'),
-- 北京 <-> 迪拜
('EK302', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 8 HOUR), 'PEK', 'DXB', 'Scheduled', '388'),
('EK303', DATE_ADD(NOW(), INTERVAL 6 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 6 DAY), INTERVAL 8 HOUR), 'DXB', 'PEK', 'Scheduled', '388'),
('CA875', DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 4 DAY), INTERVAL 8 HOUR), 'PEK', 'DXB', 'Scheduled', '359'),
-- 北京 <-> 伦敦
('BA38', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 10 HOUR), 'PEK', 'LHR', 'Scheduled', '789'),
('BA39', DATE_ADD(NOW(), INTERVAL 9 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 9 DAY), INTERVAL 9 HOUR), 'LHR', 'PEK', 'Scheduled', '789'),
('CA855', DATE_ADD(NOW(), INTERVAL 6 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 6 DAY), INTERVAL 10 HOUR), 'PEK', 'LHR', 'Scheduled', '77W'),
-- 北京 <-> 曼谷
('TG614', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 5 HOUR), 'PEK', 'BKK', 'Scheduled', '333'),
('TG615', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 DAY), INTERVAL 5 HOUR), 'BKK', 'PEK', 'Scheduled', '333'),
('CA839', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 5 HOUR), 'PEK', 'BKK', 'Scheduled', '321'),
-- 北京 <-> 新加坡
('SQ802', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 6 HOUR), 'PEK', 'SIN', 'Scheduled', '359'),
('SQ803', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 7 DAY), INTERVAL 6 HOUR), 'SIN', 'PEK', 'Scheduled', '359'),
('CA861', DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 4 DAY), INTERVAL 6 HOUR), 'PEK', 'SIN', 'Scheduled', '332'),
-- 北京 <-> 马尔代夫
('MU741', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 7 HOUR), 'PVG', 'MLE', 'Scheduled', '320'),
('MU742', DATE_ADD(NOW(), INTERVAL 9 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 9 DAY), INTERVAL 7 HOUR), 'MLE', 'PVG', 'Scheduled', '320'),
-- 北京 <-> 罗马
('CA863', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 11 HOUR), 'PEK', 'FCO', 'Scheduled', '77W'),
('AZ782', DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 10 DAY), INTERVAL 10 HOUR), 'FCO', 'PEK', 'Scheduled', '77W'),
-- 东京 <-> 巴黎
('JL415', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 13 HOUR), 'NRT', 'CDG', 'Scheduled', '789'),
('JL416', DATE_ADD(NOW(), INTERVAL 9 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 9 DAY), INTERVAL 12 HOUR), 'CDG', 'NRT', 'Scheduled', '789'),
-- 新加坡 <-> 巴厘岛
('SQ942', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 2 HOUR), 'SIN', 'DPS', 'Scheduled', '320'),
('SQ943', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 DAY), INTERVAL 2 HOUR), 'DPS', 'SIN', 'Scheduled', '320'),
-- 迪拜 <-> 伦敦
('EK001', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 7 HOUR), 'DXB', 'LHR', 'Scheduled', '388'),
('EK002', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 DAY), INTERVAL 7 HOUR), 'LHR', 'DXB', 'Scheduled', '388'),
-- 曼谷 <-> 新加坡
('TG401', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 2 HOUR), 'BKK', 'SIN', 'Scheduled', '320'),
('TG402', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 2 HOUR), 'SIN', 'BKK', 'Scheduled', '320'),
-- 上海 <-> 多个目的地
('MU551', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 5 HOUR), 'PVG', 'SIN', 'Scheduled', '332'),
('MU552', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 7 DAY), INTERVAL 5 HOUR), 'SIN', 'PVG', 'Scheduled', '332'),
('MU261', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 12 HOUR), 'PVG', 'CDG', 'Scheduled', '77W'),
('MU262', DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 10 DAY), INTERVAL 11 HOUR), 'CDG', 'PVG', 'Scheduled', '77W'),
-- 广州 <-> 东南亚
('CZ361', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 3 HOUR), 'CAN', 'BKK', 'Scheduled', '321'),
('CZ362', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 DAY), INTERVAL 3 HOUR), 'BKK', 'CAN', 'Scheduled', '321'),
('CZ371', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 4 HOUR), 'CAN', 'SIN', 'Scheduled', '320'),
('CZ372', DATE_ADD(NOW(), INTERVAL 6 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 6 DAY), INTERVAL 4 HOUR), 'SIN', 'CAN', 'Scheduled', '320');

-- =============================================
-- 补充数据：北京、上海、首尔、巴塞罗那的酒店
-- =============================================
INSERT INTO hotels (name, location, price_tier, checkin_date, checkout_date, booked) VALUES
-- 北京
('北京故宫附近精品酒店', '北京', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('北京三里屯设计酒店', '北京', 'Upper Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('北京国贸豪华酒店', '北京', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('北京胡同四合院民宿', '北京', 'Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('北京朝阳商务酒店', '北京', 'Economy', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
-- 上海
('上海外滩景观酒店', '上海', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('上海新天地精品酒店', '上海', 'Upper Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('上海陆家嘴商务酒店', '上海', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('上海静安寺精品民宿', '上海', 'Upper Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
-- 首尔
('首尔明洞精品酒店', '首尔', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('首尔江南豪华酒店', '首尔', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('首尔弘大设计旅馆', '首尔', 'Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('首尔景福宫传统韩屋', '首尔', 'Upper Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
-- 巴塞罗那
('巴塞罗那哥特区精品酒店', '巴塞罗那', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('巴塞罗那海滨豪华酒店', '巴塞罗那', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('巴塞罗那格拉西亚大道酒店', '巴塞罗那', 'Upper Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0);

-- =============================================
-- 补充租车：北京、上海、首尔、巴塞罗那
-- =============================================
INSERT INTO car_rentals (name, location, price_tier, start_date, end_date, booked) VALUES
('大众帕萨特 - 北京首都机场', '北京', 'Midsize', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('宝马5系 - 北京国贸', '北京', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('丰田凯美瑞 - 北京朝阳', '北京', 'Midsize', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('别克君越 - 上海浦东机场', '上海', 'Midsize', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('奔驰C级 - 上海虹桥机场', '上海', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('大众途观 - 上海市中心', '上海', 'SUV', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('现代索纳塔 - 首尔仁川机场', '首尔', 'Midsize', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('起亚K5 - 首尔市中心', '首尔', 'Economy', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('雷诺Clio - 巴塞罗那机场', '巴塞罗那', 'Compact', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('大众Tiguan - 巴塞罗那市中心', '巴塞罗那', 'SUV', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0);

-- =============================================
-- 补充景点：北京、上海、首尔、巴塞罗那
-- =============================================
INSERT INTO trip_recommendations (name, location, details, keywords, booked) VALUES
('北京故宫深度游', '北京', '专业导游带领参观故宫博物院，了解明清两代皇家历史，含优先入场和午餐。', '历史,文化,皇宫', 0),
('北京长城徒步', '北京', '前往慕田峪长城，体验徒步登城，欣赏壮观的山脉风光，含往返交通。', '历史,徒步,自然', 0),
('北京胡同文化游', '北京', '骑三轮车游览北京传统胡同，参观四合院，品尝地道北京小吃。', '文化,美食,传统', 0),
('上海外滩夜游', '上海', '乘坐游船游览黄浦江，欣赏外滩和陆家嘴的璀璨夜景，含晚餐。', '夜景,游船,城市', 0),
('上海迪士尼乐园', '上海', '体验上海迪士尼乐园，含快速通道和园区餐饮券，适合家庭出行。', '主题乐园,娱乐,家庭', 0),
('首尔K-POP文化体验', '首尔', '参观SM娱乐公司，体验K-POP舞蹈课程，了解韩国流行文化。', '文化,音乐,娱乐', 0),
('首尔美食之旅', '首尔', '探索广藏市场和弘大美食街，品尝正宗韩国烤肉、炸鸡和街头小吃。', '美食,市场,文化', 0),
('巴塞罗那高迪建筑游', '巴塞罗那', '参观圣家堂、奎尔公园等高迪代表作，了解加泰罗尼亚现代主义建筑。', '建筑,艺术,文化', 0),
('巴塞罗那海滩休闲', '巴塞罗那', '在巴塞罗内塔海滩享受阳光，体验地中海风情，含海鲜午餐。', '海滩,美食,休闲', 0);

-- =============================================
-- 补充航班：更多时段和城市
-- =============================================
INSERT INTO flights (flight_no, scheduled_departure, scheduled_arrival, departure_airport, arrival_airport, status, aircraft_code) VALUES
-- 北京 <-> 首尔
('CA123', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 2 HOUR), 'PEK', 'ICN', 'Scheduled', '321'),
('CA124', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 2 HOUR), 'ICN', 'PEK', 'Scheduled', '321'),
('KE852', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 2 HOUR), 'PEK', 'ICN', 'Scheduled', '77W'),
('KE851', DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 4 DAY), INTERVAL 2 HOUR), 'ICN', 'PEK', 'Scheduled', '77W'),
-- 上海 <-> 首尔
('MU531', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 2 HOUR), 'PVG', 'ICN', 'Scheduled', '320'),
('MU532', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 2 HOUR), 'ICN', 'PVG', 'Scheduled', '320'),
-- 北京 <-> 巴塞罗那
('IB6402', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 12 HOUR), 'PEK', 'BCN', 'Scheduled', '77W'),
('IB6403', DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 10 DAY), INTERVAL 11 HOUR), 'BCN', 'PEK', 'Scheduled', '77W'),
-- 首尔 <-> 东京
('KE701', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 2 HOUR), 'ICN', 'NRT', 'Scheduled', '73H'),
('KE702', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 2 HOUR), 'NRT', 'ICN', 'Scheduled', '73H'),
-- 首尔 <-> 싱가포르
('SQ601', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 6 HOUR), 'ICN', 'SIN', 'Scheduled', '359'),
('SQ602', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 7 DAY), INTERVAL 6 HOUR), 'SIN', 'ICN', 'Scheduled', '359'),
-- 巴塞罗那 <-> 巴黎
('VY8001', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 2 HOUR), 'BCN', 'CDG', 'Scheduled', '320'),
('VY8002', DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 4 DAY), INTERVAL 2 HOUR), 'CDG', 'BCN', 'Scheduled', '320'),
-- 巴塞罗那 <-> 罗马
('VY6301', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 2 HOUR), 'BCN', 'FCO', 'Scheduled', '320'),
('VY6302', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 DAY), INTERVAL 2 HOUR), 'FCO', 'BCN', 'Scheduled', '320'),
-- 更多时段：北京出发
('CA183', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 DAY), INTERVAL 4 HOUR), 'PEK', 'NRT', 'Scheduled', '332'),
('CA184', DATE_ADD(NOW(), INTERVAL 6 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 6 DAY), INTERVAL 4 HOUR), 'NRT', 'PEK', 'Scheduled', '332'),
('CA685', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 7 HOUR), 'PEK', 'DPS', 'Scheduled', '359'),
('CA686', DATE_ADD(NOW(), INTERVAL 9 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 9 DAY), INTERVAL 7 HOUR), 'DPS', 'PEK', 'Scheduled', '359'),
('CA173', DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 4 DAY), INTERVAL 12 HOUR), 'PEK', 'SYD', 'Scheduled', '789'),
('CA174', DATE_ADD(NOW(), INTERVAL 11 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 11 DAY), INTERVAL 11 HOUR), 'SYD', 'PEK', 'Scheduled', '789'),
-- 更多时段：上海出发
('MU523', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 3 HOUR), 'PVG', 'NRT', 'Scheduled', '321'),
('MU524', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 DAY), INTERVAL 3 HOUR), 'NRT', 'PVG', 'Scheduled', '321'),
('MU553', DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 4 DAY), INTERVAL 5 HOUR), 'PVG', 'SIN', 'Scheduled', '359'),
('MU554', DATE_ADD(NOW(), INTERVAL 8 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 8 DAY), INTERVAL 5 HOUR), 'SIN', 'PVG', 'Scheduled', '359'),
('MU263', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 DAY), INTERVAL 12 HOUR), 'PVG', 'CDG', 'Scheduled', '77W'),
('MU264', DATE_ADD(NOW(), INTERVAL 12 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 12 DAY), INTERVAL 11 HOUR), 'CDG', 'PVG', 'Scheduled', '77W'),
-- 迪拜 <-> 新加坡
('EK431', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 7 HOUR), 'DXB', 'SIN', 'Scheduled', '388'),
('EK432', DATE_ADD(NOW(), INTERVAL 6 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 6 DAY), INTERVAL 7 HOUR), 'SIN', 'DXB', 'Scheduled', '388'),
-- 伦敦 <-> 纽约
('BA177', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 7 HOUR), 'LHR', 'JFK', 'Scheduled', '789'),
('BA178', DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 4 DAY), INTERVAL 7 HOUR), 'JFK', 'LHR', 'Scheduled', '789'),
-- 悉尼 <-> 新加坡
('SQ231', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 8 HOUR), 'SYD', 'SIN', 'Scheduled', '359'),
('SQ232', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 7 DAY), INTERVAL 8 HOUR), 'SIN', 'SYD', 'Scheduled', '359'),
-- 曼谷 <-> 巴厘岛
('TG431', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 3 HOUR), 'BKK', 'DPS', 'Scheduled', '320'),
('TG432', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 DAY), INTERVAL 3 HOUR), 'DPS', 'BKK', 'Scheduled', '320'),
-- 马尔代夫 <-> 新加坡
('SQ451', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 4 HOUR), 'SIN', 'MLE', 'Scheduled', '320'),
('SQ452', DATE_ADD(NOW(), INTERVAL 9 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 9 DAY), INTERVAL 4 HOUR), 'MLE', 'SIN', 'Scheduled', '320');


-- =============================================
-- 补充：阿姆斯特丹、布拉格、圣托里尼、开罗、开普敦
-- 马拉喀什、洛杉矶、里约、坎昆、伊斯坦布尔 的酒店
-- =============================================
INSERT INTO hotels (name, location, price_tier, checkin_date, checkout_date, booked) VALUES
('阿姆斯特丹运河景观酒店', '阿姆斯特丹', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('阿姆斯特丹约旦区精品旅馆', '阿姆斯特丹', 'Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('阿姆斯特丹博物馆广场豪华酒店', '阿姆斯特丹', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('布拉格老城广场精品酒店', '布拉格', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('布拉格城堡景观酒店', '布拉格', 'Upper Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('布拉格查理大桥民宿', '布拉格', 'Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('圣托里尼伊亚悬崖酒店', '圣托里尼', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('圣托里尼蓝顶海景别墅', '圣托里尼', 'Upper Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('圣托里尼菲拉精品酒店', '圣托里尼', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('开罗金字塔景观酒店', '开罗', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('开罗尼罗河畔豪华酒店', '开罗', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('开罗老城区精品旅馆', '开罗', 'Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('开普敦桌山景观酒店', '开普敦', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('开普敦V&A码头豪华酒店', '开普敦', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('马拉喀什麦地那精品里亚德', '马拉喀什', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('马拉喀什帕尔梅莱豪华度假村', '马拉喀什', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('洛杉矶比弗利山庄豪华酒店', '洛杉矶', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('洛杉矶圣莫尼卡海滩酒店', '洛杉矶', 'Upper Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('洛杉矶好莱坞精品酒店', '洛杉矶', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('里约热内卢科帕卡巴纳海滩酒店', '里约热内卢', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('里约热内卢伊帕内玛精品酒店', '里约热内卢', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('坎昆酒店区全包度假村', '坎昆', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('坎昆加勒比海滨精品酒店', '坎昆', 'Upper Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('伊斯坦布尔苏丹艾哈迈德精品酒店', '伊斯坦布尔', 'Upscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('伊斯坦布尔博斯普鲁斯豪华酒店', '伊斯坦布尔', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0),
('伊斯坦布尔贝伊奥卢设计酒店', '伊斯坦布尔', 'Upper Midscale', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 0);

-- =============================================
-- 补充租车
-- =============================================
INSERT INTO car_rentals (name, location, price_tier, start_date, end_date, booked) VALUES
('大众Golf - 阿姆斯特丹史基浦机场', '阿姆斯特丹', 'Compact', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('斯柯达Octavia - 布拉格机场', '布拉格', 'Midsize', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('雅典娜租车 - 圣托里尼', '圣托里尼', 'Compact', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('丰田Corolla - 开罗机场', '开罗', 'Economy', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('大众Polo - 开普敦机场', '开普敦', 'Economy', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('雷诺Duster - 马拉喀什机场', '马拉喀什', 'SUV', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('特斯拉Model3 - 洛杉矶LAX机场', '洛杉矶', 'Luxury', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('福特Mustang - 洛杉矶市中心', '洛杉矶', 'Premium', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('菲亚特Uno - 里约热内卢机场', '里约热内卢', 'Economy', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('大众Jetta - 坎昆机场', '坎昆', 'Midsize', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0),
('雷诺Megane - 伊斯坦布尔机场', '伊斯坦布尔', 'Midsize', DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0);

-- =============================================
-- 补充景点
-- =============================================
INSERT INTO trip_recommendations (name, location, details, keywords, booked) VALUES
('阿姆斯特丹运河游船', '阿姆斯特丹', '乘坐玻璃顶游船游览阿姆斯特丹运河网络，欣赏17世纪黄金时代建筑，含导游讲解。', '运河,历史,游船', 0),
('梵高博物馆参观', '阿姆斯特丹', '参观世界最大的梵高作品收藏，了解这位后印象派大师的传奇人生。', '艺术,博物馆,文化', 0),
('布拉格城堡夜游', '布拉格', '夜晚参观布拉格城堡，欣赏灯光下的哥特式建筑，含专业导游和葡萄酒品鉴。', '历史,夜景,建筑', 0),
('圣托里尼日落游船', '圣托里尼', '乘坐帆船欣赏伊亚著名日落，含希腊海鲜晚餐和葡萄酒。', '日落,浪漫,游船', 0),
('吉萨金字塔骑骆驼', '开罗', '骑骆驼游览吉萨金字塔群，参观狮身人面像，含专业导游和午餐。', '历史,古迹,冒险', 0),
('桌山缆车游览', '开普敦', '乘坐旋转缆车登上桌山，俯瞰开普敦全景和大西洋，含导游讲解。', '自然,城市,缆车', 0),
('撒哈拉沙漠一日游', '马拉喀什', '从马拉喀什出发前往撒哈拉沙漠，骑骆驼观日落，在贝都因营地过夜。', '沙漠,冒险,文化', 0),
('好莱坞影城参观', '洛杉矶', '参观华纳兄弟影城，探索好莱坞电影制作幕后，含专业导游和纪念品。', '电影,娱乐,文化', 0),
('基督山缆车游览', '里约热内卢', '乘坐缆车登上基督山，俯瞰里约热内卢全景，含导游讲解和午餐。', '地标,城市,自然', 0),
('奇琴伊察一日游', '坎昆', '从坎昆出发参观玛雅文明遗址奇琴伊察，含专业导游和天然井游泳。', '历史,古迹,文化', 0),
('博斯普鲁斯游船', '伊斯坦布尔', '乘坐游船游览博斯普鲁斯海峡，欣赏欧亚两岸风光，含土耳其茶和甜点。', '游船,历史,文化', 0),
('大巴扎购物体验', '伊斯坦布尔', '在世界最大的有顶集市大巴扎购物，含导游带领和土耳其咖啡品鉴。', '购物,文化,美食', 0);

-- =============================================
-- 补充航班：新增城市间互飞
-- 机场代码：AMS=阿姆斯特丹, PRG=布拉格, ATH=雅典(圣托里尼转机)
-- CAI=开罗, CPT=开普敦, RAK=马拉喀什
-- LAX=洛杉矶, GIG=里约, CUN=坎昆, IST=伊斯坦布尔
-- =============================================
INSERT INTO flights (flight_no, scheduled_departure, scheduled_arrival, departure_airport, arrival_airport, status, aircraft_code) VALUES
-- 北京 <-> 阿姆斯特丹
('KL895', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 11 HOUR), 'PEK', 'AMS', 'Scheduled', '77W'),
('KL896', DATE_ADD(NOW(), INTERVAL 9 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 9 DAY), INTERVAL 10 HOUR), 'AMS', 'PEK', 'Scheduled', '77W'),
-- 北京 <-> 伊斯坦布尔
('TK26', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 9 HOUR), 'PEK', 'IST', 'Scheduled', '77W'),
('TK27', DATE_ADD(NOW(), INTERVAL 6 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 6 DAY), INTERVAL 9 HOUR), 'IST', 'PEK', 'Scheduled', '77W'),
-- 北京 <-> 开罗
('MS961', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 10 HOUR), 'PEK', 'CAI', 'Scheduled', '789'),
('MS962', DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 10 DAY), INTERVAL 10 HOUR), 'CAI', 'PEK', 'Scheduled', '789'),
-- 北京 <-> 洛杉矶
('CA837', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 12 HOUR), 'PEK', 'LAX', 'Scheduled', '77W'),
('CA838', DATE_ADD(NOW(), INTERVAL 9 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 9 DAY), INTERVAL 13 HOUR), 'LAX', 'PEK', 'Scheduled', '77W'),
-- 上海 <-> 洛杉矶
('MU581', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 12 HOUR), 'PVG', 'LAX', 'Scheduled', '77W'),
('MU582', DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 10 DAY), INTERVAL 13 HOUR), 'LAX', 'PVG', 'Scheduled', '77W'),
-- 伦敦 <-> 阿姆斯特丹
('BA428', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 1 HOUR), 'LHR', 'AMS', 'Scheduled', '320'),
('BA429', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 1 HOUR), 'AMS', 'LHR', 'Scheduled', '320'),
-- 巴黎 <-> 阿姆斯特丹
('AF1240', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 1 HOUR), 'CDG', 'AMS', 'Scheduled', '319'),
('AF1241', DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 4 DAY), INTERVAL 1 HOUR), 'AMS', 'CDG', 'Scheduled', '319'),
-- 巴黎 <-> 布拉格
('AF1560', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 2 HOUR), 'CDG', 'PRG', 'Scheduled', '319'),
('AF1561', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 DAY), INTERVAL 2 HOUR), 'PRG', 'CDG', 'Scheduled', '319'),
-- 伊斯坦布尔 <-> 迪拜
('TK760', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 4 HOUR), 'IST', 'DXB', 'Scheduled', '77W'),
('TK761', DATE_ADD(NOW(), INTERVAL 5 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 DAY), INTERVAL 4 HOUR), 'DXB', 'IST', 'Scheduled', '77W'),
-- 伊斯坦布尔 <-> 开罗
('TK690', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 2 HOUR), 'IST', 'CAI', 'Scheduled', '321'),
('TK691', DATE_ADD(NOW(), INTERVAL 6 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 6 DAY), INTERVAL 2 HOUR), 'CAI', 'IST', 'Scheduled', '321'),
-- 纽约 <-> 洛杉矶
('AA100', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 6 HOUR), 'JFK', 'LAX', 'Scheduled', '321'),
('AA101', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 5 HOUR), 'LAX', 'JFK', 'Scheduled', '321'),
-- 纽约 <-> 坎昆
('AA901', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 4 HOUR), 'JFK', 'CUN', 'Scheduled', '738'),
('AA902', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 7 DAY), INTERVAL 4 HOUR), 'CUN', 'JFK', 'Scheduled', '738'),
-- 洛杉矶 <-> 坎昆
('UA1234', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 4 HOUR), 'LAX', 'CUN', 'Scheduled', '738'),
('UA1235', DATE_ADD(NOW(), INTERVAL 6 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 6 DAY), INTERVAL 4 HOUR), 'CUN', 'LAX', 'Scheduled', '738'),
-- 悉尼 <-> 开普敦
('QF63', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 3 DAY), INTERVAL 14 HOUR), 'SYD', 'CPT', 'Scheduled', '789'),
('QF64', DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 10 DAY), INTERVAL 14 HOUR), 'CPT', 'SYD', 'Scheduled', '789'),
-- 迪拜 <-> 开罗
('EK921', DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 1 DAY), INTERVAL 3 HOUR), 'DXB', 'CAI', 'Scheduled', '77W'),
('EK922', DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 4 DAY), INTERVAL 3 HOUR), 'CAI', 'DXB', 'Scheduled', '77W'),
-- 迪拜 <-> 马拉喀什
('AT800', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 2 DAY), INTERVAL 6 HOUR), 'DXB', 'RAK', 'Scheduled', '738'),
('AT801', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 7 DAY), INTERVAL 6 HOUR), 'RAK', 'DXB', 'Scheduled', '738');
