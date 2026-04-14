import React, { useState } from "react";

const C = {
  surfaceContainer: "#19191f",
  onSurface: "#f6f2fa",
  onSurfaceVariant: "#acaab1",
  primary: "#b6a0ff",
};

// 目的地数据（与 DestinationsView 保持一致）
const DESTINATIONS = [
  { id:"tokyo",   name:"东京",   country:"日本",       tag:"文化 · 科技", img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80", flights:"直飞约3.5小时", desc:"融合传统与现代的都市，霓虹灯与神社并存。" },
  { id:"paris",   name:"巴黎",   country:"法国",       tag:"艺术 · 浪漫", img:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80", flights:"直飞约11小时",  desc:"光之城，艺术与时尚的殿堂。" },
  { id:"bali",    name:"巴厘岛", country:"印度尼西亚", tag:"海岛 · 度假", img:"https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", flights:"直飞约6小时",   desc:"神明之岛，梯田、神庙与碧海蓝天。" },
  { id:"swiss",   name:"瑞士",   country:"瑞士",       tag:"自然 · 滑雪", img:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", flights:"转机约13小时",  desc:"阿尔卑斯山的心脏，雪山与湖泊。" },
  { id:"newyork", name:"纽约",   country:"美国",       tag:"都市 · 文化", img:"https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80", flights:"直飞约14小时",  desc:"不夜城，百老汇与中央公园。" },
  { id:"sydney",  name:"悉尼",   country:"澳大利亚",   tag:"海港 · 自然", img:"https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80", flights:"直飞约11小时",  desc:"南半球最美的海港城市。" },
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
