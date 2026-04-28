import React, { useState } from 'react'
import { api } from '../api.js'

const C = { bg: '#0f0f14', card: '#17171f', border: '#2a2838', primary: '#7c6af7', text: '#e2e0e8', muted: '#8b8a96' }

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const data = await api.login(username, password)
      onLogin({ token: data.token, username: data.username })
    } catch (e) {
      setError(e.message || '登录失败，请检查账号密码或管理员权限')
    } finally { setLoading(false) }
  }

  const inp = {
    width: '100%', height: '44px', background: '#1e1e28', border: `1px solid ${C.border}`,
    borderRadius: '10px', padding: '0 14px', color: C.text, fontSize: '14px', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '360px', background: C.card, borderRadius: '16px', padding: '36px', border: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '20px', fontVariationSettings: "'FILL' 1" }}>shield_person</span>
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '16px' }}>TripMind Admin</div>
            <div style={{ fontSize: '12px', color: C.muted }}>管理后台</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '6px' }}>管理员账号</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder="用户名" required style={inp} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '6px' }}>密码</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="密码" required style={inp} />
          </div>
          {error && <p style={{ fontSize: '13px', color: '#f87171', margin: 0 }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            height: '44px', background: C.primary, border: 'none', borderRadius: '10px',
            color: '#fff', fontWeight: '600', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, marginTop: '4px',
          }}>{loading ? '登录中...' : '登录'}</button>
        </form>
      </div>
    </div>
  )
}
