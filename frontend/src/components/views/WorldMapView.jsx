import React, { useState, useEffect, useRef, useCallback } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";

// 30个目的地，按区域分组
const DESTINATIONS = [
  // 亚洲
  { id:"tokyo",    name:"东京",    country:"日本",       region:"亚洲", coords:[139.69,35.69],  color:"#a78bfa", tag:"文化·科技" },
  { id:"beijing",  name:"北京",    country:"中国",       region:"亚洲", coords:[116.40,39.90],  color:"#c084fc", tag:"历史·文化" },
  { id:"shanghai", name:"上海",    country:"中国",       region:"亚洲", coords:[121.47,31.23],  color:"#e879f9", tag:"都市·商业" },
  { id:"bangkok",  name:"曼谷",    country:"泰国",       region:"亚洲", coords:[100.52,13.75],  color:"#4ade80", tag:"美食·寺庙" },
  { id:"bali",     name:"巴厘岛",  country:"印尼",       region:"亚洲", coords:[115.19,-8.41],  color:"#34d399", tag:"海岛·度假" },
  { id:"singapore",name:"新加坡",  country:"新加坡",     region:"亚洲", coords:[103.82,1.35],   color:"#2dd4bf", tag:"都市·美食" },
  { id:"seoul",    name:"首尔",    country:"韩国",       region:"亚洲", coords:[126.98,37.57],  color:"#60a5fa", tag:"时尚·美食" },
  { id:"dubai",    name:"迪拜",    country:"阿联酋",     region:"亚洲", coords:[55.27,25.20],   color:"#fbbf24", tag:"奢华·沙漠" },
  { id:"maldives", name:"马尔代夫",country:"马尔代夫",   region:"亚洲", coords:[73.22,1.97],    color:"#38bdf8", tag:"海岛·蜜月" },
  // 欧洲
  { id:"paris",    name:"巴黎",    country:"法国",       region:"欧洲", coords:[2.35,48.85],    color:"#f472b6", tag:"艺术·浪漫" },
  { id:"london",   name:"伦敦",    country:"英国",       region:"欧洲", coords:[-0.12,51.51],   color:"#818cf8", tag:"历史·文化" },
  { id:"rome",     name:"罗马",    country:"意大利",     region:"欧洲", coords:[12.50,41.90],   color:"#f87171", tag:"古迹·美食" },
  { id:"swiss",    name:"瑞士",    country:"瑞士",       region:"欧洲", coords:[8.23,46.82],    color:"#fb923c", tag:"自然·滑雪" },
  { id:"barcelona",name:"巴塞罗那",country:"西班牙",     region:"欧洲", coords:[2.17,41.39],    color:"#facc15", tag:"建筑·海滩" },
  { id:"amsterdam",name:"阿姆斯特丹",country:"荷兰",    region:"欧洲", coords:[4.90,52.37],    color:"#a3e635", tag:"运河·郁金香" },
  { id:"prague",   name:"布拉格",  country:"捷克",       region:"欧洲", coords:[14.42,50.08],   color:"#fb7185", tag:"童话·古城" },
  { id:"santorini",name:"圣托里尼",country:"希腊",       region:"欧洲", coords:[25.43,36.39],   color:"#67e8f9", tag:"蓝白·海景" },
  // 美洲
  { id:"newyork",  name:"纽约",    country:"美国",       region:"美洲", coords:[-74.01,40.71],  color:"#f97316", tag:"都市·文化" },
  { id:"losangeles",name:"洛杉矶", country:"美国",       region:"美洲", coords:[-118.24,34.05], color:"#fb923c", tag:"娱乐·海滩" },
  { id:"cancun",   name:"坎昆",    country:"墨西哥",     region:"美洲", coords:[-86.85,21.16],  color:"#4ade80", tag:"海滩·玛雅" },
  { id:"rio",      name:"里约",    country:"巴西",       region:"美洲", coords:[-43.17,-22.91], color:"#fbbf24", tag:"狂欢·海滩" },
  { id:"buenosaires",name:"布宜诺斯艾利斯",country:"阿根廷",region:"美洲",coords:[-58.38,-34.61],color:"#c084fc",tag:"探戈·牛排"},
  // 非洲&大洋洲
  { id:"sydney",   name:"悉尼",    country:"澳大利亚",   region:"大洋洲",coords:[151.21,-33.87], color:"#e879f9", tag:"海港·自然" },
  { id:"auckland", name:"奥克兰",  country:"新西兰",     region:"大洋洲",coords:[174.76,-36.85], color:"#34d399", tag:"自然·冒险" },
  { id:"cairo",    name:"开罗",    country:"埃及",       region:"非洲", coords:[31.24,30.04],   color:"#fcd34d", tag:"金字塔·历史" },
  { id:"capetown", name:"开普敦",  country:"南非",       region:"非洲", coords:[18.42,-33.93],  color:"#f87171", tag:"自然·葡萄酒" },
  { id:"marrakech",name:"马拉喀什",country:"摩洛哥",     region:"非洲", coords:[-7.99,31.63],   color:"#fb923c", tag:"集市·沙漠" },
];

