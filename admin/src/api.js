const BASE = '/api'

function getToken() {
  try { return JSON.parse(localStorage.getItem('admin_user'))?.token || '' } catch { return '' }
}

// 401 时清除登录状态并刷新页面，强制重新登录
function handleUnauthorized() {
  localStorage.removeItem('admin_user')
  window.location.reload()
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401) {
    handleUnauthorized()
    throw new Error('登录已过期，请重新登录')
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || '请求失败')
  return data
}

export const api = {
  login:            (u, p)       => req('POST', '/login/', { username: u, password: p }),
  // 仪表盘
  dashboard:        ()           => req('GET',  '/admin/dashboard/'),
  // 用户
  users:            (page, kw)   => req('GET',  `/admin/users/?page=${page}&keyword=${encodeURIComponent(kw||'')}`),
  updateUser:       (uid, body)  => req('PATCH',`/admin/users/${uid}/`, body),
  deleteUser:       (uid)        => req('DELETE',`/admin/users/${uid}/`),
  // 对话
  chats:            (page, u)    => req('GET',  `/admin/chats/?page=${page}&username=${encodeURIComponent(u||'')}`),
  chatDetail:       (id)         => req('GET',  `/admin/chats/${id}/`),
  deleteChat:       (id)         => req('DELETE',`/admin/chats/${id}/`),
  // env 配置
  getEnvConfig:     ()           => req('GET',  '/admin/config/env/'),
  updateEnvConfig:  (updates)    => req('POST', '/admin/config/env/', { updates }),
  // 模型预设
  listModels:       ()           => req('GET',  '/admin/models/'),
  createModel:      (body)       => req('POST', '/admin/models/', body),
  updateModel:      (id, body)   => req('PATCH',`/admin/models/${id}/`, body),
  deleteModel:      (id)         => req('DELETE',`/admin/models/${id}/`),
  activateModel:    (id)         => req('POST', `/admin/models/${id}/activate/`),
  // 目的地
  listDests:        (page, kw)   => req('GET',  `/admin/destinations/?page=${page}&keyword=${encodeURIComponent(kw||'')}`),
  createDest:       (body)       => req('POST', '/admin/destinations/', body),
  updateDest:       (id, body)   => req('PATCH',`/admin/destinations/${id}/`, body),
  deleteDest:       (id)         => req('DELETE',`/admin/destinations/${id}/`),
  toggleDest:       (id)         => req('PATCH',`/admin/destinations/${id}/toggle/`),
  // 系统
  systemInfo:       ()           => req('GET',  '/admin/system/'),
}
