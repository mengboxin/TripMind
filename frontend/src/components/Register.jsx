import React, { useState } from "react";

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
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError("两次密码不一致"); return; }
    setError("");
    setLoading(true);
    try {
      const base = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";
      const res = await fetch(`${base}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email: email || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "注册失败，用户名可能已存在"); return; }
      const loginRes = await fetch(`${base}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const loginData = await loginRes.json();
      onRegister && onRegister({ token: loginData.token, username: loginData.username, create_time: loginData.create_time });
    } catch (e) {
      setError("无法连接服务器，请检查后端是否启动");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { background:"transparent", padding:"13px 13px 13px 46px", color:"white", fontSize:"14px", fontFamily:"Manrope,sans-serif" };

  return (
    <div style={{position:"relative",minHeight:"100vh",overflow:"hidden"}}>

      {/* 全屏背景图 */}
      <div style={{position:"absolute",inset:0,zIndex:0}}>
        <img style={{width:"100%",height:"100%",objectFit:"cover",animation:"bgZoom 12s ease-in-out infinite alternate",transformOrigin:"center center"}}
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85"
          alt="风景" />
        <div style={{position:"absolute",inset:0,background:"rgba(10,10,16,0.35)"}} />
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to right, transparent 30%, rgba(8,8,14,0.45) 60%, rgba(8,8,14,0.65) 100%)"}} />
      </div>

      {/* 左侧品牌内容 */}
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:"55%",display:"flex",flexDirection:"column",
        justifyContent:"space-between",padding:"48px 64px",zIndex:10}}
        className="hidden lg:flex">
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
          <div>
            <span className="headline-font" style={{display:"block",fontSize:"26px",fontWeight:"700",color:C.primary}}>50k+</span>
            <span style={{fontSize:"11px",textTransform:"uppercase",letterSpacing:"0.15em",color:"rgba(255,255,255,0.5)",fontWeight:"500"}}>精选行程</span>
          </div>
          <div>
            <span className="headline-font" style={{display:"block",fontSize:"26px",fontWeight:"700",color:C.primary}}>120+</span>
            <span style={{fontSize:"11px",textTransform:"uppercase",letterSpacing:"0.15em",color:"rgba(255,255,255,0.5)",fontWeight:"500"}}>覆盖国家</span>
          </div>
        </div>
      </div>

      {/* 右侧表单区 — 毛玻璃浮层 */}
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:"420px",zIndex:10,
        display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 48px",
        background:"rgba(8,8,16,0.55)",backdropFilter:"blur(20px)",
        borderLeft:"1px solid rgba(255,255,255,0.07)"}}
        className="w-full lg:w-auto">
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
            <p style={{color:"rgba(255,255,255,0.5)",fontSize:"14px"}}>开启你的 AI 旅行规划之旅。</p>
          </div>

          <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"16px"}}>
            <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
              <label style={{fontSize:"12px",fontWeight:"600",color:"rgba(255,255,255,0.5)",marginLeft:"2px"}} htmlFor="reg-username">用户名</label>
              <FieldIcon icon="person">
                <input id="reg-username" type="text" value={username} onChange={e=>setUsername(e.target.value)} required
                  placeholder="请输入用户名" className="w-full focus:outline-none" style={inputStyle}/>
              </FieldIcon>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
              <label style={{fontSize:"12px",fontWeight:"600",color:"rgba(255,255,255,0.5)",marginLeft:"2px"}} htmlFor="reg-email">邮箱（选填）</label>
              <FieldIcon icon="mail">
                <input id="reg-email" type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="your@email.com" className="w-full focus:outline-none" style={inputStyle}/>
              </FieldIcon>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
              <label style={{fontSize:"12px",fontWeight:"600",color:"rgba(255,255,255,0.5)",marginLeft:"2px"}} htmlFor="reg-pw">密码</label>
              <FieldIcon icon="lock">
                <input id="reg-pw" type="password" value={password} onChange={e=>setPassword(e.target.value)} required
                  placeholder="请输入密码" className="w-full focus:outline-none" style={inputStyle}/>
              </FieldIcon>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:"7px"}}>
              <label style={{fontSize:"12px",fontWeight:"600",color:"rgba(255,255,255,0.5)",marginLeft:"2px"}} htmlFor="reg-confirm">确认密码</label>
              <FieldIcon icon="lock">
                <input id="reg-confirm" type="password" value={confirm} onChange={e=>{setConfirm(e.target.value);setError("");}} required
                  placeholder="请再次输入密码" className="w-full focus:outline-none" style={inputStyle}/>
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

          <div style={{display:"flex",justifyContent:"center",gap:"20px",marginTop:"32px",
            fontSize:"10px",textTransform:"uppercase",letterSpacing:"0.15em",fontWeight:"700",color:"rgba(255,255,255,0.2)"}}>
            {["隐私政策","服务条款","帮助支持"].map(t=>(
              <span key={t} style={{cursor:"pointer"}}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 悬浮助手 */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative group w-14 h-14 rounded-2xl flex items-center justify-center cursor-help"
          style={{background:"rgba(37,37,44,0.6)",backdropFilter:"blur(20px)",
            border:"1px solid rgba(182,160,255,0.2)",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform duration-300"
            style={{color:C.primary,fontVariationSettings:"'FILL' 1"}}>smart_toy</span>
          <div className="absolute bottom-full right-0 mb-4 w-48 p-4 rounded-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none"
            style={{background:"rgba(37,37,44,0.9)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.05)"}}>
            <p className="text-xs leading-relaxed" style={{color:"rgba(172,170,177,0.8)"}}>需要帮助？我随时为你的旅程提供支持。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;