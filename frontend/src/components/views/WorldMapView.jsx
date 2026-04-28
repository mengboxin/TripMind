import React, { useState, useEffect, useRef } from "react";

const TIANDITU_KEY = "52184641e399c73302c41d5940b891e4";

const DESTINATIONS = [
  { id:"beijing",  name:"北京",    country:"中国",       region:"亚洲", coords:[116.40,39.90],  color:"#c084fc", tag:"历史·文化" },
  { id:"shanghai", name:"上海",    country:"中国",       region:"亚洲", coords:[121.47,31.23],  color:"#e879f9", tag:"都市·商业" },
  { id:"bangkok",  name:"曼谷",    country:"泰国",       region:"亚洲", coords:[100.52,13.75],  color:"#4ade80", tag:"美食·寺庙" },
  { id:"bali",     name:"巴厘岛",  country:"印尼",       region:"亚洲", coords:[115.19,-8.41],  color:"#34d399", tag:"海岛·度假" },
  { id:"singapore",name:"新加坡",  country:"新加坡",     region:"亚洲", coords:[103.82,1.35],   color:"#2dd4bf", tag:"都市·美食" },
  { id:"seoul",    name:"首尔",    country:"韩国",       region:"亚洲", coords:[126.98,37.57],  color:"#60a5fa", tag:"时尚·美食" },
  { id:"dubai",    name:"迪拜",    country:"阿联酋",     region:"亚洲", coords:[55.27,25.20],   color:"#fbbf24", tag:"奢华·沙漠" },
  { id:"maldives", name:"马尔代夫",country:"马尔代夫",   region:"亚洲", coords:[73.22,1.97],    color:"#38bdf8", tag:"海岛·蜜月" },
  { id:"paris",    name:"巴黎",    country:"法国",       region:"欧洲", coords:[2.35,48.85],    color:"#f472b6", tag:"艺术·浪漫" },
  { id:"london",   name:"伦敦",    country:"英国",       region:"欧洲", coords:[-0.12,51.51],   color:"#818cf8", tag:"历史·文化" },
  { id:"rome",     name:"罗马",    country:"意大利",     region:"欧洲", coords:[12.50,41.90],   color:"#f87171", tag:"古迹·美食" },
  { id:"swiss",    name:"瑞士",    country:"瑞士",       region:"欧洲", coords:[8.23,46.82],    color:"#fb923c", tag:"自然·滑雪" },
  { id:"barcelona",name:"巴塞罗那",country:"西班牙",     region:"欧洲", coords:[2.17,41.39],    color:"#facc15", tag:"建筑·海滩" },
  { id:"amsterdam",name:"阿姆斯特丹",country:"荷兰",    region:"欧洲", coords:[4.90,52.37],    color:"#a3e635", tag:"运河·郁金香" },
  { id:"prague",   name:"布拉格",  country:"捷克",       region:"欧洲", coords:[14.42,50.08],   color:"#fb7185", tag:"童话·古城" },
  { id:"santorini",name:"圣托里尼",country:"希腊",       region:"欧洲", coords:[25.43,36.39],   color:"#67e8f9", tag:"蓝白·海景" },
  { id:"newyork",  name:"纽约",    country:"美国",       region:"美洲", coords:[-74.01,40.71],  color:"#f97316", tag:"都市·文化" },
  { id:"losangeles",name:"洛杉矶", country:"美国",       region:"美洲", coords:[-118.24,34.05], color:"#fb923c", tag:"娱乐·海滩" },
  { id:"cancun",   name:"坎昆",    country:"墨西哥",     region:"美洲", coords:[-86.85,21.16],  color:"#4ade80", tag:"海滩·玛雅" },
  { id:"rio",      name:"里约",    country:"巴西",       region:"美洲", coords:[-43.17,-22.91], color:"#fbbf24", tag:"狂欢·海滩" },
  { id:"sydney",   name:"悉尼",    country:"澳大利亚",   region:"大洋洲",coords:[151.21,-33.87], color:"#e879f9", tag:"海港·自然" },
  { id:"auckland", name:"奥克兰",  country:"新西兰",     region:"大洋洲",coords:[174.76,-36.85], color:"#34d399", tag:"自然·冒险" },
  { id:"cairo",    name:"开罗",    country:"埃及",       region:"非洲", coords:[31.24,30.04],   color:"#fcd34d", tag:"金字塔·历史" },
  { id:"capetown", name:"开普敦",  country:"南非",       region:"非洲", coords:[18.42,-33.93],  color:"#f87171", tag:"自然·葡萄酒" },
  { id:"marrakech",name:"马拉喀什",country:"摩洛哥",     region:"非洲", coords:[-7.99,31.63],   color:"#fb923c", tag:"集市·沙漠" },
  { id:"tokyo",    name:"东京",    country:"日本",       region:"亚洲", coords:[139.69,35.69],  color:"#a78bfa", tag:"文化·科技" },
];

