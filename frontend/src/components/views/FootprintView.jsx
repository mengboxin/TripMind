import React, { useState, useEffect, useRef } from "react";

const TIANDITU_KEY = "52184641e399c73302c41d5940b891e4";

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

const FootprintView = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapReady, setMapReady] = useState(false);
  const [visited, setVisited] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tm_visited") || "[]"); } catch { return []; }
  });
  const [selected, setSelected] = useState(null);

  // 加载天地图
  useEffect(() => {
    if (window.T) { setMapReady(true); return; }
    const script = document.createElement("script");
    script.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${TIANDITU_KEY}`;
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);
  }, []);

  // 初始化地图
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstanceRef.current) return;
    const T = window.T;
    const map = new T.Map(mapRef.current);
    map.centerAndZoom(new T.LngLat(20, 20), 2);
    map.enableScrollWheelZoom();
    const tileLayer = new T.TileLayer(
      `https://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_KEY}`,
      { minZoom: 1, maxZoom: 18, subdomains: "01234567" }
    );
    const labelLayer = new T.TileLayer(
      `https://t{s}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=${TIANDITU_KEY}`,
      { minZoom: 1, maxZoom: 18, subdomains: "01234567" }
    );
    map.addLayer(tileLayer);
    map.addLayer(labelLayer);
    mapInstanceRef.current = map;
  }, [mapReady]);

  // 更新标记
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const T = window.T;
    const map = mapInstanceRef.current;
    markersRef.current.forEach(m => map.removeOverLay(m));
    markersRef.current = [];

    ALL_DESTINATIONS.forEach(dest => {
      const isVisited = visited.includes(dest.id);
      const isSel = selected?.id === dest.id;
      const size = isSel ? 28 : isVisited ? 22 : 14;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="${isVisited ? dest.color+'30' : '#2a205080'}" stroke="${isVisited ? dest.color : '#4a3880'}" stroke-width="${isSel?2.5:1.5}"/>
        <circle cx="12" cy="12" r="${isSel?5:isVisited?4:2.5}" fill="${isVisited ? dest.color : '#4a3880'}"/>
        ${isVisited ? `<text x="12" y="8" text-anchor="middle" font-size="7" fill="${dest.color}">✓</text>` : ''}
      </svg>`;
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const icon = new T.Icon({ iconUrl: url, iconSize: new T.Point(size, size), iconAnchor: new T.Point(size/2, size/2) });
      const marker = new T.Marker(new T.LngLat(dest.coords[0], dest.coords[1]), { icon });
      marker.addEventListener("click", () => setSelected(s => s?.id === dest.id ? null : dest));
      map.addOverLay(marker);
      markersRef.current.push(marker);
    });
  }, [mapReady, visited, selected]);

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
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"16px",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <h2 className="headline-font" style={{fontSize:"24px",fontWeight:"700",marginBottom:"4px",
              background:"linear-gradient(to right,#f472b6,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              旅行足迹
            </h2>
            <p style={{fontSize:"12px",color:"#6b7280"}}>
              地图来源：国家地理信息公共服务平台天地图 · 审图号：GS(2024)0650号
            </p>
          </div>
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

        {/* 天地图 */}
        <div style={{borderRadius:"16px",overflow:"hidden",border:"1px solid rgba(244,114,182,0.2)",
          boxShadow:"0 0 40px rgba(244,114,182,0.08)",marginBottom:"20px",
          height:"min(420px, 40dvh)",
          position:"relative",
          touchAction:"none"}}>
          <div ref={mapRef} style={{width:"100%",height:"100%",touchAction:"none"}} />
          {!mapReady && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
              background:"#0d0b1a",color:"#b8b5cc",fontSize:"14px"}}>地图加载中...</div>
          )}
        </div>

        {/* 选中操作 */}
        {selected && (
          <div style={{marginBottom:"18px",padding:"14px 18px",borderRadius:"12px",
            background:`linear-gradient(135deg,${selected.color}12,rgba(8,6,20,0.9))`,
            border:`1px solid ${selected.color}30`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:"12px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              <div style={{width:"10px",height:"10px",borderRadius:"50%",background:selected.color,boxShadow:`0 0 8px ${selected.color}`}}/>
              <span style={{fontSize:"15px",fontWeight:"700",color:"#f0eeff"}}>{selected.name}</span>
              <span style={{fontSize:"12px",color:"#b8b5cc"}}>{selected.country} · {selected.region}</span>
            </div>
            <button onClick={() => toggleVisited(selected.id)}
              style={{padding:"8px 18px",borderRadius:"9999px",fontSize:"13px",fontWeight:"600",cursor:"pointer",
                background: visited.includes(selected.id) ? "rgba(255,110,132,0.15)" : `${selected.color}20`,
                color: visited.includes(selected.id) ? "#ff6e84" : selected.color,
                border: visited.includes(selected.id) ? "1px solid rgba(255,110,132,0.3)" : `1px solid ${selected.color}40`}}>
              {visited.includes(selected.id) ? "✓ 已打卡 · 取消" : "📍 标记已去过"}
            </button>
          </div>
        )}

        {/* 目的地网格 */}
        <div>
          <p style={{fontSize:"13px",fontWeight:"600",color:"#b8b5cc",marginBottom:"10px"}}>点击标记去过的地方</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:"8px"}}>
            {ALL_DESTINATIONS.map(dest => {
              const isVisited = visited.includes(dest.id);
              return (
                <button key={dest.id} onClick={() => { toggleVisited(dest.id); setSelected(dest); }}
                  style={{padding:"9px 12px",borderRadius:"10px",textAlign:"left",cursor:"pointer",transition:"all 0.15s",
                    background: isVisited ? `${dest.color}18` : "rgba(255,255,255,0.03)",
                    border: isVisited ? `1px solid ${dest.color}40` : "1px solid rgba(255,255,255,0.07)",
                    display:"flex",alignItems:"center",gap:"8px"}}>
                  <div style={{width:"8px",height:"8px",borderRadius:"50%",flexShrink:0,
                    background: isVisited ? dest.color : "#2a2050",
                    boxShadow: isVisited ? `0 0 5px ${dest.color}` : "none"}}/>
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

        {visitedDests.length > 0 && (
          <div style={{marginTop:"24px"}}>
            <p style={{fontSize:"13px",fontWeight:"600",color:"#b8b5cc",marginBottom:"10px"}}>我的足迹</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
              {visitedDests.map(dest => (
                <div key={dest.id} style={{display:"flex",alignItems:"center",gap:"6px",
                  padding:"5px 12px",borderRadius:"9999px",
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
