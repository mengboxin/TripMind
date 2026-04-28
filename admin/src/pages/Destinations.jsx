import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api.js'

const C = { card: '#17171f', border: '#1e1e28', muted: '#8b8a96', primary: '#7c6af7' }
const inp = { width: '100%', height: '38px', background: '#1e1e28', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0 12px', color: '#e2e0e8', fontSize: '13px', outline: 'none' }
const EMPTY = { dest_id:'', name:'', country:'', region:'亚洲', tag:'', lat:0, lon:0, img:'', description:'', highlights:[], food:[], best_time:'', flights:'', is_active:1, sort_order:0 }

export default function Destinations() {
  const [data, setData] = useState({ total: 0, items: [] })
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { setData(await api.listDests(page, keyword)) } catch (e) { setMsg(e.message) }
    finally { setLoading(false) }
  }, [page, keyword])

  useEffect(() => { load() }, [load])

  const openEdit = (d) => {
    setForm({ ...d, highlights: Array.isArray(d.highlights) ? d.highlights.join('\n') : d.highlights, food: Array.isArray(d.food) ? d.food.join('\n') : d.food })
    setEdit(d.id)
  }
  const openNew = () => { setForm({ ...EMPTY, highlights: '', food: '' }); setEdit('new') }

  const parseLines = (v) => (typeof v === 'string' ? v.split('\n').map(s => s.trim()).filter(Boolean) : v)

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      const body = { ...form, highlights: parseLines(form.highlights), food: parseLines(form.food), lat: parseFloat(form.lat), lon: parseFloat(form.lon), sort_order: parseInt(form.sort_order) }
      if (edit === 'new') await api.createDest(body)
      else await api.updateDest(edit, body)
      setEdit(null); load(); setMsg('保存成功')
    } catch (e) { setMsg(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`确认删除目的地 "${name}"？`)) return
    try { await api.deleteDest(id); load(); setMsg('已删除') } catch (e) { setMsg(e.message) }
  }

  const handleToggle = async (id) => {
    try { await api.toggleDest(id); load() } catch (e) { setMsg(e.message) }
  }

  const PAGE_SIZE = 20
  const totalPages = Math.ceil(data.total / PAGE_SIZE)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700' }}>目的地管理</h1>
          <p style={{ fontSize: '13px', color: C.muted, marginTop: '4px' }}>管理前端展示的目的地卡片，修改后前端实时生效</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1) }} placeholder="搜索名称/国家/标签"
            style={{ ...inp, width: '200px' }} />
          <button onClick={openNew} style={{ padding: '0 20px', height: '38px', borderRadius: '8px', border: 'none', background: C.primary, color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>+ 新增</button>
        </div>
      </div>

      {msg && <div style={{ marginBottom: '12px', padding: '10px 14px', background: '#1e1e28', borderRadius: '8px', fontSize: '13px', color: '#a3e635' }}>{msg}</div>}

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {['排序', '图片', '名称', '国家', '地区', '标签', '状态', '操作'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: C.muted, fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: C.muted }}>加载中...</td></tr>
            ) : data.items.map(d => (
              <tr key={d.id} style={{ borderBottom: `1px solid ${C.border}`, opacity: d.is_active ? 1 : 0.5 }}>
                <td style={{ padding: '10px 14px', color: C.muted }}>{d.sort_order}</td>
                <td style={{ padding: '10px 14px' }}>
                  <img src={d.img} alt={d.name} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} onError={e => e.target.style.display = 'none'} />
                </td>
                <td style={{ padding: '10px 14px', fontWeight: '600' }}>{d.name}</td>
                <td style={{ padding: '10px 14px', color: C.muted }}>{d.country}</td>
                <td style={{ padding: '10px 14px', color: C.muted }}>{d.region}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', background: 'rgba(124,106,247,0.15)', color: C.primary }}>{d.tag}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => handleToggle(d.id)} style={{ padding: '3px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600',
                    background: d.is_active ? '#34d39922' : '#3a3848', color: d.is_active ? '#34d399' : C.muted }}>
                    {d.is_active ? '显示中' : '已隐藏'}
                  </button>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => openEdit(d)} style={{ padding: '4px 10px', borderRadius: '6px', border: `1px solid ${C.border}`, background: 'transparent', color: '#e2e0e8', cursor: 'pointer', fontSize: '12px' }}>编辑</button>
                    <button onClick={() => handleDelete(d.id, d.name)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #7f1d1d', background: 'transparent', color: '#f87171', cursor: 'pointer', fontSize: '12px' }}>删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', fontSize: '13px', color: C.muted }}>
        <span>共 {data.total} 条</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={{ ...inp, width: 'auto', padding: '0 12px', cursor: 'pointer', opacity: page <= 1 ? 0.4 : 1 }}>上一页</button>
          <span style={{ lineHeight: '38px' }}>{page} / {totalPages || 1}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ ...inp, width: 'auto', padding: '0 12px', cursor: 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}>下一页</button>
        </div>
      </div>

      {/* 编辑弹窗 */}
      {edit !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '20px' }} onClick={() => setEdit(null)}>
          <div style={{ background: '#17171f', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '28px', width: '600px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>{edit === 'new' ? '新增目的地' : `编辑：${form.name}`}</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {[['ID标识', 'dest_id', '如 beijing'], ['名称', 'name', '如 北京'], ['国家', 'country', '如 中国'], ['标签', 'tag', '如 历史·文化'], ['纬度', 'lat', '39.90'], ['经度', 'lon', '116.40'], ['最佳时间', 'best_time', '4-5月'], ['飞行时间', 'flights', '国内航班'], ['排序', 'sort_order', '0']].map(([label, key, ph]) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '5px' }}>{label}</label>
                  <input value={form[key] ?? ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={inp} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '5px' }}>地区</label>
                <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
                  {['亚洲','欧洲','美洲','非洲','大洋洲'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '5px' }}>状态</label>
                <select value={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: parseInt(e.target.value) }))} style={{ ...inp, cursor: 'pointer' }}>
                  <option value={1}>显示</option><option value={0}>隐藏</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '5px' }}>图片 URL</label>
              <input value={form.img} onChange={e => setForm(f => ({ ...f, img: e.target.value }))} placeholder="https://..." style={inp} />
              {form.img && <img src={form.img} alt="" style={{ marginTop: '8px', width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} onError={e => e.target.style.display = 'none'} />}
            </div>

            <div style={{ marginTop: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '5px' }}>简介</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                style={{ ...inp, height: 'auto', padding: '10px 12px', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '5px' }}>热门景点（每行一个）</label>
                <textarea value={typeof form.highlights === 'string' ? form.highlights : form.highlights?.join('\n')} onChange={e => setForm(f => ({ ...f, highlights: e.target.value }))} rows={5}
                  style={{ ...inp, height: 'auto', padding: '10px 12px', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '5px' }}>特色美食（每行一个）</label>
                <textarea value={typeof form.food === 'string' ? form.food : form.food?.join('\n')} onChange={e => setForm(f => ({ ...f, food: e.target.value }))} rows={5}
                  style={{ ...inp, height: 'auto', padding: '10px 12px', resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setEdit(null)} style={{ flex: 1, height: '40px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: '#e2e0e8', cursor: 'pointer' }}>取消</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, height: '40px', borderRadius: '8px', border: 'none', background: C.primary, color: '#fff', fontWeight: '600', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? '保存中...' : '保存'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