const REGIONS = ["全部", "亚洲", "欧洲", "美洲", "非洲", "大洋洲"];
const W = 960, H = 500;

const WorldMapView = ({ favorites, onToggleFav, onChat }) => {
  const [paths, setPaths] = useState([]);
  const [selected, setSelected] = useState(null);
  const [region, setRegion] = useState("全部");
  const [zoom, setZoom] = useState(1);
  const [translate, setTranslate] = useState([0, 0]);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const svgRef = useRef(null);

  // 投影：Natural Earth，更好看
  const getProjection = useCallback(() =>
    geoNaturalEarth1()
      .scale(153 * zoom)
      .translate([W / 2 + translate[0], H / 2 + translate[1]]),
  [zoom, translate]);

  const pathGen = useCallback(() => geoPath().projection(getProjection()), [getProjection]);

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then(topo => setPaths(feature(topo, topo.objects.countries).features))
      .catch(() => {});
  }, []);

  const filtered = region === "全部" ? DESTINATIONS : DESTINATIONS.filter(d => d.region === region);

  // 鼠标拖拽平移
  const onMouseDown = (e) => { setDragging(true); setDragStart([e.clientX, e.clientY]); };
  const onMouseMove = (e) => {
    if (!dragging || !dragStart) return;
    const dx = e.clientX - dragStart[0], dy = e.clientY - dragStart[1];
    setTranslate(t => [t[0] + dx, t[1] + dy]);
    setDragStart([e.clientX, e.clientY]);
  };
  const onMouseUp = () => { setDragging(false); setDragStart(null); };

  const proj = getProjection();
  const pg = pathGen();

  return (
    <div style={{flex:1,overflowY:"auto",paddingTop:"80px",paddingBottom:"40px"}}>
      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"24px 32px"}}>

        {/* 标题 */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"20px",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <h2 className="headline-font" style={{fontSize:"24px",fontWeight:"700",marginBottom:"6px",
              background:"linear-gradient(to right,#a78bfa,#38bdf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              全球目的地地图
            </h2>
            <p style={{fontSize:"13px",color:"#b8b5cc"}}>共 {DESTINATIONS.length} 个目的地 · 点击标记查看详情 · 拖拽平移 · 滚轮缩放</p>
          </div>
          {/* 缩放控制 */}
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            <button onClick={()=>setZoom(z=>Math.min(z+0.3,4))}
              style={{width:"32px",height:"32px",borderRadius:"8px",background:"rgba(167,139,250,0.15)",
                border:"1px solid rgba(167,139,250,0.3)",color:"#a78bfa",fontSize:"18px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
            <span style={{fontSize:"12px",color:"#b8b5cc",minWidth:"36px",textAlign:"center"}}>{Math.round(zoom*100)}%</span>
            <button onClick={()=>setZoom(z=>Math.max(z-0.3,0.5))}
              style={{width:"32px",height:"32px",borderRadius:"8px",background:"rgba(167,139,250,0.15)",
                border:"1px solid rgba(167,139,250,0.3)",color:"#a78bfa",fontSize:"18px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
            <button onClick={()=>{setZoom(1);setTranslate([0,0]);}}
              style={{padding:"0 12px",height:"32px",borderRadius:"8px",background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.1)",color:"#b8b5cc",fontSize:"12px",cursor:"pointer"}}>重置</button>
          </div>
        </div>

        {/* 区域筛选 */}
        <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
          {REGIONS.map(r => (
            <button key={r} onClick={()=>setRegion(r)}
              style={{padding:"6px 16px",borderRadius:"9999px",fontSize:"12px",fontWeight:"600",cursor:"pointer",transition:"all 0.15s",
                background: region===r ? "linear-gradient(to right,#a78bfa,#60a5fa)" : "rgba(255,255,255,0.05)",
                color: region===r ? "#0d0b1a" : "#b8b5cc",
                border: region===r ? "none" : "1px solid rgba(255,255,255,0.1)"}}>
              {r}
            </button>
          ))}
        </div>

        {/* 地图 SVG */}
        <div style={{borderRadius:"20px",overflow:"hidden",border:"1px solid rgba(139,92,246,0.25)",
          background:"radial-gradient(ellipse at center,#0f0c24 0%,#080614 100%)",
          boxShadow:"0 0 60px rgba(139,92,246,0.12)",position:"relative",cursor:dragging?"grabbing":"grab"}}>
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{width:"100%",display:"block",userSelect:"none"}}
            onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
            onWheel={e=>{e.preventDefault();setZoom(z=>Math.max(0.5,Math.min(4,z-(e.deltaY>0?0.15:-0.15))));}}
          >
            <defs>
              <radialGradient id="globeBg" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#1a1040" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#080614" stopOpacity="0"/>
              </radialGradient>
              {DESTINATIONS.map(d => (
                <radialGradient key={`g-${d.id}`} id={`glow-${d.id}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={d.color} stopOpacity="0.6"/>
                  <stop offset="100%" stopColor={d.color} stopOpacity="0"/>
                </radialGradient>
              ))}
            </defs>
            <rect width={W} height={H} fill="url(#globeBg)" />

            {/* 国家 */}
            {paths.map((geo, i) => (
              <path key={i} d={pg(geo) || ""}
                fill="#13102a" stroke="#2d2060" strokeWidth={0.4}
                style={{transition:"fill 0.1s"}}
                onMouseEnter={e=>e.target.setAttribute("fill","#1e1640")}
                onMouseLeave={e=>e.target.setAttribute("fill","#13102a")} />
            ))}

            {/* 行程路线（已收藏目的地之间连线） */}
            {favorites.length >= 2 && favorites.slice(0,-1).map((id,i) => {
              const a = DESTINATIONS.find(d=>d.id===id);
              const b = DESTINATIONS.find(d=>d.id===favorites[i+1]);
              if (!a||!b) return null;
              const pa = proj(a.coords), pb = proj(b.coords);
              if (!pa||!pb) return null;
              return (
                <g key={`line-${i}`}>
                  <line x1={pa[0]} y1={pa[1]} x2={pb[0]} y2={pb[1]}
                    stroke="#a78bfa" strokeWidth={1} strokeDasharray="5 3" opacity={0.5}/>
                  <circle cx={(pa[0]+pb[0])/2} cy={(pa[1]+pb[1])/2} r={2} fill="#a78bfa" opacity={0.7}/>
                </g>
              );
            })}

            {/* 目的地标记 */}
            {filtered.map(dest => {
              const pt = proj(dest.coords);
              if (!pt) return null;
              const isSel = selected?.id === dest.id;
              const isFav = favorites.includes(dest.id);
              return (
                <g key={dest.id} style={{cursor:"pointer"}}
                  onClick={e=>{e.stopPropagation();setSelected(isSel?null:dest);}}>
                  {/* 光晕背景 */}
                  {isSel && <circle cx={pt[0]} cy={pt[1]} r={22} fill={`url(#glow-${dest.id})`}/>}
                  {/* 外圈 */}
                  <circle cx={pt[0]} cy={pt[1]} r={isSel?13:8}
                    fill={`${dest.color}20`} stroke={dest.color} strokeWidth={isSel?1.5:1}
                    style={{transition:"all 0.2s"}}/>
                  {/* 内点 */}
                  <circle cx={pt[0]} cy={pt[1]} r={isSel?5:3}
                    fill={dest.color}
                    style={{filter:`drop-shadow(0 0 4px ${dest.color})`,transition:"all 0.2s"}}/>
                  {/* 城市名（始终显示，缩放>1.5时） */}
                  {(zoom > 1.4 || isSel) && (
                    <text x={pt[0]} y={pt[1]+(isSel?22:16)} textAnchor="middle"
                      style={{fontSize: isSel?"11px":"9px", fill: isSel?dest.color:"rgba(255,255,255,0.7)",
                        fontWeight:"600",fontFamily:"Manrope,sans-serif",pointerEvents:"none",
                        filter:"drop-shadow(0 1px 3px #000)"}}>
                      {dest.name}
                    </text>
                  )}
                  {/* 收藏心 */}
                  {isFav && <text x={pt[0]+8} y={pt[1]-8} style={{fontSize:"8px",fill:"#ff6e84",pointerEvents:"none"}}>♥</text>}
                </g>
              );
            })}
          </svg>

          {/* 图例 */}
          <div style={{position:"absolute",bottom:"14px",left:"14px",display:"flex",gap:"14px",
            background:"rgba(8,6,20,0.85)",backdropFilter:"blur(8px)",padding:"8px 16px",borderRadius:"10px",
            border:"1px solid rgba(139,92,246,0.15)"}}>
            {[["#a78bfa","目的地"],["#ff6e84","已收藏"]].map(([c,l])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",color:"#b8b5cc"}}>
                <div style={{width:"8px",height:"8px",borderRadius:"50%",background:c}}/>{l}
              </div>
            ))}
            <div style={{display:"flex",alignItems:"center",gap:"6px",fontSize:"11px",color:"#b8b5cc"}}>
              <div style={{width:"16px",height:"0",borderTop:"2px dashed #a78bfa",opacity:0.7}}/>收藏路线
            </div>
          </div>

          {/* 目的地数量 */}
          <div style={{position:"absolute",top:"14px",right:"14px",
            background:"rgba(8,6,20,0.85)",backdropFilter:"blur(8px)",padding:"6px 12px",borderRadius:"8px",
            border:"1px solid rgba(139,92,246,0.15)",fontSize:"11px",color:"#b8b5cc"}}>
            显示 {filtered.length} / {DESTINATIONS.length} 个目的地
          </div>
        </div>

        {/* 选中详情卡片 */}
        {selected && (
          <div style={{marginTop:"16px",padding:"20px 24px",borderRadius:"16px",
            background:`linear-gradient(135deg,${selected.color}15,rgba(8,6,20,0.95))`,
            border:`1px solid ${selected.color}35`,
            display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px",flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
              <div style={{width:"48px",height:"48px",borderRadius:"14px",
                background:`${selected.color}20`,border:`1px solid ${selected.color}40`,
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <div style={{width:"14px",height:"14px",borderRadius:"50%",background:selected.color,
                  boxShadow:`0 0 12px ${selected.color}`}}/>
              </div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"4px"}}>
                  <h3 className="headline-font" style={{fontSize:"20px",fontWeight:"700",color:"#f0eeff"}}>{selected.name}</h3>
                  <span style={{fontSize:"12px",color:"#b8b5cc",background:"rgba(255,255,255,0.06)",
                    padding:"2px 8px",borderRadius:"9999px"}}>{selected.country}</span>
                  <span style={{fontSize:"11px",color:selected.color,background:`${selected.color}15`,
                    padding:"2px 8px",borderRadius:"9999px",border:`1px solid ${selected.color}30`}}>{selected.tag}</span>
                </div>
                <p style={{fontSize:"12px",color:"#b8b5cc"}}>
                  {selected.region} · {selected.coords[0].toFixed(2)}°E {Math.abs(selected.coords[1]).toFixed(2)}°{selected.coords[1]>=0?"N":"S"}
                </p>
              </div>
            </div>
            <div style={{display:"flex",gap:"10px",flexShrink:0}}>
              <button onClick={()=>onToggleFav(selected.id)}
                style={{padding:"10px 20px",borderRadius:"9999px",fontSize:"13px",fontWeight:"600",cursor:"pointer",transition:"all 0.2s",
                  background:favorites.includes(selected.id)?"rgba(255,110,132,0.15)":"rgba(255,255,255,0.06)",
                  color:favorites.includes(selected.id)?"#ff6e84":"#b8b5cc",
                  border:favorites.includes(selected.id)?"1px solid rgba(255,110,132,0.3)":"1px solid rgba(255,255,255,0.1)"}}>
                {favorites.includes(selected.id)?"♥ 已收藏":"♡ 收藏"}
              </button>
              <button onClick={()=>onChat(`帮我规划${selected.name}的旅行行程`)}
                style={{padding:"10px 20px",borderRadius:"9999px",fontSize:"13px",fontWeight:"600",cursor:"pointer",
                  background:`linear-gradient(to right,${selected.color},${selected.color}bb)`,
                  color:"#0d0b1a",border:"none",boxShadow:`0 4px 20px ${selected.color}50`}}>
                ✈ 规划行程
              </button>
            </div>
          </div>
        )}

        {/* 目的地网格 */}
        <div style={{marginTop:"24px"}}>
          <p style={{fontSize:"13px",fontWeight:"600",color:"#b8b5cc",marginBottom:"12px"}}>
            {region === "全部" ? "所有目的地" : `${region}目的地`}（{filtered.length}个）
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:"8px"}}>
            {filtered.map(dest => (
              <button key={dest.id} onClick={()=>setSelected(selected?.id===dest.id?null:dest)}
                style={{padding:"10px 14px",borderRadius:"12px",textAlign:"left",cursor:"pointer",transition:"all 0.15s",
                  background:selected?.id===dest.id?`${dest.color}18`:"rgba(255,255,255,0.03)",
                  border:selected?.id===dest.id?`1px solid ${dest.color}40`:"1px solid rgba(255,255,255,0.07)",
                  display:"flex",alignItems:"center",gap:"8px"}}
                onMouseEnter={e=>{e.currentTarget.style.background=`${dest.color}10`;}}
                onMouseLeave={e=>{e.currentTarget.style.background=selected?.id===dest.id?`${dest.color}18`:"rgba(255,255,255,0.03)";}}>
                <div style={{width:"8px",height:"8px",borderRadius:"50%",background:dest.color,flexShrink:0,
                  boxShadow:`0 0 6px ${dest.color}`}}/>
                <div style={{overflow:"hidden"}}>
                  <div style={{fontSize:"13px",fontWeight:"600",color:"#f0eeff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {favorites.includes(dest.id)&&<span style={{color:"#ff6e84",marginRight:"3px",fontSize:"10px"}}>♥</span>}
                    {dest.name}
                  </div>
                  <div style={{fontSize:"10px",color:"#b8b5cc"}}>{dest.tag}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMapView;
