import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import BudgetView from "./views/BudgetView";
import FavoritesView from "./views/FavoritesView";
import SettingsView from "./views/SettingsView";
import ItineraryView from "./views/ItineraryView";
import StatsView from "./views/StatsView";
import DestinationsView from "./views/DestinationsView";
import WorldMapView from "./views/WorldMapView";
import FootprintView from "./views/FootprintView";
import RecommendView from "./views/RecommendView";
import ConciergeView from "./views/ConciergeView";
import HelpView from "./views/HelpView";

const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

// 颜色常量（与桌面端一致）
const C = {
  bg: "#0e0e13",
  surface: "#131318",
  surfaceHigh: "#19191f",
  surfaceHigher: "#1f1f26",
  onSurface: "#f6f2fa",
  onSurfaceVariant: "#acaab1",
  primary: "#b6a0ff",
  secondary: "#8596ff",
};

// 底部导航配置 — 对应桌面端侧边栏功能
const NAV_ITEMS = [
  { key: "chat",      icon: "chat",              label: "对话"   },
  { key: "itinerary", icon: "map",               label: "行程"   },
  { key: "budget",    icon: "account_balance_wallet", label: "预算" },
  { key: "favorites", icon: "bookmark",          label: "收藏"   },
  { key: "more",      icon: "grid_view",         label: "更多"   },
];

// 快捷建议卡片
const QUICK_CARDS = [
  { icon: "map",                  color: "#b6a0ff", label: "行程规划", prompt: "帮我规划一个北京旅行行程" },
  { icon: "bed",                  color: "#8596ff", label: "酒店推荐", prompt: "推荐一些好的酒店" },
  { icon: "directions_car",       color: "#81ecff", label: "交通出行", prompt: "查询最优交通路线" },
  { icon: "account_balance_wallet", color: "#b6a0ff", label: "预算管理", prompt: "帮我管理旅行预算" },
];

