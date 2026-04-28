import React, { useState, useRef } from "react";

const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

const MobileRegister = ({ onRegister, onSwitchToLogin }) => {
  const [email, setEmail]       = useState("");
  const [otp, setOtp]           = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent]   = useState(false);
  const [countdown, setCountdown]   = useState(0);
  const [error, setError]       = useState("");
  const timerRef = useRef(null);

  const startCountdown = () => {
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown(v => {
        if (v <= 1) { clearInterval(timerRef.current); return 0; }
        return v - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!email) { setError("请先填写邮箱"); return; }
    setOtpLoading(true); setError("");
    try {
      const res = await fetch(`${API}/send_otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, scene: "register" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "发送失败，请重试"); return; }
      setOtpSent(true);
      startCountdown();
    } catch { setError("网络错误，请重试"); }
    finally { setOtpLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("两次密码不一致"); return; }
    if (!otp) { setError("请输入验证码"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "注册失败，请重试"); return; }
      const loginRes = await fetch(`${API}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      const loginData = await loginRes.json();
      onRegister && onRegister({ token: loginData.token, username: loginData.username, create_time: loginData.create_time });
    } catch { setError("无法连接服务器，请检查网络"); }
    finally { setLoading(false); }
  };

  const fieldStyle = {
    width:"100%",height:"52px",background:"#131318",border:"none",borderRadius:"12px",
    paddingLeft:"44px",paddingRight:"16px",color:"#f6f2fa",fontSize:"15px",
    outline:"none",boxSizing:"border-box",transition:"background 0.2s",
  };

  const Field = ({ label, icon, type="text", value, onChange, placeholder, maxLength }) => (
    <div>
      <label style={{display:"block",fontSize:"11px",fontWeight:"700",letterSpacing:"0.1em",
        textTransform:"uppercase",color:"#acaab1",marginBottom:"8px",paddingLeft:"4px"}}>{label}</label>
      <div style={{position:"relative"}}>
        <span className="material-symbols-outlined" style={{
          position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",
          color:"rgba(182,160,255,0.6)",fontSize:"20px",pointerEvents:"none"}}>{icon}</span>
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
          maxLength={maxLength} required style={fieldStyle}
          onFocus={e=>e.target.style.background="#19191f"}
          onBlur={e=>e.target.style.background="#131318"} />
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100dvh",background:"#0e0e13",display:"flex",flexDirection:"column",
      justifyContent:"center",alignItems:"center",padding:"24px",
      position:"relative",overflow:"hidden",fontFamily:"'Manrope',sans-serif"}}>
      <div style={{position:"fixed",top:"-10%",left:"-10%",width:"60%",height:"60%",
        background:"rgba(182,160,255,0.08)",borderRadius:"50%",filter:"blur(120px)",pointerEvents:"none"}} />

      <div style={{width:"100%",maxWidth:"400px",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:"32px"}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",
            width:"64px",height:"64px",borderRadius:"20px",background:"#19191f",
            boxShadow:"0 16px 32px rgba(182,160,255,0.15)",marginBottom:"16px"}}>
            <span className="material-symbols-outlined" style={{fontSize:"32px",color:"#b6a0ff",fontVariationSettings:"'FILL' 1"}}>psychology</span>
          </div>
          <h1 style={{fontSize:"28px",fontWeight:"800",
            background:"linear-gradient(to right,#b6a0ff,#8596ff)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            fontFamily:"'Plus Jakarta Sans',sans-serif",margin:0}}>TripMind</h1>
        </div>

        <div style={{marginBottom:"24px"}}>
          <h2 style={{fontSize:"28px",fontWeight:"800",color:"#f6f2fa",margin:"0 0 6px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>创建账号</h2>
          <p style={{color:"#acaab1",margin:0,fontSize:"15px"}}>用邮箱验证，开启智能旅行之旅。</p>
        </div>

        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"16px"}}>
          {/* 邮箱 + 发送验证码 */}
          <div>
            <label style={{display:"block",fontSize:"11px",fontWeight:"700",letterSpacing:"0.1em",
              textTransform:"uppercase",color:"#acaab1",marginBottom:"8px",paddingLeft:"4px"}}>邮箱</label>
            <div style={{display:"flex",gap:"8px"}}>
              <div style={{position:"relative",flex:1}}>
                <span className="material-symbols-outlined" style={{
                  position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",
                  color:"rgba(182,160,255,0.6)",fontSize:"20px",pointerEvents:"none"}}>alternate_email</span>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                  placeholder="your@email.com" style={fieldStyle}
                  onFocus={e=>e.target.style.background="#19191f"}
                  onBlur={e=>e.target.style.background="#131318"} />
              </div>
              <button type="button" onClick={handleSendOtp} disabled={otpLoading || countdown > 0}
                style={{flexShrink:0,padding:"0 14px",borderRadius:"12px",border:"none",cursor:"pointer",
                  background:countdown>0?"#1e1e26":"linear-gradient(to right,#b6a0ff,#7e51ff)",
                  color:countdown>0?"#acaab1":"#340090",fontSize:"12px",fontWeight:"700",
                  whiteSpace:"nowrap",fontFamily:"'Manrope',sans-serif",opacity:otpLoading?0.7:1,height:"52px"}}>
                {otpLoading ? "发送中" : countdown > 0 ? `${countdown}s` : "发送验证码"}
              </button>
            </div>
          </div>

          {/* 验证码 */}
          <Field label="邮箱验证码" icon="pin" value={otp} onChange={setOtp}
            placeholder={otpSent ? "请输入6位验证码" : "请先发送验证码"} maxLength={6} />

          {/* 密码 */}
          <Field label="密码" icon="lock" type="password" value={password} onChange={setPassword} placeholder="至少6位" />
          <Field label="确认密码" icon="lock_reset" type="password" value={confirm}
            onChange={v=>{setConfirm(v);setError("");}} placeholder="再次输入密码" />

          {error && <p style={{color:"#ff6e84",fontSize:"13px",margin:0,paddingLeft:"4px"}}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            width:"100%",height:"52px",marginTop:"4px",
            background:"linear-gradient(to right,#b6a0ff,#7e51ff)",
            border:"none",borderRadius:"9999px",color:"#340090",fontWeight:"700",fontSize:"16px",
            cursor:loading?"not-allowed":"pointer",boxShadow:"0 8px 32px rgba(182,160,255,0.25)",
            display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
            transition:"all 0.2s",opacity:loading?0.7:1,fontFamily:"'Manrope',sans-serif"}}>
            {loading ? "注册中..." : "注册"}
            {!loading && <span className="material-symbols-outlined" style={{fontSize:"20px"}}>arrow_forward</span>}
          </button>
        </form>

        <p style={{textAlign:"center",marginTop:"28px",fontSize:"14px",color:"#acaab1"}}>
          已有账号？{" "}
          <button onClick={onSwitchToLogin} style={{
            background:"none",border:"none",color:"#b6a0ff",fontWeight:"700",
            cursor:"pointer",fontSize:"14px",padding:0,fontFamily:"'Manrope',sans-serif"}}>
            立即登录
          </button>
        </p>
      </div>
    </div>
  );
};

export default MobileRegister;
