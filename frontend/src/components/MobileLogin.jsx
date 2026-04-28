import React, { useState, useRef } from "react";

const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

// 忘记密码弹窗
const ForgotPwdModal = ({ onClose }) => {
  const [step, setStep]         = useState(1);
  const [email, setEmail]       = useState("");
  const [otp, setOtp]           = useState("");
  const [newPwd, setNewPwd]     = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown]   = useState(0);
  const [err, setErr]           = useState("");
  const timerRef = useRef(null);
  const mouseDownOnMask = useRef(false);

  const startCountdown = () => {
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown(v => { if (v <= 1) { clearInterval(timerRef.current); return 0; } return v - 1; });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!email) { setErr("请先填写邮箱"); return; }
    setOtpLoading(true); setErr("");
    try {
      const res = await fetch(`${API}/send_otp/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, scene: "reset_pwd" }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.detail || "发送失败，请重试"); return; }
      startCountdown();
    } catch { setErr("网络错误，请重试"); }
    finally { setOtpLoading(false); }
  };

  const inputStyle = {
    width:"100%",height:"52px",background:"#131318",border:"none",borderRadius:"12px",
    padding:"0 16px",color:"#f6f2fa",fontSize:"15px",outline:"none",boxSizing:"border-box",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPwd !== confirm) { setErr("两次密码不一致"); return; }
    if (newPwd.length < 6) { setErr("新密码至少6位"); return; }
    if (!otp) { setErr("请输入验证码"); return; }
    setLoading(true); setErr("");
    try {
      const res = await fetch(`${API}/reset_password/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.detail || "验证失败，请重试"); return; }
      setStep(2);
    } catch { setErr("网络错误，请重试"); }
    finally { setLoading(false); }
  };

  return (
    <div
      style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",
        display:"flex",alignItems:"flex-end",justifyContent:"center"}}
      onMouseDown={e => { mouseDownOnMask.current = e.target === e.currentTarget; }}
      onMouseUp={e => { if (mouseDownOnMask.current && e.target === e.currentTarget) onClose(); mouseDownOnMask.current = false; }}
    >
      <div style={{width:"100%",maxWidth:"480px",background:"#131318",borderRadius:"24px 24px 0 0",
        padding:"24px 24px 40px",border:"1px solid rgba(255,255,255,0.08)"}} onMouseDown={e=>e.stopPropagation()}>
        <div style={{width:"40px",height:"4px",background:"#48474d",borderRadius:"2px",margin:"0 auto 20px"}} />
        {step === 1 ? (
          <>
            <h3 style={{margin:"0 0 6px",fontSize:"20px",fontWeight:"700",color:"#f6f2fa",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>重置密码</h3>
            <p style={{margin:"0 0 20px",fontSize:"13px",color:"#acaab1"}}>向注册邮箱发送验证码来重置密码</p>
            <form onSubmit={handleSubmit} autoComplete="off" style={{display:"flex",flexDirection:"column",gap:"12px"}}>
              <div style={{display:"flex",gap:"8px"}}>
                <input type="email" placeholder="注册邮箱" value={email} autoComplete="off"
                  onChange={e=>setEmail(e.target.value)} required style={{...inputStyle,flex:1}} />
                <button type="button" onClick={e=>{e.stopPropagation();handleSendOtp();}} disabled={otpLoading||countdown>0}
                  style={{flexShrink:0,padding:"0 14px",borderRadius:"12px",border:"none",cursor:"pointer",
                    background:countdown>0?"#1e1e26":"linear-gradient(to right,#b6a0ff,#7e51ff)",
                    color:countdown>0?"#acaab1":"#340090",fontSize:"12px",fontWeight:"700",
                    whiteSpace:"nowrap",fontFamily:"'Manrope',sans-serif",opacity:otpLoading?0.7:1,height:"52px"}}>
                  {otpLoading?"发送中":countdown>0?`${countdown}s`:"发送验证码"}
                </button>
              </div>
              <input placeholder="邮箱验证码" value={otp} autoComplete="one-time-code"
                onChange={e=>setOtp(e.target.value)} required maxLength={6} style={inputStyle} />
              <input type="password" placeholder="新密码（至少6位）" value={newPwd} autoComplete="new-password"
                onChange={e=>setNewPwd(e.target.value)} required style={inputStyle} />
              <input type="password" placeholder="确认新密码" value={confirm} autoComplete="new-password"
                onChange={e=>setConfirm(e.target.value)} required style={inputStyle} />
              {err && <p style={{margin:0,fontSize:"13px",color:"#ff6e84"}}>{err}</p>}
              {!err && countdown>0 && <p style={{margin:0,fontSize:"13px",color:"#34d399"}}>✓ 验证码已发送至 {email}</p>}
              <button type="submit" disabled={loading} style={{
                width:"100%",height:"52px",marginTop:"4px",
                background:"linear-gradient(to right,#b6a0ff,#7e51ff)",border:"none",borderRadius:"9999px",
                color:"#340090",fontWeight:"700",fontSize:"16px",cursor:loading?"not-allowed":"pointer",
                opacity:loading?0.7:1,fontFamily:"'Manrope',sans-serif",
              }}>{loading ? "重置中..." : "重置密码"}</button>
            </form>
          </>
        ) : (
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:"48px",marginBottom:"16px"}}>✅</div>
            <h3 style={{margin:"0 0 8px",fontSize:"18px",fontWeight:"700",color:"#f6f2fa",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>密码重置成功</h3>
            <p style={{margin:"0 0 20px",fontSize:"14px",color:"#acaab1"}}>请用新密码重新登录</p>
            <button onClick={onClose} style={{padding:"12px 40px",borderRadius:"9999px",border:"none",cursor:"pointer",background:"linear-gradient(to right,#b6a0ff,#7e51ff)",color:"#340090",fontWeight:"700",fontSize:"15px",fontFamily:"'Manrope',sans-serif"}}>去登录</button>
          </div>
        )}
      </div>
    </div>
  );
};

