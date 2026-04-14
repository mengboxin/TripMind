import React, { useState } from "react";
import WeatherWidget from "../WeatherWidget";

const C = {
  surface: "#0e0e13",
  surfaceContainer: "#19191f",
  surfaceContainerHigh: "#1f1f26",
  onSurface: "#f6f2fa",
  onSurfaceVariant: "#acaab1",
  primary: "#b6a0ff",
  secondary: "#8596ff",
};

const DESTINATIONS = [
  { id:"tokyo",     name:"东京",     country:"日本",       region:"亚洲",   tag:"文化·科技", lat:35.69,  lon:139.69,  img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",  desc:"融合传统与现代的都市，霓虹灯与神社并存，是亚洲最受欢迎的旅行目的地之一。", highlights:["浅草寺","新宿御苑","涩谷十字路口","筑地市场","秋叶原"], food:["寿司","拉面","天妇罗","抹茶甜品","居酒屋料理"], bestTime:"3-5月（樱花季）/ 10-11月（红叶季）", flights:"直飞约3.5小时" },
  { id:"beijing",  name:"北京", country:"中国", region:"亚洲", tag:"历史·文化", lat:39.90, lon:116.40, img:"https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&q=80", desc:"中国首都，故宫、长城与天坛见证了数千年的历史，胡同文化与现代都市交相辉映。", highlights:["故宫","长城","天坛","颐和园","南锣鼓巷"], food:["北京烤鸭","炸酱面","豆汁","驴打滚","糖葫芦"], bestTime:"4-5月 / 9-10月", flights:"国内航班" },
  { id:"shanghai", name:"上海", country:"中国", region:"亚洲", tag:"都市·时尚", lat:31.23, lon:121.47, img:"https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=600&q=80", desc:"东方巴黎，外滩的万国建筑群与陆家嘴的摩天大楼，是中国最国际化的大都市。", highlights:["外滩","东方明珠","豫园","新天地","田子坊"], food:["小笼包","生煎","红烧肉","蟹粉豆腐","本帮菜"], bestTime:"3-5月 / 9-11月", flights:"国内航班" },
  { id:"paris",     name:"巴黎",     country:"法国",       region:"欧洲",   tag:"艺术·浪漫", lat:48.85,  lon:2.35,    img:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",  desc:"光之城，艺术与时尚的殿堂，埃菲尔铁塔下的浪漫让无数旅人魂牵梦绕。", highlights:["埃菲尔铁塔","卢浮宫","凡尔赛宫","蒙马特高地","塞纳河游船"], food:["法棍面包","可颂","法式蜗牛","鹅肝","马卡龙"], bestTime:"4-6月 / 9-10月", flights:"直飞约11小时" },
  { id:"bali",      name:"巴厘岛",   country:"印度尼西亚", region:"亚洲",   tag:"海岛·度假", lat:-8.41,  lon:115.19,  img:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",  desc:"神明之岛，梯田、神庙与碧海蓝天构成人间天堂，是放松身心的绝佳去处。", highlights:["乌布猴林","海神庙","库塔海滩","梯田日落","乌鲁瓦图悬崖"], food:["沙爹","巴厘炒饭","烤乳猪","椰子冰淇淋","新鲜热带水果"], bestTime:"4-10月（旱季）", flights:"直飞约6小时" },
  { id:"swiss",     name:"瑞士",     country:"瑞士",       region:"欧洲",   tag:"自然·滑雪", lat:46.82,  lon:8.23,    img:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",  desc:"阿尔卑斯山的心脏，雪山、湖泊与精致小镇，是欧洲最美的自然风光之一。", highlights:["少女峰","卢塞恩湖","因特拉肯","马特洪峰","日内瓦旧城"], food:["奶酪火锅","瑞士巧克力","牛肉干","土豆饼","苹果派"], bestTime:"12-3月（滑雪）/ 6-9月（徒步）", flights:"转机约13小时" },
  { id:"newyork",   name:"纽约",     country:"美国",       region:"美洲",   tag:"都市·文化", lat:40.71,  lon:-74.01,  img:"https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80",  desc:"不夜城，百老汇、中央公园与自由女神像，是全球最具活力的国际大都市。", highlights:["自由女神像","中央公园","时代广场","大都会博物馆","布鲁克林大桥"], food:["纽约披萨","百吉饼","热狗","芝士蛋糕","龙虾卷"], bestTime:"4-6月 / 9-11月", flights:"直飞约14小时" },
  { id:"sydney",    name:"悉尼",     country:"澳大利亚",   region:"大洋洲", tag:"海港·自然", lat:-33.87, lon:151.21,  img:"https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80",  desc:"南半球最美的海港城市，歌剧院与海湾大桥相映成趣，阳光沙滩令人心旷神怡。", highlights:["悉尼歌剧院","海湾大桥","邦迪海滩","蓝山国家公园","达令港"], food:["澳洲牛排","海鲜拼盘","袋鼠肉","提拉米苏","扁平白咖啡"], bestTime:"9-11月（春季）/ 3-5月（秋季）", flights:"直飞约11小时" },
  { id:"london",    name:"伦敦",     country:"英国",       region:"欧洲",   tag:"历史·文化", lat:51.51,  lon:-0.12,   img:"https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80",  desc:"历史名城，大英博物馆、白金汉宫与泰晤士河畔的风景令人流连忘返。", highlights:["大英博物馆","白金汉宫","塔桥","泰特现代美术馆","海德公园"], food:["炸鱼薯条","英式早餐","司康饼","约克郡布丁","印度咖喱"], bestTime:"5-9月", flights:"直飞约10小时" },
  { id:"rome",      name:"罗马",     country:"意大利",     region:"欧洲",   tag:"古迹·美食", lat:41.90,  lon:12.50,   img:"https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80",  desc:"永恒之城，斗兽场、梵蒂冈与特莱维喷泉，每一步都是历史的印记。", highlights:["斗兽场","梵蒂冈","特莱维喷泉","西班牙广场","博尔盖塞美术馆"], food:["意大利面","披萨","提拉米苏","冰淇淋","卡布奇诺"], bestTime:"4-6月 / 9-10月", flights:"转机约12小时" },
  { id:"dubai",     name:"迪拜",     country:"阿联酋",     region:"亚洲",   tag:"奢华·沙漠", lat:25.20,  lon:55.27,   img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",  desc:"沙漠中的奇迹，哈利法塔、棕榈岛与黄金市场，现代奢华与传统文化的完美融合。", highlights:["哈利法塔","棕榈岛","迪拜购物中心","黄金市场","沙漠冲沙"], food:["沙瓦尔玛","胡姆斯","烤肉串","枣椰子","阿拉伯咖啡"], bestTime:"11月-3月", flights:"直飞约8小时" },
  { id:"bangkok",   name:"曼谷",     country:"泰国",       region:"亚洲",   tag:"美食·寺庙", lat:13.75,  lon:100.52,  img:"https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80",  desc:"东南亚美食之都，金碧辉煌的寺庙与热闹的夜市，性价比极高的旅行目的地。", highlights:["大皇宫","卧佛寺","考山路","恰图恰周末市场","湄南河游船"], food:["泰式炒河粉","冬阴功汤","芒果糯米饭","泰式奶茶","烤肉串"], bestTime:"11月-2月", flights:"直飞约4小时" },
  { id:"singapore", name:"新加坡",   country:"新加坡",     region:"亚洲",   tag:"都市·美食", lat:1.35,   lon:103.82,  img:"https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80",  desc:"花园城市，滨海湾花园、圣淘沙岛与多元文化美食，是亚洲最宜居的城市之一。", highlights:["滨海湾花园","圣淘沙岛","牛车水","小印度","克拉码头"], food:["海南鸡饭","辣椒螃蟹","肉骨茶","叻沙","榴莲"], bestTime:"全年（2-4月最佳）", flights:"直飞约6小时" },
  { id:"seoul",     name:"首尔",     country:"韩国",       region:"亚洲",   tag:"时尚·美食", lat:37.57,  lon:126.98,  img:"https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600&q=80",  desc:"K-pop与传统文化的交汇地，景福宫、明洞与汉江公园，时尚与历史并存。", highlights:["景福宫","明洞","北村韩屋村","汉江公园","南山首尔塔"], food:["韩式烤肉","石锅拌饭","炸鸡啤酒","泡菜汤","韩式炸酱面"], bestTime:"3-5月 / 9-11月", flights:"直飞约2小时" },
  { id:"barcelona", name:"巴塞罗那", country:"西班牙",     region:"欧洲",   tag:"建筑·海滩", lat:41.39,  lon:2.17,    img:"https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80",  desc:"高迪建筑的圣地，圣家堂与巴特罗之家令人叹为观止，地中海海滩阳光明媚。", highlights:["圣家堂","巴特罗之家","兰布拉大道","巴塞罗内塔海滩","米拉之家"], food:["海鲜饭","西班牙火腿","加泰罗尼亚奶油布丁","桑格利亚","油条蘸巧克力"], bestTime:"5-6月 / 9-10月", flights:"转机约13小时" },
  { id:"amsterdam", name:"阿姆斯特丹",country:"荷兰",     region:"欧洲",   tag:"运河·郁金香",lat:52.37, lon:4.90,    img:"https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=80",  desc:"运河之城，梵高博物馆、安妮之家与郁金香花田，骑行是探索这座城市的最佳方式。", highlights:["梵高博物馆","安妮之家","运河游船","库肯霍夫花园","国立博物馆"], food:["荷兰煎饼","奶酪","鲱鱼","荷兰豆汤","苹果派"], bestTime:"4-5月（郁金香季）", flights:"转机约12小时" },
  { id:"prague",    name:"布拉格",   country:"捷克",       region:"欧洲",   tag:"童话·古城", lat:50.08,  lon:14.42,   img:"https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&q=80",  desc:"百塔之城，中世纪古城保存完好，查理大桥与布拉格城堡在夜晚尤为迷人。", highlights:["布拉格城堡","查理大桥","老城广场","天文钟","瓦茨拉夫广场"], food:["烤猪肘","捷克啤酒","土豆饺子","蜂蜜蛋糕","烤面包碗"], bestTime:"5-9月", flights:"转机约12小时" },
  { id:"santorini", name:"圣托里尼", country:"希腊",       region:"欧洲",   tag:"蓝白·海景", lat:36.39,  lon:25.43,   img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80",  desc:"爱琴海上的明珠，蓝顶白墙与火山悬崖，是全球最浪漫的蜜月目的地之一。", highlights:["伊亚小镇","菲拉小镇","红沙滩","阿克罗蒂里遗址","卡马里黑沙滩"], food:["希腊沙拉","烤章鱼","菲达奶酪","蜂蜜酸奶","烤羊肉"], bestTime:"5-10月", flights:"转机约14小时" },
  { id:"maldives",  name:"马尔代夫", country:"马尔代夫",   region:"亚洲",   tag:"海岛·蜜月", lat:1.97,   lon:73.22,   img:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80",  desc:"印度洋上的人间天堂，水上屋、珊瑚礁与清澈海水，是蜜月旅行的终极目的地。", highlights:["水上屋度假村","珊瑚礁浮潜","海豚湾","马累老城","日落巡游"], food:["马尔代夫鱼汤","椰子饭","烤金枪鱼","热带水果拼盘","椰子甜点"], bestTime:"11月-4月", flights:"转机约7小时" },
  { id:"cairo",     name:"开罗",     country:"埃及",       region:"非洲",   tag:"金字塔·历史",lat:30.04, lon:31.24,   img:"https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=600&q=80",  desc:"古文明的摇篮，吉萨金字塔与狮身人面像见证了数千年的历史，尼罗河畔风情万种。", highlights:["吉萨金字塔","狮身人面像","埃及博物馆","汗哈利利市场","萨卡拉阶梯金字塔"], food:["沙瓦尔玛","胡姆斯","埃及豆泥","烤鸽子","甘蔗汁"], bestTime:"10月-4月", flights:"转机约12小时" },
  { id:"capetown",  name:"开普敦",   country:"南非",       region:"非洲",   tag:"自然·葡萄酒",lat:-33.93,lon:18.42,   img:"https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80",  desc:"好望角所在地，桌山俯瞰大西洋，葡萄酒庄园与企鹅海滩令人难忘。", highlights:["桌山","好望角","博尔德斯企鹅海滩","V&A码头","斯泰伦博斯葡萄酒庄"], food:["南非烤肉","波波提","比尔通肉干","开普马来咖喱","葡萄酒"], bestTime:"11月-3月", flights:"转机约16小时" },
  { id:"marrakech", name:"马拉喀什", country:"摩洛哥",     region:"非洲",   tag:"集市·沙漠", lat:31.63,  lon:-7.99,   img:"https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80",  desc:"红城，迷宫般的麦地那与五彩斑斓的集市，撒哈拉沙漠近在咫尺。", highlights:["杰马夫纳广场","巴伊亚宫","马约尔花园","苏克集市","撒哈拉沙漠"], food:["塔吉锅","古斯古斯","摩洛哥薄荷茶","巴斯蒂拉","哈里拉汤"], bestTime:"3-5月 / 9-11月", flights:"转机约12小时" },
  { id:"losangeles",name:"洛杉矶",   country:"美国",       region:"美洲",   tag:"娱乐·海滩", lat:34.05,  lon:-118.24, img:"https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=600&q=80",  desc:"好莱坞的故乡，圣莫尼卡海滩与比弗利山庄，阳光、电影与梦想在这里交汇。", highlights:["好莱坞星光大道","圣莫尼卡海滩","盖蒂中心","比弗利山庄","环球影城"], food:["墨西哥卷饼","汉堡","韩国烤肉","寿司","阿沃卡多吐司"], bestTime:"3-5月 / 9-11月", flights:"直飞约12小时" },
  { id:"rio",       name:"里约热内卢",country:"巴西",      region:"美洲",   tag:"狂欢·海滩", lat:-22.91, lon:-43.17,  img:"https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80",  desc:"上帝之城，基督山俯瞰科帕卡巴纳海滩，狂欢节的热情感染每一位到访者。", highlights:["基督山","科帕卡巴纳海滩","伊帕内玛海滩","面包山","马拉卡纳球场"], food:["巴西烤肉","黑豆炖肉","椰子水","卡皮利尼亚鸡尾酒","木薯饼"], bestTime:"12月-3月（狂欢节）", flights:"转机约20小时" },
  { id:"cancun",    name:"坎昆",     country:"墨西哥",     region:"美洲",   tag:"海滩·玛雅", lat:21.16,  lon:-86.85,  img:"https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=600&q=80",  desc:"加勒比海明珠，碧绿海水与白沙滩，附近的玛雅遗址奇琴伊察令人叹为观止。", highlights:["奇琴伊察","图卢姆遗址","科苏梅尔岛","女人岛","天然井浮潜"], food:["玉米饼","墨西哥辣椒","鳄梨酱","海鲜汤","龙舌兰酒"], bestTime:"12月-4月", flights:"转机约18小时" },
  { id:"istanbul",  name:"伊斯坦布尔",country:"土耳其",    region:"欧洲",   tag:"东西·交汇", lat:41.01,  lon:28.97,   img:"https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80",  desc:"横跨欧亚两洲的城市，蓝色清真寺与大巴扎，博斯普鲁斯海峡两岸风光无限。", highlights:["蓝色清真寺","圣索菲亚大教堂","大巴扎","托普卡帕宫","博斯普鲁斯游船"], food:["土耳其烤肉","土耳其软糖","石榴汁","土耳其茶","巴克拉瓦"], bestTime:"4-6月 / 9-11月", flights:"直飞约10小时" },
  { id:"kyoto",     name:"京都",     country:"日本",       region:"亚洲",   tag:"传统·禅意", lat:35.01,  lon:135.77,  img:"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80",  desc:"日本传统文化的精髓，千座神社与寺庙、艺伎文化与茶道，是感受日本古典之美的最佳去处。", highlights:["岚山竹林","伏见稻荷大社","金阁寺","祇园花见小路","嵐山渡月桥"], food:["京都怀石料理","抹茶甜品","豆腐料理","京都漬物","清酒"], bestTime:"3-5月（樱花）/ 11月（红叶）", flights:"直飞约3小时" },
  { id:"vienna",    name:"维也纳",   country:"奥地利",     region:"欧洲",   tag:"音乐·艺术", lat:48.21,  lon:16.37,   img:"https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600&q=80",  desc:"音乐之都，莫扎特与贝多芬的故乡，金色大厅与美泉宫彰显哈布斯堡王朝的辉煌。", highlights:["美泉宫","金色大厅","霍夫堡宫","维也纳国家歌剧院","普拉特游乐园"], food:["维也纳炸猪排","苹果卷","萨赫蛋糕","维也纳咖啡","古拉什"], bestTime:"5-9月", flights:"转机约12小时" },
  { id:"auckland",  name:"奥克兰",   country:"新西兰",     region:"大洋洲", tag:"自然·冒险", lat:-36.85, lon:174.76,  img:"https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600&q=80",  desc:"帆船之城，天空塔俯瞰海湾，附近的罗托鲁瓦地热奇观与霍比特人村庄令人惊叹。", highlights:["天空塔","怀赫科岛","罗托鲁瓦地热","霍比特人村","米尔福德峡湾"], food:["新西兰羊排","帕夫洛娃蛋糕","绿贻贝","奇异果","新西兰葡萄酒"], bestTime:"12月-3月（夏季）", flights:"转机约13小时" },
  { id:"hanoi",     name:"河内",     country:"越南",       region:"亚洲",   tag:"历史·美食", lat:21.03,  lon:105.85,  img:"https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=600&q=80",  desc:"千年古都，还剑湖与老城区保留着浓厚的历史气息，越南美食在这里最为正宗。", highlights:["还剑湖","老城区36条街","胡志明陵墓","文庙","下龙湾（近郊）"], food:["越南河粉","春卷","法棍三明治","越南咖啡","蜗牛米线"], bestTime:"10月-4月", flights:"直飞约3小时" },
  { id:"lisbon",    name:"里斯本",   country:"葡萄牙",     region:"欧洲",   tag:"海港·法多", lat:38.72,  lon:-9.14,   img:"https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80",  desc:"七丘之城，黄色电车穿梭于鹅卵石街道，法多音乐与葡式蛋挞令人沉醉。", highlights:["贝伦塔","热罗尼莫斯修道院","阿尔法玛老城","圣乔治城堡","辛特拉宫殿"], food:["葡式蛋挞","烤鳕鱼","猪肉夹面包","绿酒","葡萄牙海鲜饭"], bestTime:"3-5月 / 9-10月", flights:"转机约13小时" },
  { id:"phuket",    name:"普吉岛",   country:"泰国",       region:"亚洲",   tag:"海岛·潜水", lat:7.88,   lon:98.39,   img:"https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80",  desc:"泰国最大岛屿，芭东海滩与皮皮岛的碧水白沙，是东南亚最受欢迎的海岛度假地。", highlights:["芭东海滩","皮皮岛","攀牙湾","大佛寺","老普吉镇"], food:["泰式炒河粉","冬阴功汤","芒果糯米饭","海鲜烧烤","椰子冰淇淋"], bestTime:"11月-4月", flights:"直飞约4小时" },
  { id:"zurich",    name:"苏黎世",   country:"瑞士",       region:"欧洲",   tag:"金融·湖光", lat:47.38,  lon:8.54,    img:"https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=600&q=80",  desc:"全球最宜居城市之一，苏黎世湖畔风光旖旎，老城区保存完好，购物与美食一流。", highlights:["苏黎世湖","老城区","格罗斯明斯特教堂","班霍夫大街","瑞士国家博物馆"], food:["奶酪火锅","瑞士巧克力","苏黎世小牛肉","格拉鲁斯奶酪","苹果酒"], bestTime:"5-9月", flights:"转机约12小时" },
];

const PAGE_SIZE = 12;
const REGIONS = ["全部", "亚洲", "欧洲", "美洲", "非洲", "大洋洲"];

const DestinationCard = ({ dest, isFav, onToggleFav, onOpen }) => (
  <div style={{borderRadius:"16px",overflow:"hidden",background:C.surfaceContainer,
    border:"1px solid rgba(255,255,255,0.06)",cursor:"pointer",transition:"transform 0.2s",position:"relative"}}
    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
    onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
    <div style={{position:"relative",height:"160px",overflow:"hidden"}} onClick={() => onOpen(dest)}>
      <img src={dest.img} alt={dest.name} style={{width:"100%",height:"100%",objectFit:"cover"}}
        onError={e=>e.target.style.background="#1f1f26"} />
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 60%)"}} />
      <span style={{position:"absolute",bottom:"10px",left:"12px",fontSize:"11px",fontWeight:"700",
        color:"white",background:"rgba(0,0,0,0.4)",padding:"3px 8px",borderRadius:"9999px",
        backdropFilter:"blur(8px)"}}>{dest.tag}</span>
      <span style={{position:"absolute",top:"10px",left:"12px",fontSize:"10px",
        color:"rgba(255,255,255,0.7)",background:"rgba(0,0,0,0.3)",padding:"2px 7px",borderRadius:"9999px"}}>{dest.region}</span>
    </div>
    <button onClick={e=>{e.stopPropagation();onToggleFav(dest.id);}}
      style={{position:"absolute",top:"10px",right:"10px",width:"32px",height:"32px",borderRadius:"50%",
        background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",border:"none",cursor:"pointer",
        display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
      <span className="material-symbols-outlined" style={{fontSize:"18px",
        color: isFav ? "#ff6e84" : "white",
        fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0"}}>favorite</span>
    </button>
    <div style={{padding:"14px"}} onClick={() => onOpen(dest)}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <h3 className="headline-font" style={{fontSize:"16px",fontWeight:"700",color:C.onSurface,marginBottom:"2px"}}>{dest.name}</h3>
          <p style={{fontSize:"12px",color:C.onSurfaceVariant}}>{dest.country} · {dest.flights}</p>
        </div>
        <span className="material-symbols-outlined" style={{color:C.primary,fontSize:"18px",marginTop:"2px"}}>arrow_forward</span>
      </div>
      <p style={{fontSize:"12px",color:C.onSurfaceVariant,marginTop:"8px",lineHeight:"1.6",
        overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
        {dest.desc}
      </p>
    </div>
  </div>
);

const DestinationDetail = ({ dest, isFav, onToggleFav, onClose, onChat }) => (
  <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",
    display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}
    onClick={onClose}>
    <div style={{width:"100%",maxWidth:"640px",maxHeight:"85vh",overflowY:"auto",borderRadius:"20px",
      background:"#16161e",border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 24px 64px rgba(0,0,0,0.6)"}}
      onClick={e=>e.stopPropagation()}>
      <div style={{position:"relative",height:"220px",overflow:"hidden",borderRadius:"20px 20px 0 0"}}>
        <img src={dest.img} alt={dest.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(22,22,30,1) 0%,transparent 60%)"}} />
        <button onClick={onClose} style={{position:"absolute",top:"14px",left:"14px",width:"36px",height:"36px",
          borderRadius:"50%",background:"rgba(0,0,0,0.5)",border:"none",cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>
          <span className="material-symbols-outlined" style={{color:"white",fontSize:"20px"}}>arrow_back</span>
        </button>
        <button onClick={()=>onToggleFav(dest.id)} style={{position:"absolute",top:"14px",right:"14px",width:"36px",height:"36px",
          borderRadius:"50%",background:"rgba(0,0,0,0.5)",border:"none",cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>
          <span className="material-symbols-outlined" style={{fontSize:"20px",
            color: isFav ? "#ff6e84" : "white",fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0"}}>favorite</span>
        </button>
        <div style={{position:"absolute",bottom:"16px",left:"20px"}}>
          <h2 className="headline-font" style={{fontSize:"28px",fontWeight:"800",color:"white",marginBottom:"4px"}}>{dest.name}</h2>
          <p style={{fontSize:"13px",color:"rgba(255,255,255,0.7)"}}>{dest.country} · {dest.tag}</p>
        </div>
      </div>
      <div style={{padding:"20px 24px 28px"}}>
        <p style={{fontSize:"14px",color:C.onSurfaceVariant,lineHeight:"1.8",marginBottom:"16px"}}>{dest.desc}</p>
        <div style={{marginBottom:"16px"}}>
          <WeatherWidget cityName={dest.name} lat={dest.lat} lon={dest.lon} />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"20px"}}>
          <div style={{padding:"12px",borderRadius:"12px",background:C.surfaceContainerHigh}}>
            <p style={{fontSize:"11px",color:C.primary,fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"6px"}}>最佳旅行时间</p>
            <p style={{fontSize:"13px",color:C.onSurface}}>{dest.bestTime}</p>
          </div>
          <div style={{padding:"12px",borderRadius:"12px",background:C.surfaceContainerHigh}}>
            <p style={{fontSize:"11px",color:C.secondary,fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"6px"}}>飞行时间</p>
            <p style={{fontSize:"13px",color:C.onSurface}}>{dest.flights}</p>
          </div>
        </div>
        <div style={{marginBottom:"20px"}}>
          <p style={{fontSize:"12px",fontWeight:"700",color:C.onSurfaceVariant,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"10px"}}>热门景点</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
            {dest.highlights.map(h => (
              <span key={h} style={{padding:"5px 12px",borderRadius:"9999px",fontSize:"12px",
                background:"rgba(182,160,255,0.1)",color:C.primary,border:"1px solid rgba(182,160,255,0.2)"}}>{h}</span>
            ))}
          </div>
        </div>
        <div style={{marginBottom:"24px"}}>
          <p style={{fontSize:"12px",fontWeight:"700",color:C.onSurfaceVariant,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"10px"}}>特色美食</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
            {dest.food.map(f => (
              <span key={f} style={{padding:"5px 12px",borderRadius:"9999px",fontSize:"12px",
                background:"rgba(133,150,255,0.1)",color:C.secondary,border:"1px solid rgba(133,150,255,0.2)"}}>{f}</span>
            ))}
          </div>
        </div>
        <button onClick={() => onChat(`帮我规划${dest.name}的旅行行程`)}
          style={{width:"100%",padding:"14px",borderRadius:"12px",fontSize:"14px",fontWeight:"700",
            background:"linear-gradient(to right,#b6a0ff,#7e51ff)",color:"#340090",border:"none",cursor:"pointer"}}>
          <span className="material-symbols-outlined" style={{fontSize:"16px",verticalAlign:"middle",marginRight:"6px",fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
          让 AI 规划 {dest.name} 行程
        </button>
      </div>
    </div>
  </div>
);

const DestinationsView = ({ onChat, favorites, onToggleFav }) => {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("全部");
  const [page, setPage] = useState(1);

  const filtered = DESTINATIONS.filter(d => {
    const matchRegion = region === "全部" || d.region === region;
    const matchSearch = !search || d.name.includes(search) || d.country.includes(search) || d.tag.includes(search);
    return matchRegion && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const handleRegion = (r) => { setRegion(r); setPage(1); };
  const handleSearch = (v) => { setSearch(v); setPage(1); };

  return (
    <div style={{flex:1,overflowY:"auto",paddingTop:"80px",paddingBottom:"40px"}}>
      <div style={{maxWidth:"960px",margin:"0 auto",padding:"24px 32px"}}>
        <div style={{marginBottom:"24px"}}>
          <h2 className="headline-font" style={{fontSize:"24px",fontWeight:"700",color:"#f6f2fa",marginBottom:"8px"}}>热门目的地</h2>
          <p style={{fontSize:"14px",color:"#acaab1",marginBottom:"16px"}}>共 {DESTINATIONS.length} 个目的地，收藏心仪之地，一键开启 AI 行程规划</p>

          {/* 区域筛选 */}
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap",marginBottom:"14px"}}>
            {REGIONS.map(r => (
              <button key={r} onClick={() => handleRegion(r)}
                style={{padding:"6px 16px",borderRadius:"9999px",fontSize:"12px",fontWeight:"600",cursor:"pointer",transition:"all 0.15s",
                  background: region===r ? "linear-gradient(to right,#b6a0ff,#7e51ff)" : "rgba(255,255,255,0.05)",
                  color: region===r ? "#0d0b1a" : "#acaab1",
                  border: region===r ? "none" : "1px solid rgba(255,255,255,0.1)"}}>
                {r}
              </button>
            ))}
          </div>

          {/* 搜索框 */}
          <div style={{position:"relative",maxWidth:"360px"}}>
            <span className="material-symbols-outlined" style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",
              color:"#acaab1",fontSize:"18px"}}>search</span>
            <input value={search} onChange={e=>handleSearch(e.target.value)} placeholder="搜索目的地..."
              style={{width:"100%",padding:"10px 14px 10px 40px",borderRadius:"12px",fontSize:"14px",
                background:"#19191f",border:"1px solid rgba(255,255,255,0.08)",color:"#f6f2fa",outline:"none",boxSizing:"border-box"}} />
          </div>
        </div>

        {/* 结果数量 */}
        <p style={{fontSize:"13px",color:"#acaab1",marginBottom:"16px"}}>
          共 {filtered.length} 个结果，第 {page}/{totalPages} 页
        </p>

        {/* 卡片网格 */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"16px",marginBottom:"28px"}}>
          {paged.map(dest => (
            <DestinationCard key={dest.id} dest={dest}
              isFav={favorites.includes(dest.id)}
              onToggleFav={onToggleFav}
              onOpen={setSelected} />
          ))}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:"8px"}}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              style={{width:"36px",height:"36px",borderRadius:"10px",border:"none",cursor:page===1?"not-allowed":"pointer",
                background:"rgba(255,255,255,0.05)",color: page===1 ? "#4b5563" : "#acaab1",fontSize:"16px",
                display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>

            {Array.from({length:totalPages},(_,i)=>i+1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{width:"36px",height:"36px",borderRadius:"10px",border:"none",cursor:"pointer",fontSize:"13px",fontWeight:"600",
                  background: page===p ? "linear-gradient(to right,#b6a0ff,#7e51ff)" : "rgba(255,255,255,0.05)",
                  color: page===p ? "#0d0b1a" : "#acaab1"}}>
                {p}
              </button>
            ))}

            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              style={{width:"36px",height:"36px",borderRadius:"10px",border:"none",cursor:page===totalPages?"not-allowed":"pointer",
                background:"rgba(255,255,255,0.05)",color: page===totalPages ? "#4b5563" : "#acaab1",fontSize:"16px",
                display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
          </div>
        )}
      </div>

      {selected && (
        <DestinationDetail dest={selected}
          isFav={favorites.includes(selected.id)}
          onToggleFav={onToggleFav}
          onClose={() => setSelected(null)}
          onChat={(msg) => { onChat(msg); setSelected(null); }} />
      )}
    </div>
  );
};

export default DestinationsView;
