import React, { useState } from "react";

const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

const C = {
  surfaceContainer: "#19191f",
  surfaceContainerHigh: "#1f1f26",
  onSurface: "#f6f2fa",
  onSurfaceVariant: "#acaab1",
  primary: "#b6a0ff",
};

const Section = ({ title, children }) => (
  <div style={{marginBottom:"28px"}}>
    <p style={{fontSize:"11px",fontWeight:"700",color:C.primary,textTransform:"uppercase",
      letterSpacing:"0.12em",marginBottom:"12px"}}>{title}</p>
    <div style={{borderRadius:"14px",background:C.surfaceContainer,border:"1px solid rgba(255,255,255,0.06)",overflow:"hidden"}}>
      {children}
    </div>
  </div>
);

const Row = ({ icon, label, value, onClick, last, danger }) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
    padding:"14px 16px",
    borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.04)",
    cursor: onClick ? "pointer" : "default"}}
    onClick={onClick}
    onMouseEnter={e=>{ if(onClick) e.currentTarget.style.background="rgba(255,255,255,0.03)"; }}
    onMouseLeave={e=>{ if(onClick) e.currentTarget.style.background="transparent"; }}>
    <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
      <span className="material-symbols-outlined" style={{color: danger ? "#ff6e84" : C.onSurfaceVariant, fontSize:"20px"}}>{icon}</span>
      <span style={{fontSize:"14px",color: danger ? "#ff6e84" : C.onSurface}}>{label}</span>
    </div>
    {value && <span style={{fontSize:"13px",color:C.onSurfaceVariant}}>{value}</span>}
    {onClick && !value && <span className="material-symbols-outlined" style={{color: danger ? "#ff6e84" : C.onSurfaceVariant,fontSize:"18px"}}>chevron_right</span>}
  </div>
);

