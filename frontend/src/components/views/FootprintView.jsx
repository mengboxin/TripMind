import React, { useState, useEffect, useRef } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";

const ALL_DESTINATIONS = [
  { id:"beijing",  name:"北京",    country:"中国",     region:"亚洲",   coords:[116.40,39.90], color:"#c084fc" },
  { id:"shanghai", name:"上海",    country:"中国",     region:"亚洲",   coords:[121.47,31.23], color:"#e879f9" },
  { id:"tokyo",    name:"东京",    country:"日本",     region:"亚洲",   coords:[139.69,35.69], color:"#a78bfa" },
  { id:"seoul",    name:"首尔",    country:"韩国",     region:"亚洲",   coords:[126.98,37.57], color:"#60a5fa" },
  { id:"bangkok",  name:"曼谷",    country:"泰国",     region:"亚洲",   coords:[100.52,13.75], color:"#4ade80" },
  { id:"singapore",name:"新加坡",  country:"新加坡",   region:"亚洲",   coords:[103.82,1.35],  color:"#2dd4bf" },
  { id:"bali",     name:"巴厘岛",  country:"印尼",     region:"亚洲",   coords:[115.19,-8.41], color:"#34d399" },
  { id:"dubai",    name:"迪拜",    country:"阿联酋",   region:"亚洲",   coords:[55.27,25.20],  color:"#fbbf24" },
  { id:"paris",    name:"巴黎",    country:"法国",     region:"欧洲",   coords:[2.35,48.85],   color:"#f472b6" },
  { id:"london",   name:"伦敦",    country:"英国",     region:"欧洲",   coords:[-0.12,51.51],  color:"#818cf8" },
  { id:"rome",     name:"罗马",    country:"意大利",   region:"欧洲",   coords:[12.50,41.90],  color:"#f87171" },
  { id:"swiss",    name:"瑞士",    country:"瑞士",     region:"欧洲",   coords:[8.23,46.82],   color:"#fb923c" },
  { id:"barcelona",name:"巴塞罗那",country:"西班牙",   region:"欧洲",   coords:[2.17,41.39],   color:"#facc15" },
  { id:"amsterdam",name:"阿姆斯特丹",country:"荷兰",  region:"欧洲",   coords:[4.90,52.37],   color:"#a3e635" },
  { id:"newyork",  name:"纽约",    country:"美国",     region:"美洲",   coords:[-74.01,40.71], color:"#f97316" },
  { id:"losangeles",name:"洛杉矶", country:"美国",     region:"美洲",   coords:[-118.24,34.05],color:"#fb923c" },
  { id:"sydney",   name:"悉尼",    country:"澳大利亚", region:"大洋洲", coords:[151.21,-33.87],color:"#e879f9" },
  { id:"cairo",    name:"开罗",    country:"埃及",     region:"非洲",   coords:[31.24,30.04],  color:"#fcd34d" },
  { id:"capetown", name:"开普敦",  country:"南非",     region:"非洲",   coords:[18.42,-33.93], color:"#f87171" },
];

const W = 900, H = 460;

