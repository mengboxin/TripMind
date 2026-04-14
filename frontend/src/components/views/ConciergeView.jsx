import React from "react";

const SERVICES = [
  { icon:"flight",              color:"#a78bfa", bg:"rgba(139,92,246,0.15)", title:"机票预订",  desc:"搜索全球航班，比价预订，支持改签退票",     prompt:"帮我查询并预订机票" },
  { icon:"hotel",               color:"#60a5fa", bg:"rgba(96,165,250,0.15)",  title:"酒店预订",  desc:"精选全球酒店，从经济到豪华一应俱全",     prompt:"帮我搜索并预订酒店" },
  { icon:"directions_car",      color:"#34d399", bg:"rgba(52,211,153,0.15)",  title:"租车服务",  desc:"目的地取车，自由驾驶，探索更多角落",     prompt:"帮我查询租车服务" },
  { icon:"map",                 color:"#f472b6", bg:"rgba(244,114,182,0.15)", title:"行程规划",  desc:"AI 智能规划每日行程，景点路线最优安排", prompt:"帮我规划详细行程" },
  { icon:"restaurant",          color:"#fb923c", bg:"rgba(251,146,60,0.15)",  title:"餐厅推荐",  desc:"当地特色美食与高分餐厅精选推荐",         prompt:"推荐当地特色餐厅" },
  { icon:"local_activity",      color:"#e879f9", bg:"rgba(232,121,249,0.15)", title:"活动预订",  desc:"当地游览、演出票务、特色体验活动",       prompt:"推荐当地特色活动" },
];

const FAQ = [
  { q:"如何修改或取消已预订的机票？", a:"直接告诉 AI 助手你的需求，如'帮我改签明天的航班'，AI 会查询你的订单并协助办理。" },
  { q:"预订酒店需要提前多久？",       a:"建议提前 1-2 周预订，旺季建议提前 1 个月以上，以获得更好的价格和房型选择。" },
  { q:"如何查看我的所有订单？",       a:"点击右上角个人中心图标，可以查看机票、酒店、租车的所有订单详情。" },
  { q:"AI 助手支持哪些语言？",        a:"目前主要支持中文对话，也可以理解英文输入，回复以中文为主。" },
];

const ConciergeView = ({ onChat }) => (
  <div style={{flex:1,overflowY:"auto",paddingTop:"80px",paddingBottom:"40px"}}>
    <div style={{maxWidth:"860px",margin:"0 auto",padding:"24px 32px"}}>
      <div style={{marginBottom:"32px"}}>
        <h2 className="headline-font" style={{fontSize:"24px",fontWeight:"700",
          background:"linear-gradient(to right,#a78bfa,#60a5fa)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          marginBottom:"8px"}}>礼宾服务</h2>
        <p style={{fontSize:"14px",color:"#b8b5cc"}}>专属 AI 礼宾，为你的旅程提供全方位支持</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"14px",marginBottom:"40px"}}>
        {SERVICES.map(s => (
          <button key={s.title} onClick={() => onChat(s.prompt)}
            style={{padding:"20px",borderRadius:"16px",textAlign:"left",border:"none",cursor:"pointer",
              background:`linear-gradient(135deg,${s.bg},rgba(255,255,255,0.02))`,
              borderWidth:"1px",borderStyle:"solid",borderColor:`${s.color}30`,
              transition:"all 0.2s",backdropFilter:"blur(8px)"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.borderColor=`${s.color}60`;e.currentTarget.style.boxShadow=`0 8px 24px ${s.color}20`;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor=`${s.color}30`;e.currentTarget.style.boxShadow="none";}}>
            <div style={{width:"42px",height:"42px",borderRadius:"12px",display:"flex",alignItems:"center",
              justifyContent:"center",marginBottom:"14px",background:s.bg,
              boxShadow:`0 0 16px ${s.color}30`}}>
              <span className="material-symbols-outlined" style={{color:s.color,fontSize:"22px",fontVariationSettings:"'FILL' 1"}}>{s.icon}</span>
            </div>
            <h3 style={{fontSize:"14px",fontWeight:"700",color:"#f0eeff",marginBottom:"6px"}}>{s.title}</h3>
            <p style={{fontSize:"12px",color:"#b8b5cc",lineHeight:"1.6"}}>{s.desc}</p>
          </button>
        ))}
      </div>

      <div>
        <h3 className="headline-font" style={{fontSize:"16px",fontWeight:"700",color:"#f0eeff",marginBottom:"16px"}}>常见问题</h3>
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {FAQ.map((item, i) => (
            <details key={i} style={{borderRadius:"12px",
              background:"linear-gradient(135deg,rgba(139,92,246,0.08),rgba(96,165,250,0.05))",
              border:"1px solid rgba(139,92,246,0.15)",overflow:"hidden"}}>
              <summary style={{padding:"14px 16px",fontSize:"14px",fontWeight:"600",color:"#f0eeff",
                cursor:"pointer",listStyle:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                {item.q}
                <span className="material-symbols-outlined" style={{color:"#a78bfa",fontSize:"18px",flexShrink:0}}>expand_more</span>
              </summary>
              <div style={{padding:"0 16px 14px",fontSize:"13px",color:"#b8b5cc",lineHeight:"1.7",
                borderTop:"1px solid rgba(139,92,246,0.1)"}}>
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ConciergeView;