// Markdown 渲染（与桌面端一致）
const MsgContent = ({ text, isAi }) => {
  if (!isAi) return <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{text}</span>;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        p: ({ children }) => <p style={{ margin: "0 0 10px", lineHeight: "1.8" }}>{children}</p>,
        strong: ({ children }) => <strong style={{ color: "#d4c8ff", fontWeight: "700" }}>{children}</strong>,
        em: ({ children }) => <em style={{ color: "#c4b8f0", fontStyle: "italic" }}>{children}</em>,
        ul: ({ children }) => <ul style={{ paddingLeft: "20px", margin: "8px 0", display: "flex", flexDirection: "column", gap: "4px" }}>{children}</ul>,
        ol: ({ children }) => <ol style={{ paddingLeft: "20px", margin: "8px 0", display: "flex", flexDirection: "column", gap: "4px" }}>{children}</ol>,
        li: ({ children }) => <li style={{ lineHeight: "1.7", color: "#e2e0e8" }}>{children}</li>,
        h1: ({ children }) => (
          <h1 style={{ fontSize: "17px", fontWeight: "800", color: "#e8e0ff", margin: "14px 0 7px",
            paddingBottom: "6px", borderBottom: "1px solid rgba(167,139,250,0.25)",
            fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#d4c8ff", margin: "12px 0 5px",
            display: "flex", alignItems: "center", gap: "6px",
            fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            <span style={{ width: "3px", height: "15px", background: "linear-gradient(to bottom,#b6a0ff,#7e51ff)",
              borderRadius: "2px", display: "inline-block", flexShrink: 0 }}/>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#c4b8f0", margin: "10px 0 4px" }}>{children}</h3>
        ),
        code: ({ inline, children }) => inline
          ? <code style={{ background: "rgba(167,139,250,0.18)", color: "#c4b8f0", padding: "2px 7px", borderRadius: "5px", fontSize: "12px", fontFamily: "'Courier New',monospace" }}>{children}</code>
          : <pre style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(167,139,250,0.15)", padding: "12px 14px", borderRadius: "10px", overflow: "auto", margin: "10px 0" }}>
              <code style={{ fontSize: "12px", color: "#c4b8f0", fontFamily: "'Courier New',monospace", lineHeight: "1.6" }}>{children}</code>
            </pre>,
        blockquote: ({ children }) => (
          <blockquote style={{ borderLeft: "3px solid #7c6af7", padding: "10px 14px", margin: "10px 0",
            background: "rgba(124,106,247,0.06)", borderRadius: "0 8px 8px 0", color: "#b8b5cc" }}>{children}</blockquote>
        ),
        hr: () => <hr style={{ border: "none", borderTop: "1px solid rgba(167,139,250,0.2)", margin: "12px 0" }}/>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer"
            style={{ color: "#b6a0ff", textDecoration: "underline", textDecorationColor: "rgba(182,160,255,0.4)" }}>
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div style={{ overflowX: "auto", margin: "12px -4px", borderRadius: "10px",
            border: "1px solid rgba(167,139,250,0.25)",
            boxShadow: "0 2px 12px rgba(124,106,247,0.1)" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "12px", lineHeight: "1.7", tableLayout: "auto" }}>{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead style={{ background: "linear-gradient(135deg,rgba(124,106,247,0.25),rgba(133,150,255,0.18))" }}>{children}</thead>
        ),
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr style={{ borderBottom: "1px solid rgba(167,139,250,0.1)" }}>{children}</tr>,
        th: ({ children }) => (
          <th style={{ padding: "9px 12px", textAlign: "left", color: "#c4b8f0", fontWeight: "700",
            fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em",
            borderBottom: "2px solid rgba(167,139,250,0.35)", whiteSpace: "nowrap",
            borderRight: "1px solid rgba(167,139,250,0.1)" }}>{children}</th>
        ),
        td: ({ children }) => (
          <td style={{ padding: "9px 12px", color: "#e2e0e8", verticalAlign: "top",
            lineHeight: "1.7", minWidth: "60px",
            borderRight: "1px solid rgba(255,255,255,0.04)" }}>{children}</td>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

// 抽屉菜单（"更多"页面）
const MoreDrawer = ({ onViewChange, onNewChat, onLogout, username, createTime, token, onClose, onSelectSession }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch(`${API}/chat/history/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setHistory)
      .catch(() => {});
  }, [token]);

  const items = [
    { icon: "add_circle",  label: "新建对话",  action: () => { onNewChat(); onClose(); } },
    { icon: "history",     label: "历史对话",  action: null },
    { icon: "explore",     label: "目的地探索", action: () => { onViewChange("destinations"); onClose(); } },
    { icon: "public",      label: "世界地图",  action: () => { onViewChange("worldmap"); onClose(); } },
    { icon: "footprint",   label: "旅行足迹",  action: () => { onViewChange("footprint"); onClose(); } },
    { icon: "bar_chart",   label: "旅行统计",  action: () => { onViewChange("stats"); onClose(); } },
    { icon: "recommend",   label: "智能推荐",  action: () => { onViewChange("recommend"); onClose(); } },
    { icon: "concierge",   label: "礼宾服务",  action: () => { onViewChange("concierge"); onClose(); } },
    { icon: "help_outline",label: "帮助中心",  action: () => { onViewChange("help"); onClose(); } },
    { icon: "settings",    label: "设置",      action: () => { onViewChange("settings"); onClose(); } },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
    }} onClick={onClose}>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: C.surface,
        borderRadius: "24px 24px 0 0",
        padding: "12px 0 32px",
        maxHeight: "80dvh",
        overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>
        {/* 拖动条 */}
        <div style={{ width: "40px", height: "4px", background: "#48474d", borderRadius: "2px", margin: "0 auto 20px" }} />

        {/* 用户信息 */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: C.surfaceHigh, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ color: C.onSurfaceVariant, fontSize: "22px" }}>person</span>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: "700", color: C.onSurface, fontSize: "15px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{username || "旅行者"}</p>
            <p style={{ margin: 0, fontSize: "12px", color: C.onSurfaceVariant }}>
              {createTime ? `${new Date(createTime).getFullYear()}年加入` : "新用户"}
            </p>
          </div>
        </div>

        {/* 菜单项 */}
        <div style={{ padding: "8px 0" }}>
          {items.map((item, i) => (
            <button key={i} onClick={item.action || undefined} style={{
              display: "flex", alignItems: "center", gap: "14px",
              width: "100%", padding: "14px 20px",
              background: "none", border: "none", cursor: item.action ? "pointer" : "default",
              color: item.action ? C.onSurface : C.onSurfaceVariant,
              fontSize: "15px", fontFamily: "'Manrope',sans-serif", textAlign: "left",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "22px", color: item.action ? C.primary : C.onSurfaceVariant }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          {/* 历史对话列表 */}
          {history.length > 0 && (
            <div style={{ padding: "0 20px", marginTop: "4px" }}>
              <p style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>最近对话</p>
              {history.slice(0, 5).map(s => (
                <button key={s.thread_id} onClick={() => { onSelectSession(s.thread_id); onClose(); }} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  width: "100%", padding: "10px 0",
                  background: "none", border: "none", cursor: "pointer",
                  color: C.onSurfaceVariant, fontSize: "14px", fontFamily: "'Manrope',sans-serif", textAlign: "left",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chat_bubble</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 退出 */}
        <div style={{ padding: "8px 20px 0", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "8px" }}>
          <button onClick={onLogout} style={{
            display: "flex", alignItems: "center", gap: "14px",
            width: "100%", padding: "14px 0",
            background: "none", border: "none", cursor: "pointer",
            color: "#ff6e84", fontSize: "15px", fontFamily: "'Manrope',sans-serif",
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>logout</span>
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
};

// 主组件
const MobileChat = ({ onLogout, token, username, createTime, preloaded, onRefreshPreload }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
        })
  );
  const [sessionTitle, setSessionTitle] = useState("");
  const [pendingApproval, setPendingApproval] = useState(false);
  const [view, setView] = useState("chat");
  const [showMore, setShowMore] = useState(false);
  const [bookings, setBookings] = useState({ flights: [], hotels: [], cars: [] });
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tm_favorites") || "[]"); } catch { return []; }
  });
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const endRef = useRef(null);
  const sendingRef = useRef(false);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // 拦截 Android 返回键：非 chat 视图时返回 chat，而不是退出
  useEffect(() => {
    if (view !== "chat") {
      window.history.pushState({ view }, "");
    }
    const handlePop = () => {
      setView("chat");
      setShowMore(false);
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, [view]);

  // 加载订单（优先预加载数据）
  const loadBookings = useCallback(async () => {
    if (preloaded?.loaded && preloaded?.bookings) { setBookings(preloaded.bookings); return; }
    try {
      const res = await fetch(`${API}/user/bookings/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setBookings(await res.json());
    } catch {}
  }, [token, preloaded]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  const saveSession = useCallback(async (msgs, title) => {
    if (!msgs.length) return;
    try {
      await fetch(`${API}/chat/save/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
          config: { configurable: { passenger_id: "", thread_id: threadId } },
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
        const lines = decoder.decode(value, { stream: true }).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.delta) {
              fullText += data.delta;
              if (!aiMsgInserted) {
                aiMsgInserted = true;
                setLoading(false);
                setMessages([...currentMsgs, { id: aiMsgId, content: fullText, sender: "ai" }]);
              } else {
                setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, content: fullText } : m));
              }
            }
            if (data.suggestions) {
              setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, suggestions: data.suggestions } : m));
            }
            if (data.interrupt) interrupted = true;
            if (data.done) break;
          } catch {}
        }
      }
      if (interrupted) setPendingApproval(true);
      else setPendingApproval(false);
      if (!aiMsgInserted) setMessages([...currentMsgs, { id: aiMsgId, content: "", sender: "ai" }]);

      const successKeywords = ["成功预定", "成功预订", "预订成功", "预定成功", "成功取消", "成功更新"];
      if (successKeywords.some(k => fullText.includes(k))) loadBookings();

      const newMsgs = [...currentMsgs, { id: aiMsgId, content: fullText, sender: "ai" }];
      const title = sessionTitle || currentMsgs[0]?.content?.slice(0, 20) || "新对话";
      if (!sessionTitle) setSessionTitle(title);
      saveSession(newMsgs, title);
    } catch (e) {
      setMessages(prev => {
        const has = prev.some(m => m.id === aiMsgId);
        if (has) return prev.map(m => m.id === aiMsgId ? { ...m, content: `连接失败：${e.message}` } : m);
        return [...prev, { id: aiMsgId, content: `连接失败：${e.message}`, sender: "ai" }];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (text) => {
    const content = (typeof text === "string" ? text : input).trim();
    if (!content || loading || sendingRef.current) return;
    sendingRef.current = true;
    const newMsgs = [...messages, { id: Date.now(), content, sender: "user" }];
    setMessages(newMsgs);
    setInput("");
    callApi(content, newMsgs).finally(() => { sendingRef.current = false; });
  };

  const handleApprove = () => {
    const newMsgs = [...messages, { id: Date.now(), content: "y", sender: "user" }];
    setMessages(newMsgs);
    setPendingApproval(false);
    callApi("y", newMsgs);
  };

  const handleReject = () => {
    const newMsgs = [...messages, { id: Date.now(), content: "取消操作", sender: "user" }];
    setMessages(newMsgs);
    setPendingApproval(false);
    callApi("取消操作", newMsgs);
  };

  const handleNewChat = () => {
    setMessages([]); setInput(""); setPendingApproval(false);
    setThreadId(typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0;
          return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
        }));
    setSessionTitle("");
    setView("chat");
  };

  const handleToggleFav = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem("tm_favorites", JSON.stringify(next));
      return next;
    });
  };

  const handleChatFromView = (text) => {
    setView("chat");
    setTimeout(() => handleSend(text), 100);
  };

  const handleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("当前浏览器不支持语音输入"); return; }
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const rec = new SR();
    rec.lang = "zh-CN"; rec.continuous = false; rec.interimResults = true;
    recognitionRef.current = rec;
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => setInput(Array.from(e.results).map(r => r[0].transcript).join(""));
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.start();
  };

  // 加载历史会话
  const handleSelectSession = async (tid) => {
    try {
      const res = await fetch(`${API}/chat/history/${tid}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const msgs = (data.messages || []).map((m, i) => ({ id: i, content: m.content, sender: m.role }));
      setMessages(msgs);
      setThreadId(tid);
      setSessionTitle(data.title || "");
      setView("chat");
    } catch {}
  };

  const handleNavClick = (key) => {
    if (key === "more") { setShowMore(true); return; }
    setView(key);
  };

  const isNew = messages.length === 0;

  // 渲染非聊天视图
  const renderView = () => {
    switch (view) {
      case "budget":       return <BudgetView token={token} preloaded={preloaded} onRefreshPreload={onRefreshPreload} />;
      case "favorites":    return <FavoritesView token={token} favorites={favorites} onToggleFav={handleToggleFav} onChat={handleChatFromView} />;
      case "itinerary":    return <ItineraryView token={token} bookings={bookings} onChat={handleChatFromView} />;
      case "stats":        return <StatsView token={token} preloaded={preloaded} />;
      case "settings":     return <SettingsView token={token} username={username} createTime={createTime} onLogout={onLogout} />;
      case "destinations": return <DestinationsView onChat={handleChatFromView} favorites={favorites} onToggleFav={handleToggleFav} />;
      case "worldmap":     return <WorldMapView favorites={favorites} onToggleFav={handleToggleFav} onChat={handleChatFromView} />;
      case "footprint":    return <FootprintView />;
      case "recommend":    return <RecommendView favorites={favorites} onChat={handleChatFromView} />;
      case "concierge":    return <ConciergeView onChat={handleChatFromView} />;
      case "help":         return <HelpView onChat={handleChatFromView} />;
      default:             return null;
    }
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100dvh", background: C.bg,
      fontFamily: "'Manrope', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      {/* 顶部导航栏 */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999,
        height: "60px",
        background: "rgba(14,14,19,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px",
      }}>
        <button onClick={handleNewChat} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", color: C.onSurfaceVariant, display: "flex" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>add_circle</span>
        </button>
        <h1 style={{
          margin: 0, fontSize: "18px", fontWeight: "800",
          background: "linear-gradient(to right,#b6a0ff,#8596ff)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          fontFamily: "'Plus Jakarta Sans',sans-serif",
        }}>途灵 TripMind</h1>
        <button onClick={() => setShowMore(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px", color: C.onSurfaceVariant, display: "flex" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>menu</span>
        </button>
      </header>

      {/* 主内容区 */}
      <main style={{ flex: 1, overflowY: "auto", paddingTop: "60px", paddingBottom: "72px" }}>
        {view !== "chat" ? (
          <div style={{ padding: "16px" }}>
            {/* 返回按钮 */}
            <button onClick={() => setView("chat")} style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "none", border: "none", cursor: "pointer",
              color: C.primary, fontSize: "14px", fontWeight: "600",
              padding: "8px 0", marginBottom: "8px",
              fontFamily: "'Manrope',sans-serif",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_back</span>
              返回对话
            </button>
            {renderView()}
          </div>
        ) : (
          <>
            {/* 欢迎页 */}
            {isNew && (
              <div style={{ padding: "32px 20px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  display: "inline-block", padding: "6px 14px", marginBottom: "20px",
                  borderRadius: "9999px", background: "rgba(41,60,160,0.4)",
                  color: C.primary, fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase",
                }}>AI 助手已就绪</div>
                <h2 style={{
                  fontSize: "28px", fontWeight: "800", textAlign: "center",
                  color: C.onSurface, lineHeight: "1.2", marginBottom: "12px",
                  fontFamily: "'Plus Jakarta Sans',sans-serif",
                }}>
                  想去哪里<br />
                  <span style={{ background: "linear-gradient(to right,#b6a0ff,#8596ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    探索？
                  </span>
                </h2>
                <p style={{ color: C.onSurfaceVariant, textAlign: "center", fontSize: "14px", lineHeight: "1.6", marginBottom: "28px", maxWidth: "280px" }}>
                  你的专属 AI 旅行顾问，随时为你打造难忘旅程。
                </p>
                {/* 快捷卡片 2x2 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", width: "100%" }}>
                  {QUICK_CARDS.map((card, i) => (
                    <button key={i} onClick={() => handleSend(card.prompt)} style={{
                      background: C.surface, borderRadius: "20px", border: "none",
                      padding: "20px 16px", textAlign: "left", cursor: "pointer",
                      display: "flex", flexDirection: "column", gap: "12px",
                      minHeight: "120px", transition: "background 0.2s",
                    }}
                      onTouchStart={e => e.currentTarget.style.background = C.surfaceHigh}
                      onTouchEnd={e => e.currentTarget.style.background = C.surface}
                    >
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "12px",
                        background: `${card.color}18`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "22px", color: card.color }}>{card.icon}</span>
                      </div>
                      <div>
                        <p style={{ margin: "0 0 2px", fontSize: "11px", color: C.onSurfaceVariant, fontWeight: "500" }}>快捷入口</p>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: C.onSurface }}>{card.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 消息列表 */}
            {!isNew && (
              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {messages.map((msg, idx) => {
                  const isLastAi = msg.sender === "ai" && idx === messages.length - 1 && !loading;
                  return (
                    <div key={msg.id}>
                      <div style={{
                        display: "flex", gap: "10px",
                        flexDirection: msg.sender === "user" ? "row-reverse" : "row",
                        alignItems: "flex-start",
                      }}>
                        <div style={{
                          flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: msg.sender === "ai" ? "linear-gradient(135deg,#b6a0ff,#7e51ff)" : C.surfaceHigh,
                          marginTop: "2px",
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "13px", color: "white", fontVariationSettings: "'FILL' 1" }}>
                            {msg.sender === "ai" ? "auto_awesome" : "person"}
                          </span>
                        </div>
                        <div style={{
                          maxWidth: "85%", padding: "10px 14px",
                          borderRadius: msg.sender === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                          fontSize: "14px", lineHeight: "1.7", wordBreak: "break-word",
                          background: msg.sender === "user" ? "rgba(120,80,255,0.25)" : "rgba(18,14,32,0.9)",
                          border: msg.sender === "user" ? "1px solid rgba(129,140,248,0.25)" : "1px solid rgba(255,255,255,0.06)",
                          color: C.onSurface,
                        }}>
                          <MsgContent text={msg.content} isAi={msg.sender === "ai"} />
                        </div>
                      </div>
                      {/* 推荐追问 */}
                      {isLastAi && msg.suggestions?.length > 0 && (
                        <div style={{ paddingLeft: "38px", marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {msg.suggestions.map((s, i) => (
                            <button key={i} onClick={() => handleSend(s)}
                              style={{ padding: "7px 16px", borderRadius: "9999px", fontSize: "12px", fontWeight: "600",
                                cursor: "pointer", border: "1px solid rgba(182,160,255,0.35)",
                                background: "rgba(182,160,255,0.08)", color: "#c4b8f0",
                                fontFamily: "'Manrope',sans-serif", display: "flex", alignItems: "center", gap: "5px" }}>
                              <span style={{ fontSize: "10px", opacity: 0.6 }}>✦</span>
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 加载动画 */}
                {loading && (
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ flexShrink: 0, width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg,#b6a0ff,#7e51ff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "13px", color: "white", fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    </div>
                    <div style={{ padding: "12px 14px", borderRadius: "4px 16px 16px 16px", background: C.surface, border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                        {[0, 150, 300].map(d => (
                          <div key={d} className="animate-bounce" style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.primary, animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 待审批操作 */}
                {pendingApproval && (
                  <div style={{ background: "rgba(255,200,0,0.08)", border: "1px solid rgba(255,200,0,0.2)", borderRadius: "16px", padding: "16px" }}>
                    <p style={{ margin: "0 0 12px", fontSize: "13px", color: "#fbbf24", fontWeight: "600" }}>🔒 需要你的确认才能继续操作</p>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={handleApprove} style={{
                        flex: 1, padding: "10px", borderRadius: "10px",
                        background: "linear-gradient(to right,#b6a0ff,#7e51ff)",
                        border: "none", color: "#340090", fontWeight: "700", fontSize: "14px", cursor: "pointer",
                        fontFamily: "'Manrope',sans-serif",
                      }}>✅ 确认</button>
                      <button onClick={handleReject} style={{
                        flex: 1, padding: "10px", borderRadius: "10px",
                        background: C.surfaceHigh, border: "none", color: "#ff6e84",
                        fontWeight: "700", fontSize: "14px", cursor: "pointer",
                        fontFamily: "'Manrope',sans-serif",
                      }}>🚫 拒绝</button>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>
            )}
          </>
        )}
      </main>

      {/* 底部输入框（仅聊天视图显示） */}
      {view === "chat" && (
        <footer style={{
          position: "fixed", bottom: "72px", left: 0, right: 0, zIndex: 9998,
          padding: "8px 16px",
          background: "rgba(14,14,19,0.9)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="告诉我你的旅行梦想..."
                style={{
                  width: "100%", height: "48px",
                  background: C.surfaceHigh, border: "none", borderRadius: "9999px",
                  paddingLeft: "20px", paddingRight: "52px",
                  color: C.onSurface, fontSize: "14px",
                  outline: "none", boxSizing: "border-box",
                  fontFamily: "'Manrope',sans-serif",
                }}
              />
              <button onClick={handleSend} disabled={!input.trim() || loading} style={{
                position: "absolute", right: "4px",
                width: "40px", height: "40px", borderRadius: "50%",
                background: input.trim() ? "linear-gradient(135deg,#b6a0ff,#7e51ff)" : C.surfaceHigher,
                border: "none", cursor: input.trim() ? "pointer" : "default",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background 0.2s",
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px", color: input.trim() ? "#340090" : C.onSurfaceVariant, fontVariationSettings: "'FILL' 1" }}>send</span>
              </button>
            </div>
            <button onClick={handleVoice} style={{
              width: "48px", height: "48px", borderRadius: "14px",
              background: isListening ? "rgba(182,160,255,0.2)" : C.surfaceHigh,
              border: isListening ? "1px solid rgba(182,160,255,0.4)" : "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "22px", color: isListening ? C.primary : C.onSurfaceVariant }}>mic</span>
            </button>
          </div>
        </footer>
      )}

      {/* 底部导航栏 */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
        height: "72px",
        background: "rgba(14,14,19,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        {NAV_ITEMS.map(item => {
          const isActive = item.key === "more" ? showMore : (view === item.key && !showMore);
          return (
            <button key={item.key} onClick={() => handleNavClick(item.key)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: "3px", height: "100%",
              background: "none", border: "none", cursor: "pointer",
              color: isActive ? C.primary : C.onSurfaceVariant,
              transition: "color 0.2s",
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: "22px",
                fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                transition: "font-variation-settings 0.2s",
              }}>{item.icon}</span>
              <span style={{ fontSize: "10px", fontWeight: isActive ? "700" : "500" }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 更多抽屉 */}
      {showMore && (
        <MoreDrawer
          onViewChange={(v) => { setView(v); setShowMore(false); }}
          onNewChat={handleNewChat}
          onLogout={onLogout}
          username={username}
          createTime={createTime}
          token={token}
          onClose={() => setShowMore(false)}
          onSelectSession={handleSelectSession}
        />
      )}
    </div>
  );
};

export default MobileChat;
