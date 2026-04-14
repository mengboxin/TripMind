import React, { useState, useRef, useEffect, useCallback } from "react";
import DestinationsView from "./views/DestinationsView";
import ItineraryView from "./views/ItineraryView";
import ConciergeView from "./views/ConciergeView";
import FavoritesView from "./views/FavoritesView";
import SettingsView from "./views/SettingsView";
import HelpView from "./views/HelpView";
import WorldMapView from "./views/WorldMapView";

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
    img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80",
    icon:"map", iconColor:"#b6a0ff", tag:"行程规划", title:"规划东京之旅", sub:"7天科技与传统的深度体验", overlay:true },
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
    <aside style={{width:"260px",flexShrink:0,background:"linear-gradient(180deg,rgba(20,12,40,0.96) 0%,rgba(8,6,20,0.96) 100%)",backdropFilter:"blur(20px)",
      borderRight:"1px solid rgba(255,255,255,0.05)",display:"flex",flexDirection:"column",
      height:"100vh",padding:"28px 16px",boxShadow:"0 0 50px -12px rgba(182,160,255,0.08)"}}>

      <div style={{marginBottom:"32px",paddingLeft:"8px"}}>
        <h1 className="headline-font"
          style={{fontSize:"19px",fontWeight:"800",background:"linear-gradient(to right,#a5b4fc,#c084fc)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
          途灵 TripMind
        </h1>
        <p style={{fontSize:"10px",color:C.onSurfaceVariant,letterSpacing:"0.12em",marginTop:"3px",textTransform:"uppercase"}}>智能旅行助手</p>
      </div>

      <nav style={{display:"flex",flexDirection:"column",gap:"2px"}}>
        {navItems.map(item => {
          const isActive = active === item.key;
          return (
            <button key={item.key} onClick={() => handleNav(item.key)}
              style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 12px",borderRadius:"10px",
                width:"100%",textAlign:"left",border:"none",cursor:"pointer",transition:"all 0.15s",
                background: isActive ? "rgba(99,102,241,0.12)" : "transparent",
                color: isActive ? "#a5b4fc" : C.onSurfaceVariant,
                fontWeight: isActive ? "600" : "400",
                borderLeft: isActive ? "2px solid #818cf8" : "2px solid transparent",
                fontSize:"13px",fontFamily:"Manrope,sans-serif"}}
              onMouseEnter={e=>{ if(!isActive){ e.currentTarget.style.background="rgba(255,255,255,0.04)"; e.currentTarget.style.color=C.onSurface; }}}
              onMouseLeave={e=>{ if(!isActive){ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=C.onSurfaceVariant; }}}>
              <span className="material-symbols-outlined" style={{fontSize:"18px"}}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 历史对话列表 */}
      {showHistory && (
        <div style={{marginTop:"8px",flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:"2px"}}>
          {history.length === 0
            ? <p style={{fontSize:"12px",color:C.onSurfaceVariant,padding:"8px 12px"}}>暂无历史对话</p>
            : history.map(s => (
              <button key={s.thread_id}
                onClick={() => onSelectSession(s.thread_id)}
                style={{display:"block",width:"100%",textAlign:"left",padding:"8px 12px",borderRadius:"8px",
                  border:"none",cursor:"pointer",fontSize:"12px",fontFamily:"Manrope,sans-serif",
                  background: s.thread_id === currentThreadId ? "rgba(99,102,241,0.1)" : "transparent",
                  color: s.thread_id === currentThreadId ? "#a5b4fc" : C.onSurfaceVariant,
                  transition:"all 0.15s",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}
                onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.04)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.background = s.thread_id === currentThreadId ? "rgba(99,102,241,0.1)" : "transparent"; }}>
                {s.title}
              </button>
            ))
          }
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
    style={{background:C.surfaceContainer,border:"1px solid rgba(140,100,255,0.15)",boxShadow:"0 4px 24px rgba(80,40,160,0.2)"}}>
    {item.img && (
      <div className="absolute inset-0 z-0" style={{opacity:item.overlay?0.65:0.45}}>
        <img src={item.img} alt={item.title} className="w-full h-full object-cover"
          onError={e=>e.target.style.display="none"} />
      </div>
    )}
    {item.overlay && <div className="absolute inset-0 z-10" style={{background:"linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 60%)"}} />}
    {!item.overlay && item.img && <div className="absolute inset-0 z-10" style={{background:"rgba(0,0,0,0.45)"}} />}
    <div className={`relative z-20 p-5 flex flex-col ${item.overlay?"absolute bottom-0 left-0 right-0":"h-full justify-between"}`}>
      {item.tag ? (
        <div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"8px"}}>
          <span className="material-symbols-outlined" style={{color:item.iconColor,fontSize:"14px"}}>{item.icon}</span>
          <span className="headline-font" style={{fontSize:"10px",fontWeight:"700",letterSpacing:"0.1em",color:item.iconColor}}>{item.tag}</span>
        </div>
      ) : (
        <span className="material-symbols-outlined" style={{color:item.iconColor,fontSize:"26px"}}>{item.icon}</span>
      )}
      <div>
        <h3 className="headline-font" style={{color:"white",fontSize:item.overlay?"19px":"14px",fontWeight:"700",marginBottom:item.sub?"4px":"0"}}>{item.title}</h3>
        {item.sub && <p style={{fontSize:"12px",color:item.overlay?"#d1d5db":C.onSurfaceVariant}}>{item.sub}</p>}
      </div>
    </div>
  </div>
);