const MobileLogin = ({ onLogin, onSwitchToRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "登录失败，请检查账号密码"); return; }
      onLogin && onLogin({ token: data.token, username: data.username, create_time: data.create_time });
    } catch {
      setError("无法连接服务器，请检查网络");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div style={{
      minHeight: "100dvh",
      background: "#0e0e13",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Manrope', sans-serif",
    }}>
      {/* 背景光晕 */}
      <div style={{position:"fixed",top:"-10%",left:"-10%",width:"60%",height:"60%",
        background:"rgba(182,160,255,0.08)",borderRadius:"50%",filter:"blur(120px)",pointerEvents:"none"}} />
      <div style={{position:"fixed",bottom:"-10%",right:"-10%",width:"50%",height:"50%",
        background:"rgba(133,150,255,0.05)",borderRadius:"50%",filter:"blur(100px)",pointerEvents:"none"}} />

      <div style={{width:"100%",maxWidth:"400px",position:"relative",zIndex:1}}>
        {/* 品牌 */}
        <div style={{textAlign:"center",marginBottom:"40px"}}>
          <div style={{
            display:"inline-flex",alignItems:"center",justifyContent:"center",
            width:"64px",height:"64px",borderRadius:"20px",
            background:"#19191f",
            boxShadow:"0 16px 32px rgba(182,160,255,0.15)",
            marginBottom:"16px",
          }}>
            <span className="material-symbols-outlined" style={{fontSize:"32px",color:"#b6a0ff",fontVariationSettings:"'FILL' 1"}}>psychology</span>
          </div>
          <h1 style={{
            fontSize:"28px",fontWeight:"800",
            background:"linear-gradient(to right,#b6a0ff,#8596ff)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
            fontFamily:"'Plus Jakarta Sans',sans-serif",
            margin:0,
          }}>TripMind</h1>
        </div>

        {/* 欢迎语 */}
        <div style={{marginBottom:"32px"}}>
          <h2 style={{fontSize:"30px",fontWeight:"800",color:"#f6f2fa",margin:"0 0 6px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>欢迎回来</h2>
          <p style={{color:"#acaab1",margin:0,fontSize:"15px"}}>你的下一段旅程从这里开始。</p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"20px"}}>
          {/* 用户名 */}
          <div>
            <label style={{display:"block",fontSize:"11px",fontWeight:"700",letterSpacing:"0.1em",
              textTransform:"uppercase",color:"#acaab1",marginBottom:"8px",paddingLeft:"4px"}}>用户名</label>
            <div style={{position:"relative"}}>
              <span className="material-symbols-outlined" style={{
                position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",
                color:"rgba(182,160,255,0.6)",fontSize:"20px",pointerEvents:"none",
              }}>person</span>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="输入用户名"
                required
                style={{
                  width:"100%",height:"52px",
                  background:"#131318",border:"none",borderRadius:"12px",
                  paddingLeft:"44px",paddingRight:"16px",
                  color:"#f6f2fa",fontSize:"15px",
                  outline:"none",boxSizing:"border-box",
                  transition:"background 0.2s",
                }}
                onFocus={e => e.target.style.background="#19191f"}
                onBlur={e => e.target.style.background="#131318"}
              />
            </div>
          </div>

          {/* 密码 */}
          <div>
            <label style={{display:"block",fontSize:"11px",fontWeight:"700",letterSpacing:"0.1em",
              textTransform:"uppercase",color:"#acaab1",marginBottom:"8px",paddingLeft:"4px"}}>密码</label>
            <div style={{position:"relative"}}>
              <span className="material-symbols-outlined" style={{
                position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",
                color:"rgba(182,160,255,0.6)",fontSize:"20px",pointerEvents:"none",
              }}>lock</span>
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="输入密码"
                required
                style={{
                  width:"100%",height:"52px",
                  background:"#131318",border:"none",borderRadius:"12px",
                  paddingLeft:"44px",paddingRight:"48px",
                  color:"#f6f2fa",fontSize:"15px",
                  outline:"none",boxSizing:"border-box",
                  transition:"background 0.2s",
                }}
                onFocus={e => e.target.style.background="#19191f"}
                onBlur={e => e.target.style.background="#131318"}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} style={{
                position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",
                background:"none",border:"none",cursor:"pointer",padding:0,
                color:"#acaab1",display:"flex",alignItems:"center",
              }}>
                <span className="material-symbols-outlined" style={{fontSize:"20px"}}>
                  {showPwd ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          {error && (
            <p style={{color:"#ff6e84",fontSize:"13px",margin:0,paddingLeft:"4px"}}>{error}</p>
          )}

          <button type="submit" disabled={loading} style={{
            width:"100%",height:"52px",marginTop:"4px",
            background:"linear-gradient(to right,#b6a0ff,#7e51ff)",
            border:"none",borderRadius:"9999px",
            color:"#340090",fontWeight:"700",fontSize:"16px",
            cursor:loading?"not-allowed":"pointer",
            boxShadow:"0 8px 32px rgba(182,160,255,0.25)",
            display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
            transition:"all 0.2s",opacity:loading?0.7:1,
            fontFamily:"'Manrope',sans-serif",
          }}>
            {loading ? "登录中..." : "登录"}
            {!loading && <span className="material-symbols-outlined" style={{fontSize:"20px"}}>arrow_forward</span>}
          </button>
        </form>

        {/* 注册跳转 */}
        <p style={{textAlign:"center",marginTop:"32px",fontSize:"14px",color:"#acaab1"}}>
          还没有账号？{" "}
          <button onClick={onSwitchToRegister} style={{
            background:"none",border:"none",color:"#b6a0ff",fontWeight:"700",
            cursor:"pointer",fontSize:"14px",padding:0,
            fontFamily:"'Manrope',sans-serif",
          }}>免费注册</button>
        </p>
        <p style={{textAlign:"center",marginTop:"12px",fontSize:"14px"}}>
          <button onClick={() => setShowForgot(true)} style={{
            background:"none",border:"none",color:"#acaab1",
            cursor:"pointer",fontSize:"13px",padding:0,
            fontFamily:"'Manrope',sans-serif",
          }}>忘记密码？</button>
        </p>
      </div>
    </div>
    {showForgot && <ForgotPwdModal onClose={() => setShowForgot(false)} />}
  </>
  );
};

export default MobileLogin;
