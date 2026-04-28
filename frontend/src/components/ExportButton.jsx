import React, { useState } from "react";

// 行内 markdown 转 HTML
function mdInline(text) {
  if (!text) return "";
  return text
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/~~(.+?)~~/g, "<del>$1</del>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}

// 完整 Markdown → HTML，逐行状态机解析，正确处理表格
function mdToHtml(md) {
  if (!md) return "";

  const lines = md.split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── 代码块 ──────────────────────────────────────
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      out.push(`<pre><code class="lang-${lang}">${codeLines.join("\n")}</code></pre>`);
      i++;
      continue;
    }

    // ── 表格：检测 | 开头的行，下一行是 |---| 分隔行 ──
    if (line.trim().startsWith("|") && i + 1 < lines.length && /^\|[\s\-:|]+\|/.test(lines[i + 1].trim())) {
      const tableLines = [line];
      i += 2; // 跳过表头和分隔行
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }

      const parseRow = (row) =>
        row.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

      const headers = parseRow(tableLines[0]);
      const rows = tableLines.slice(1).map(parseRow);

      const ths = headers.map((h) => `<th>${mdInline(h)}</th>`).join("");
      const trs = rows
        .map((r) => `<tr>${r.map((c) => `<td>${mdInline(c)}</td>`).join("")}</tr>`)
        .join("\n");

      out.push(`<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`);
      continue;
    }

    // ── 标题 ────────────────────────────────────────
    const hMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (hMatch) {
      const level = hMatch[1].length;
      out.push(`<h${level}>${mdInline(hMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // ── 引用块 ──────────────────────────────────────
    if (line.startsWith("> ")) {
      out.push(`<blockquote>${mdInline(line.slice(2))}</blockquote>`);
      i++;
      continue;
    }

    // ── 分割线 ──────────────────────────────────────
    if (/^[-*_]{3,}$/.test(line.trim())) {
      out.push("<hr/>");
      i++;
      continue;
    }

    // ── 无序列表 ────────────────────────────────────
    if (/^[-*+]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        items.push(`<li>${mdInline(lines[i].replace(/^[-*+]\s/, ""))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // ── 有序列表 ────────────────────────────────────
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li>${mdInline(lines[i].replace(/^\d+\.\s/, ""))}</li>`);
        i++;
      }
      out.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // ── 空行 ────────────────────────────────────────
    if (line.trim() === "") {
      i++;
      continue;
    }

    // ── 普通段落（连续非空行合并） ───────────────────
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("|") && !/^[-*+]\s/.test(lines[i]) && !/^\d+\.\s/.test(lines[i]) && !lines[i].startsWith("```") && !lines[i].startsWith("> ")) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      out.push(`<p>${mdInline(paraLines.join("<br/>"))}</p>`);
    }
  }

  return out.join("\n");
}

