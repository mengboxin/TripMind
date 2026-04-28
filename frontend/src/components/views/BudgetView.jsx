import React, { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

const CATEGORIES = [
  { key:"机票", icon:"✈️", color:"#a78bfa" },
  { key:"酒店", icon:"🏨", color:"#60a5fa" },
  { key:"租车", icon:"🚗", color:"#34d399" },
  { key:"餐饮", icon:"🍜", color:"#fb923c" },
  { key:"景点", icon:"🎡", color:"#f472b6" },
  { key:"其他", icon:"💳", color:"#94a3b8" },
];

const catColor = (cat) => CATEGORIES.find(c => c.key === cat)?.color || "#94a3b8";
const catIcon  = (cat) => CATEGORIES.find(c => c.key === cat)?.icon || "💳";

const BudgetView = ({ token, preloaded, onRefresh }) => {
  const [budget, setBudget] = useState(null);
  const [records, setRecords] = useState([]);
  const [spent, setSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  // 新建预算表单
  const [showSetup, setShowSetup] = useState(false);
  const [tripName, setTripName] = useState("");
  const [total, setTotal] = useState("");

  // 新增记录表单
  const [showAdd, setShowAdd] = useState(false);
  const [addCat, setAddCat] = useState("餐饮");
  const [addDesc, setAddDesc] = useState("");
  const [addAmt, setAddAmt] = useState("");

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/budget/`, { headers });
      const data = await res.json();
      setBudget(data.budget);
      setRecords(data.records || []);
      setSpent(data.spent || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSetup = async (e) => {
    e.preventDefault();
    await fetch(`${API}/budget/`, { method:"POST", headers, body: JSON.stringify({ trip_name:tripName, total:parseFloat(total) }) });
    setShowSetup(false);
    load();
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!budget) return;
    await fetch(`${API}/budget/record/`, { method:"POST", headers,
      body: JSON.stringify({ budget_id:budget.id, category:addCat, description:addDesc, amount:parseFloat(addAmt) }) });
    setAddDesc(""); setAddAmt(""); setShowAdd(false);
    load();
  };

  const handleDelete = async (id) => {
    await fetch(`${API}/budget/record/${id}/`, { method:"DELETE", headers });
    load();
  };

  const remaining = budget ? budget.total - spent : 0;
  const pct = budget ? Math.min(100, (spent / budget.total) * 100) : 0;
  const barColor = pct > 90 ? "#ff6e84" : pct > 70 ? "#fb923c" : "#a78bfa";

  // 按分类汇总
  const catSummary = CATEGORIES.map(c => ({
    ...c, total: records.filter(r => r.category === c.key).reduce((s, r) => s + r.amount, 0)
  })).filter(c => c.total > 0);

  if (loading) return (
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",paddingTop:"80px"}}>
      <p style={{color:"#b8b5cc"}}>加载中...</p>
    </div>
  );

  return (
    <div style={{flex:1,overflowY:"auto",paddingTop:"80px",paddingBottom:"40px"}}>
      <div style={{maxWidth:"800px",margin:"0 auto",padding:"24px 32px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
          <div>
            <h2 className="headline-font" style={{fontSize:"24px",fontWeight:"700",marginBottom:"6px",
              background:"linear-gradient(to right,#a78bfa,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
              预算追踪
            </h2>
            <p style={{fontSize:"13px",color:"#b8b5cc"}}>{budget ? budget.trip_name : "设定旅行预算，追踪每笔花销"}</p>
          </div>
          <div style={{display:"flex",gap:"10px"}}>
            <button onClick={() => setShowSetup(true)}
              style={{padding:"8px 16px",borderRadius:"9999px",fontSize:"13px",fontWeight:"600",cursor:"pointer",
                background:"rgba(167,139,250,0.12)",color:"#a78bfa",border:"1px solid rgba(167,139,250,0.25)"}}>
              {budget ? "修改预算" : "设定预算"}
            </button>
            {budget && (
              <button onClick={() => setShowAdd(true)}
                style={{padding:"8px 16px",borderRadius:"9999px",fontSize:"13px",fontWeight:"600",cursor:"pointer",
                  background:"linear-gradient(to right,#a78bfa,#7e51ff)",color:"#0d0b1a",border:"none"}}>
                + 记录消费
              </button>
            )}
          </div>
        </div>

        {!budget ? (
          <div style={{textAlign:"center",padding:"60px 20px",borderRadius:"20px",
            background:"rgba(167,139,250,0.05)",border:"1px dashed rgba(167,139,250,0.2)"}}>
            <div style={{fontSize:"48px",marginBottom:"16px"}}>💰</div>
            <h3 style={{fontSize:"16px",fontWeight:"600",color:"#f0eeff",marginBottom:"8px"}}>还没有设定预算</h3>
            <p style={{fontSize:"13px",color:"#b8b5cc",marginBottom:"20px"}}>设定旅行总预算，追踪每笔花销，掌控旅行开支</p>
            <button onClick={() => setShowSetup(true)}
              style={{padding:"12px 28px",borderRadius:"9999px",fontSize:"14px",fontWeight:"700",cursor:"pointer",
                background:"linear-gradient(to right,#a78bfa,#7e51ff)",color:"#0d0b1a",border:"none"}}>
              立即设定预算
            </button>
          </div>
        ) : (
          <>
            {/* 预算概览 */}
            <div style={{padding:"20px 24px",borderRadius:"16px",marginBottom:"20px",
              background:"linear-gradient(135deg,rgba(167,139,250,0.1),rgba(52,211,153,0.06))",
              border:"1px solid rgba(167,139,250,0.2)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"14px",flexWrap:"wrap",gap:"8px"}}>
                <div>
                  <p style={{fontSize:"12px",color:"#b8b5cc",marginBottom:"4px"}}>总预算</p>
                  <p style={{fontSize:"28px",fontWeight:"700",color:"#f0eeff"}}>
                    ¥{budget.total.toLocaleString()}
                  </p>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:"12px",color:"#b8b5cc",marginBottom:"4px"}}>剩余</p>
                  <p style={{fontSize:"28px",fontWeight:"700",color: remaining < 0 ? "#ff6e84" : "#34d399"}}>
                    ¥{remaining.toLocaleString()}
                  </p>
                </div>
              </div>
              {/* 进度条 */}
              <div style={{height:"8px",borderRadius:"9999px",background:"rgba(255,255,255,0.08)",overflow:"hidden",marginBottom:"8px"}}>
                <div style={{height:"100%",borderRadius:"9999px",width:`${pct}%`,
                  background:`linear-gradient(to right,${barColor},${barColor}aa)`,
                  transition:"width 0.5s ease",boxShadow:`0 0 8px ${barColor}60`}} />
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:"12px",color:"#b8b5cc"}}>
                <span>已花费 ¥{spent.toLocaleString()} ({pct.toFixed(1)}%)</span>
                <span>{records.length} 笔记录</span>
              </div>
            </div>

            {/* 分类汇总 */}
            {catSummary.length > 0 && (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:"10px",marginBottom:"20px"}}>
                {catSummary.map(c => (
                  <div key={c.key} style={{padding:"12px",borderRadius:"12px",textAlign:"center",
                    background:`${c.color}10`,border:`1px solid ${c.color}25`}}>
                    <div style={{fontSize:"20px",marginBottom:"4px"}}>{c.icon}</div>
                    <div style={{fontSize:"11px",color:"#b8b5cc",marginBottom:"2px"}}>{c.key}</div>
                    <div style={{fontSize:"14px",fontWeight:"700",color:c.color}}>¥{c.total.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 消费记录 */}
            <div>
              <p style={{fontSize:"13px",fontWeight:"600",color:"#b8b5cc",marginBottom:"12px"}}>消费明细</p>
              {records.length === 0 ? (
                <p style={{fontSize:"13px",color:"#b8b5cc",textAlign:"center",padding:"24px"}}>暂无消费记录</p>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                  {records.map(r => (
                    <div key={r.id} style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",
                      borderRadius:"12px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
                      <div style={{width:"36px",height:"36px",borderRadius:"10px",flexShrink:0,
                        background:`${catColor(r.category)}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>
                        {catIcon(r.category)}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:"13px",fontWeight:"600",color:"#f0eeff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.description}</p>
                        <p style={{fontSize:"11px",color:"#b8b5cc"}}>{r.category} · {r.record_date?.slice(0,10)}</p>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <p style={{fontSize:"14px",fontWeight:"700",color:catColor(r.category)}}>-¥{r.amount.toLocaleString()}</p>
                      </div>
                      <button onClick={() => handleDelete(r.id)}
                        style={{width:"28px",height:"28px",borderRadius:"8px",background:"rgba(255,110,132,0.1)",
                          border:"none",cursor:"pointer",color:"#ff6e84",fontSize:"14px",flexShrink:0}}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* 设定预算弹窗 */}
        {showSetup && (
          <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",
            display:"flex",alignItems:"center",justifyContent:"center"}} onClick={() => setShowSetup(false)}>
            <div style={{width:"360px",padding:"28px",borderRadius:"20px",background:"#16161e",
              border:"1px solid rgba(167,139,250,0.2)"}} onClick={e => e.stopPropagation()}>
              <h3 className="headline-font" style={{fontSize:"18px",fontWeight:"700",color:"#f0eeff",marginBottom:"20px"}}>设定旅行预算</h3>
              <form onSubmit={handleSetup} style={{display:"flex",flexDirection:"column",gap:"14px"}}>
                <div>
                  <label style={{fontSize:"12px",color:"#b8b5cc",display:"block",marginBottom:"6px"}}>旅行名称</label>
                  <input value={tripName} onChange={e=>setTripName(e.target.value)} placeholder="如：北京7日游"
                    style={{width:"100%",padding:"10px 14px",borderRadius:"10px",background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(255,255,255,0.1)",color:"#f0eeff",fontSize:"14px",outline:"none",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <label style={{fontSize:"12px",color:"#b8b5cc",display:"block",marginBottom:"6px"}}>总预算（元）</label>
                  <input value={total} onChange={e=>setTotal(e.target.value)} placeholder="如：15000" type="number" required
                    style={{width:"100%",padding:"10px 14px",borderRadius:"10px",background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(255,255,255,0.1)",color:"#f0eeff",fontSize:"14px",outline:"none",boxSizing:"border-box"}}/>
                </div>
                <div style={{display:"flex",gap:"10px",marginTop:"4px"}}>
                  <button type="button" onClick={() => setShowSetup(false)}
                    style={{flex:1,padding:"11px",borderRadius:"10px",background:"rgba(255,255,255,0.05)",
                      color:"#b8b5cc",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"14px"}}>取消</button>
                  <button type="submit"
                    style={{flex:1,padding:"11px",borderRadius:"10px",background:"linear-gradient(to right,#a78bfa,#7e51ff)",
                      color:"#0d0b1a",border:"none",cursor:"pointer",fontSize:"14px",fontWeight:"700"}}>确认</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 添加记录弹窗 */}
        {showAdd && (
          <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",
            display:"flex",alignItems:"center",justifyContent:"center"}} onClick={() => setShowAdd(false)}>
            <div style={{width:"380px",padding:"28px",borderRadius:"20px",background:"#16161e",
              border:"1px solid rgba(167,139,250,0.2)"}} onClick={e => e.stopPropagation()}>
              <h3 className="headline-font" style={{fontSize:"18px",fontWeight:"700",color:"#f0eeff",marginBottom:"20px"}}>记录消费</h3>
              <form onSubmit={handleAddRecord} style={{display:"flex",flexDirection:"column",gap:"14px"}}>
                <div>
                  <label style={{fontSize:"12px",color:"#b8b5cc",display:"block",marginBottom:"8px"}}>消费类别</label>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
                    {CATEGORIES.map(c => (
                      <button key={c.key} type="button" onClick={() => setAddCat(c.key)}
                        style={{padding:"6px 14px",borderRadius:"9999px",fontSize:"12px",fontWeight:"600",cursor:"pointer",
                          background: addCat===c.key ? `${c.color}20` : "rgba(255,255,255,0.04)",
                          color: addCat===c.key ? c.color : "#b8b5cc",
                          border: addCat===c.key ? `1px solid ${c.color}40` : "1px solid rgba(255,255,255,0.08)"}}>
                        {c.icon} {c.key}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{fontSize:"12px",color:"#b8b5cc",display:"block",marginBottom:"6px"}}>消费说明</label>
                  <input value={addDesc} onChange={e=>setAddDesc(e.target.value)} placeholder="如：北京首都机场往返" required
                    style={{width:"100%",padding:"10px 14px",borderRadius:"10px",background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(255,255,255,0.1)",color:"#f0eeff",fontSize:"14px",outline:"none",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <label style={{fontSize:"12px",color:"#b8b5cc",display:"block",marginBottom:"6px"}}>金额（元）</label>
                  <input value={addAmt} onChange={e=>setAddAmt(e.target.value)} placeholder="如：3200" type="number" step="0.01" required
                    style={{width:"100%",padding:"10px 14px",borderRadius:"10px",background:"rgba(255,255,255,0.05)",
                      border:"1px solid rgba(255,255,255,0.1)",color:"#f0eeff",fontSize:"14px",outline:"none",boxSizing:"border-box"}}/>
                </div>
                <div style={{display:"flex",gap:"10px",marginTop:"4px"}}>
                  <button type="button" onClick={() => setShowAdd(false)}
                    style={{flex:1,padding:"11px",borderRadius:"10px",background:"rgba(255,255,255,0.05)",
                      color:"#b8b5cc",border:"1px solid rgba(255,255,255,0.1)",cursor:"pointer",fontSize:"14px"}}>取消</button>
                  <button type="submit"
                    style={{flex:1,padding:"11px",borderRadius:"10px",background:"linear-gradient(to right,#a78bfa,#7e51ff)",
                      color:"#0d0b1a",border:"none",cursor:"pointer",fontSize:"14px",fontWeight:"700"}}>记录</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetView;
