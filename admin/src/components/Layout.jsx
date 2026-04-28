import React from 'react'

const C = { bg: '#0f0f14', sidebar: '#13131a', border: '#1e1e28', primary: '#7c6af7', text: '#e2e0e8', muted: '#8b8a96', active: '#1e1b2e' }

const NAV = [
  { key: 'dashboard',    icon: 'dashboard',   label: '仪表盘' },
  { key: 'users',        icon: 'group',        label: '用户管理' },
  { key: 'chats',        icon: 'forum',        label: '对话日志' },
  { key: 'destinations', icon: 'explore',      label: '目的地管理' },
  { key: 'models',       icon: 'smart_toy',    label: '模型管理' },
  { key: 'config',       icon: 'tune',         label: 'API 配置' },
  { key: 'system',       icon: 'memory',       label: '系统信息' },
]

export default function Layout({ children, page, onNav, onLogout, username }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg }}>
      {/* 侧边栏 */}
      <aside style={{ width: '220px', background: C.sidebar, borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px' }}>TripMind</div>
              <div style={{ fontSize: '11px', color: C.muted }}>Admin Console</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {NAV.map(n => (
            <button key={n.key} onClick={() => onNav(n.key)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: page === n.key ? C.active : 'transparent',
              color: page === n.key ? C.primary : C.muted,
              fontSize: '14px', fontWeight: page === n.key ? '600' : '400',
              marginBottom: '2px', transition: 'all 0.15s',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', fontVariationSettings: page === n.key ? "'FILL' 1" : "'FILL' 0" }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px 8px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ padding: '8px 12px', marginBottom: '4px', fontSize: '13px', color: C.muted }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '6px' }}>person</span>
            {username}
          </div>
          <button onClick={onLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#f87171', fontSize: '14px',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容 */}
      <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        {children}
      </main>
    </div>
  )
}