const ExportButton = ({ messages, username }) => {
  const [exporting, setExporting] = useState(false);

  const itineraryMsgs = messages.filter(
    (m) =>
      m.sender === "ai" &&
      (m.content.includes("##") ||
        m.content.includes("**") ||
        m.content.includes("天") ||
        m.content.length > 200)
  );

  const handleExport = () => {
    if (!itineraryMsgs.length) {
      alert("暂无可导出的行程内容，请先让 AI 规划一份行程");
      return;
    }
    setExporting(true);

    const content = itineraryMsgs
      .map((m) => mdToHtml(m.content))
      .join('<hr class="section-divider"/>');

    const now = new Date().toLocaleDateString("zh-CN");

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8"/>
  <title>途灵 TripMind · 行程规划</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
      color: #1a1a2e;
      background: #fff;
      padding: 48px 64px;
      line-height: 1.85;
      font-size: 14px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-bottom: 18px;
      border-bottom: 2px solid #7c3aed;
      margin-bottom: 36px;
    }
    .logo { font-size: 22px; font-weight: 800; color: #7c3aed; letter-spacing: -0.5px; }
    .logo span { color: #4f46e5; }
    .meta { font-size: 12px; color: #6b7280; text-align: right; line-height: 1.6; }
    h1 { font-size: 22px; color: #3b0764; margin: 24px 0 10px; }
    h2 {
      font-size: 17px; color: #5b21b6; margin: 20px 0 8px;
      padding-left: 10px; border-left: 3px solid #7c3aed;
    }
    h3 { font-size: 15px; color: #6d28d9; margin: 14px 0 6px; }
    h4, h5, h6 { font-size: 14px; color: #7c3aed; margin: 10px 0 4px; }
    p { margin: 8px 0; color: #374151; }
    ul, ol { padding-left: 22px; margin: 8px 0; }
    li { margin: 4px 0; color: #374151; line-height: 1.7; }
    strong { color: #4c1d95; font-weight: 700; }
    em { color: #6d28d9; font-style: italic; }
    code {
      background: #f3f0ff; color: #6d28d9;
      padding: 1px 6px; border-radius: 4px; font-size: 12px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #f8f7ff; border: 1px solid #e9d5ff;
      padding: 14px 16px; border-radius: 8px;
      overflow-x: auto; margin: 10px 0;
    }
    pre code { background: none; padding: 0; color: #4c1d95; }
    blockquote {
      border-left: 3px solid #a78bfa;
      padding: 8px 14px; margin: 10px 0;
      background: #faf5ff; border-radius: 0 6px 6px 0;
      color: #6b7280; font-style: italic;
    }
    a { color: #7c3aed; }

    /* ── 表格 ── */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 13px;
      border: 1px solid #e9d5ff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 1px 8px rgba(124,58,237,0.08);
    }
    thead { background: linear-gradient(135deg, #ede9fe, #e0e7ff); }
    thead th {
      padding: 11px 16px;
      text-align: left;
      color: #5b21b6;
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #c4b5fd;
      border-right: 1px solid #e9d5ff;
    }
    thead th:last-child { border-right: none; }
    tbody tr:nth-child(even) { background: #faf5ff; }
    tbody tr:nth-child(odd)  { background: #fff; }
    tbody td {
      padding: 10px 16px;
      color: #374151;
      vertical-align: top;
      line-height: 1.7;
      border-bottom: 1px solid #f3e8ff;
      border-right: 1px solid #f3e8ff;
    }
    tbody td:last-child { border-right: none; }
    tbody tr:last-child td { border-bottom: none; }

    hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
    .section-divider { border: none; border-top: 2px dashed #c4b5fd; margin: 32px 0; }
    .footer {
      margin-top: 48px; padding-top: 16px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px; color: #9ca3af; text-align: center;
    }
    .actions {
      text-align: center; margin-top: 36px;
      display: flex; justify-content: center; gap: 12px;
    }
    .btn-print {
      padding: 12px 32px;
      background: linear-gradient(to right, #7c3aed, #4f46e5);
      color: white; border: none; border-radius: 9999px;
      font-size: 14px; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 16px rgba(124,58,237,0.3);
    }
    .btn-close {
      padding: 12px 24px; background: #f3f4f6; color: #374151;
      border: none; border-radius: 9999px; font-size: 14px; cursor: pointer;
    }
    @media print {
      body { padding: 20px 32px; }
      .actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">✈ 途灵 <span>TripMind</span></div>
    <div class="meta">
      <div>旅行者：${username || "旅行者"}</div>
      <div>导出时间：${now}</div>
    </div>
  </div>
  <div class="content">${content}</div>
  <div class="footer">
    本行程由途灵 TripMind AI 智能规划 · 仅供参考，请根据实际情况调整
  </div>
  <div class="actions">
    <button class="btn-print" onclick="window.print()">🖨️ 打印 / 保存 PDF</button>
    <button class="btn-close" onclick="window.close()">关闭</button>
  </div>
</body>
</html>`);
    printWindow.document.close();
    setExporting(false);
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "7px 14px", borderRadius: "9999px",
        fontSize: "12px", fontWeight: "600", cursor: "pointer",
        transition: "all 0.2s",
        background: "rgba(167,139,250,0.12)", color: "#a78bfa",
        border: "1px solid rgba(167,139,250,0.25)",
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: "15px" }}>download</span>
      导出行程
    </button>
  );
};

export default ExportButton;
