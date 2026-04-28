import React, { useEffect, useState } from 'react'
import { api } from '../api.js'

const C = { card: '#17171f', border: '#1e1e28', muted: '#8b8a96', primary: '#7c6af7' }
const inp = { width: '100%', height: '40px', background: '#1e1e28', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0 12px', color: '#e2e0e8', fontSize: '13px', outline: 'none' }

const GROUPS = [
  {
    title: '通义千问 (DashScope)',
    color: '#7c6af7',
    icon: 'psychology',
    keys: ['DASHSCOPE_API_KEY', 'DASHSCOPE_BASE_URL'],
  },
  {
    title: 'OpenAI / 兼容接口',
    color: '#22d3ee',
    icon: 'smart_toy',
    keys: ['OPENAI_API_KEY', 'OPENAI_BASE_URL'],
  },
  {
    title: '智谱 AI (ZhipuAI)',
    color: '#34d399',
    icon: 'hub',
    keys: ['ZAI_API_KEY', 'ZAI_BASE_URL'],
  },
  {
    title: 'Tavily 搜索',
    color: '#f59e0b',
    icon: 'search',
    keys: ['TAVILY_API_KEY'],
  },
  {
    title: '邮件 SMTP',
    color: '#f472b6',
    icon: 'mail',
    keys: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'],
  },
]

const LABELS = {
  DASHSCOPE_API_KEY: 'API Key', DASHSCOPE_BASE_URL: 'Base URL',
  OPENAI_API_KEY: 'API Key', OPENAI_BASE_URL: 'Base URL',
  ZAI_API_KEY: 'API Key', ZAI_BASE_URL: 'Base URL',
  TAVILY_API_KEY: 'API Key',
  SMTP_HOST: 'SMTP Host', SMTP_PORT: 'SMTP Port', SMTP_USER: '发件人账号',
  SMTP_PASSWORD: '授权码/密码', SMTP_FROM: '发件人名称',
}

export default function Config() {
  const [config, setConfig] = useState({})
  const [edits, setEdits] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.getEnvConfig().then(d => { setConfig(d); setEdits({}) }).catch(e => setMsg(e.message)).finally(() => setLoading(false))
  }, [])

  const handleChange = (k, v) => setEdits(e => ({ ...e, [k]: v }))

  const handleSave = async (keys) => {
    const updates = {}
    keys.forEach(k => { if (edits[k] !== undefined && edits[k] !== '') updates[k] = edits[k] })
    if (!Object.keys(updates).length) { setMsg('没有修改内容'); return }
    setSaving(true); setMsg('')
    try {
      await api.updateEnvConfig(updates)
      setMsg(`已保存：${Object.keys(updates).join(', ')}`)
      const fresh = await api.getEnvConfig()
      setConfig(fresh); setEdits({})
    } catch (e) { setMsg(e.message) }
    finally { setSaving(false) }
  }

  if (loading) return <div style={{ color: C.muted, padding: '40px', textAlign: 'center' }}>加载中...</div>

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>模型 & 服务配置</h1>
      <p style={{ fontSize: '13px', color: C.muted, marginBottom: '24px' }}>修改后立即生效（写入 .env 文件并更新当前进程环境变量）。Key 字段当前仅显示前8位。</p>

      {msg && <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#1e1e28', borderRadius: '8px', fontSize: '13px', color: '#a3e635' }}>{msg}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {GROUPS.map(g => (
          <div key={g.title} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: g.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: g.color, fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>{g.icon}</span>
              </div>
              <span style={{ fontWeight: '600', fontSize: '15px' }}>{g.title}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', marginBottom: '16px' }}>
              {g.keys.map(k => (
                <div key={k}>
                  <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '6px' }}>
                    {LABELS[k] || k}
                    <span style={{ marginLeft: '6px', fontSize: '11px', color: '#3a3848' }}>({k})</span>
                  </label>
                  <input
                    type={k.includes('KEY') || k.includes('PASSWORD') ? 'password' : 'text'}
                    placeholder={config[k] || '未设置'}
                    value={edits[k] ?? ''}
                    onChange={e => handleChange(k, e.target.value)}
                    style={inp}
                  />
                </div>
              ))}
            </div>

            <button onClick={() => handleSave(g.keys)} disabled={saving} style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none',
              background: g.color, color: '#fff', fontWeight: '600', fontSize: '13px',
              cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
            }}>保存此分组</button>
          </div>
        ))}
      </div>
    </div>
  )
}
