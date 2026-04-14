import React, { useState } from "react";

const ExportButton = ({ messages, username }) => {
  const [exporting, setExporting] = useState(false);

  // 只取 AI 的行程规划消息（包含列表或标题的）
  const itineraryMsgs = messages.filter(m =>
    m.sender === "ai" && (m.content.includes("##") || m.content.includes("**") || m.content.includes("天") || m.content.length > 200)
  );

  const handleExport = () => {
    if (!itineraryMsgs.length) {
      alert("暂无可导出的行程内容，请先让 AI 规划一份行程");
      return;
    }
    setExporting(true);

    // 构建打印内容
    const content = itineraryMsgs.map(m => {
      // 简单的 Markdown 转 HTML
      return m.content
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/^# (.+)$/gm, "<h1>$1</h1>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/^- (.+)$/gm, "<li>$1</li>")
        .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br/>");
    }).join('<hr style="margin:24px 0;border-color:#e0d8ff"/>');

    const now = new Date().toLocaleDateString("zh-CN");

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8"/>
  <title>途灵 TripMind - 行程规划</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
      color: #1a1a2e;
      background: white;
      padding: 40px 60px;
      line-height: 1.8;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #7c3aed;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 22px;
      font-weight: 800;
      background: linear-gradient(to right, #7c3aed, #4f46e5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .meta { font-size: 13px; color: #6b7280; text-align: right; }
    h1 { font-size: 22px; color: #4c1d95; margin: 20px 0 10px; }
    h2 { font-size: 18px; color: #5b21b6; margin: 18px 0 8px; border-left: 3px solid #7c3aed; padding-left: 10px; }
    h3 { font-size: 15px; color: #6d28d9; margin: 14px 0 6px; }
    p { margin: 8px 0; color: #374151; }
    ul { padding-left: 20px; margin: 8px 0; }
    li { margin: 4px 0; color: #374151; }
    strong { color: #4c1d95; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #9ca3af;
      text-align: center;
    }
    @media print {
      body { padding: 20px 40px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">✈ 途灵 TripMind</div>
    <div class="meta">
      <div>旅行者：${username || "旅行者"}</div>
      <div>导出时间：${now}</div>
    </div>
  </div>

  <div class="content">
    <p>${content}</p>
  </div>

  <div class="footer">
    本行程由途灵 TripMind AI 智能规划 · 仅供参考，请根据实际情况调整
  </div>

  <div class="no-print" style="text-align:center;margin-top:32px">
    <button onclick="window.print()" style="padding:12px 32px;background:linear-gradient(to right,#7c3aed,#4f46e5);color:white;border:none;border-radius:8px;font-size:15px;cursor:pointer;margin-right:12px">
      🖨️ 打印 / 保存 PDF
    </button>
    <button onclick="window.close()" style="padding:12px 24px;background:#f3f4f6;color:#374151;border:none;border-radius:8px;font-size:15px;cursor:pointer">
      关闭
    </button>
  </div>
</body>
</html>
    `);
    printWindow.document.close();
    setExporting(false);
  };

  return (
    <button onClick={handleExport} disabled={exporting}
      style={{display:"flex",alignItems:"center",gap:"6px",padding:"7px 14px",borderRadius:"9999px",
        fontSize:"12px",fontWeight:"600",cursor:"pointer",transition:"all 0.2s",
        background:"rgba(167,139,250,0.12)",color:"#a78bfa",
        border:"1px solid rgba(167,139,250,0.25)"}}>
      <span className="material-symbols-outlined" style={{fontSize:"15px"}}>download</span>
      导出行程
    </button>
  );
};

export default ExportButton;