const FootprintView = () => {
  const [paths, setPaths] = useState([]);
  const [visited, setVisited] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tm_visited") || "[]"); } catch { return []; }
  });
  const [selected, setSelected] = useState(null);

  const projection = geoNaturalEarth1().scale(145).translate([W/2, H/2]);
  const pg = geoPath().projection(projection);

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then(topo => setPaths(feature(topo, topo.objects.countries).features))
      .catch(() => {});
  }, []);

  const toggleVisited = (id) => {
    const next = visited.includes(id) ? visited.filter(v => v !== id) : [...visited, id];
    setVisited(next);
    localStorage.setItem("tm_visited", JSON.stringify(next));
  };

  const visitedDests = ALL_DESTINATIONS.filter(d => visited.includes(d.id));
  const regions = [...new Set(visitedDests.map(d => d.region))];

  return (
    <div style={{flex:1,overflowY:"auto",paddingTop:"80px",paddingBottom:"40px"}}>
      <div style={{maxWidth:"1000px",margin:"0 auto",padding:"24px 32px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"20px",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <h2 className="headline-font" style={{fontSize:"24px",fontWeight:"700",marginBottom:"6px",
              background:"linear-gradient(to right,#f472b6,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              旅行足迹
            </h2>
            <p style={{fontSize:"13px",color:"#b8b5cc"}}>
              已打卡 <span style={{color:"#f472b6",fontWeight:"700"}}>{visited.length}</span> 个目的地 ·
              覆盖 <span style={{color:"#a78bfa",fontWeight:"700"}}>{new Set(visitedDests.map(d=>d.country)).size}</span> 个国家 ·
              <span style={{color:"#60a5fa",fontWeight:"700"}}> {regions.length}</span> 个大洲
            </p>
          </div>
          {/* 统计徽章 */}
          <div style={{display:"flex",gap:"10px"}}>
            {[
              { label:"目的地", value:visited.length, color:"#f472b6" },
              { label:"国家",   value:new Set(visitedDests.map(d=>d.country)).size, color:"#a78bfa" },
              { label:"大洲",   value:regions.length, color:"#60a5fa" },
            ].map(s => (
              <div key={s.label} style={{padding:"8px 16px",borderRadius:"12px",textAlign:"center",
                background:`${s.color}12`,border:`1px solid ${s.color}30`}}>
                <div style={{fontSize:"20px",fontWeight:"700",color:s.color}}>{s.value}</div>
                <div style={{fontSize:"11px",color:"#b8b5cc"}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 足迹地图 */}
        <div style={{borderRadius:"20px",overflow:"hidden",border:"1px solid rgba(244,114,182,0.2)",
          background:"radial-gradient(ellipse at center,#0f0c24 0%,#080614 100%)",
          boxShadow:"0 0 40px rgba(244,114,182,0.08)",marginBottom:"24px"}}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",display:"block"}}>
            {paths.map((geo, i) => (
              <path key={i} d={pg(geo)||""} fill="#13102a" stroke="#2d2060" strokeWidth={0.4}
                onMouseEnter={e=>e.target.setAttribute("fill","#1e1640")}
                onMouseLeave={e=>e.target.setAttribute("fill","#13102a")} />
            ))}
            {/* 已访问目的地 */}
            {ALL_DESTINATIONS.map(dest => {
              const pt = projection(dest.coords);
              if (!pt) return null;
              const isVisited = visited.includes(dest.id);
              const isSel = selected?.id === dest.id;
              return (
                <g key={dest.id} style={{cursor:"pointer"}} onClick={() => setSelected(isSel ? null : dest)}>
                  {isVisited && <circle cx={pt[0]} cy={pt[1]} r={18} fill={`${dest.color}10`} stroke={dest.color} strokeWidth={0.5} opacity={0.5}/>}
                  <circle cx={pt[0]} cy={pt[1]} r={isVisited ? (isSel?8:5) : 3}
                    fill={isVisited ? dest.color : "#2a2050"}
                    stroke={isVisited ? dest.color : "#4a3880"}
                    strokeWidth={1}
                    style={{filter: isVisited ? `drop-shadow(0 0 6px ${dest.color})` : "none", transition:"all 0.2s"}} />
                  {isVisited && (
                    <text x={pt[0]} y={pt[1]-12} textAnchor="middle"
                      style={{fontSize:"9px",fill:dest.color,fontWeight:"600",fontFamily:"Manrope,sans-serif",
                        filter:"drop-shadow(0 1px 2px #000)",pointerEvents:"none"}}>
                      ✓ {dest.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* 选中目的地操作 */}
        {selected && (
          <div style={{marginBottom:"20px",padding:"16px 20px",borderRadius:"14px",
            background:`linear-gradient(135deg,${selected.color}12,rgba(8,6,20,0.9))`,
            border:`1px solid ${selected.color}30`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <div style={{width:"10px",height:"10px",borderRadius:"50%",background:selected.color,boxShadow:`0 0 8px ${selected.color}`}}/>
              <span style={{fontSize:"16px",fontWeight:"700",color:"#f0eeff"}}>{selected.name}</span>
              <span style={{fontSize:"12px",color:"#b8b5cc"}}>{selected.country} · {selected.region}</span>
            </div>
            <button onClick={() => toggleVisited(selected.id)}
              style={{padding:"8px 20px",borderRadius:"9999px",fontSize:"13px",fontWeight:"600",cursor:"pointer",transition:"all 0.2s",
                background: visited.includes(selected.id) ? "rgba(255,110,132,0.15)" : `${selected.color}20`,
                color: visited.includes(selected.id) ? "#ff6e84" : selected.color,
                border: visited.includes(selected.id) ? "1px solid rgba(255,110,132,0.3)" : `1px solid ${selected.color}40`}}>
              {visited.includes(selected.id) ? "✓ 已打卡 · 取消" : "📍 标记已去过"}
            </button>
          </div>
        )}

        {/* 目的地网格 - 点击标记 */}
        <div>
          <p style={{fontSize:"13px",fontWeight:"600",color:"#b8b5cc",marginBottom:"12px"}}>点击标记去过的地方</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"8px"}}>
            {ALL_DESTINATIONS.map(dest => {
              const isVisited = visited.includes(dest.id);
              return (
                <button key={dest.id} onClick={() => { toggleVisited(dest.id); setSelected(dest); }}
                  style={{padding:"10px 12px",borderRadius:"12px",textAlign:"left",cursor:"pointer",transition:"all 0.15s",
                    background: isVisited ? `${dest.color}18` : "rgba(255,255,255,0.03)",
                    border: isVisited ? `1px solid ${dest.color}40` : "1px solid rgba(255,255,255,0.07)",
                    display:"flex",alignItems:"center",gap:"8px"}}>
                  <div style={{width:"8px",height:"8px",borderRadius:"50%",flexShrink:0,
                    background: isVisited ? dest.color : "#2a2050",
                    boxShadow: isVisited ? `0 0 6px ${dest.color}` : "none"}}/>
                  <div>
                    <div style={{fontSize:"12px",fontWeight:"600",color: isVisited ? "#f0eeff" : "#b8b5cc"}}>
                      {isVisited && "✓ "}{dest.name}
                    </div>
                    <div style={{fontSize:"10px",color:"#b8b5cc"}}>{dest.country}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 已访问列表 */}
        {visitedDests.length > 0 && (
          <div style={{marginTop:"28px"}}>
            <p style={{fontSize:"13px",fontWeight:"600",color:"#b8b5cc",marginBottom:"12px"}}>我的足迹</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
              {visitedDests.map(dest => (
                <div key={dest.id} style={{display:"flex",alignItems:"center",gap:"6px",
                  padding:"6px 12px",borderRadius:"9999px",
                  background:`${dest.color}15`,border:`1px solid ${dest.color}30`}}>
                  <div style={{width:"6px",height:"6px",borderRadius:"50%",background:dest.color}}/>
                  <span style={{fontSize:"12px",color:dest.color,fontWeight:"600"}}>{dest.name}</span>
                  <span style={{fontSize:"11px",color:"#b8b5cc"}}>{dest.country}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FootprintView;
