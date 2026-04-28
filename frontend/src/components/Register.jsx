import React, { useState, useRef } from "react";

const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

const C = {
  onSurface: "#f6f2fa",
  onSurfaceVariant: "#acaab1",
  primary: "#b6a0ff",
  error: "#ff6e84",
};

const FieldIcon = ({ icon, children }) => (
  <div className="relative flex items-center rounded-full"
    style={{border:"1px solid rgba(182,160,255,0.2)",background:"rgba(255,255,255,0.07)",overflow:"hidden"}}>
    <span className="material-symbols-outlined absolute left-4 select-none"
      style={{color:"rgba(182,160,255,0.7)",fontSize:"20px"}}>{icon}</span>
    {children}
  </div>
);

const Register = ({ onRegister, onSwitchToLogin }) => {
  const [email, setEmail]       = useState("");
  const [otp, setOtp]           = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [otpSent, setOtpSent]   = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown]   = useState(0);
  const [error, setError]       = useState("");
  const timerRef = useRef(null);

  const inputStyle = {
    background:"transparent", padding:"13px 13px 13px 46px",
    color:"white", fontSize:"14px", fontFamily:"Manrope,sans-serif",
  };

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
      // 注册成功后自动登录
      const loginRes = await fetch(`${API}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });
      const loginData = await loginRes.json();
      onRegister && onRegister({ token: loginData.token, username: loginData.username, create_time: loginData.create_time });
    } catch { setError("无法连接服务器，请检查后端是否启动"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{position:"relative",minHeight:"100vh",overflow:"hidden"}}>
      {/* 背景 */}
      <div style={{position:"absolute",inset:0,zIndex:0}}>
        <img style={{width:"100%",height:"100%",objectFit:"cover",animation:"bgZoom 12s ease-in-out infinite alternate",transformOrigin:"center center"}}
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85" alt="风景" />
        <div style={{position:"absolute",inset:0,background:"rgba(10,10,16,0.35)"}} />
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to right, transparent 30%, rgba(8,8,14,0.45) 60%, rgba(8,8,14,0.65) 100%)"}} />
      </div>

      {/* 左侧品牌 */}
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:"55%",display:"flex",flexDirection:"column",
        justifyContent:"space-between",padding:"48px 64px",zIndex:10}} className="hidden lg:flex">
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"40px",height:"40px",borderRadius:"12px",background:C.primary,
            display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 20px rgba(182,160,255,0.35)"}}>
            <span className="material-symbols-outlined" style={{color:"#340090",fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
          </div>
          <span className="headline-font" style={{fontSize:"22px",fontWeight:"800",letterSpacing:"-0.5px",color:"white"}}>途灵 TripMind</span>
        </div>
        <div style={{maxWidth:"480px"}}>
          <h2 className="headline-font" style={{fontSize:"48px",fontWeight:"700",lineHeight:"1.15",marginBottom:"20px",color:"white"}}>
            每一段旅程，<br/>都从<span style={{color:C.primary}}>第一步</span>开始。
          </h2>
          <p style={{fontSize:"17px",lineHeight:"1.7",color:"rgba(255,255,255,0.65)"}}>
            加入数万名旅行者，让途灵 AI 为你规划完美的专属旅程。
          </p>
        </div>
        <div style={{display:"flex",gap:"40px"}}>
          {[["50k+","精选行程"],["120+","覆盖国家"]].map(([n,l])=>(
            <div key={l}>
              <span className="headline-font" style={{display:"block",fontSize:"26px",fontWeight:"700",color:C.primary}}>{n}</span>
              <span style={{fontSize:"11px",textTransform:"uppercase",letterSpacing:"0.15em",color:"rgba(255,255,255,0.5)",fontWeight:"500"}}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 右侧表单 */}
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:"420px",zIndex:10,
        display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 48px",
        background:"rgba(8,8,16,0.55)",backdropFilter:"blur(20px)",
        borderLeft:"1px solid rgba(255,255,255,0.07)"}} className="w-full lg:w-auto">
        <div style={{width:"100%",maxWidth:"340px"}}>
          <div className="flex lg:hidden items-center gap-3" style={{marginBottom:"36px"}}>
            <div style={{width:"36px",height:"36px",borderRadius:"10px",background:C.primary,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span className="material-symbols-outlined" style={{color:"#340090",fontSize:"18px",fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
            </div>
            <span className="headline-font" style={{fontSize:"18px",fontWeight:"800",color:"white"}}>途灵 TripMind</span>
          </div>

          <div style={{marginBottom:"28px"}}>
            <h1 className="headline-font" style={{fontSize:"30px",fontWeight:"700",color:"white",marginBottom:"8px"}}>创建账号</h1>
            <p style={{color:"rgba(255,255,255,0.5)",fontSize:"14px"}}>用邮箱验证，开启 AI 旅行规划之旅。</p>
          </div>

          <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            {/* 邮箱 + 发送验证码 */}
            <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
              <label style={{fontSize:"12px",fontWeight:"600",color:"rgba(255,255,255,0.5)",marginLeft:"2px"}}>邮箱</label>
              <div style={{display:"flex",gap:"8px"}}>
                <FieldIcon icon="mail">
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                    placeholder="your@email.com" className="w-full focus:outline-none" style={inputStyle}/>
                </FieldIcon>
                <button type="button" onClick={handleSendOtp} disabled={otpLoading || countdown > 0}
                  style={{flexShrink:0,padding:"0 14px",borderRadius:"9999px",border:"none",cursor:"pointer",
                    background:countdown>0?"rgba(255,255,255,0.1)":"linear-gradient(to right,#b6a0ff,#7e51ff)",
                    color:countdown>0?"rgba(255,255,255,0.4)":"#340090",fontSize:"12px",fontWeight:"700",
                    whiteSpace:"nowrap",fontFamily:"Manrope,sans-serif",opacity:otpLoading?0.7:1}}>
                  {otpLoading ? "发送中" : countdown > 0 ? `${countdown}s` : "发送验证码"}
                </button>
              </div>
            </div>

            {/* 验证码 */}
            <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
              <label style={{fontSize:"12px",fontWeight:"600",color:"rgba(255,255,255,0.5)",marginLeft:"2px"}}>邮箱验证码</label>
              <FieldIcon icon="pin">
                <input type="text" value={otp} onChange={e=>setOtp(e.target.value)} required
                  placeholder={otpSent ? "请输入6位验证码" : "请先发送验证码"}
                  className="w-full focus:outline-none" style={inputStyle} maxLength={6}/>
              </FieldIcon>
            </div>

            {/* 密码 */}
            <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
              <label style={{fontSize:"12px",fontWeight:"600",color:"rgba(255,255,255,0.5)",marginLeft:"2px"}}>密码</label>
              <FieldIcon icon="lock">
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
                  placeholder="至少6位" className="w-full focus:outline-none" style={inputStyle}/>
              </FieldIcon>
            </div>

            {/* 确认密码 */}
            <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
              <label style={{fontSize:"12px",fontWeight:"600",color:"rgba(255,255,255,0.5)",marginLeft:"2px"}}>确认密码</label>
              <FieldIcon icon="lock">
                <input type="password" value={confirm} onChange={e=>{setConfirm(e.target.value);setError("");}} required
                  placeholder="再次输入密码" className="w-full focus:outline-none" style={inputStyle}/>
              </FieldIcon>
              {error && <p style={{fontSize:"12px",color:C.error,marginLeft:"2px"}}>{error}</p>}
            </div>

            <button type="submit" disabled={loading}
              style={{marginTop:"4px",padding:"14px",borderRadius:"9999px",fontWeight:"700",fontSize:"15px",
                background:"linear-gradient(to right,#b6a0ff,#7e51ff)",color:"#340090",border:"none",
                boxShadow:loading?"none":"0 8px 24px rgba(182,160,255,0.4)",
                opacity:loading?0.7:1,cursor:loading?"not-allowed":"pointer",transition:"all 0.2s",
                fontFamily:"Manrope,sans-serif"}}>
              {loading ? "注册中..." : "注册"}
            </button>
          </form>

          <p style={{textAlign:"center",marginTop:"24px",fontSize:"13px",color:"rgba(255,255,255,0.4)"}}>
            已有账号？{" "}
            <button onClick={onSwitchToLogin}
              style={{color:C.primary,fontWeight:"700",background:"none",border:"none",cursor:"pointer",fontSize:"13px",fontFamily:"Manrope,sans-serif"}}>
              立即登录
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
