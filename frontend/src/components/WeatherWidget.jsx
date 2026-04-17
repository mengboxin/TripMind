import React, { useState, useEffect } from "react";

// 天气代码映射
const WMO = {
  0:  { label:"晴天",   icon:"☀️" },
  1:  { label:"晴间多云", icon:"🌤️" },
  2:  { label:"多云",   icon:"⛅" },
  3:  { label:"阴天",   icon:"☁️" },
  45: { label:"雾",     icon:"🌫️" },
  48: { label:"冻雾",   icon:"🌫️" },
  51: { label:"小毛毛雨", icon:"🌦️" },
  53: { label:"毛毛雨",  icon:"🌦️" },
  55: { label:"大毛毛雨", icon:"🌧️" },
  61: { label:"小雨",   icon:"🌧️" },
  63: { label:"中雨",   icon:"🌧️" },
  65: { label:"大雨",   icon:"🌧️" },
  71: { label:"小雪",   icon:"🌨️" },
  73: { label:"中雪",   icon:"❄️" },
  75: { label:"大雪",   icon:"❄️" },
  80: { label:"阵雨",   icon:"🌦️" },
  81: { label:"中阵雨",  icon:"🌧️" },
  82: { label:"强阵雨",  icon:"⛈️" },
  95: { label:"雷暴",   icon:"⛈️" },
  99: { label:"强雷暴",  icon:"⛈️" },
};

const getWeather = (code) => WMO[code] || { label:"未知", icon:"🌡️" };

const WeatherWidget = ({ cityName, lat, lon }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!lat || !lon) {
      setLoading(true);
      setError(false);
      return;
    }
    const cacheKey = `weather_${lat}_${lon}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached && retry === 0) {
      try { setWeather(JSON.parse(cached)); setLoading(false); return; } catch {}
    }
    setLoading(true);
    setError(false);
    const ctrl = new AbortController();
    const timeout = setTimeout(() => { ctrl.abort(); setError(true); setLoading(false); }, 25000);
    const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";
    fetch(`${API_BASE}/weather/?city=${encodeURIComponent(cityName)}&days=4`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(data => {
        clearTimeout(timeout);
        if (data.error) { setError(true); setLoading(false); return; }
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        setWeather(data);
        setLoading(false);
      })
      .catch((err) => { clearTimeout(timeout); if (err?.name !== 'AbortError') { setError(true); setLoading(false); } });
    return () => { clearTimeout(timeout); ctrl.abort(); };
  }, [lat, lon, cityName, retry]);

  if (loading) return (
    <div style={{padding:"14px 16px",borderRadius:"12px",background:"rgba(167,139,250,0.06)",
      border:"1px solid rgba(167,139,250,0.15)"}}>
      <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
        <div style={{fontSize:"28px",animation:"spin 2s linear infinite",display:"inline-block"}}>🌍</div>
        <div>
          <div style={{fontSize:"13px",color:"#b8b5cc"}}>正在获取 {cityName} 天气...</div>
          <div style={{fontSize:"11px",color:"rgba(172,170,177,0.5)",marginTop:"2px"}}>首次加载约需10秒，之后将缓存</div>
        </div>
      </div>
    </div>
  );

  if (error || !weather?.current) return (
    <div style={{padding:"14px 16px",borderRadius:"12px",background:"rgba(167,139,250,0.06)",
      border:"1px solid rgba(167,139,250,0.15)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <span style={{fontSize:"13px",color:"#b8b5cc"}}>天气数据暂时不可用</span>
      <button onClick={() => { sessionStorage.removeItem(`weather_${lat}_${lon}`); setRetry(r => r+1); }}
        style={{fontSize:"12px",color:"#a78bfa",background:"rgba(167,139,250,0.1)",
          border:"1px solid rgba(167,139,250,0.2)",borderRadius:"8px",padding:"4px 12px",cursor:"pointer"}}>
        重试
      </button>
    </div>
  );

  const cur = weather.current;
  const daily = weather.daily;
  const w = getWeather(cur.weathercode);

  return (
    <div style={{borderRadius:"14px",background:"linear-gradient(135deg,rgba(167,139,250,0.08),rgba(96,165,250,0.06))",
      border:"1px solid rgba(167,139,250,0.2)",overflow:"hidden"}}>
      {/* 当前天气 */}
      <div style={{padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <span style={{fontSize:"32px"}}>{w.icon}</span>
          <div>
            <div style={{fontSize:"22px",fontWeight:"700",color:"#f0eeff"}}>{Math.round(cur.temperature_2m)}°C</div>
            <div style={{fontSize:"12px",color:"#b8b5cc"}}>{w.label} · {cityName}</div>
          </div>
        </div>
        <div style={{textAlign:"right",fontSize:"12px",color:"#b8b5cc"}}>
          <div>💨 {Math.round(cur.windspeed_10m)} km/h</div>
          <div>💧 {cur.relative_humidity_2m}%</div>
        </div>
      </div>
      {/* 未来4天 */}
      {daily && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderTop:"1px solid rgba(167,139,250,0.1)"}}>
          {[0,1,2,3].map(i => {
            const date = new Date(daily.time[i]);
            const dayW = getWeather(daily.weathercode[i]);
            const days = ["今天","明天","后天",["日","一","二","三","四","五","六"][date.getDay()]+"曜"];
            return (
              <div key={i} style={{padding:"10px 8px",textAlign:"center",
                borderRight: i<3 ? "1px solid rgba(167,139,250,0.08)" : "none"}}>
                <div style={{fontSize:"11px",color:"#b8b5cc",marginBottom:"4px"}}>{days[i]}</div>
                <div style={{fontSize:"18px",marginBottom:"4px"}}>{dayW.icon}</div>
                <div style={{fontSize:"11px",color:"#f0eeff",fontWeight:"600"}}>
                  {Math.round(daily.temperature_2m_max[i])}°
                  <span style={{color:"#b8b5cc",fontWeight:"400"}}>/{Math.round(daily.temperature_2m_min[i])}°</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;
