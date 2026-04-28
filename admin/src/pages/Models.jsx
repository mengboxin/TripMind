import React, { useEffect, useState } from 'react'
import { api } from '../api.js'

const C = { card: '#17171f', border: '#1e1e28', muted: '#8b8a96', primary: '#7c6af7' }
const inp = { width: '100%', height: '38px', background: '#1e1e28', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0 12px', color: '#e2e0e8', fontSize: '13px', outline: 'none' }

const PROVIDERS = ['openai', 'tongyi', 'zhipu', 'custom']
const PROVIDER_DEFAULTS = {
  openai:  { base_url: 'https://api.openai.com/v1',                              model_name: 'gpt-4o-mini' },
  tongyi:  { base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',      model_name: 'qwen-plus' },
  zhipu:   { base_url: 'https://open.bigmodel.cn/api/paas/v4/',                  model_name: 'glm-4' },
  custom:  { base_url: '',                                                         model_name: '' },
}
const EMPTY = { name: '', provider: 'openai', model_name: 'gpt-4o-mini', api_key: '', base_url: 'https://api.openai.com/v1', temperature: 0.7 }

const providerColor = { openai: '#22d3ee', tongyi: '#7c6af7', zhipu: '#34d399', custom: '#f59e0b' }

export default function Models() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => {
    setLoading(true)
    api.listModels().then(setModels).catch(e => setMsg(e.message)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openNew = () => { setForm({ ...EMPTY }); setEdit('new') }
  const openEdit = (m) => {
    // api_key 不回显（安全），留空表示编辑时不修改
    setForm({ ...m, api_key: '' })
    setEdit(m.id)
  }

  const handleProviderChange = (provider) => {
    const defaults = PROVIDER_DEFAULTS[provider] || {}
    setForm(f => ({ ...f, provider, model_name: defaults.model_name || '', base_url: defaults.base_url || '' }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setMsg('请填写配置名称'); return }
    if (!form.model_name.trim()) { setMsg('请填写模型名称'); return }
    if (edit === 'new' && !form.api_key.trim()) { setMsg('新增时 API Key 不能为空'); return }
    setSaving(true); setMsg('')
    try {
      if (edit === 'new') {
        await api.createModel(form)
      } else {
        // 如果 api_key 为空，不传该字段（后端保留原值）
        const body = { ...form }
        if (!body.api_key) delete body.api_key
        await api.updateModel(edit, body)
      }
      setEdit(null); load(); setMsg('保存成功')
    } catch (e) { setMsg(e.message) }
    finally { setSaving(false) }
  }

  const handleActivate = async (id, name) => {
    try { await api.activateModel(id); load(); setMsg(`✅ 已切换到：${name}`) }
    catch (e) { setMsg(e.message) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`确认删除模型配置 "${name}"？`)) return
    try { await api.deleteModel(id); load(); setMsg('已删除') }
    catch (e) { setMsg(e.message) }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700' }}>模型管理</h1>
          <p style={{ fontSize: '13px', color: C.muted, marginTop: '4px' }}>
            新增/编辑模型时直接填写 API Key，点击「激活」热切换当前使用的模型（无需重启）
          </p>
        </div>
        <button onClick={openNew} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: C.primary, color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer', flexShrink: 0 }}>
          + 新增模型
        </button>
      </div>

      {msg && (
        <div style={{ marginBottom: '14px', padding: '10px 14px', background: '#1e1e28', borderRadius: '8px', fontSize: '13px', color: msg.startsWith('✅') ? '#a3e635' : '#f87171' }}>
          {msg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {loading
          ? <div style={{ color: C.muted, padding: '40px', textAlign: 'center' }}>加载中...</div>
          : models.length === 0
            ? <div style={{ color: C.muted, padding: '40px', textAlign: 'center' }}>暂无模型配置，点击「新增模型」添加</div>
            : models.map(m => (
          <div key={m.id} style={{
            background: C.card,
            border: `1px solid ${m.is_active ? C.primary : C.border}`,
            borderRadius: '14px', padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.is_active ? '#34d399' : '#3a3848', flexShrink: 0 }} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: '600', fontSize: '15px' }}>{m.name}</span>
                {m.is_active && (
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', background: '#34d39922', color: '#34d399', fontWeight: '700' }}>
                    当前激活
                  </span>
                )}
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '9999px', background: (providerColor[m.provider] || '#888') + '22', color: providerColor[m.provider] || '#888' }}>
                  {m.provider}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: C.muted, display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span>模型：<span style={{ color: '#e2e0e8', fontFamily: 'monospace' }}>{m.model_name}</span></span>
                <span>Base URL：<span style={{ color: '#e2e0e8' }}>{m.base_url || '默认'}</span></span>
                <span>温度：<span style={{ color: '#e2e0e8' }}>{m.temperature}</span></span>
                <span>API Key：<span style={{ color: '#e2e0e8' }}>{m.api_key ? '已配置 ****' : '未配置'}</span></span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              {!m.is_active && (
                <button onClick={() => handleActivate(m.id, m.name)}
                  style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#34d39922', color: '#34d399', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                  激活
                </button>
              )}
              <button onClick={() => openEdit(m)}
                style={{ padding: '6px 14px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: '#e2e0e8', cursor: 'pointer', fontSize: '12px' }}>
                编辑
              </button>
              <button onClick={() => handleDelete(m.id, m.name)}
                style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #7f1d1d', background: 'transparent', color: '#f87171', cursor: 'pointer', fontSize: '12px' }}>
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 新增/编辑弹窗 */}
      {edit !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }}
          onClick={() => setEdit(null)}>
          <div style={{ background: '#17171f', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '28px', width: '520px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '6px', fontSize: '17px', fontWeight: '700' }}>
              {edit === 'new' ? '新增模型配置' : `编辑：${form.name}`}
            </h3>
            <p style={{ fontSize: '12px', color: C.muted, marginBottom: '20px' }}>
              {edit !== 'new' && 'API Key 留空则保留原值，不会被清除'}
            </p>

            {/* Provider 选择 */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '6px' }}>Provider 类型</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {PROVIDERS.map(p => (
                  <button key={p} type="button" onClick={() => handleProviderChange(p)}
                    style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                      background: form.provider === p ? (providerColor[p] + '33') : '#1e1e28',
                      color: form.provider === p ? providerColor[p] : C.muted,
                      outline: form.provider === p ? `1px solid ${providerColor[p]}` : 'none',
                    }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* 配置名称 */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '6px' }}>配置名称 <span style={{ color: '#f87171' }}>*</span></label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="如：通义千问 qwen-plus" style={inp} />
            </div>

            {/* 模型名称 */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '6px' }}>模型名称 <span style={{ color: '#f87171' }}>*</span></label>
              <input value={form.model_name} onChange={e => setForm(f => ({ ...f, model_name: e.target.value }))}
                placeholder="如：qwen-plus / gpt-4o-mini / glm-4" style={inp} />
            </div>

            {/* API Key */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '6px' }}>
                API Key {edit === 'new' && <span style={{ color: '#f87171' }}>*</span>}
                {edit !== 'new' && <span style={{ marginLeft: '6px', color: '#4b5563' }}>（留空保留原值）</span>}
              </label>
              <input type="password" value={form.api_key} onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))}
                placeholder={edit === 'new' ? '请输入 API Key' : '留空则不修改'} style={inp} />
            </div>

            {/* Base URL */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '6px' }}>
                Base URL
                <span style={{ marginLeft: '6px', color: '#4b5563' }}>（通义千问留空自动填充默认地址）</span>
              </label>
              <input value={form.base_url} onChange={e => setForm(f => ({ ...f, base_url: e.target.value }))}
                placeholder="https://api.openai.com/v1" style={inp} />
            </div>

            {/* 温度 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '6px' }}>
                温度 (0 ~ 2)：<span style={{ color: '#e2e0e8' }}>{form.temperature}</span>
              </label>
              <input type="range" min="0" max="2" step="0.1" value={form.temperature}
                onChange={e => setForm(f => ({ ...f, temperature: parseFloat(e.target.value) }))}
                style={{ width: '100%', accentColor: C.primary }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: C.muted, marginTop: '4px' }}>
                <span>0 精确</span><span>1 平衡</span><span>2 创意</span>
              </div>
            </div>

            {msg && edit !== null && (
              <div style={{ marginBottom: '12px', padding: '8px 12px', background: '#1e1e28', borderRadius: '8px', fontSize: '12px', color: '#f87171' }}>{msg}</div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setEdit(null)}
                style={{ flex: 1, height: '42px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: '#e2e0e8', cursor: 'pointer', fontSize: '14px' }}>
                取消
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ flex: 2, height: '42px', borderRadius: '8px', border: 'none', background: C.primary, color: '#fff', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: saving ? 0.7 : 1 }}>
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
