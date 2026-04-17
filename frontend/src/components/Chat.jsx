import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import ExportButton from "./ExportButton";
import DestinationsView from "./views/DestinationsView";
import ItineraryView from "./views/ItineraryView";
import ConciergeView from "./views/ConciergeView";
import FavoritesView from "./views/FavoritesView";
import SettingsView from "./views/SettingsView";
import HelpView from "./views/HelpView";
import WorldMapView from "./views/WorldMapView";
import FootprintView from "./views/FootprintView";
import BudgetView from "./views/BudgetView";
import StatsView from "./views/StatsView";
import RecommendView from "./views/RecommendView";

const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

const C = {
  surface: "#0d0d14",
  surfaceContainer: "#13131f",
  surfaceContainerHigh: "#1a1a2e",
  surfaceContainerLow: "#0f0f1a",
  onSurface: "#f0eeff",
  onSurfaceVariant: "#b8b5cc",
  primary: "#b6a0ff",
  secondary: "#8596ff",
  secondaryContainer: "#1e2060",
  sidebar: "rgba(8,6,20,0.92)",
  header: "rgba(8,6,20,0.82)",
};

const BENTO = [
  { key:"itinerary", col:"md:col-span-2", row:"md:row-span-2",
    img:"https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80",
    icon:"map", iconColor:"#b6a0ff", tag:"行程规划", title:"规划北京之旅", sub:"7天历史文化与现代都市体验", overlay:true },
  { key:"hotel", col:"md:col-span-2", row:"",
    img:"https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
    icon:"hotel", iconColor:"#8596ff", tag:"住宿推荐", title:"精选酒店推荐", sub:null, overlay:false },
  { key:"transport", col:"", row:"",
    img:"https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80",
    icon:"directions_car", iconColor:"#b6a0ff", tag:"交通出行", title:"交通出行", sub:"最优驾车路线", overlay:false },
  { key:"finance", col:"", row:"",
    img:"https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80",
    icon:"account_balance_wallet", iconColor:"#8596ff", tag:"预算管理", title:"预算管理", sub:"精准控制花销", overlay:false },
];

const CHIPS = ["瑞士阿尔卑斯7日游", "巴黎平价美食推荐", "8000元以内飞巴厘岛"];

