import React, { useEffect, useState } from 'react'
import { api } from '../api.js'

const C = { card: '#17171f', border: '#1e1e28', muted: '#8b8a96' }

const Row = ({ label, value, ok }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: `1px solid ${C.border}` }}>
    <span style={{ fontSize: '14px', color: C.muted }}>{label}</span>
    <span style={{ fontSize: '13px', fontFamily: ok !== undefined ? 'inherit' : 'monospace', color: ok === true ? '#34d399' : ok === false ? '#f87171' : '#e2e0e8', fontWeight: ok !== undefined ? '600' : '400' }}>
      {ok === true ? '✓ ' : ok === false ? '✗ ' : ''}{value}
    </span>
  </div>
)

export default function System() {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.systemInfo().then(setInfo).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: C.muted, padding: '40px', textAlign: 'center' }}>加载中...</div>
  if (!info) return <div style={{ color: '#f87171', padding: '40px' }}>加载失败</div>

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px' }}>系统信息</h1>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '4px 24px' }}>
        <Row label="服务器时间" value={info.server_time?.replace('T', ' ').slice(0, 19)} />
        <Row label="Python 版本" value={info.python?.split(' ')[0]} />
        <Row label="运行平台" value={info.platform} />
        <Row label="Redis 状态" value={info.redis === 'connected' ? '已连接' : '未连接'} ok={info.redis === 'connected'} />
        <Row label="当前激活模型" value={info.active_model} />
      </div>

      <div style={{ marginTop: '20px', background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px 24px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>快速操作</div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { label: '刷新系统信息', icon: 'refresh', action: () => { setLoading(true); api.systemInfo().then(setInfo).finally(() => setLoading(false)) } },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '10px', border: `1px solid ${C.border}`,
              background: 'transparent', color: '#e2e0e8', cursor: 'pointer', fontSize: '13px', fontWeight: '500',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{btn.icon}</span>
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
