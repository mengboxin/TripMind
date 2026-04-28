import React, { useEffect, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { api } from '../api.js'
import StatCard from '../components/StatCard.jsx'

const C = { border: '#1e1e28', card: '#17171f', muted: '#8b8a96' }

const ChartCard = ({ title, children }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px 24px' }}>
    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '20px', color: '#e2e0e8' }}>{title}</div>
    {children}
  </div>
)

const tooltipStyle = { background: '#1e1e28', border: '1px solid #2a2838', borderRadius: '8px', fontSize: '13px' }

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dashboard().then(setData).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: C.muted, padding: '40px', textAlign: 'center' }}>加载中...</div>
  if (!data) return <div style={{ color: '#f87171', padding: '40px' }}>加载失败，请检查管理员权限</div>

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px' }}>仪表盘</h1>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <StatCard icon="group" label="总用户数" value={data.total_users} sub={`今日新增 +${data.new_users_today}`} color="#7c6af7" />
        <StatCard icon="forum" label="总对话数" value={data.total_chats} sub={`今日 +${data.chats_today}`} color="#22d3ee" />
        <StatCard icon="explore" label="目的地数量" value={data.total_destinations} sub="已上线展示" color="#34d399" />
        <StatCard icon="wallet" label="旅行预算数" value={data.total_budgets} color="#f59e0b" />
        <StatCard icon="today" label="今日新用户" value={data.new_users_today} color="#f472b6" />
        <StatCard icon="chat_bubble" label="今日对话" value={data.chats_today} color="#818cf8" />
      </div>

      {/* 图表区 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <ChartCard title="近7天用户注册趋势">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.reg_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" />
              <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="count" stroke="#7c6af7" strokeWidth={2} dot={{ fill: '#7c6af7', r: 3 }} name="注册数" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="近7天对话趋势">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.chat_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e28" />
              <XAxis dataKey="date" tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.muted, fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} name="对话数" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 快速入口 */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px 24px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#e2e0e8' }}>快速操作</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: '管理用户', icon: 'group', color: '#7c6af7', page: 'users' },
            { label: '查看对话', icon: 'forum', color: '#22d3ee', page: 'chats' },
            { label: '目的地管理', icon: 'explore', color: '#34d399', page: 'destinations' },
            { label: '模型配置', icon: 'smart_toy', color: '#f59e0b', page: 'models' },
            { label: 'API 配置', icon: 'tune', color: '#f472b6', page: 'config' },
          ].map(btn => (
            <button key={btn.label} onClick={() => window.dispatchEvent(new CustomEvent('admin-nav', { detail: btn.page }))}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '10px',
                border: `1px solid ${btn.color}33`,
                background: btn.color + '11', color: btn.color,
                cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
