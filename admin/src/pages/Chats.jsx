import React, { useEffect, useState, useCallback } from 'react'
import { api } from '../api.js'

const C = { card: '#17171f', border: '#1e1e28', muted: '#8b8a96', primary: '#7c6af7' }
const inp = { height: '36px', background: '#1e1e28', border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0 12px', color: '#e2e0e8', fontSize: '13px', outline: 'none' }

export default function Chats() {
  const [data, setData] = useState({ total: 0, items: [] })
  const [page, setPage] = useState(1)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [detail, setDetail] = useState(null)   // 当前查看的对话详情
  const [detailLoading, setDetailLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try { setData(await api.chats(page, username)) } catch (e) { setMsg(e.message) }
    finally { setLoading(false) }
  }, [page, username])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    if (!confirm('确认删除此对话记录？')) return
    try { await api.deleteChat(id); setMsg('已删除'); load() } catch (e) { setMsg(e.message) }
  }

  const handleViewDetail = async (id) => {
    setDetailLoading(true)
    setDetail({ loading: true })
    try {
      const d = await api.chatDetail(id)
      setDetail(d)
    } catch (e) {
      setMsg(e.message)
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const PAGE_SIZE = 20
  const totalPages = Math.ceil(data.total / PAGE_SIZE)

  return (
    <div style={{ display: 'flex', gap: '20px', height: '100%' }}>
      {/* 左侧列表 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '700' }}>对话日志</h1>
            <p style={{ fontSize: '13px', color: C.muted, marginTop: '4px' }}>点击「查看」可展开完整对话内容</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input value={username} onChange={e => { setUsername(e.target.value); setPage(1) }}
              placeholder="按用户名筛选" style={{ ...inp, width: '180px' }} />
            <button onClick={load} style={{ ...inp, padding: '0 16px', cursor: 'pointer', background: C.primary, border: 'none', color: '#fff', fontWeight: '600' }}>筛选</button>
          </div>
        </div>

        {msg && <div style={{ marginBottom: '12px', padding: '10px 14px', background: '#1e1e28', borderRadius: '8px', fontSize: '13px', color: '#a3e635' }}>{msg}</div>}

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['ID', '用户', '标题', '消息数', '最后更新', '操作'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: C.muted, fontWeight: '600' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: C.muted }}>加载中...</td></tr>
              ) : data.items.map(c => (
                <tr key={c.id}
                  style={{ borderBottom: `1px solid ${C.border}`, background: detail?.id === c.id ? 'rgba(124,106,247,0.08)' : 'transparent', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => { if (detail?.id !== c.id) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={e => { if (detail?.id !== c.id) e.currentTarget.style.background = 'transparent' }}>
                  <td style={{ padding: '12px 16px', color: C.muted }}>{c.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: '500' }}>{c.username}</td>
                  <td style={{ padding: '12px 16px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title || '无标题'}</td>
                  <td style={{ padding: '12px 16px', color: C.muted }}>
                    <span style={{ padding: '2px 8px', borderRadius: '9999px', background: 'rgba(124,106,247,0.15)', color: C.primary, fontSize: '12px' }}>
                      {c.message_count ?? '—'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: C.muted }}>{c.updated_at ? c.updated_at.slice(0, 16) : '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleViewDetail(c.id)}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: `1px solid ${C.primary}44`, background: detail?.id === c.id ? C.primary + '22' : 'transparent', color: C.primary, cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                        {detail?.id === c.id ? '已展开' : '查看'}
                      </button>
                      <button onClick={() => handleDelete(c.id)}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #7f1d1d', background: 'transparent', color: '#f87171', cursor: 'pointer', fontSize: '12px' }}>
                        删除
                      </button>
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
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} style={{ ...inp, padding: '0 12px', cursor: 'pointer', opacity: page <= 1 ? 0.4 : 1 }}>上一页</button>
            <span style={{ lineHeight: '36px' }}>{page} / {totalPages || 1}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} style={{ ...inp, padding: '0 12px', cursor: 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}>下一页</button>
          </div>
        </div>
      </div>

      {/* 右侧对话详情面板 */}
      {detail && (
        <div style={{
          width: '420px', flexShrink: 0,
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: '14px', display: 'flex', flexDirection: 'column',
          maxHeight: 'calc(100vh - 120px)', position: 'sticky', top: '0',
        }}>
          {/* 面板头部 */}
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: '700', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {detail.loading ? '加载中...' : (detail.title || '无标题')}
              </div>
              {!detail.loading && (
                <div style={{ fontSize: '12px', color: C.muted, marginTop: '2px' }}>
                  {detail.username} · {detail.updated_at?.slice(0, 16)}
                </div>
              )}
            </div>
            <button onClick={() => setDetail(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: '4px', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
            </button>
          </div>

          {/* 消息列表 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {detail.loading ? (
              <div style={{ color: C.muted, textAlign: 'center', padding: '40px' }}>加载中...</div>
            ) : !detail.messages?.length ? (
              <div style={{ color: C.muted, textAlign: 'center', padding: '40px' }}>暂无消息记录</div>
            ) : detail.messages.map((m, i) => {
              const isAi = m.role === 'ai' || m.role === 'assistant'
              return (
                <div key={i} style={{ display: 'flex', gap: '8px', flexDirection: isAi ? 'row' : 'row-reverse', alignItems: 'flex-start' }}>
                  {/* 头像 */}
                  <div style={{
                    flexShrink: 0, width: '26px', height: '26px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isAi ? 'linear-gradient(135deg,#7c6af7,#4f46e5)' : '#2a2838',
                    fontSize: '12px',
                  }}>
                    {isAi ? '✦' : '👤'}
                  </div>
                  {/* 气泡 */}
                  <div style={{
                    maxWidth: '80%', padding: '8px 12px', borderRadius: isAi ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                    fontSize: '13px', lineHeight: '1.65', wordBreak: 'break-word',
                    background: isAi ? 'rgba(124,106,247,0.1)' : 'rgba(255,255,255,0.05)',
                    border: isAi ? '1px solid rgba(124,106,247,0.2)' : '1px solid rgba(255,255,255,0.06)',
                    color: '#e2e0e8',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {m.content}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 底部统计 */}
          {!detail.loading && detail.messages?.length > 0 && (
            <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}`, fontSize: '12px', color: C.muted, flexShrink: 0 }}>
              共 {detail.messages.length} 条消息 · 用户 {detail.messages.filter(m => m.role === 'user').length} 条 · AI {detail.messages.filter(m => m.role === 'ai' || m.role === 'assistant').length} 条
            </div>
          )}
        </div>
      )}
    </div>
  )
}
