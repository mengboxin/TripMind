import React, { useState } from "react";

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
  {
    id: "tokyo",
    name: "东京",
    country: "日本",
    tag: "文化 · 科技",
    img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
    desc: "融合传统与现代的都市，霓虹灯与神社并存，是亚洲最受欢迎的旅行目的地之一。",
    highlights: ["浅草寺", "新宿御苑", "涩谷十字路口", "筑地市场", "秋叶原"],
    food: ["寿司", "拉面", "天妇罗", "抹茶甜品", "居酒屋料理"],
    bestTime: "3-5月（樱花季）/ 10-11月（红叶季）",
    flights: "直飞约3.5小时",
  },
  {
    id: "paris",
    name: "巴黎",
    country: "法国",
    tag: "艺术 · 浪漫",
    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80",
    desc: "光之城，艺术与时尚的殿堂，埃菲尔铁塔下的浪漫让无数旅人魂牵梦绕。",
    highlights: ["埃菲尔铁塔", "卢浮宫", "凡尔赛宫", "蒙马特高地", "塞纳河游船"],
    food: ["法棍面包", "可颂", "法式蜗牛", "鹅肝", "马卡龙"],
    bestTime: "4-6月 / 9-10月",
    flights: "直飞约11小时",
  },
  {
    id: "bali",
    name: "巴厘岛",
    country: "印度尼西亚",
    tag: "海岛 · 度假",
    img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
    desc: "神明之岛，梯田、神庙与碧海蓝天构成人间天堂，是放松身心的绝佳去处。",
    highlights: ["乌布猴林", "海神庙", "库塔海滩", "梯田日落", "乌鲁瓦图悬崖"],
    food: ["沙爹", "巴厘炒饭", "烤乳猪", "椰子冰淇淋", "新鲜热带水果"],
    bestTime: "4-10月（旱季）",
    flights: "直飞约6小时",
  },
  {
    id: "swiss",
    name: "瑞士",
    country: "瑞士",
    tag: "自然 · 滑雪",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    desc: "阿尔卑斯山的心脏，雪山、湖泊与精致小镇，是欧洲最美的自然风光之一。",
    highlights: ["少女峰", "卢塞恩湖", "因特拉肯", "马特洪峰", "日内瓦旧城"],
    food: ["奶酪火锅", "瑞士巧克力", "牛肉干", "土豆饼", "苹果派"],
    bestTime: "12-3月（滑雪）/ 6-9月（徒步）",
    flights: "转机约13小时",
  },
  {
    id: "newyork",
    name: "纽约",
    country: "美国",
    tag: "都市 · 文化",
    img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80",
    desc: "不夜城，百老汇、中央公园与自由女神像，是全球最具活力的国际大都市。",
    highlights: ["自由女神像", "中央公园", "时代广场", "大都会博物馆", "布鲁克林大桥"],
    food: ["纽约披萨", "百吉饼", "热狗", "芝士蛋糕", "龙虾卷"],
    bestTime: "4-6月 / 9-11月",
    flights: "直飞约14小时",
  },
  {
    id: "sydney",
    name: "悉尼",
    country: "澳大利亚",
    tag: "海港 · 自然",
    img: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80",
    desc: "南半球最美的海港城市，歌剧院与海湾大桥相映成趣，阳光沙滩令人心旷神怡。",
    highlights: ["悉尼歌剧院", "海湾大桥", "邦迪海滩", "蓝山国家公园", "达令港"],
    food: ["澳洲牛排", "海鲜拼盘", "袋鼠肉", "提拉米苏", "扁平白咖啡"],
    bestTime: "9-11月（春季）/ 3-5月（秋季）",
    flights: "直飞约11小时",
  },
];

const DestinationCard = ({ dest, isFav, onToggleFav, onOpen }) => (
  <div style={{borderRadius:"16px",overflow:"hidden",background:C.surfaceContainer,
    border:"1px solid rgba(255,255,255,0.06)",cursor:"pointer",transition:"transform 0.2s",position:"relative"}}
    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-3px)"}
    onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
    {/* 图片 */}
    <div style={{position:"relative",height:"160px",overflow:"hidden"}} onClick={() => onOpen(dest)}>
      <img src={dest.img} alt={dest.name} style={{width:"100%",height:"100%",objectFit:"cover"}}
        onError={e=>e.target.style.background="#1f1f26"} />
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 60%)"}} />
      <span style={{position:"absolute",bottom:"10px",left:"12px",fontSize:"11px",fontWeight:"700",
        color:"white",background:"rgba(0,0,0,0.4)",padding:"3px 8px",borderRadius:"9999px",
        backdropFilter:"blur(8px)"}}>{dest.tag}</span>
    </div>
    {/* 收藏按钮 */}
    <button onClick={e=>{e.stopPropagation();onToggleFav(dest.id);}}
      style={{position:"absolute",top:"10px",right:"10px",width:"32px",height:"32px",borderRadius:"50%",
        background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",border:"none",cursor:"pointer",
        display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
      <span className="material-symbols-outlined" style={{fontSize:"18px",
        color: isFav ? "#ff6e84" : "white",
        fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0"}}>favorite</span>
    </button>
    {/* 信息 */}
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
      {/* 头图 */}
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
      {/* 内容 */}
      <div style={{padding:"20px 24px 28px"}}>
        <p style={{fontSize:"14px",color:C.onSurfaceVariant,lineHeight:"1.8",marginBottom:"20px"}}>{dest.desc}</p>

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

  const filtered = DESTINATIONS.filter(d =>
    d.name.includes(search) || d.country.includes(search) || d.tag.includes(search)
  );

  return (
    <div style={{flex:1,overflowY:"auto",paddingTop:"80px",paddingBottom:"40px"}}>
      <div style={{maxWidth:"960px",margin:"0 auto",padding:"24px 32px"}}>
        <div style={{marginBottom:"28px"}}>
          <h2 className="headline-font" style={{fontSize:"24px",fontWeight:"700",color:"#f6f2fa",marginBottom:"8px"}}>热门目的地</h2>
          <p style={{fontSize:"14px",color:"#acaab1",marginBottom:"20px"}}>探索全球精选目的地，收藏心仪之地，一键开启 AI 行程规划</p>
          {/* 搜索框 */}
          <div style={{position:"relative",maxWidth:"360px"}}>
            <span className="material-symbols-outlined" style={{position:"absolute",left:"12px",top:"50%",transform:"translateY(-50%)",
              color:"#acaab1",fontSize:"18px"}}>search</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="搜索目的地..."
              style={{width:"100%",padding:"10px 14px 10px 40px",borderRadius:"12px",fontSize:"14px",
                background:"#19191f",border:"1px solid rgba(255,255,255,0.08)",color:"#f6f2fa",outline:"none"}} />
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"16px"}}>
          {filtered.map(dest => (
            <DestinationCard key={dest.id} dest={dest}
              isFav={favorites.includes(dest.id)}
              onToggleFav={onToggleFav}
              onOpen={setSelected} />
          ))}
        </div>
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
