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

const TEMPLATES = [
  { id:"culture", icon:"🏛️", label:"文化探索", desc:"深度体验当地历史与艺术" },
  { id:"food",    icon:"🍜", label:"美食之旅", desc:"探索地道风味与特色餐厅" },
  { id:"nature",  icon:"🏔️", label:"自然风光", desc:"徒步、露营与自然奇观" },
  { id:"relax",   icon:"🏖️", label:"休闲度假", desc:"海滩、温泉与慢节奏生活" },
  { id:"city",    icon:"🌆", label:"城市漫游", desc:"街头艺术、夜生活与购物" },
  { id:"family",  icon:"👨‍👩‍👧", label:"亲子出行", desc:"适合全家的安全有趣路线" },
];

const DAYS_OPTIONS = [3, 5, 7, 10, 14];

const ItineraryView = ({ onChat }) => {
  const [dest, setDest] = useState("");
  const [days, setDays] = useState(5);
  const [style, setStyle] = useState("");
  const [budget, setBudget] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    if (!dest.trim()) return;
    const styleText = style ? `，风格偏向${TEMPLATES.find(t=>t.id===style)?.label}` : "";
    const budgetText = budget ? `，预算约${budget}元` : "";
    const prompt = `请帮我规划一份${dest}${days}天的详细旅行行程${styleText}${budgetText}。请包含每天的景点安排、推荐餐厅、交通方式和住宿建议。`;
    setGenerating(true);
    setTimeout(() => { setGenerating(false); onChat(prompt); }, 300);
  };

  return (
    <div style={{flex:1,overflowY:"auto",paddingTop:"80px",paddingBottom:"40px"}}>
      <div style={{maxWidth:"720px",margin:"0 auto",padding:"24px 32px"}}>
        <div style={{marginBottom:"32px"}}>
          <h2 className="headline-font" style={{fontSize:"24px",fontWeight:"700",color:C.onSurface,marginBottom:"8px"}}>AI 行程规划</h2>
          <p style={{fontSize:"14px",color:C.onSurfaceVariant}}>告诉我你的目的地和偏好，AI 为你生成专属行程</p>
        </div>

        {/* 目的地输入 */}
        <div style={{marginBottom:"24px"}}>
          <label style={{fontSize:"13px",fontWeight:"600",color:C.onSurfaceVariant,display:"block",marginBottom:"8px"}}>目的地</label>
          <div style={{position:"relative"}}>
            <span className="material-symbols-outlined" style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",
              color:C.onSurfaceVariant,fontSize:"20px"}}>location_on</span>
            <input value={dest} onChange={e=>setDest(e.target.value)}
              placeholder="输入城市或国家，如：东京、巴黎、瑞士..."
              style={{width:"100%",padding:"14px 14px 14px 46px",borderRadius:"14px",fontSize:"14px",
                background:C.surfaceContainer,border:"1px solid rgba(255,255,255,0.08)",
                color:C.onSurface,outline:"none",boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor="rgba(182,160,255,0.4)"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"} />
          </div>
        </div>

        {/* 天数选择 */}
        <div style={{marginBottom:"24px"}}>
          <label style={{fontSize:"13px",fontWeight:"600",color:C.onSurfaceVariant,display:"block",marginBottom:"8px"}}>行程天数</label>
          <div style={{display:"flex",gap:"10px",flexWrap:"wrap"}}>
            {DAYS_OPTIONS.map(d => (
              <button key={d} onClick={()=>setDays(d)}
                style={{padding:"8px 20px",borderRadius:"9999px",fontSize:"13px",fontWeight:"600",
                  border:"none",cursor:"pointer",transition:"all 0.15s",
                  background: days===d ? "linear-gradient(to right,#b6a0ff,#7e51ff)" : C.surfaceContainerHigh,
                  color: days===d ? "#340090" : C.onSurfaceVariant}}>
                {d}天
              </button>
            ))}
          </div>
        </div>

        {/* 旅行风格 */}
        <div style={{marginBottom:"24px"}}>
          <label style={{fontSize:"13px",fontWeight:"600",color:C.onSurfaceVariant,display:"block",marginBottom:"8px"}}>旅行风格（可选）</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"10px"}}>
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={()=>setStyle(style===t.id?"":t.id)}
                style={{padding:"14px 12px",borderRadius:"14px",textAlign:"left",border:"none",cursor:"pointer",
                  transition:"all 0.15s",
                  background: style===t.id ? "rgba(182,160,255,0.12)" : C.surfaceContainer,
                  borderWidth:"1px",borderStyle:"solid",
                  borderColor: style===t.id ? "rgba(182,160,255,0.3)" : "rgba(255,255,255,0.06)"}}>
                <div style={{fontSize:"22px",marginBottom:"6px"}}>{t.icon}</div>
                <div style={{fontSize:"13px",fontWeight:"600",color: style===t.id ? C.primary : C.onSurface,marginBottom:"3px"}}>{t.label}</div>
                <div style={{fontSize:"11px",color:C.onSurfaceVariant}}>{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 预算 */}
        <div style={{marginBottom:"32px"}}>
          <label style={{fontSize:"13px",fontWeight:"600",color:C.onSurfaceVariant,display:"block",marginBottom:"8px"}}>预算（可选）</label>
          <div style={{position:"relative"}}>
            <span className="material-symbols-outlined" style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",
              color:C.onSurfaceVariant,fontSize:"20px"}}>account_balance_wallet</span>
            <input value={budget} onChange={e=>setBudget(e.target.value)}
              placeholder="总预算，如：8000"
              type="number"
              style={{width:"100%",padding:"14px 14px 14px 46px",borderRadius:"14px",fontSize:"14px",
                background:C.surfaceContainer,border:"1px solid rgba(255,255,255,0.08)",
                color:C.onSurface,outline:"none",boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor="rgba(182,160,255,0.4)"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.08)"} />
          </div>
        </div>

        {/* 生成按钮 */}
        <button onClick={handleGenerate} disabled={!dest.trim() || generating}
          style={{width:"100%",padding:"16px",borderRadius:"14px",fontSize:"15px",fontWeight:"700",
            background: dest.trim() ? "linear-gradient(to right,#b6a0ff,#7e51ff)" : C.surfaceContainerHigh,
            color: dest.trim() ? "#340090" : C.onSurfaceVariant,
            border:"none",cursor: dest.trim() ? "pointer" : "not-allowed",
            boxShadow: dest.trim() ? "0 8px 24px rgba(182,160,255,0.3)" : "none",
            transition:"all 0.2s",opacity: generating ? 0.7 : 1}}>
          <span className="material-symbols-outlined" style={{fontSize:"18px",verticalAlign:"middle",marginRight:"8px",fontVariationSettings:"'FILL' 1"}}>
            {generating ? "hourglass_empty" : "auto_awesome"}
          </span>
          {generating ? "正在生成行程..." : "生成专属行程"}
        </button>

        {/* 快捷模板 */}
        <div style={{marginTop:"40px"}}>
          <p style={{fontSize:"13px",fontWeight:"600",color:C.onSurfaceVariant,marginBottom:"14px"}}>快捷模板</p>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {[
              "帮我规划东京7天文化美食之旅，预算15000元",
              "设计一份巴厘岛5天海岛度假行程，适合情侣",
              "规划瑞士阿尔卑斯10天自驾游路线",
              "制定巴黎5天艺术探索行程，包含博物馆和美食",
            ].map(q => (
              <button key={q} onClick={() => onChat(q)}
                style={{padding:"12px 16px",borderRadius:"12px",textAlign:"left",fontSize:"13px",
                  background:C.surfaceContainer,border:"1px solid rgba(255,255,255,0.06)",
                  color:C.onSurfaceVariant,cursor:"pointer",transition:"all 0.15s",display:"flex",
                  alignItems:"center",gap:"10px"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(182,160,255,0.2)";e.currentTarget.style.color=C.onSurface;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.06)";e.currentTarget.style.color=C.onSurfaceVariant;}}>
                <span className="material-symbols-outlined" style={{fontSize:"16px",color:C.primary,flexShrink:0}}>lightbulb</span>
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryView;
