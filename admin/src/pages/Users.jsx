import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api.js'

const C = { card: '#17171f', border: '#1e1e28', muted: '#8b8a96', primary: '#7c6af7' }

const inp = {
  height: '36px', background: '#1e1e28', border: `1px solid ${C.border}`,
  borderRadius: '8px', padding: '0 12px', color: '#e2e0e8', fontSize: '13px', outline: 'none',
}

export default function Users() {
  const [data, setData] = useState({ total: 0, items: [] })
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [editUser, setEditUser] = useState(null)  // {id, email, phone, real_name, password}
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try { setData(await api.users(page, keyword)) } catch (e) { setMsg(e.message) }
    finally { setLoading(false) }
  }, [page, keyword])

  useEffect(() => { load() }, [load])

  const handleDelete = async (uid, uname) => {
    if (!confirm(`确认删除用户 "${uname}"？此操作不可恢复`)) return
    try { await api.deleteUser(uid); setMsg('已删除'); load() } catch (e) { setMsg(e.message) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const body = {}
      if (editUser.email) body.email = editUser.email
      if (editUser.phone) body.phone = editUser.phone
      if (editUser.real_name) body.real_name = editUser.real_name
      if (editUser.password) body.password = editUser.password
      await api.updateUser(editUser.id, body)
      setMsg('保存成功'); setEditUser(null); load()
    } catch (e) { setMsg(e.message) }
    finally { setSaving(false) }
  }

  const PAGE_SIZE = 20
  const totalPages = Math.ceil(data.total / PAGE_SIZE)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700' }}>用户管理</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input value={keyword} onChange={e => { setKeyword(e.target.value); setPage(1) }}
            placeholder="搜索用户名/邮箱" style={{ ...inp, width: '220px' }} />
          <button onClick={load} style={{ ...inp, padding: '0 16px', cursor: 'pointer', background: C.primary, border: 'none', color: '#fff', fontWeight: '600' }}>搜索</button>
        </div>
      </div>

      {msg && <div style={{ marginBottom: '12px', padding: '10px 14px', background: '#1e1e28', borderRadius: '8px', fontSize: '13px', color: '#a3e635' }}>{msg}</div>}

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {['ID', '用户名', '邮箱', '手机', '真实姓名', '注册时间', '操作'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: C.muted, fontWeight: '600' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: C.muted }}>加载中...</td></tr>
            ) : data.items.map(u => (
              <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '12px 16px', color: C.muted }}>{u.id}</td>
                <td style={{ padding: '12px 16px', fontWeight: '500' }}>{u.username}</td>
                <td style={{ padding: '12px 16px', color: C.muted }}>{u.email || '—'}</td>
                <td style={{ padding: '12px 16px', color: C.muted }}>{u.phone || '—'}</td>
                <td style={{ padding: '12px 16px', color: C.muted }}>{u.real_name || '—'}</td>
                <td style={{ padding: '12px 16px', color: C.muted }}>{u.create_time ? u.create_time.slice(0, 10) : '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setEditUser({ ...u, password: '' })} style={{ padding: '4px 10px', borderRadius: '6px', border: `1px solid ${C.border}`, background: 'transparent', color: '#e2e0e8', cursor: 'pointer', fontSize: '12px' }}>编辑</button>
                    <button onClick={() => handleDelete(u.id, u.username)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #7f1d1d', background: 'transparent', color: '#f87171', cursor: 'pointer', fontSize: '12px' }}>删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', fontSize: '13px', color: C.muted }}>
        <span>共 {data.total} 条</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
            style={{ ...inp, padding: '0 12px', cursor: 'pointer', opacity: page <= 1 ? 0.4 : 1 }}>上一页</button>
          <span style={{ lineHeight: '36px' }}>{page} / {totalPages || 1}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
            style={{ ...inp, padding: '0 12px', cursor: 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}>下一页</button>
        </div>
      </div>

      {/* 编辑弹窗 */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={() => setEditUser(null)}>
          <div style={{ background: '#17171f', border: `1px solid ${C.border}`, borderRadius: '16px', padding: '28px', width: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '700' }}>编辑用户 · {editUser.username}</h3>
            {[['邮箱', 'email', 'email'], ['手机', 'phone', 'text'], ['真实姓名', 'real_name', 'text'], ['重置密码（留空不修改）', 'password', 'password']].map(([label, key, type]) => (
              <div key={key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: C.muted, marginBottom: '6px' }}>{label}</label>
                <input type={type} value={editUser[key] || ''} onChange={e => setEditUser(u => ({ ...u, [key]: e.target.value }))}
                  style={{ ...inp, width: '100%', height: '40px' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setEditUser(null)} style={{ flex: 1, height: '40px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: '#e2e0e8', cursor: 'pointer' }}>取消</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 2, height: '40px', borderRadius: '8px', border: 'none', background: C.primary, color: '#fff', fontWeight: '600', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? '保存中...' : '保存'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
