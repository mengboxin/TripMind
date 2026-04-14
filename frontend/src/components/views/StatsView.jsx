import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

const StatCard = ({ icon, label, value, sub, color }) => (
  <div style={{padding:"20px",borderRadius:"16px",
    background:`linear-gradient(135deg,${color}12,rgba(8,6,20,0.8))`,
    border:`1px solid ${color}25`}}>
    <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
      <div style={{width:"38px",height:"38px",borderRadius:"10px",background:`${color}18`,
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px"}}>{icon}</div>
      <span style={{fontSize:"12px",color:"#b8b5cc",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</span>
    </div>
    <div style={{fontSize:"28px",fontWeight:"800",color:"#f0eeff",marginBottom:"4px"}}>{value}</div>
    {sub && <div style={{fontSize:"12px",color:"#b8b5cc"}}>{sub}</div>}
  </div>
);

const CATS = ["机票","酒店","租车","餐饮","景点","其他"];
const CAT_COLORS = ["#a78bfa","#60a5fa","#34d399","#fb923c","#f472b6","#94a3b8"];
const CAT_ICONS  = ["✈️","🏨","🚗","🍜","🎡","💳"];

const StatsView = ({ token, preloaded }) => {
  const [bookings, setBookings] = useState({ flights:[], hotels:[], cars:[] });
  const [budget, setBudget] = useState(null);
  const [spent, setSpent] = useState(0);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 8000);
    Promise.all([
      fetch(`${API}/user/bookings/`, { headers, signal: ctrl.signal }).then(r => r.json()).catch(() => ({ flights:[], hotels:[], cars:[] })),
      fetch(`${API}/budget/`, { headers, signal: ctrl.signal }).then(r => r.json()).catch(() => ({ budget:null, spent:0, records:[] })),
    ]).then(([b, budgetData]) => {
      clearTimeout(timeout);
      setBookings(b || { flights:[], hotels:[], cars:[] });
      setBudget(budgetData.budget || null);
      setSpent(budgetData.spent || 0);
      setRecords(budgetData.records || []);
      setLoading(false);
    }).catch(() => setLoading(false));
    return () => { clearTimeout(timeout); ctrl.abort(); };
  }, []);

  if (loading) return (
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",paddingTop:"80px"}}>
      <p style={{color:"#b8b5cc"}}>加载中...</p>
    </div>
  );

  const flights = bookings.flights || [];
  const hotels  = bookings.hotels  || [];
  const cars    = bookings.cars    || [];
  const totalKm = flights.length * 1500;

  const catTotals = CATS.map(c => records.filter(r => r.category === c).reduce((s,r) => s + Number(r.amount), 0));
  const totalSpent = catTotals.reduce((a,b) => a+b, 0);
  const maxCat = Math.max(...catTotals, 1);

  return (
    <div style={{flex:1,overflowY:"auto",paddingTop:"80px",paddingBottom:"40px"}}>
      <div style={{maxWidth:"900px",margin:"0 auto",padding:"24px 32px"}}>
        <div style={{marginBottom:"28px"}}>
          <h2 className="headline-font" style={{fontSize:"24px",fontWeight:"700",marginBottom:"6px",
            background:"linear-gradient(to right,#60a5fa,#a78bfa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            旅行统计
          </h2>
          <p style={{fontSize:"13px",color:"#b8b5cc"}}>你的旅行数据一览</p>
        </div>

        {/* 核心统计 */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"14px",marginBottom:"28px"}}>
          <StatCard icon="✈️" label="机票订单" value={flights.length} sub={`约 ${totalKm.toLocaleString()} km`} color="#a78bfa"/>
          <StatCard icon="🏨" label="酒店预订" value={hotels.length} sub="已预订" color="#60a5fa"/>
          <StatCard icon="🚗" label="租车订单" value={cars.length} sub="已预订" color="#34d399"/>
          <StatCard icon="💰" label="总消费" value={`¥${totalSpent.toLocaleString()}`}
            sub={budget ? `预算 ¥${budget.total.toLocaleString()}` : "未设定预算"} color="#fb923c"/>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px",marginBottom:"28px"}}>
          {/* 消费分类条形图 */}
          <div style={{padding:"20px",borderRadius:"16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
            <p style={{fontSize:"13px",fontWeight:"600",color:"#b8b5cc",marginBottom:"16px"}}>消费分类</p>
            {totalSpent === 0 ? (
              <p style={{fontSize:"13px",color:"#b8b5cc",textAlign:"center",padding:"20px 0"}}>暂无消费记录</p>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                {CATS.map((cat, i) => catTotals[i] > 0 && (
                  <div key={cat}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                      <span style={{fontSize:"12px",color:"#b8b5cc"}}>{CAT_ICONS[i]} {cat}</span>
                      <span style={{fontSize:"12px",fontWeight:"600",color:CAT_COLORS[i]}}>¥{catTotals[i].toLocaleString()}</span>
                    </div>
                    <div style={{height:"6px",borderRadius:"9999px",background:"rgba(255,255,255,0.06)",overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:"9999px",
                        width:`${(catTotals[i]/maxCat)*100}%`,
                        background:`linear-gradient(to right,${CAT_COLORS[i]},${CAT_COLORS[i]}88)`,
                        transition:"width 0.5s ease"}}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 预算使用情况 */}
          <div style={{padding:"20px",borderRadius:"16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
            <p style={{fontSize:"13px",fontWeight:"600",color:"#b8b5cc",marginBottom:"16px"}}>预算使用</p>
            {!budget ? (
              <p style={{fontSize:"13px",color:"#b8b5cc",textAlign:"center",padding:"20px 0"}}>未设定预算</p>
            ) : (
              <>
                <div style={{position:"relative",width:"140px",height:"140px",margin:"0 auto 16px"}}>
                  <svg viewBox="0 0 100 100" style={{width:"100%",height:"100%",transform:"rotate(-90deg)"}}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12"/>
                    <circle cx="50" cy="50" r="40" fill="none"
                      stroke={spent/budget.total > 0.9 ? "#ff6e84" : "#a78bfa"}
                      strokeWidth="12" strokeLinecap="round"
                      strokeDasharray={`${Math.min(251.2, (spent/budget.total)*251.2)} 251.2`}
                      style={{transition:"stroke-dasharray 0.8s ease"}}/>
                  </svg>
                  <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                    <div style={{fontSize:"20px",fontWeight:"800",color:"#f0eeff"}}>{Math.round((spent/budget.total)*100)}%</div>
                    <div style={{fontSize:"10px",color:"#b8b5cc"}}>已使用</div>
                  </div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px"}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{color:"#ff6e84",fontWeight:"700"}}>¥{spent.toLocaleString()}</div>
                    <div style={{color:"#b8b5cc"}}>已花费</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{color:"#34d399",fontWeight:"700"}}>¥{(budget.total-spent).toLocaleString()}</div>
                    <div style={{color:"#b8b5cc"}}>剩余</div>
                  </div>
                  <div style={{textAlign:"center"}}>
                    <div style={{color:"#a78bfa",fontWeight:"700"}}>¥{budget.total.toLocaleString()}</div>
                    <div style={{color:"#b8b5cc"}}>总预算</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 最近机票 */}
        {flights.length > 0 && (
          <div style={{padding:"20px",borderRadius:"16px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
            <p style={{fontSize:"13px",fontWeight:"600",color:"#b8b5cc",marginBottom:"14px"}}>最近机票订单</p>
            <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
              {flights.slice(0,5).map((f,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:"14px",padding:"12px 14px",
                  borderRadius:"12px",background:"rgba(167,139,250,0.06)",border:"1px solid rgba(167,139,250,0.12)"}}>
                  <span style={{fontSize:"20px"}}>✈️</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"14px",fontWeight:"700",color:"#f0eeff"}}>
                      {f.departure_airport} → {f.arrival_airport}
                    </div>
                    <div style={{fontSize:"11px",color:"#b8b5cc"}}>
                      {f.flight_no} · {f.fare_conditions} · {f.scheduled_departure ? new Date(f.scheduled_departure).toLocaleDateString("zh-CN") : ""}
                    </div>
                  </div>
                  <div style={{fontSize:"11px",color:"#a78bfa",background:"rgba(167,139,250,0.1)",
                    padding:"3px 10px",borderRadius:"9999px"}}>{f.ticket_no?.slice(-6)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {flights.length === 0 && hotels.length === 0 && cars.length === 0 && totalSpent === 0 && (
          <div style={{textAlign:"center",padding:"60px 20px",borderRadius:"20px",
            background:"rgba(96,165,250,0.04)",border:"1px dashed rgba(96,165,250,0.15)"}}>
            <div style={{fontSize:"48px",marginBottom:"16px"}}>📊</div>
            <h3 style={{fontSize:"16px",fontWeight:"600",color:"#f0eeff",marginBottom:"8px"}}>暂无旅行数据</h3>
            <p style={{fontSize:"13px",color:"#b8b5cc"}}>开始规划你的第一次旅行，数据将在这里展示</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsView;