// 修改密码弹窗（邮箱验证）
const ChangePwdModal = ({ token, onClose }) => {
  const [email, setEmail] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const inputStyle = {
    width:"100%",height:"44px",background:"#131318",border:"none",borderRadius:"10px",
    padding:"0 14px",color:C.onSurface,fontSize:"14px",outline:"none",boxSizing:"border-box",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPwd !== confirm) { setMsg("两次新密码不一致"); return; }
    if (newPwd.length < 6) { setMsg("新密码至少6位"); return; }
    setLoading(true); setMsg("");
    try {
      const res = await fetch(`${API}/user/change_password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email, new_password: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.detail || "修改失败"); return; }
      setMsg("✅ 密码修改成功");
      setTimeout(onClose, 1200);
    } catch { setMsg("网络错误，请重试"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.7)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:"24px"}}
      onClick={onClose}>
      <div style={{width:"100%",maxWidth:"400px",background:"#19191f",borderRadius:"20px",
        padding:"24px",border:"1px solid rgba(255,255,255,0.08)"}}
        onClick={e=>e.stopPropagation()}>
        <h3 style={{margin:"0 0 6px",fontSize:"18px",fontWeight:"700",color:C.onSurface,
          fontFamily:"'Plus Jakarta Sans',sans-serif"}}>修改密码</h3>
        <p style={{margin:"0 0 16px",fontSize:"13px",color:C.onSurfaceVariant}}>输入注册时绑定的邮箱验证身份</p>
        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          <input type="email" placeholder="注册时绑定的邮箱" value={email} onChange={e=>setEmail(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="新密码（至少6位）" value={newPwd} onChange={e=>setNewPwd(e.target.value)} required style={inputStyle} />
          <input type="password" placeholder="确认新密码" value={confirm} onChange={e=>setConfirm(e.target.value)} required style={inputStyle} />
          {msg && <p style={{margin:0,fontSize:"13px",color:msg.startsWith("✅")?"#4ade80":"#ff6e84"}}>{msg}</p>}
          <div style={{display:"flex",gap:"10px",marginTop:"4px"}}>
            <button type="button" onClick={onClose} style={{flex:1,height:"44px",borderRadius:"10px",border:"none",cursor:"pointer",background:"rgba(255,255,255,0.06)",color:C.onSurfaceVariant,fontSize:"14px",fontFamily:"'Manrope',sans-serif"}}>取消</button>
            <button type="submit" disabled={loading} style={{flex:1,height:"44px",borderRadius:"10px",border:"none",cursor:"pointer",background:"linear-gradient(to right,#b6a0ff,#7e51ff)",color:"#340090",fontSize:"14px",fontWeight:"700",fontFamily:"'Manrope',sans-serif",opacity:loading?0.7:1}}>
              {loading?"保存中...":"保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SettingsView = ({ username, createTime, token, onLogout }) => {
  const [showChangePwd, setShowChangePwd] = useState(false);

  // 清除对话历史
  const handleClearHistory = async () => {
    if (!window.confirm("确定要清除所有对话历史吗？此操作不可恢复。")) return;
    try {
      const res = await fetch(`${API}/chat/history/clear/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) alert("对话历史已清除");
      else alert("清除失败，请重试");
    } catch { alert("网络错误，请重试"); }
  };

  // 导出对话历史
  const handleExport = async () => {
    try {
      const res = await fetch(`${API}/chat/history/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { alert("获取数据失败"); return; }
      const list = await res.json();
      if (!list.length) { alert("暂无对话历史可导出"); return; }

      // 逐条获取详情
      const details = await Promise.all(
        list.map(s => fetch(`${API}/chat/history/${s.thread_id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()).catch(() => null))
      );

      let text = `途灵 TripMind 对话历史导出\n用户：${username}\n导出时间：${new Date().toLocaleString("zh-CN")}\n${"=".repeat(50)}\n\n`;
      details.filter(Boolean).forEach(d => {
        text += `【${d.title || "对话"}】${d.updated_at ? new Date(d.updated_at).toLocaleString("zh-CN") : ""}\n`;
        (d.messages || []).forEach(m => {
          text += `${m.role === "user" ? "我" : "AI"}：${m.content}\n`;
        });
        text += "\n" + "-".repeat(40) + "\n\n";
      });

      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `tripmind_history_${Date.now()}.txt`;
      a.click(); URL.revokeObjectURL(url);
    } catch { alert("导出失败，请重试"); }
  };

  // 注销账号
  const handleDeleteAccount = async () => {
    const input = window.prompt("此操作不可恢复！\n请输入你的用户名确认注销账号：");
    if (input !== username) { if (input !== null) alert("用户名不匹配，已取消"); return; }
    try {
      const res = await fetch(`${API}/user/delete_account/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { alert("账号已注销"); onLogout(); }
      else alert("注销失败，请重试");
    } catch { alert("网络错误，请重试"); }
  };

  return (
    <div style={{flex:1,overflowY:"auto",paddingTop:"80px",paddingBottom:"40px"}}>
      <div style={{maxWidth:"600px",margin:"0 auto",padding:"24px 32px"}}>
        <div style={{marginBottom:"28px"}}>
          <h2 className="headline-font" style={{fontSize:"24px",fontWeight:"700",color:C.onSurface,marginBottom:"8px"}}>旅行设置</h2>
          <p style={{fontSize:"14px",color:C.onSurfaceVariant}}>管理你的账号与数据</p>
        </div>

        <Section title="账号信息">
          <Row icon="person" label="用户名" value={username || "旅行者"} />
          <Row icon="calendar_today" label="注册时间" value={createTime ? new Date(createTime).toLocaleDateString("zh-CN") : "—"} />
          <Row icon="lock" label="修改密码" onClick={() => setShowChangePwd(true)} last />
        </Section>

        <Section title="数据管理">
          <Row icon="download" label="导出对话历史" onClick={handleExport} />
          <Row icon="history" label="清除对话历史" onClick={handleClearHistory} />
          <Row icon="logout" label="退出登录" onClick={onLogout} last />
        </Section>

        <Section title="危险操作">
          <Row icon="delete_forever" label="注销账号" onClick={handleDeleteAccount} danger last />
        </Section>

        <Section title="关于">
          <Row icon="info" label="版本" value="v1.0" />
          <Row icon="smart_toy" label="AI 模型" value="Qwen-Plus" last />
        </Section>
      </div>

      {showChangePwd && <ChangePwdModal token={token} onClose={() => setShowChangePwd(false)} />}
    </div>
  );
};

export default SettingsView;