// ---- 侧边栏 ----
const Sidebar = ({ onNewChat, onLogout, token, onSelectSession, currentThreadId, username, createTime, onViewChange }) => {
  const [active, setActive] = useState("new");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API}/chat/history/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setHistory(await res.json());
    } catch {}
  }, [token]);

  const handleNav = (key) => {
    setActive(key);
    if (key === "new") { onNewChat(); setShowHistory(false); }
    else if (key === "history") { loadHistory(); setShowHistory(true); }
    else { setShowHistory(false); onViewChange(key); }
  };

  const navItems = [
    { icon:"add_circle", label:"新建行程",  key:"new" },
    { icon:"history",    label:"最近对话",  key:"history" },
    { icon:"bookmark",   label:"收藏地点",  key:"favorites" },
    { icon:"settings",   label:"旅行设置",  key:"settings" },
  ];

  return (
    <aside style={{width:"260px",flexShrink:0,
      background:"linear-gradient(180deg,rgba(18,10,42,0.97) 0%,rgba(10,8,24,0.97) 100%)",
      backdropFilter:"blur(24px)",
      borderRight:"1px solid rgba(140,100,255,0.12)",
      display:"flex",flexDirection:"column",
      height:"100vh",padding:"28px 16px",
      boxShadow:"4px 0 40px rgba(100,60,255,0.08), inset -1px 0 0 rgba(255,255,255,0.03)"}}>

      <div style={{marginBottom:"32px",paddingLeft:"8px",cursor:"pointer"}} onClick={() => handleNav("new")}>
        <h1 className="headline-font"
          style={{fontSize:"19px",fontWeight:"800",background:"linear-gradient(to right,#a5b4fc,#c084fc)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
          途灵 TripMind
        </h1>
        <p style={{fontSize:"10px",color:C.onSurfaceVariant,letterSpacing:"0.12em",marginTop:"3px",textTransform:"uppercase"}}>智能旅行助手</p>
      </div>

      <nav style={{display:"flex",flexDirection:"column",gap:"4px"}}>
        {navItems.map(item => {
          const isActive = active === item.key;
          return (
            <button key={item.key} onClick={() => handleNav(item.key)}
              style={{display:"flex",alignItems:"center",gap:"12px",padding:"12px 14px",borderRadius:"12px",
                width:"100%",textAlign:"left",border:"none",cursor:"pointer",transition:"all 0.18s",
                background: isActive ? "linear-gradient(135deg,rgba(129,140,248,0.18),rgba(192,132,252,0.12))" : "transparent",
                color: isActive ? "#c4b5fd" : "#9ca3af",
                fontWeight: isActive ? "600" : "500",
                boxShadow: isActive ? "inset 0 0 0 1px rgba(165,180,252,0.2)" : "none",
                fontSize:"14px",fontFamily:"Manrope,sans-serif"}}
              onMouseEnter={e=>{ if(!isActive){ e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="#e2e8f0"; }}}
              onMouseLeave={e=>{ if(!isActive){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#9ca3af"; }}}>
              <span className="material-symbols-outlined"
                style={{fontSize:"20px",color: isActive ? "#a5b4fc" : "#6b7280",transition:"color 0.18s",
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0"}}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 历史对话列表 — 有分隔感的独立区域 */}
      {showHistory && (
        <div style={{marginTop:"16px",flex:1,overflowY:"auto",minHeight:0}}>
          <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:"14px"}}>
            <p style={{fontSize:"10px",fontWeight:"700",color:"#6b7280",letterSpacing:"0.12em",
              textTransform:"uppercase",paddingLeft:"14px",marginBottom:"8px"}}>历史记录</p>
            <div style={{display:"flex",flexDirection:"column",gap:"2px"}}>
              {history.length === 0
                ? <p style={{fontSize:"12px",color:"#6b7280",padding:"8px 14px"}}>暂无历史对话</p>
                : history.map(s => (
                  <button key={s.thread_id}
                    onClick={() => onSelectSession(s.thread_id)}
                    style={{display:"flex",alignItems:"center",gap:"8px",width:"100%",textAlign:"left",
                      padding:"9px 14px",borderRadius:"10px",border:"none",cursor:"pointer",
                      fontSize:"13px",fontFamily:"Manrope,sans-serif",
                      background: s.thread_id === currentThreadId ? "rgba(99,102,241,0.12)" : "transparent",
                      color: s.thread_id === currentThreadId ? "#a5b4fc" : "#9ca3af",
                      transition:"all 0.15s"}}
                    onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="#e2e8f0"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.background = s.thread_id === currentThreadId ? "rgba(99,102,241,0.12)" : "transparent"; e.currentTarget.style.color = s.thread_id === currentThreadId ? "#a5b4fc" : "#9ca3af"; }}>
                    <span className="material-symbols-outlined" style={{fontSize:"14px",flexShrink:0,color:"inherit"}}>chat_bubble</span>
                    <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.title}</span>
                  </button>
                ))
              }
            </div>
          </div>
        </div>
      )}

      <div style={{marginTop:"auto",paddingTop:"16px",display:"flex",flexDirection:"column",gap:"12px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"6px 8px"}}>
          <div style={{width:"34px",height:"34px",borderRadius:"50%",background:C.surfaceContainerHigh,
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span className="material-symbols-outlined" style={{color:C.onSurfaceVariant,fontSize:"17px"}}>person</span>
          </div>
          <div>
            <p className="headline-font" style={{fontSize:"13px",fontWeight:"600",color:C.onSurface}}>{username || "旅行者"}</p>
            <p style={{fontSize:"10px",color:C.onSurfaceVariant}}>
              {createTime ? `${new Date(createTime).getFullYear()}年加入` : "新用户"}
            </p>
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"1px"}}>
          {[["help_outline","帮助中心","help"],["logout","退出登录","logout"]].map(([icon,label,key],i)=>(
            <button key={icon} onClick={key==="logout" ? onLogout : ()=>onViewChange(key)}
              style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px 12px",borderRadius:"10px",
                color:C.onSurfaceVariant,fontSize:"13px",background:"transparent",border:"none",cursor:"pointer",
                fontFamily:"Manrope,sans-serif",transition:"all 0.15s"}}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.color=C.onSurface; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=C.onSurfaceVariant; }}>
              <span className="material-symbols-outlined" style={{fontSize:"17px"}}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

// ---- Bento 卡片 ----
const BentoCard = ({ item, onClick }) => (
  <div onClick={() => onClick(item.title)}
    className={`${item.col} ${item.row} group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-500`}
    style={{background:C.surfaceContainer,border:"1px solid rgba(140,100,255,0.2)",
      boxShadow:"0 4px 24px rgba(80,40,160,0.25)",transition:"transform 0.2s,box-shadow 0.2s"}}
    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 32px rgba(120,80,255,0.35)";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 4px 24px rgba(80,40,160,0.25)";}}>
    {item.img && (
      <div className="absolute inset-0 z-0" style={{opacity:item.overlay ? 0.75 : 0.72}}>
        <img src={item.img} alt={item.title} className="w-full h-full object-cover"
          onError={e=>e.target.style.display="none"} />
      </div>
    )}
    {item.overlay && <div className="absolute inset-0 z-10" style={{background:"linear-gradient(to top,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.1) 60%)"}} />}
    {!item.overlay && item.img && <div className="absolute inset-0 z-10" style={{background:"linear-gradient(135deg,rgba(0,0,0,0.28) 0%,rgba(0,0,0,0.18) 100%)"}} />}
    <div className={`relative z-20 p-5 flex flex-col ${item.overlay?"absolute bottom-0 left-0 right-0":"h-full justify-between"}`}>
      {item.tag ? (
        <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"8px",
          background:"rgba(0,0,0,0.35)",backdropFilter:"blur(6px)",
          padding:"4px 10px",borderRadius:"9999px",width:"fit-content",
          border:`1px solid ${item.iconColor}40`}}>
          <span className="material-symbols-outlined" style={{color:item.iconColor,fontSize:"13px",fontVariationSettings:"'FILL' 1"}}>{item.icon}</span>
          <span className="headline-font" style={{fontSize:"10px",fontWeight:"700",letterSpacing:"0.08em",color:item.iconColor}}>{item.tag}</span>
        </div>
      ) : (
        <span className="material-symbols-outlined" style={{color:item.iconColor,fontSize:"26px"}}>{item.icon}</span>
      )}
      <div>
        <h3 className="headline-font" style={{color:"white",fontSize:item.overlay?"19px":"15px",fontWeight:"700",marginBottom:item.sub?"4px":"0",
          textShadow:"0 1px 8px rgba(0,0,0,0.6)"}}>{item.title}</h3>
        {item.sub && <p style={{fontSize:"12px",color:item.overlay?"#e5e7eb":"#f0eeff",textShadow:"0 1px 4px rgba(0,0,0,0.5)"}}>{item.sub}</p>}
      </div>
    </div>
  </div>
);

// ---- 欢迎页 ----
const WelcomeView = ({ onSend }) => {
  const planeRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const frameRef = React.useRef(null);
  const trailRef = React.useRef([]); // 存储尾迹点

  React.useEffect(() => {
    let angle = 0;
    const rx = 280, ry = 68;
    const speed = 0.4;
    const TRAIL_LEN = 48; // 尾迹点数量
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    // canvas 中心对应椭圆中心
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const tick = () => {
      angle = (angle + speed) % 360;
      const rad = (angle * Math.PI) / 180;
      const x = rx * Math.cos(rad);
      const y = ry * Math.sin(rad);
      const dx = -rx * Math.sin(rad);
      const dy = ry * Math.cos(rad);
      const rot = Math.atan2(dy, dx) * (180 / Math.PI);

      // 更新飞机位置
      if (planeRef.current) {
        planeRef.current.style.transform =
          `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rot}deg)`;
      }

      // 记录尾迹点（canvas 坐标）
      trailRef.current.push({ x: cx + x, y: cy + y });
      if (trailRef.current.length > TRAIL_LEN) trailRef.current.shift();

      // 绘制尾迹
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const trail = trailRef.current;
      for (let i = 1; i < trail.length; i++) {
        const alpha = (i / trail.length) * 0.55;
        const width = (i / trail.length) * 2.2;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.strokeStyle = `rgba(180,160,255,${alpha})`;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
  <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 48px 200px"}}>
    <div style={{textAlign:"center",marginBottom:"48px",maxWidth:"680px",position:"relative"}}>
      {/* 尾迹 canvas */}
      <canvas ref={canvasRef} width={680} height={200}
        style={{position:"absolute",top:"44%",left:"50%",
          transform:"translate(-50%,-50%)",
          pointerEvents:"none",zIndex:1,opacity:0.9}} />
      {/* 绕轨道的小飞机 */}
      <div ref={planeRef} style={{
        position:"absolute",top:"44%",left:"50%",
        fontSize:"20px",
        filter:"drop-shadow(0 0 4px rgba(180,160,255,0.4))",
        pointerEvents:"none",
        zIndex:2,
        transformOrigin:"center",
      }}>✈️</div>

      <h2 className="headline-font glow-title" style={{
        fontSize:"clamp(30px,4vw,52px)",fontWeight:"800",
        color:C.onSurface,lineHeight:"1.15",marginBottom:"14px",
        position:"relative",zIndex:3,
      }}>
        你想去哪里旅行？<br/>
        <span style={{
          background:"linear-gradient(to right,#c4b0ff,#a0b4ff,#b6a0ff)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          display:"inline-block",
        }}>
          让我来帮你规划
        </span>
      </h2>
      <p style={{color:"#c8c4e8",fontSize:"16px",lineHeight:"1.7",position:"relative",zIndex:3}}>你的专属 AI 旅行顾问，随时为你打造难忘的旅程。</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full" style={{maxWidth:"860px",height:"340px"}}>
      {BENTO.map(item => <BentoCard key={item.key} item={item} onClick={onSend} />)}
    </div>
  </div>
  );
};

// ---- 消息列表 ----
const MsgContent = ({ text, isAi }) => {
  if (!isAi) return <span style={{whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{text}</span>;
  return (
    <ReactMarkdown
      components={{
        p: ({children}) => <p style={{margin:"0 0 8px",lineHeight:"1.75"}}>{children}</p>,
        strong: ({children}) => <strong style={{color:"#d4c8ff",fontWeight:"700"}}>{children}</strong>,
        ul: ({children}) => <ul style={{paddingLeft:"18px",margin:"6px 0"}}>{children}</ul>,
        ol: ({children}) => <ol style={{paddingLeft:"18px",margin:"6px 0"}}>{children}</ol>,
        li: ({children}) => <li style={{margin:"3px 0",lineHeight:"1.6"}}>{children}</li>,
        h1: ({children}) => <h1 className="headline-font" style={{fontSize:"16px",fontWeight:"700",color:"#d4c8ff",margin:"10px 0 6px"}}>{children}</h1>,
        h2: ({children}) => <h2 className="headline-font" style={{fontSize:"15px",fontWeight:"700",color:"#d4c8ff",margin:"8px 0 5px"}}>{children}</h2>,
        h3: ({children}) => <h3 style={{fontSize:"14px",fontWeight:"600",color:"#c4b8f0",margin:"6px 0 4px"}}>{children}</h3>,
        code: ({inline, children}) => inline
          ? <code style={{background:"rgba(167,139,250,0.15)",color:"#c4b8f0",padding:"1px 6px",borderRadius:"4px",fontSize:"13px"}}>{children}</code>
          : <pre style={{background:"rgba(0,0,0,0.3)",padding:"12px",borderRadius:"8px",overflow:"auto",margin:"8px 0"}}><code style={{fontSize:"12px",color:"#c4b8f0"}}>{children}</code></pre>,
        blockquote: ({children}) => <blockquote style={{borderLeft:"3px solid #a78bfa",paddingLeft:"12px",margin:"8px 0",color:"#b8b5cc"}}>{children}</blockquote>,
        hr: () => <hr style={{border:"none",borderTop:"1px solid rgba(167,139,250,0.2)",margin:"10px 0"}}/>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

const MessageList = ({ messages, loading, endRef }) => (
  <div style={{flex:1,overflowY:"auto",paddingTop:"80px",paddingBottom:"180px"}}>
    <div style={{maxWidth:"680px",margin:"0 auto",padding:"24px 32px",display:"flex",flexDirection:"column",gap:"20px"}}>
      {messages.map(msg => (
        <div key={msg.id} className="msg-enter" style={{display:"flex",gap:"12px",flexDirection:msg.sender==="user"?"row-reverse":"row",alignItems:"flex-start",width:"100%"}}>
          <div style={{flexShrink:0,width:"30px",height:"30px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
            background:msg.sender==="ai"?"linear-gradient(135deg,#b6a0ff,#7e51ff)":C.surfaceContainerHigh,marginTop:"2px"}}>
            <span className="material-symbols-outlined" style={{fontSize:"14px",color:"white",fontVariationSettings:"'FILL' 1"}}>
              {msg.sender==="ai"?"auto_awesome":"person"}
            </span>
          </div>
          <div style={{maxWidth:"72%",padding:"11px 15px",
            borderRadius:msg.sender==="user"?"16px 4px 16px 16px":"4px 16px 16px 16px",
            fontSize:"14px",lineHeight:"1.75",wordBreak:"break-word",
            background:msg.sender==="user"?"rgba(120,80,255,0.25)":"rgba(18,14,32,0.9)",
            border:msg.sender==="user"?"1px solid rgba(129,140,248,0.25)":"1px solid rgba(255,255,255,0.05)",
            color:C.onSurface}}>
            <MsgContent text={msg.content} isAi={msg.sender==="ai"} />
          </div>
        </div>
      ))}
      {loading && (
        <div className="msg-enter" style={{display:"flex",gap:"12px",alignItems:"flex-start"}}>
          <div style={{flexShrink:0,width:"30px",height:"30px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
            background:"linear-gradient(135deg,#b6a0ff,#7e51ff)",marginTop:"2px"}}>
            <span className="material-symbols-outlined" style={{fontSize:"14px",color:"white",fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
          </div>
          <div style={{padding:"13px 16px",borderRadius:"4px 16px 16px 16px",background:C.surfaceContainer,border:"1px solid rgba(255,255,255,0.05)"}}>
            <div style={{display:"flex",gap:"5px",alignItems:"center"}}>
              {[0,150,300].map(d=>(
                <div key={d} className="animate-bounce" style={{width:"6px",height:"6px",borderRadius:"50%",background:"#b6a0ff",animationDelay:`${d}ms`}} />
              ))}
            </div>
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  </div>
);

// ---- 主组件 ----
const Chat = ({ onLogout, token, username, createTime, preloaded, onRefreshPreload }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  });
  const [sessionTitle, setSessionTitle] = useState("");
  const [pendingApproval, setPendingApproval] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [bookings, setBookings] = useState({ flights:[], hotels:[], cars:[] });
  const [view, setView] = useState("chat");
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tm_favorites") || "[]"); } catch { return []; }
  });
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const endRef = useRef(null);
  const textareaRef = useRef(null);
  const sendingRef = useRef(false);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  // 加载订单 - 优先用预加载数据
  const loadBookings = useCallback(async () => {
    if (preloaded?.loaded && preloaded?.bookings) {
      setBookings(preloaded.bookings);
      return;
    }
    try {
      const res = await fetch(`${API}/user/bookings/`, { headers:{ Authorization:`Bearer ${token}` } });
      if (res.ok) setBookings(await res.json());
    } catch {}
  }, [token, preloaded]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  // 预加载数据到达时同步（已在 loadBookings 里处理，无需重复）
  const saveSession = useCallback(async (msgs, title) => {
    if (!msgs.length) return;
    try {
      await fetch(`${API}/chat/save/`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          thread_id: threadId,
          title: title || msgs[0]?.content?.slice(0, 20) || "新对话",
          messages: msgs.map(m => ({ role: m.sender, content: m.content, timestamp: new Date().toISOString() })),
        }),
      });
    } catch {}
  }, [token, threadId]);

  const callApi = async (userInput, currentMsgs) => {
    setLoading(true);
    const aiMsgId = Date.now() + 1;
    let aiMsgInserted = false;

    try {
      const res = await fetch(`${API}/graph/stream/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          user_input: userInput,
          config: { configurable: { passenger_id: "", thread_id: threadId } }
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      let interrupted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.delta) {
              fullText += data.delta;
              if (!aiMsgInserted) {
                // 第一次有内容时才插入 AI 消息，避免 loading 气泡和空消息同时显示
                aiMsgInserted = true;
                setLoading(false);
                setMessages([...currentMsgs, { id: aiMsgId, content: fullText, sender: "ai" }]);
              } else {
                setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: fullText } : m));
              }
            }
            if (data.interrupt) interrupted = true;
            if (data.done) break;
          } catch {}
        }
      }

      if (interrupted) setPendingApproval(true);
      else setPendingApproval(false);

      // 如果没有收到任何内容（interrupt 情况）
      if (!aiMsgInserted) {
        setMessages([...currentMsgs, { id: aiMsgId, content: "", sender: "ai" }]);
      }

      // 检测订单成功通知
      const successKeywords = ["成功预定","成功预订","预订成功","预定成功","成功取消","成功更新","成功改签"];
      if (successKeywords.some(k => fullText.includes(k))) {
        const notif = { id: Date.now(), text: fullText.slice(0, 60) + (fullText.length > 60 ? "..." : ""), time: new Date().toLocaleTimeString() };
        setNotifications(prev => [notif, ...prev].slice(0, 10));
        loadBookings();
      }

      const newMsgs = [...currentMsgs, { id: aiMsgId, content: fullText, sender: "ai" }];
      const title = sessionTitle || currentMsgs[0]?.content?.slice(0, 20) || "新对话";
      if (!sessionTitle) setSessionTitle(title);
      saveSession(newMsgs, title);

    } catch (e) {
      setMessages(prev => {
        const hasMsg = prev.some(m => m.id === aiMsgId);
        if (hasMsg) return prev.map(m => m.id === aiMsgId ? { ...m, content: `连接后端失败：${e.message}` } : m);
        return [...prev, { id: aiMsgId, content: `连接后端失败：${e.message}`, sender: "ai" }];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (text) => {
    const content = (typeof text === "string" ? text : input).trim();
    if (!content || loading || sendingRef.current) return;
    sendingRef.current = true;
    const newMsgs = [...messages, { id:Date.now(), content, sender:"user" }];
    setMessages(newMsgs);
    setInput("");
    callApi(content, newMsgs).finally(() => { sendingRef.current = false; });
  };

  const handleApprove = () => {
    const newMsgs = [...messages, { id:Date.now(), content:"y", sender:"user" }];
    setMessages(newMsgs);
    setPendingApproval(false);
    callApi("y", newMsgs);
  };

  const handleReject = () => {
    const newMsgs = [...messages, { id:Date.now(), content:"取消操作", sender:"user" }];
    setMessages(newMsgs);
    setPendingApproval(false);
    callApi("取消操作", newMsgs);
  };

  const handleNewChat = () => {
    setMessages([]); setInput(""); setPendingApproval(false);
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    setThreadId(newId); setSessionTitle("");
    setView("chat");
  };

  const handleToggleFav = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem("tm_favorites", JSON.stringify(next));
      return next;
    });
  };

  // 从其他视图发起对话，切换到 chat 视图
  const handleChatFromView = (text) => {
    setView("chat");
    setTimeout(() => handleSend(text), 100);
  };

  // 语音输入
  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("当前浏览器不支持语音输入，请使用 Chrome"); return; }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "zh-CN";
    rec.continuous = false;
    rec.interimResults = true;
    recognitionRef.current = rec;

    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join("");
      setInput(transcript);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.start();
  };

  // 加载历史会话
  const handleSelectSession = async (tid) => {
    try {
      const res = await fetch(`${API}/chat/history/${tid}/`, {
        headers: { Authorization:`Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      const msgs = (data.messages || []).map((m, i) => ({ id:i, content:m.content, sender:m.role }));
      setMessages(msgs);
      setThreadId(tid);
      setSessionTitle(data.title || "");
      setView("chat");
    } catch {}
  };

  const handleKeyDown = (e) => {
    if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const isNew = messages.length === 0;

  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:"#0b0a18"}}>
      <div className="noise-overlay" style={{zIndex:0}}/>
      <Sidebar onNewChat={handleNewChat} onLogout={onLogout} token={token}
        onSelectSession={handleSelectSession} currentThreadId={threadId}
        username={username} createTime={createTime}
        onViewChange={setView} />

      <main style={{flex:1,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
        <header style={{position:"fixed",top:0,right:0,left:"260px",zIndex:50,height:"64px",
          padding:"0 36px",display:"flex",justifyContent:"space-between",alignItems:"center",
          background:"linear-gradient(90deg,rgba(22,12,48,0.92) 0%,rgba(14,10,36,0.92) 50%,rgba(10,14,40,0.92) 100%)",
          backdropFilter:"blur(24px)",
          borderBottom:"1px solid rgba(120,100,255,0.15)",
          boxShadow:"0 1px 0 rgba(100,80,255,0.08), 0 4px 24px rgba(80,60,200,0.12), inset 0 1px 0 rgba(160,140,255,0.06)"
        }}>
          {/* header 蓝紫装饰光 */}
          <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
            <div style={{position:"absolute",top:"-20px",left:"15%",width:"220px",height:"80px",
              background:"radial-gradient(ellipse,rgba(120,100,255,0.12) 0%,transparent 70%)",
              filter:"blur(12px)"}}/>
            <div style={{position:"absolute",top:"-10px",left:"45%",width:"160px",height:"60px",
              background:"radial-gradient(ellipse,rgba(80,120,255,0.09) 0%,transparent 70%)",
              filter:"blur(10px)"}}/>
            <div style={{position:"absolute",top:"-15px",right:"12%",width:"180px",height:"70px",
              background:"radial-gradient(ellipse,rgba(160,100,255,0.10) 0%,transparent 70%)",
              filter:"blur(12px)"}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"28px",position:"relative",zIndex:1}}>
            <span className="headline-font" onClick={handleNewChat}
              style={{fontSize:"16px",fontWeight:"700",color:C.onSurface,cursor:"pointer",
                background:"linear-gradient(to right,#a5b4fc,#c084fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
                flexShrink:0}}>
              途灵 TripMind
            </span>
            <nav style={{display:"flex",gap:"4px"}}>
              {[["推荐","recommend"],["目的地","destinations"],["行程规划","itinerary"],["地图","worldmap"],["足迹","footprint"],["预算","budget"],["统计","stats"],["礼宾服务","concierge"]].map(([t,v])=>(
                <button key={v} onClick={()=>setView(view===v?"chat":v)}
                  style={{
                    color: view===v ? "#a5b4fc" : C.onSurfaceVariant,
                    fontSize:"14px",
                    background: view===v ? "rgba(165,180,252,0.1)" : "none",
                    border:"none",
                    cursor:"pointer",
                    transition:"all 0.2s",
                    fontFamily:"Manrope,sans-serif",
                    fontWeight: view===v ? "600" : "400",
                    padding:"6px 14px",
                    borderRadius:"8px",
                    position:"relative",
                  }}
                  onMouseEnter={e=>{ if(view!==v){ e.currentTarget.style.color="#a5b4fc"; e.currentTarget.style.background="rgba(165,180,252,0.06)"; }}}
                  onMouseLeave={e=>{ if(view!==v){ e.currentTarget.style.color=C.onSurfaceVariant; e.currentTarget.style.background="none"; }}}>
                  {t}
                  {view===v && <span style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",
                    width:"20px",height:"2px",borderRadius:"2px",background:"linear-gradient(to right,#a5b4fc,#c084fc)"}}/>}
                </button>
              ))}
            </nav>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"18px",position:"relative",zIndex:1}}>
            {/* 对话视图有消息时显示导出按钮 */}
            {view === "chat" && messages.length > 0 && (
              <ExportButton messages={messages} username={username} />
            )}
            {/* 通知按钮 */}
            <div style={{position:"relative",cursor:"pointer"}} onClick={() => { setShowNotif(v=>!v); setShowProfile(false); }}>
              <span className="material-symbols-outlined" style={{color: showNotif ? C.primary : C.onSurfaceVariant,fontSize:"21px"}}>notifications</span>
              {notifications.length > 0 && (
                <span style={{position:"absolute",top:"-4px",right:"-4px",minWidth:"16px",height:"16px",borderRadius:"9999px",
                  background:"#ff6e84",color:"white",fontSize:"10px",fontWeight:"700",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>
                  {notifications.length}
                </span>
              )}
              {/* 通知面板 */}
              {showNotif && (
                <div style={{position:"absolute",top:"32px",right:0,width:"320px",borderRadius:"16px",zIndex:100,
                  background:"#16161e",border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 16px 48px rgba(0,0,0,0.6)"}}>
                  <div style={{padding:"14px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:"13px",fontWeight:"600",color:C.onSurface}}>订单通知</span>
                    {notifications.length > 0 && (
                      <button onClick={e=>{e.stopPropagation();setNotifications([]);}}
                        style={{fontSize:"11px",color:C.onSurfaceVariant,background:"none",border:"none",cursor:"pointer"}}>清空</button>
                    )}
                  </div>
                  <div style={{maxHeight:"280px",overflowY:"auto"}}>
                    {notifications.length === 0
                      ? <p style={{padding:"20px 16px",fontSize:"13px",color:C.onSurfaceVariant,textAlign:"center"}}>暂无通知</p>
                      : notifications.map(n => (
                        <div key={n.id} style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                          <p style={{fontSize:"13px",color:C.onSurface,lineHeight:"1.5"}}>{n.text}</p>
                          <p style={{fontSize:"11px",color:C.onSurfaceVariant,marginTop:"4px"}}>{n.time}</p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>

            {/* 个人中心按钮 */}
            <div style={{position:"relative",cursor:"pointer"}} onClick={() => { setShowProfile(v=>!v); setShowNotif(false); }}>
              <span className="material-symbols-outlined" style={{color: showProfile ? C.primary : C.onSurfaceVariant,fontSize:"21px"}}>account_circle</span>
              {/* 个人中心面板 */}
              {showProfile && (
                <div style={{position:"absolute",top:"32px",right:0,width:"360px",borderRadius:"16px",zIndex:100,
                  background:"#16161e",border:"1px solid rgba(255,255,255,0.08)",boxShadow:"0 16px 48px rgba(0,0,0,0.6)"}}>
                  <div style={{padding:"16px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    <p style={{fontSize:"14px",fontWeight:"600",color:C.onSurface}}>{username || "旅行者"}</p>
                    <p style={{fontSize:"12px",color:C.onSurfaceVariant,marginTop:"2px"}}>
                      {createTime ? `${new Date(createTime).getFullYear()}年${new Date(createTime).getMonth()+1}月加入` : ""}
                    </p>
                  </div>
                  {/* 机票 */}
                  {bookings.flights.length > 0 && (
                    <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <p style={{fontSize:"11px",fontWeight:"700",color:C.primary,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"8px"}}>我的机票</p>
                      {bookings.flights.slice(0,3).map((f,i) => (
                        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                          <div>
                            <span style={{fontSize:"13px",fontWeight:"600",color:C.onSurface}}>{f.departure_airport} → {f.arrival_airport}</span>
                            <p style={{fontSize:"11px",color:C.onSurfaceVariant,marginTop:"2px"}}>{f.flight_no} · {f.fare_conditions}</p>
                          </div>
                          <span style={{fontSize:"11px",color:C.onSurfaceVariant}}>{f.scheduled_departure ? new Date(f.scheduled_departure).toLocaleDateString("zh-CN") : ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 酒店 */}
                  {bookings.hotels.length > 0 && (
                    <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <p style={{fontSize:"11px",fontWeight:"700",color:"#8596ff",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"8px"}}>我的酒店</p>
                      {bookings.hotels.slice(0,3).map((h,i) => (
                        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                          <span style={{fontSize:"13px",color:C.onSurface}}>{h.name || `酒店 #${h.id}`}</span>
                          <span style={{fontSize:"11px",color:C.onSurfaceVariant}}>{h.location || ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 租车 */}
                  {bookings.cars.length > 0 && (
                    <div style={{padding:"12px 16px"}}>
                      <p style={{fontSize:"11px",fontWeight:"700",color:"#81ecff",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:"8px"}}>我的租车</p>
                      {bookings.cars.slice(0,3).map((c,i) => (
                        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                          <span style={{fontSize:"13px",color:C.onSurface}}>{c.name || `租车 #${c.id}`}</span>
                          <span style={{fontSize:"11px",color:C.onSurfaceVariant}}>{c.location || ""}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {bookings.flights.length === 0 && bookings.hotels.length === 0 && bookings.cars.length === 0 && (
                    <p style={{padding:"20px 16px",fontSize:"13px",color:C.onSurfaceVariant,textAlign:"center"}}>暂无订单，快去规划你的旅程吧</p>
                  )}
                  <div style={{padding:"12px 16px",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                    <button onClick={onLogout}
                      style={{width:"100%",padding:"10px",borderRadius:"10px",fontSize:"13px",fontWeight:"600",
                        background:"rgba(255,110,132,0.1)",color:"#ff6e84",border:"1px solid rgba(255,110,132,0.2)",cursor:"pointer"}}>
                      退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 内容区 */}
        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
          {view === "recommend"    && <RecommendView favorites={favorites} onChat={handleChatFromView} />}
          {view === "destinations" && <DestinationsView onChat={handleChatFromView} favorites={favorites} onToggleFav={handleToggleFav} />}
          {view === "itinerary"    && <ItineraryView onChat={handleChatFromView} />}
          {view === "worldmap"     && <WorldMapView favorites={favorites} onToggleFav={handleToggleFav} onChat={handleChatFromView} />}
          {view === "footprint"    && <FootprintView />}
          {view === "budget"       && <BudgetView token={token} preloaded={preloaded} onRefresh={onRefreshPreload} />}
          {view === "stats"        && <StatsView token={token} preloaded={preloaded} />}
          {view === "concierge"    && <ConciergeView onChat={handleChatFromView} />}
          {view === "favorites"    && <FavoritesView onChat={handleChatFromView} favorites={favorites} onToggleFav={handleToggleFav} />}
          {view === "settings"     && <SettingsView username={username} />}
          {view === "help"         && <HelpView onChat={handleChatFromView} />}
          {view === "chat" && (isNew ? <WelcomeView onSend={handleSend} /> : <MessageList messages={messages} loading={loading} endRef={endRef} />)}
        </div>

        {pendingApproval && (
          <div style={{position:"fixed",bottom:"140px",left:"260px",right:0,display:"flex",justifyContent:"center",zIndex:40}}>
            <div style={{display:"flex",gap:"12px",padding:"14px 20px",borderRadius:"16px",
              background:"rgba(31,31,38,0.9)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <span style={{fontSize:"13px",color:C.onSurfaceVariant,alignSelf:"center"}}>AI 请求执行操作，是否批准？</span>
              <button onClick={handleApprove}
                style={{padding:"8px 20px",borderRadius:"9999px",fontSize:"13px",fontWeight:"600",
                  background:"linear-gradient(to right,#b6a0ff,#7e51ff)",color:"#340090",border:"none",cursor:"pointer"}}>
                 批准
              </button>
              <button onClick={handleReject}
                style={{padding:"8px 20px",borderRadius:"9999px",fontSize:"13px",fontWeight:"600",
                  background:"rgba(255,110,132,0.15)",color:"#ff6e84",border:"1px solid rgba(255,110,132,0.3)",cursor:"pointer"}}>
                 拒绝
              </button>
            </div>
          </div>
        )}

        {view === "chat" && <div style={{position:"fixed",bottom:0,right:0,left:"260px",padding:"16px 36px 20px",pointerEvents:"none",
          background:"linear-gradient(to top, #0e0e13 60%, transparent 100%)",zIndex:30}}>
          <div style={{maxWidth:"780px",margin:"0 auto",pointerEvents:"auto"}}>
            <div style={{display:"flex",alignItems:"flex-end",borderRadius:"9999px",padding:"6px 6px 6px 20px",
              background:"rgba(18,12,38,0.85)",backdropFilter:"blur(24px)",
              border:"1px solid rgba(255,255,255,0.1)",boxShadow:"0 0 0 1px rgba(182,160,255,0.08), 0 8px 32px rgba(0,0,0,0.6)"}}>
              <textarea ref={textareaRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="告诉我你想去哪里旅行..."
                rows={1}
                style={{flex:1,background:"transparent",border:"none",outline:"none",resize:"none",
                  color:C.onSurface,fontSize:"14px",lineHeight:"1.6",padding:"9px 12px 9px 0",maxHeight:"160px",
                  fontFamily:"Manrope,sans-serif"}} />
              <div style={{display:"flex",alignItems:"center",gap:"4px",flexShrink:0}}>
                <button onClick={handleVoice}
                  style={{width:"38px",height:"38px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                  color: isListening ? "#ff6e84" : C.onSurfaceVariant,
                  background: isListening ? "rgba(255,110,132,0.15)" : "transparent",
                  border: isListening ? "1px solid rgba(255,110,132,0.3)" : "none",
                  cursor:"pointer",transition:"all 0.2s",
                  animation: isListening ? "pulse 1s infinite" : "none"}}>
                  <span className="material-symbols-outlined" style={{fontSize:"19px",
                    fontVariationSettings: isListening ? "'FILL' 1" : "'FILL' 0"}}>mic</span>
                </button>
                <button onClick={() => handleSend()} disabled={loading || !input.trim()}
                  style={{width:"42px",height:"42px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                    background: input.trim() && !loading ? "linear-gradient(135deg,#b6a0ff,#7e51ff)" : C.surfaceContainerHigh,
                    border:"none",cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                    boxShadow: input.trim() && !loading ? "0 4px 15px rgba(182,160,255,0.3)" : "none",
                    transition:"all 0.2s",opacity:loading?0.5:1}}>
                  <span className="material-symbols-outlined" style={{fontSize:"18px",color:"white",fontVariationSettings:"'FILL' 1"}}>send</span>
                </button>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:"8px",marginTop:"12px",flexWrap:"wrap"}}>
              {CHIPS.map(chip=>(
                <button key={chip} onClick={()=>handleSend(chip)}
                  style={{padding:"6px 14px",borderRadius:"9999px",fontSize:"12px",fontWeight:"500",
                    background:"rgba(80,40,180,0.3)",border:"1px solid rgba(255,255,255,0.06)",
                    color:C.secondary,cursor:"pointer",transition:"background 0.2s",fontFamily:"Manrope,sans-serif"}}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(41,60,160,0.55)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(41,60,160,0.35)"}>
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>}
      </main>
    </div>
  );
};

export default Chat;