// ---- 欢迎页 ----
const WelcomeView = ({ onSend }) => (
  <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 48px 200px"}}>
    <div style={{textAlign:"center",marginBottom:"48px",maxWidth:"680px"}}>
      <h2 className="headline-font" style={{fontSize:"clamp(30px,4vw,52px)",fontWeight:"800",color:C.onSurface,lineHeight:"1.15",marginBottom:"14px"}}>
        你想去哪里旅行？<br/>
        <span style={{background:"linear-gradient(to right,#b6a0ff,#8596ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
          让我来帮你规划
        </span>
      </h2>
      <p style={{color:"#c8c4e8",fontSize:"16px",lineHeight:"1.7"}}>你的专属 AI 旅行顾问，随时为你打造难忘的旅程。</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full" style={{maxWidth:"860px",height:"340px"}}>
      {BENTO.map(item => <BentoCard key={item.key} item={item} onClick={onSend} />)}
    </div>
  </div>
);

// ---- 消息列表 ----
const MsgContent = ({ text }) => <span style={{whiteSpace:"pre-wrap",wordBreak:"break-word"}}>{text}</span>;

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
            <MsgContent text={msg.content} />
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
const Chat = ({ onLogout, token, username, createTime }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(() => crypto.randomUUID());
  const [sessionTitle, setSessionTitle] = useState("");
  const [pendingApproval, setPendingApproval] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [bookings, setBookings] = useState({ flights:[], hotels:[], cars:[] });
  const [view, setView] = useState("chat"); // chat | destinations | itinerary | concierge | favorites | settings | help
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tm_favorites") || "[]"); } catch { return []; }
  });
  const endRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  // 加载订单
  const loadBookings = useCallback(async () => {
    try {
      const res = await fetch(`${API}/user/bookings/`, { headers:{ Authorization:`Bearer ${token}` } });
      if (res.ok) setBookings(await res.json());
    } catch {}
  }, [token]);

  useEffect(() => { loadBookings(); }, [loadBookings]);
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
    try {
      const res = await fetch(`${API}/graph/`, {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization:`Bearer ${token}` },
        body: JSON.stringify({
          user_input: userInput,
          config: { configurable: { passenger_id:"3442 587242", thread_id: threadId } }
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data.assistant || "抱歉，暂时无法获取回复。";
      if (reply.includes("是否批准")) setPendingApproval(true);
      else setPendingApproval(false);

      // 检测订单成功，推送通知并刷新订单
      const successKeywords = ["成功预定","成功预订","预订成功","预定成功","成功取消","成功更新","成功改签"];
      if (successKeywords.some(k => reply.includes(k))) {
        const notif = { id: Date.now(), text: reply.slice(0, 60) + (reply.length > 60 ? "..." : ""), time: new Date().toLocaleTimeString() };
        setNotifications(prev => [notif, ...prev].slice(0, 10));
        loadBookings(); // 刷新订单列表
      }

      const newMsgs = [...currentMsgs, { id:Date.now()+1, content:reply, sender:"ai" }];
      setMessages(newMsgs);
      // 自动保存
      const title = sessionTitle || currentMsgs[0]?.content?.slice(0, 20) || "新对话";
      if (!sessionTitle) setSessionTitle(title);
      saveSession(newMsgs, title);
    } catch (e) {
      setMessages(prev => [...prev, { id:Date.now()+1, content:`连接后端失败：${e.message}`, sender:"ai" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (text) => {
    const content = (typeof text === "string" ? text : input).trim();
    if (!content || loading) return;
    const newMsgs = [...messages, { id:Date.now(), content, sender:"user" }];
    setMessages(newMsgs);
    setInput("");
    callApi(content, newMsgs);
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
    setThreadId(crypto.randomUUID()); setSessionTitle("");
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
    } catch {}
  };

  const handleKeyDown = (e) => {
    if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const isNew = messages.length === 0;

  return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden",background:"linear-gradient(135deg,#0d0b1a 0%,#0d0d14 60%,#0a0d18 100%)"}}>
      <Sidebar onNewChat={handleNewChat} onLogout={onLogout} token={token}
        onSelectSession={handleSelectSession} currentThreadId={threadId}
        username={username} createTime={createTime}
        onViewChange={setView} />

      <main style={{flex:1,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
        <header style={{position:"fixed",top:0,right:0,left:"260px",zIndex:50,height:"64px",
          padding:"0 36px",display:"flex",justifyContent:"space-between",alignItems:"center",
          background:"linear-gradient(90deg,rgba(16,10,36,0.88) 0%,rgba(8,6,20,0.88) 100%)",backdropFilter:"blur(20px)",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
          <div style={{display:"flex",alignItems:"center",gap:"24px"}}>
            <span className="headline-font" style={{fontSize:"16px",fontWeight:"700",color:C.onSurface}}>途灵 TripMind</span>
            <nav style={{display:"flex",gap:"18px"}}>
              {[["目的地","destinations"],["行程规划","itinerary"],["地图","worldmap"],["礼宾服务","concierge"]].map(([t,v])=>(
                <button key={v} onClick={()=>setView(view===v?"chat":v)}
                  style={{color: view===v ? "#a5b4fc" : C.onSurfaceVariant,fontSize:"13px",
                    background:"none",border:"none",cursor:"pointer",transition:"color 0.2s",
                    fontFamily:"Manrope,sans-serif",fontWeight: view===v ? "600" : "400",
                    borderBottom: view===v ? "1px solid #a5b4fc" : "1px solid transparent",
                    paddingBottom:"2px"}}
                  onMouseEnter={e=>{ if(view!==v) e.target.style.color="#a5b4fc"; }}
                  onMouseLeave={e=>{ if(view!==v) e.target.style.color=C.onSurfaceVariant; }}>
                  {t}
                </button>
              ))}
            </nav>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"18px"}}>
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
          {view === "destinations" && <DestinationsView onChat={handleChatFromView} favorites={favorites} onToggleFav={handleToggleFav} />}
          {view === "itinerary"    && <ItineraryView onChat={handleChatFromView} />}
          {view === "worldmap"     && <WorldMapView favorites={favorites} onToggleFav={handleToggleFav} onChat={handleChatFromView} />}
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
                <button style={{width:"38px",height:"38px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                  color:C.onSurfaceVariant,background:"transparent",border:"none",cursor:"pointer"}}>
                  <span className="material-symbols-outlined" style={{fontSize:"19px"}}>mic</span>
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



