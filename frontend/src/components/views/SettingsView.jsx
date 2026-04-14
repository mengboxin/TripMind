import React, { useState } from "react";

const C = {
  surfaceContainer: "#19191f",
  surfaceContainerHigh: "#1f1f26",
  onSurface: "#f6f2fa",
  onSurfaceVariant: "#acaab1",
  primary: "#b6a0ff",
  secondary: "#8596ff",
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

const Row = ({ icon, label, value, onClick, toggle, toggled }) => (
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",
    borderBottom:"1px solid rgba(255,255,255,0.04)",cursor: onClick ? "pointer" : "default"}}
    onClick={onClick}
    onMouseEnter={e=>{ if(onClick) e.currentTarget.style.background="rgba(255,255,255,0.03)"; }}
    onMouseLeave={e=>{ if(onClick) e.currentTarget.style.background="transparent"; }}>
    <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
      <span className="material-symbols-outlined" style={{color:C.onSurfaceVariant,fontSize:"20px"}}>{icon}</span>
      <span style={{fontSize:"14px",color:C.onSurface}}>{label}</span>
    </div>
    {toggle !== undefined ? (
      <div onClick={e=>{e.stopPropagation();toggle();}}
        style={{width:"44px",height:"24px",borderRadius:"9999px",cursor:"pointer",transition:"background 0.2s",
          background: toggled ? C.primary : "#2a2a35",position:"relative"}}>
        <div style={{position:"absolute",top:"3px",left: toggled ? "23px" : "3px",width:"18px",height:"18px",
          borderRadius:"50%",background:"white",transition:"left 0.2s"}} />
      </div>
    ) : value ? (
      <span style={{fontSize:"13px",color:C.onSurfaceVariant}}>{value}</span>
    ) : onClick ? (
      <span className="material-symbols-outlined" style={{color:C.onSurfaceVariant,fontSize:"18px"}}>chevron_right</span>
    ) : null}
  </div>
);

const SettingsView = ({ username }) => {
  const [notif, setNotif] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [lang, setLang] = useState("中文");
  const [currency, setCurrency] = useState("CNY");

  return (
    <div style={{flex:1,overflowY:"auto",paddingTop:"80px",paddingBottom:"40px"}}>
      <div style={{maxWidth:"600px",margin:"0 auto",padding:"24px 32px"}}>
        <div style={{marginBottom:"28px"}}>
          <h2 className="headline-font" style={{fontSize:"24px",fontWeight:"700",color:C.onSurface,marginBottom:"8px"}}>旅行设置</h2>
          <p style={{fontSize:"14px",color:C.onSurfaceVariant}}>个性化你的旅行助手体验</p>
        </div>

        <Section title="账号">
          <Row icon="person" label="用户名" value={username || "旅行者"} />
          <Row icon="lock" label="修改密码" onClick={()=>{}} />
          <Row icon="mail" label="绑定邮箱" onClick={()=>{}} />
        </Section>

        <Section title="偏好设置">
          <Row icon="language" label="界面语言" value={lang} onClick={()=>setLang(lang==="中文"?"English":"中文")} />
          <Row icon="payments" label="货币单位" value={currency} onClick={()=>setCurrency(currency==="CNY"?"USD":"CNY")} />
          <Row icon="dark_mode" label="深色模式" toggle={()=>setDarkMode(!darkMode)} toggled={darkMode} />
        </Section>

        <Section title="通知">
          <Row icon="notifications" label="订单通知" toggle={()=>setNotif(!notif)} toggled={notif} />
          <Row icon="save" label="自动保存对话" toggle={()=>setAutoSave(!autoSave)} toggled={autoSave} />
        </Section>

        <Section title="旅行偏好">
          <Row icon="flight_class" label="默认舱位" value="经济舱" onClick={()=>{}} />
          <Row icon="hotel_class" label="酒店星级偏好" value="3-4星" onClick={()=>{}} />
          <Row icon="directions_car" label="出行方式偏好" value="公共交通" onClick={()=>{}} />
        </Section>

        <Section title="数据与隐私">
          <Row icon="history" label="清除对话历史" onClick={()=>alert("功能开发中")} />
          <Row icon="download" label="导出我的数据" onClick={()=>alert("功能开发中")} />
          <Row icon="delete_forever" label="注销账号" onClick={()=>alert("功能开发中")} />
        </Section>
      </div>
    </div>
  );
};

export default SettingsView;
