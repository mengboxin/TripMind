import React, { useState } from "react";

const C = {
  surface: "#0e0e13",
  surfaceContainerLow: "#131318",
  surfaceContainerHigh: "#1f1f26",
  surfaceBright: "#2b2b33",
  onSurface: "#f6f2fa",
  onSurfaceVariant: "#acaab1",
  primary: "#b6a0ff",
  outlineVariant: "#48474d",
  error: "#ff6e84",
};

const FieldIcon = ({ icon, children }) => (
  <div className="relative flex items-center rounded-xl"
    style={{border:"1px solid rgba(72,71,77,0.4)",background:C.surfaceContainerLow}}>
    <span className="material-symbols-outlined absolute left-4 select-none"
      style={{color:"rgba(172,170,177,0.5)",fontSize:"20px"}}>{icon}</span>
    {children}
  </div>
);

const FloatingBot = () => (
  <div className="fixed bottom-8 right-8 z-50">
    <div className="relative group w-14 h-14 rounded-2xl flex items-center justify-center cursor-help"
      style={{background:"rgba(37,37,44,0.6)",backdropFilter:"blur(20px)",
        border:"1px solid rgba(182,160,255,0.2)",boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>
      <span className="material-symbols-outlined group-hover:scale-110 transition-transform duration-300"
        style={{color:C.primary,fontVariationSettings:"'FILL' 1"}}>smart_toy</span>
      <div className="absolute bottom-full right-0 mb-4 w-48 p-4 rounded-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none"
        style={{background:"rgba(37,37,44,0.9)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.05)"}}>
        <p className="text-xs leading-relaxed" style={{color:C.onSurfaceVariant}}>需要帮助？我随时为您的旅程提供支持。</p>
      </div>
    </div>
  </div>
);

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api"}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "登录失败，请检查账号密码");
        return;
      }
      onLogin && onLogin({ token: data.token, username: data.username, create_time: data.create_time });
    } catch (e) {
      setError("无法连接服务器，请检查后端是否启动");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{display:"flex",minHeight:"100vh",overflow:"hidden"}}>

      {/* 左侧品牌区 */}
      <section style={{flex:1,position:"relative",display:"flex",flexDirection:"column",
        justifyContent:"space-between",padding:"48px 64px",overflow:"hidden"}}
        className="hidden lg:flex">
        <div style={{position:"absolute",inset:0,zIndex:0}}>
          <img style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.6,filter:"grayscale(20%)"}}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPzfACTVh6NrffccqSTKlSfPBKUYiEqnJsTaEBpdv63vphmMbqr66mH0Oq-KXHkIQtwITcmeghHrJR9c2Bjx3khcn4i3Z0Nc6Z-pp38GbKxMnSDGx7U1m8hTxBlgweesvXh66wmDX6m5Gjoy1QhK3cmOPmh7oosJHrDTxn09QcMQkdZTdJccOB185TKliFlG5qNNJrCDfuxy3-04KZoa1BZq-4vXnuUUsFlnbtTuuVx6-ofRSs3wNKmgwoNf9sQK7egKYU9ywsMHM"
            alt="风景" />
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top right,#0e0e13 0%,rgba(14,14,19,0.45) 55%,transparent 100%)"}} />
        </div>

        {/* Logo */}
        <div style={{position:"relative",zIndex:10,display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"40px",height:"40px",borderRadius:"12px",background:C.primary,
            display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 20px rgba(182,160,255,0.3)"}}>
            <span className="material-symbols-outlined" style={{color:"#340090",fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
          </div>
          <span className="headline-font" style={{fontSize:"22px",fontWeight:"800",letterSpacing:"-0.5px",color:C.onSurface}}>途灵 TripMind</span>
        </div>

        {/* 标语 */}
        <div style={{position:"relative",zIndex:10,maxWidth:"480px"}}>
          <h2 className="headline-font" style={{fontSize:"48px",fontWeight:"700",lineHeight:"1.15",marginBottom:"20px",color:C.onSurface}}>
            为你量身定制，<br/><span style={{color:C.primary}}>独一无二</span>的旅程。
          </h2>
          <p style={{fontSize:"17px",lineHeight:"1.7",color:C.onSurfaceVariant,whiteSpace:"nowrap"}}>
            用人工智能的视角探索世界，为你的下一次精彩出行打造专属行程。
          </p>
        </div>

        {/* 统计 */}
        <div style={{position:"relative",zIndex:10,display:"flex",gap:"40px"}}>
          <div>
            <span className="headline-font" style={{display:"block",fontSize:"26px",fontWeight:"700",color:C.primary}}>50k+</span>
            <span style={{fontSize:"11px",textTransform:"uppercase",letterSpacing:"0.15em",color:C.onSurfaceVariant,fontWeight:"500"}}>精选行程</span>
          </div>
          <div>
            <span className="headline-font" style={{display:"block",fontSize:"26px",fontWeight:"700",color:C.primary}}>120+</span>
            <span style={{fontSize:"11px",textTransform:"uppercase",letterSpacing:"0.15em",color:C.onSurfaceVariant,fontWeight:"500"}}>覆盖国家</span>
          </div>
        </div>
      </section>

      {/* 右侧表单区 */}
      <main style={{width:"100%",maxWidth:"520px",flexShrink:0,background:C.surface,
        display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px 56px"}}>
        <div style={{maxWidth:"380px",width:"100%",margin:"0 auto"}}>

          {/* 移动端 Logo */}
          <div className="flex lg:hidden items-center gap-3" style={{marginBottom:"40px"}}>
            <div style={{width:"36px",height:"36px",borderRadius:"10px",background:C.primary,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span className="material-symbols-outlined" style={{color:"#340090",fontSize:"18px",fontVariationSettings:"'FILL' 1"}}>auto_awesome</span>
            </div>
            <span className="headline-font" style={{fontSize:"18px",fontWeight:"800",color:C.onSurface}}>途灵 TripMind</span>
          </div>

          <div style={{marginBottom:"36px"}}>
            <h1 className="headline-font" style={{fontSize:"32px",fontWeight:"700",color:C.onSurface,marginBottom:"10px"}}>欢迎回来</h1>
            <p style={{color:C.onSurfaceVariant,fontSize:"15px"}}>你的下一段旅程，从这里开始。</p>
          </div>

          <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:"20px"}}>
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              <label style={{fontSize:"13px",fontWeight:"600",color:C.onSurfaceVariant,marginLeft:"2px"}} htmlFor="username">用户名</label>
              <FieldIcon icon="person">
                <input id="username" type="text" value={username} onChange={e=>setUsername(e.target.value)} required
                  placeholder="请输入用户名" className="w-full focus:outline-none"
                  style={{background:"transparent",padding:"14px 14px 14px 48px",color:C.onSurface,fontSize:"14px",fontFamily:"Manrope,sans-serif"}}/>
              </FieldIcon>
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginLeft:"2px"}}>
                <label style={{fontSize:"13px",fontWeight:"600",color:C.onSurfaceVariant}} htmlFor="password">密码</label>
                <a href="#" style={{fontSize:"12px",fontWeight:"600",color:C.primary,textDecoration:"none"}}>忘记密码？</a>
              </div>
              <FieldIcon icon="lock">
                <input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required
                  placeholder="" className="w-full focus:outline-none"
                  style={{background:"transparent",padding:"14px 14px 14px 48px",color:C.onSurface,fontSize:"14px",fontFamily:"Manrope,sans-serif"}}/>
              </FieldIcon>
            </div>

            {error && <p style={{fontSize:"13px",color:"#ff6e84",textAlign:"center",marginTop:"-4px"}}>{error}</p>}
            <button type="submit" disabled={loading}
              style={{marginTop:"8px",padding:"15px",borderRadius:"9999px",fontWeight:"700",fontSize:"16px",
                background:"linear-gradient(to right,#b6a0ff,#7e51ff)",color:"#340090",border:"none",
                boxShadow:loading?"none":"0 10px 30px -10px rgba(182,160,255,0.45)",
                opacity:loading?0.7:1,cursor:loading?"not-allowed":"pointer",transition:"all 0.2s",
                fontFamily:"Manrope,sans-serif"}}>
              {loading ? "登录中..." : "登录"}
            </button>
          </form>

          <p style={{textAlign:"center",marginTop:"32px",fontSize:"14px",color:C.onSurfaceVariant}}>
            还没有账号？{" "}
            <button onClick={onSwitchToRegister}
              style={{color:C.primary,fontWeight:"700",background:"none",border:"none",cursor:"pointer",fontSize:"14px",fontFamily:"Manrope,sans-serif"}}>
              立即注册
            </button>
          </p>

          <div style={{display:"flex",justifyContent:"center",gap:"24px",marginTop:"40px",
            fontSize:"10px",textTransform:"uppercase",letterSpacing:"0.18em",fontWeight:"700",color:"rgba(172,170,177,0.3)"}}>
            {["隐私政策","服务条款","帮助支持"].map(t=>(
              <span key={t} style={{cursor:"pointer"}}>{t}</span>
            ))}
          </div>
        </div>
      </main>

      <FloatingBot />
    </div>
  );
};

export default Login;