const REGIONS = ["全部", "亚洲", "欧洲", "美洲", "非洲", "大洋洲"];

const WorldMapView = ({ favorites, onToggleFav, onChat }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [selected, setSelected] = useState(null);
  const [region, setRegion] = useState("全部");
  const [mapReady, setMapReady] = useState(false);
  const selectedRef = useRef(null);

  // 加载天地图 JS API
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
    const map = new T.Map(mapRef.current, {
      projection: "EPSG:4326",
    });
    map.centerAndZoom(new T.LngLat(20, 20), 2);
    map.enableScrollWheelZoom();

    // 天地图矢量底图
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

  // 添加/更新标记
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;
    const T = window.T;
    const map = mapInstanceRef.current;

    // 清除旧标记
    markersRef.current.forEach(m => map.removeOverLay(m));
    markersRef.current = [];

    const filtered = region === "全部" ? DESTINATIONS : DESTINATIONS.filter(d => d.region === region);

    filtered.forEach(dest => {
      const isFav = favorites.includes(dest.id);
      const isSel = selectedRef.current?.id === dest.id;

      // 自定义图标 SVG
      const size = isSel ? 28 : 20;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="${dest.color}30" stroke="${dest.color}" stroke-width="${isSel?2.5:1.5}"/>
        <circle cx="12" cy="12" r="${isSel?5:3.5}" fill="${dest.color}"/>
        ${isFav ? '<text x="18" y="8" font-size="8" fill="#ff6e84">♥</text>' : ''}
      </svg>`;
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const icon = new T.Icon({
        iconUrl: url,
        iconSize: new T.Point(size, size),
        iconAnchor: new T.Point(size/2, size/2),
      });

      const marker = new T.Marker(new T.LngLat(dest.coords[0], dest.coords[1]), { icon });
      marker.addEventListener("click", () => {
        selectedRef.current = dest;
        setSelected(dest);
      });
      map.addOverLay(marker);
      markersRef.current.push(marker);
    });
  }, [mapReady, region, favorites, selected]);

  const filtered = region === "全部" ? DESTINATIONS : DESTINATIONS.filter(d => d.region === region);

  return (
    <div style={{flex:1,overflowY:"auto",paddingTop:"80px",paddingBottom:"40px"}}>
      <div style={{maxWidth:"1100px",margin:"0 auto",padding:"24px 32px"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"16px",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <h2 className="headline-font" style={{fontSize:"24px",fontWeight:"700",marginBottom:"4px",
              background:"linear-gradient(to right,#a78bfa,#38bdf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              全球目的地地图
            </h2>
            <p style={{fontSize:"12px",color:"#6b7280"}}>
              地图来源：国家地理信息公共服务平台天地图 · 审图号：GS(2024)0650号
            </p>
          </div>
          <p style={{fontSize:"13px",color:"#b8b5cc"}}>共 {DESTINATIONS.length} 个目的地 · 滚轮缩放 · 拖拽平移</p>
        </div>

        {/* 区域筛选 */}
        <div style={{display:"flex",gap:"8px",marginBottom:"14px",flexWrap:"wrap"}}>
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

        {/* 天地图容器 */}
        <div style={{borderRadius:"16px",overflow:"hidden",border:"1px solid rgba(139,92,246,0.25)",
          boxShadow:"0 0 40px rgba(139,92,246,0.1)",position:"relative",
          height:"min(480px, 45dvh)",
          touchAction:"none"}}>
          <div ref={mapRef} style={{width:"100%",height:"100%",touchAction:"none"}} />
          {!mapReady && (
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
              background:"#0d0b1a",color:"#b8b5cc",fontSize:"14px"}}>
              地图加载中...
            </div>
          )}
        </div>

        {/* 选中详情 */}
        {selected && (
          <div style={{marginTop:"14px",padding:"18px 22px",borderRadius:"14px",
            background:`linear-gradient(135deg,${selected.color}12,rgba(8,6,20,0.95))`,
            border:`1px solid ${selected.color}30`,
            display:"flex",alignItems:"center",justifyContent:"space-between",gap:"16px",flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
              <div style={{width:"44px",height:"44px",borderRadius:"12px",
                background:`${selected.color}20`,border:`1px solid ${selected.color}40`,
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <div style={{width:"12px",height:"12px",borderRadius:"50%",background:selected.color,
                  boxShadow:`0 0 10px ${selected.color}`}}/>
              </div>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"3px"}}>
                  <h3 className="headline-font" style={{fontSize:"18px",fontWeight:"700",color:"#f0eeff"}}>{selected.name}</h3>
                  <span style={{fontSize:"11px",color:"#b8b5cc",background:"rgba(255,255,255,0.06)",padding:"2px 8px",borderRadius:"9999px"}}>{selected.country}</span>
                  <span style={{fontSize:"10px",color:selected.color,background:`${selected.color}15`,padding:"2px 8px",borderRadius:"9999px",border:`1px solid ${selected.color}25`}}>{selected.tag}</span>
                </div>
                <p style={{fontSize:"12px",color:"#b8b5cc"}}>{selected.region} · {selected.coords[0].toFixed(2)}°E {Math.abs(selected.coords[1]).toFixed(2)}°{selected.coords[1]>=0?"N":"S"}</p>
              </div>
            </div>
            <div style={{display:"flex",gap:"10px",flexShrink:0}}>
              <button onClick={()=>onToggleFav(selected.id)}
                style={{padding:"9px 18px",borderRadius:"9999px",fontSize:"13px",fontWeight:"600",cursor:"pointer",
                  background:favorites.includes(selected.id)?"rgba(255,110,132,0.15)":"rgba(255,255,255,0.06)",
                  color:favorites.includes(selected.id)?"#ff6e84":"#b8b5cc",
                  border:favorites.includes(selected.id)?"1px solid rgba(255,110,132,0.3)":"1px solid rgba(255,255,255,0.1)"}}>
                {favorites.includes(selected.id)?"♥ 已收藏":"♡ 收藏"}
              </button>
              <button onClick={()=>onChat(`帮我规划${selected.name}的旅行行程`)}
                style={{padding:"9px 18px",borderRadius:"9999px",fontSize:"13px",fontWeight:"600",cursor:"pointer",
                  background:`linear-gradient(to right,${selected.color},${selected.color}bb)`,
                  color:"#0d0b1a",border:"none"}}>
                ✈ 规划行程
              </button>
            </div>
          </div>
        )}

        {/* 目的地网格 */}
        <div style={{marginTop:"20px"}}>
          <p style={{fontSize:"13px",fontWeight:"600",color:"#b8b5cc",marginBottom:"10px"}}>
            {region === "全部" ? "所有目的地" : `${region}目的地`}（{filtered.length}个）
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:"8px"}}>
            {filtered.map(dest => (
              <button key={dest.id} onClick={()=>{selectedRef.current=dest;setSelected(dest);}}
                style={{padding:"9px 12px",borderRadius:"10px",textAlign:"left",cursor:"pointer",transition:"all 0.15s",
                  background:selected?.id===dest.id?`${dest.color}18`:"rgba(255,255,255,0.03)",
                  border:selected?.id===dest.id?`1px solid ${dest.color}40`:"1px solid rgba(255,255,255,0.07)",
                  display:"flex",alignItems:"center",gap:"8px"}}>
                <div style={{width:"8px",height:"8px",borderRadius:"50%",background:dest.color,flexShrink:0,boxShadow:`0 0 5px ${dest.color}`}}/>
                <div style={{overflow:"hidden"}}>
                  <div style={{fontSize:"12px",fontWeight:"600",color:"#f0eeff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                    {favorites.includes(dest.id)&&<span style={{color:"#ff6e84",marginRight:"3px",fontSize:"9px"}}>♥</span>}
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
