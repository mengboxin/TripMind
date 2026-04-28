import React, { useState } from "react";

const C = {
  surfaceContainer: "#19191f",
  onSurface: "#f6f2fa",
  onSurfaceVariant: "#acaab1",
  primary: "#b6a0ff",
};

// 目的地数据（与 DestinationsView 保持一致）
const DESTINATIONS = [
  { id:"beijing",  name:"北京",    country:"中国",       tag:"历史 · 文化", img:"https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&q=80", flights:"国内航班",      desc:"中国首都，故宫、长城与天坛见证了数千年的历史。" },
  { id:"shanghai", name:"上海",    country:"中国",       tag:"都市 · 时尚", img:"https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=600&q=80", flights:"国内航班",      desc:"东方巴黎，外滩的万国建筑群与陆家嘴的摩天大楼。" },
  { id:"tokyo",    name:"东京",    country:"日本",       tag:"文化 · 科技", img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80", flights:"直飞约3.5小时", desc:"融合传统与现代的都市，霓虹灯与神社并存。" },
  { id:"kyoto",    name:"京都",    country:"日本",       tag:"传统 · 禅意", img:"https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80", flights:"直飞约3小时",   desc:"日本传统文化的精髓，千座神社与寺庙。" },
  { id:"seoul",    name:"首尔",    country:"韩国",       tag:"时尚 · 美食", img:"https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600&q=80", flights:"直飞约2小时",   desc:"K-pop与传统文化的交汇地，景福宫与明洞。" },
  { id:"bangkok",  name:"曼谷",    country:"泰国",       tag:"美食 · 寺庙", img:"https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80", flights:"直飞约4小时",   desc:"东南亚美食之都，金碧辉煌的寺庙与热闹的夜市。" },
  { id:"singapore",name:"新加坡",  country:"新加坡",     tag:"都市 · 美食", img:"https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80", flights:"直飞约6小时",   desc:"花园城市，滨海湾花园与多元文化美食。" },
  { id:"bali",     name:"巴厘岛",  country:"印度尼西亚", tag:"海岛 · 度假", img:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", flights:"直飞约6小时",   desc:"神明之岛，梯田、神庙与碧海蓝天。" },
  { id:"phuket",   name:"普吉岛",  country:"泰国",       tag:"海岛 · 潜水", img:"https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80", flights:"直飞约4小时",   desc:"泰国最大岛屿，芭东海滩与皮皮岛。" },
  { id:"maldives", name:"马尔代夫",country:"马尔代夫",   tag:"海岛 · 蜜月", img:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80", flights:"转机约7小时",   desc:"印度洋上的人间天堂，水上屋与珊瑚礁。" },
  { id:"dubai",    name:"迪拜",    country:"阿联酋",     tag:"奢华 · 沙漠", img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80", flights:"直飞约8小时",   desc:"沙漠中的奇迹，哈利法塔与棕榈岛。" },
  { id:"istanbul", name:"伊斯坦布尔",country:"土耳其",   tag:"东西 · 交汇", img:"https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80", flights:"直飞约10小时",  desc:"横跨欧亚两洲的城市，蓝色清真寺与大巴扎。" },
  { id:"paris",    name:"巴黎",    country:"法国",       tag:"艺术 · 浪漫", img:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80", flights:"直飞约11小时",  desc:"光之城，艺术与时尚的殿堂。" },
  { id:"london",   name:"伦敦",    country:"英国",       tag:"历史 · 文化", img:"https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80", flights:"直飞约10小时",  desc:"历史名城，大英博物馆与白金汉宫。" },
  { id:"rome",     name:"罗马",    country:"意大利",     tag:"古迹 · 美食", img:"https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80", flights:"转机约12小时",  desc:"永恒之城，斗兽场与梵蒂冈。" },
  { id:"barcelona",name:"巴塞罗那",country:"西班牙",     tag:"建筑 · 海滩", img:"https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80", flights:"转机约13小时",  desc:"高迪建筑的圣地，圣家堂令人叹为观止。" },
  { id:"amsterdam",name:"阿姆斯特丹",country:"荷兰",     tag:"运河 · 郁金香",img:"https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=80",flights:"转机约12小时",  desc:"运河之城，梵高博物馆与郁金香花田。" },
  { id:"prague",   name:"布拉格",  country:"捷克",       tag:"童话 · 古城", img:"https://images.unsplash.com/photo-1541849546-216549ae216d?w=600&q=80", flights:"转机约12小时",  desc:"百塔之城，中世纪古城保存完好。" },
  { id:"santorini",name:"圣托里尼",country:"希腊",       tag:"蓝白 · 海景", img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80", flights:"转机约14小时",  desc:"爱琴海上的明珠，蓝顶白墙与火山悬崖。" },
  { id:"swiss",    name:"瑞士",    country:"瑞士",       tag:"自然 · 滑雪", img:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", flights:"转机约13小时",  desc:"阿尔卑斯山的心脏，雪山与湖泊。" },
  { id:"vienna",   name:"维也纳",  country:"奥地利",     tag:"音乐 · 艺术", img:"https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=600&q=80", flights:"转机约12小时",  desc:"音乐之都，金色大厅与美泉宫。" },
  { id:"lisbon",   name:"里斯本",  country:"葡萄牙",     tag:"海港 · 法多", img:"https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=80", flights:"转机约13小时",  desc:"七丘之城，黄色电车穿梭于鹅卵石街道。" },
  { id:"newyork",  name:"纽约",    country:"美国",       tag:"都市 · 文化", img:"https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80", flights:"直飞约14小时",  desc:"不夜城，百老汇与中央公园。" },
  { id:"losangeles",name:"洛杉矶", country:"美国",       tag:"娱乐 · 海滩", img:"https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=600&q=80", flights:"直飞约12小时",  desc:"好莱坞的故乡，圣莫尼卡海滩与比弗利山庄。" },
  { id:"cancun",   name:"坎昆",    country:"墨西哥",     tag:"海滩 · 玛雅", img:"https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=600&q=80", flights:"转机约18小时",  desc:"加勒比海明珠，碧绿海水与玛雅遗址。" },
  { id:"rio",      name:"里约热内卢",country:"巴西",     tag:"狂欢 · 海滩", img:"https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80", flights:"转机约20小时",  desc:"上帝之城，基督山俯瞰科帕卡巴纳海滩。" },
  { id:"sydney",   name:"悉尼",    country:"澳大利亚",   tag:"海港 · 自然", img:"https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80", flights:"直飞约11小时",  desc:"南半球最美的海港城市。" },
  { id:"auckland", name:"奥克兰",  country:"新西兰",     tag:"自然 · 冒险", img:"https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=600&q=80", flights:"转机约13小时",  desc:"帆船之城，天空塔俯瞰海湾。" },
  { id:"cairo",    name:"开罗",    country:"埃及",       tag:"金字塔 · 历史",img:"https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=600&q=80", flights:"转机约12小时",  desc:"古文明的摇篮，吉萨金字塔与狮身人面像。" },
  { id:"capetown", name:"开普敦",  country:"南非",       tag:"自然 · 葡萄酒",img:"https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80", flights:"转机约16小时",  desc:"好望角所在地，桌山俯瞰大西洋。" },
  { id:"marrakech",name:"马拉喀什",country:"摩洛哥",     tag:"集市 · 沙漠", img:"https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=600&q=80", flights:"转机约12小时",  desc:"红城，迷宫般的麦地那与五彩斑斓的集市。" },
  { id:"hanoi",    name:"河内",    country:"越南",       tag:"历史 · 美食", img:"https://images.unsplash.com/photo-1509030450996-dd1a26dda07a?w=600&q=80", flights:"直飞约3小时",   desc:"千年古都，还剑湖与老城区。" },
  { id:"zurich",   name:"苏黎世",  country:"瑞士",       tag:"金融 · 湖光", img:"https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=600&q=80", flights:"转机约12小时",  desc:"全球最宜居城市之一，苏黎世湖畔风光旖旎。" },
  { id:"tokyo",    name:"东京",    country:"日本",       tag:"文化 · 科技", img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80", flights:"直飞约3.5小时", desc:"融合传统与现代的都市，霓虹灯与神社并存。" },
];

const FavoritesView = ({ onChat, favorites, onToggleFav }) => {
  const favDests = DESTINATIONS.filter(d => favorites.includes(d.id));

  if (favDests.length === 0) {
    return (
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",paddingTop:"80px"}}>
        <span className="material-symbols-outlined" style={{fontSize:"56px",color:C.onSurfaceVariant,marginBottom:"16px"}}>favorite_border</span>
        <h3 className="headline-font" style={{fontSize:"18px",fontWeight:"700",color:C.onSurface,marginBottom:"8px"}}>还没有收藏</h3>
        <p style={{fontSize:"14px",color:C.onSurfaceVariant}}>在"目的地"页面点击心形图标收藏你喜欢的地方</p>
      </div>
    );
  }

  return (
    <div style={{flex:1,overflowY:"auto",paddingTop:"80px",paddingBottom:"40px"}}>
      <div style={{maxWidth:"960px",margin:"0 auto",padding:"24px 32px"}}>
        <div style={{marginBottom:"24px"}}>
          <h2 className="headline-font" style={{fontSize:"24px",fontWeight:"700",color:C.onSurface,marginBottom:"8px"}}>收藏地点</h2>
          <p style={{fontSize:"14px",color:C.onSurfaceVariant}}>共收藏了 {favDests.length} 个目的地</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"16px"}}>
          {favDests.map(dest => (
            <div key={dest.id} style={{borderRadius:"16px",overflow:"hidden",background:C.surfaceContainer,
              border:"1px solid rgba(255,255,255,0.06)",position:"relative"}}>
              <div style={{position:"relative",height:"160px",overflow:"hidden"}}>
                <img src={dest.img} alt={dest.name} style={{width:"100%",height:"100%",objectFit:"cover"}} />
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 60%)"}} />
                <span style={{position:"absolute",bottom:"10px",left:"12px",fontSize:"11px",fontWeight:"700",
                  color:"white",background:"rgba(0,0,0,0.4)",padding:"3px 8px",borderRadius:"9999px"}}>{dest.tag}</span>
              </div>
              <button onClick={() => onToggleFav(dest.id)}
                style={{position:"absolute",top:"10px",right:"10px",width:"32px",height:"32px",borderRadius:"50%",
                  background:"rgba(0,0,0,0.5)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span className="material-symbols-outlined" style={{fontSize:"18px",color:"#ff6e84",fontVariationSettings:"'FILL' 1"}}>favorite</span>
              </button>
              <div style={{padding:"14px"}}>
                <h3 className="headline-font" style={{fontSize:"16px",fontWeight:"700",color:C.onSurface,marginBottom:"2px"}}>{dest.name}</h3>
                <p style={{fontSize:"12px",color:C.onSurfaceVariant,marginBottom:"10px"}}>{dest.country} · {dest.flights}</p>
                <button onClick={() => onChat(`帮我规划${dest.name}的旅行行程`)}
                  style={{width:"100%",padding:"9px",borderRadius:"10px",fontSize:"13px",fontWeight:"600",
                    background:"rgba(182,160,255,0.1)",color:C.primary,border:"1px solid rgba(182,160,255,0.2)",cursor:"pointer"}}>
                  规划行程
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoritesView;
