import React, { useState } from "react";

const C = {
  surfaceContainer: "#19191f",
  surfaceContainerHigh: "#1f1f26",
  onSurface: "#f6f2fa",
  onSurfaceVariant: "#acaab1",
  primary: "#b6a0ff",
  secondary: "#8596ff",
};

const CATEGORIES = [
  {
    icon: "flight", label: "机票相关",
    items: [
      { q: "如何搜索并预订机票？", a: "直接在对话框输入需求，例如'帮我查询下周五上海到东京的航班'，AI 会自动搜索并展示可用航班供你选择。" },
      { q: "如何改签或退票？", a: "告诉 AI '帮我改签我的航班' 或 '我要退票'，AI 会先查询你的订单，然后协助办理改签或退票手续。" },
      { q: "改签有时间限制吗？", a: "改签要求新航班起飞时间距当前时间至少 3 小时，否则系统会拒绝改签请求。" },
    ]
  },
  {
    icon: "hotel", label: "酒店相关",
    items: [
      { q: "如何预订酒店？", a: "告诉 AI 你的目的地、入住日期和退房日期，AI 会搜索可用酒店并展示选项，确认后即可预订。" },
      { q: "可以修改入住日期吗？", a: "可以，告诉 AI '帮我修改酒店入住日期'，提供新的日期即可更新。" },
      { q: "如何取消酒店预订？", a: "告诉 AI '取消我的酒店预订'，AI 会查询订单并协助取消。" },
    ]
  },
  {
    icon: "directions_car", label: "租车相关",
    items: [
      { q: "如何预订租车？", a: "提供取车城市、取车日期和还车日期，AI 会搜索可用车辆并展示选项。" },
      { q: "支持哪些城市的租车？", a: "目前支持数据库中已有的城市，可以直接询问 AI 查询特定城市的可用车辆。" },
    ]
  },
  {
    icon: "smart_toy", label: "AI 助手",
    items: [
      { q: "AI 助手能做什么？", a: "AI 助手可以帮你搜索航班、预订酒店、租车、规划行程、推荐景点美食，以及回答旅行相关问题。" },
      { q: "AI 会记住我的对话吗？", a: "是的，每次对话都会保存到数据库，下次登录后可以在'最近对话'中找到历史记录。" },
      { q: "如何让 AI 规划行程？", a: "点击顶部'行程规划'，填写目的地、天数和偏好，或直接在对话框输入需求，AI 会生成详细的每日行程。" },
    ]
  },
];

const HelpView = ({ onChat }) => {
  const [openCat, setOpenCat] = useState(0);
  const [openItem, setOpenItem] = useState(null);

  return (
    <div style={{flex:1,overflowY:"auto",paddingTop:"80px",paddingBottom:"40px"}}>
      <div style={{maxWidth:"680px",margin:"0 auto",padding:"24px 32px"}}>
        <div style={{marginBottom:"28px"}}>
          <h2 className="headline-font" style={{fontSize:"24px",fontWeight:"700",color:C.onSurface,marginBottom:"8px"}}>帮助中心</h2>
          <p style={{fontSize:"14px",color:C.onSurfaceVariant}}>常见问题解答，快速找到你需要的帮助</p>
        </div>

        {/* 快速联系 */}
        <div style={{padding:"16px 20px",borderRadius:"14px",background:"rgba(182,160,255,0.08)",
          border:"1px solid rgba(182,160,255,0.2)",marginBottom:"28px",display:"flex",alignItems:"center",gap:"14px"}}>
          <span className="material-symbols-outlined" style={{color:C.primary,fontSize:"24px",fontVariationSettings:"'FILL' 1"}}>smart_toy</span>
          <div style={{flex:1}}>
            <p style={{fontSize:"14px",fontWeight:"600",color:C.onSurface,marginBottom:"3px"}}>找不到答案？直接问 AI</p>
            <p style={{fontSize:"12px",color:C.onSurfaceVariant}}>AI 助手 24 小时在线，随时解答你的问题</p>
          </div>
          <button onClick={() => onChat("我需要帮助")}
            style={{padding:"8px 16px",borderRadius:"9999px",fontSize:"13px",fontWeight:"600",
              background:"linear-gradient(to right,#b6a0ff,#7e51ff)",color:"#340090",border:"none",cursor:"pointer",flexShrink:0}}>
            立即咨询
          </button>
        </div>

        {/* 分类 FAQ */}
        {CATEGORIES.map((cat, ci) => (
          <div key={ci} style={{marginBottom:"16px",borderRadius:"14px",overflow:"hidden",
            background:C.surfaceContainer,border:"1px solid rgba(255,255,255,0.06)"}}>
            <button onClick={() => setOpenCat(openCat===ci ? -1 : ci)}
              style={{width:"100%",padding:"16px 18px",display:"flex",alignItems:"center",gap:"12px",
                background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
              <span className="material-symbols-outlined" style={{color:C.primary,fontSize:"20px",fontVariationSettings:"'FILL' 1"}}>{cat.icon}</span>
              <span style={{flex:1,fontSize:"15px",fontWeight:"600",color:C.onSurface}}>{cat.label}</span>
              <span className="material-symbols-outlined" style={{color:C.onSurfaceVariant,fontSize:"20px",
                transform: openCat===ci ? "rotate(180deg)" : "rotate(0)",transition:"transform 0.2s"}}>expand_more</span>
            </button>

            {openCat === ci && (
              <div style={{borderTop:"1px solid rgba(255,255,255,0.04)"}}>
                {cat.items.map((item, ii) => (
                  <div key={ii} style={{borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                    <button onClick={() => setOpenItem(openItem===`${ci}-${ii}` ? null : `${ci}-${ii}`)}
                      style={{width:"100%",padding:"13px 18px 13px 50px",display:"flex",justifyContent:"space-between",
                        alignItems:"center",background:"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
                      <span style={{fontSize:"13px",color:C.onSurface}}>{item.q}</span>
                      <span className="material-symbols-outlined" style={{color:C.onSurfaceVariant,fontSize:"16px",flexShrink:0,marginLeft:"8px",
                        transform: openItem===`${ci}-${ii}` ? "rotate(180deg)" : "rotate(0)",transition:"transform 0.2s"}}>expand_more</span>
                    </button>
                    {openItem === `${ci}-${ii}` && (
                      <div style={{padding:"0 18px 14px 50px",fontSize:"13px",color:C.onSurfaceVariant,lineHeight:"1.7"}}>
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* 版本信息 */}
        <div style={{marginTop:"32px",textAlign:"center"}}>
          <p style={{fontSize:"12px",color:"rgba(172,170,177,0.4)"}}>途灵 TripMind v1.0 · Powered by Qwen-Max</p>
        </div>
      </div>
    </div>
  );
};

export default HelpView;
