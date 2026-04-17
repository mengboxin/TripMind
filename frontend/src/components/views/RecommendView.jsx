import React, { useState, useEffect } from "react";

const ALL_DESTS = [
  { id:"beijing",  name:"北京",    country:"中国",     tag:"历史·文化", season:"春秋",  img:"https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&q=80", color:"#c084fc", reason:"中国首都，历史文化底蕴深厚" },
  { id:"paris",    name:"巴黎",    country:"法国",     tag:"艺术·浪漫", season:"春秋",  img:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80", color:"#f472b6", reason:"欧洲经典，艺术与美食之都" },
  { id:"bali",     name:"巴厘岛",  country:"印尼",     tag:"海岛·度假", season:"夏",    img:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80", color:"#34d399", reason:"热带天堂，放松身心首选" },
  { id:"swiss",    name:"瑞士",    country:"瑞士",     tag:"自然·滑雪", season:"冬夏",  img:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", color:"#fb923c", reason:"阿尔卑斯山，自然奇观" },
  { id:"newyork",  name:"纽约",    country:"美国",     tag:"都市·文化", season:"全年",  img:"https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80", color:"#f97316", reason:"国际大都市，文化多元" },
  { id:"sydney",   name:"悉尼",    country:"澳大利亚", tag:"海港·自然", season:"春秋",  img:"https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&q=80", color:"#e879f9", reason:"南半球明珠，海港风光" },
  { id:"dubai",    name:"迪拜",    country:"阿联酋",   tag:"奢华·沙漠", season:"冬",    img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80", color:"#fbbf24", reason:"现代奇迹，购物天堂" },
  { id:"london",   name:"伦敦",    country:"英国",     tag:"历史·文化", season:"春夏",  img:"https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80", color:"#818cf8", reason:"历史名城，博物馆之都" },
  { id:"bangkok",  name:"曼谷",    country:"泰国",     tag:"美食·寺庙", season:"冬",    img:"https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&q=80", color:"#4ade80", reason:"东南亚美食中心，性价比高" },
  { id:"rome",     name:"罗马",    country:"意大利",   tag:"古迹·美食", season:"春秋",  img:"https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80", color:"#f87171", reason:"永恒之城，历史与美食" },
  { id:"singapore",name:"新加坡",  country:"新加坡",   tag:"都市·美食", season:"全年",  img:"https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=80", color:"#2dd4bf", reason:"花园城市，亚洲美食汇聚" },
  { id:"maldives", name:"马尔代夫",country:"马尔代夫", tag:"海岛·蜜月", season:"冬春",  img:"https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=400&q=80", color:"#38bdf8", reason:"人间天堂，蜜月首选" },
];

const now = new Date();
const curMonth = now.getMonth() + 1;
const curSeason = curMonth >= 3 && curMonth <= 5 ? "春" : curMonth >= 6 && curMonth <= 8 ? "夏" : curMonth >= 9 && curMonth <= 11 ? "秋" : "冬";

const RecommendView = ({ favorites, onChat }) => {
  const [visited] = useState(() => { try { return JSON.parse(localStorage.getItem("tm_visited")||"[]"); } catch { return []; } });
  const [activeTag, setActiveTag] = useState("全部");

  // 推荐逻辑：未收藏未去过的 + 当季 + 随机
  const notSeen = ALL_DESTS.filter(d => !visited.includes(d.id));
  const seasonal = notSeen.filter(d => d.season.includes(curSeason) || d.season === "全年");
  const favBased = favorites.length > 0
    ? notSeen.filter(d => !seasonal.find(s => s.id === d.id)).slice(0, 3)
    : [];
  const popular = notSeen.filter(d => !seasonal.find(s=>s.id===d.id) && !favBased.find(f=>f.id===d.id)).slice(0,4);

  const TAGS = ["全部","亚洲","欧洲","美洲","大洋洲","海岛","都市","自然"];
  const tagMap = {
    "亚洲":["beijing","bali","dubai","bangkok","singapore","maldives"],
    "欧洲":["paris","swiss","london","rome"],
    "美洲":["newyork"],
    "大洋洲":["sydney"],
    "海岛":["bali","maldives"],
    "都市":["beijing","newyork","london","singapore","dubai"],
    "自然":["swiss","sydney","bali"],
  };

  const filtered = activeTag === "全部" ? ALL_DESTS : ALL_DESTS.filter(d => (tagMap[activeTag]||[]).includes(d.id));

  const Card = ({ dest, badge }) => (
    <div style={{borderRadius:"16px",overflow:"hidden",background:"rgba(255,255,255,0.03)",
      border:"1px solid rgba(255,255,255,0.07)",transition:"transform 0.2s",cursor:"pointer",position:"relative"}}
      onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
      onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
      <div style={{position:"relative",height:"170px",overflow:"hidden"}}>
        <img src={dest.img} alt={dest.name} style={{width:"100%",height:"100%",objectFit:"cover"}}
          onError={e=>e.target.style.background="#1a1a2e"}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 60%)"}}/>
        {badge && (
          <div style={{position:"absolute",top:"10px",left:"10px",padding:"3px 10px",borderRadius:"9999px",
            fontSize:"10px",fontWeight:"700",background:`${dest.color}cc`,color:"white"}}>
            {badge}
          </div>
        )}
        {favorites.includes(dest.id) && (
          <div style={{position:"absolute",top:"10px",right:"10px",fontSize:"14px"}}>♥</div>
        )}
      </div>
      <div style={{padding:"12px 14px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"6px"}}>
          <div>
            <h3 style={{fontSize:"15px",fontWeight:"700",color:"#f0eeff",marginBottom:"2px"}}>{dest.name}</h3>
            <p style={{fontSize:"11px",color:"#b8b5cc"}}>{dest.country} · {dest.tag}</p>
          </div>
          <span style={{fontSize:"10px",color:dest.color,background:`${dest.color}15`,
            padding:"2px 8px",borderRadius:"9999px",border:`1px solid ${dest.color}30`,flexShrink:0,marginLeft:"8px"}}>
            {dest.season}季
          </span>
        </div>
        <p style={{fontSize:"11px",color:"#b8b5cc",marginBottom:"10px",lineHeight:"1.5"}}>{dest.reason}</p>
        <button onClick={() => onChat(`帮我规划${dest.name}的旅行行程`)}
          style={{width:"100%",padding:"8px",borderRadius:"9px",fontSize:"12px",fontWeight:"600",cursor:"pointer",
            background:`${dest.color}15`,color:dest.color,border:`1px solid ${dest.color}25`,transition:"all 0.15s"}}
          onMouseEnter={e=>{e.currentTarget.style.background=`${dest.color}25`;}}
          onMouseLeave={e=>{e.currentTarget.style.background=`${dest.color}15`;}}>
          ✈ 规划行程
        </button>
      </div>
    </div>
  );

  return (
    <div style={{flex:1,overflowY:"auto",paddingTop:"80px",paddingBottom:"40px"}}>
      <div style={{maxWidth:"960px",margin:"0 auto",padding:"24px 32px"}}>
        <div style={{marginBottom:"24px"}}>
          <h2 className="headline-font" style={{fontSize:"24px",fontWeight:"700",marginBottom:"6px",
            background:"linear-gradient(to right,#fbbf24,#f472b6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            智能推荐
          </h2>
          <p style={{fontSize:"13px",color:"#b8b5cc"}}>
            当前季节：<span style={{color:"#fbbf24",fontWeight:"600"}}>{curSeason}季</span> · 根据你的偏好和当前时节为你推荐
          </p>
        </div>

        {/* 当季推荐 */}
        {seasonal.length > 0 && (
          <div style={{marginBottom:"32px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px"}}>
              <span style={{fontSize:"16px"}}>🌟</span>
              <p style={{fontSize:"14px",fontWeight:"700",color:"#f0eeff"}}>当季推荐</p>
              <span style={{fontSize:"12px",color:"#b8b5cc"}}>适合{curSeason}季出行</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"16px"}}>
              {seasonal.slice(0,4).map(d => <Card key={d.id} dest={d} badge={`${curSeason}季热门`}/>)}
            </div>
          </div>
        )}

        {/* 全部目的地 + 标签筛选 */}
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"14px",flexWrap:"wrap",gap:"10px"}}>
            <p style={{fontSize:"14px",fontWeight:"700",color:"#f0eeff"}}>探索更多</p>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              {TAGS.map(t => (
                <button key={t} onClick={() => setActiveTag(t)}
                  style={{padding:"5px 14px",borderRadius:"9999px",fontSize:"12px",fontWeight:"600",cursor:"pointer",transition:"all 0.15s",
                    background: activeTag===t ? "linear-gradient(to right,#fbbf24,#f472b6)" : "rgba(255,255,255,0.04)",
                    color: activeTag===t ? "#0d0b1a" : "#b8b5cc",
                    border: activeTag===t ? "none" : "1px solid rgba(255,255,255,0.08)"}}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"16px"}}>
            {filtered.map(d => <Card key={d.id} dest={d} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendView;
