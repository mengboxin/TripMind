import React, { useState } from 'react'
import Login from './pages/Login.jsx'
import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Users from './pages/Users.jsx'
import Chats from './pages/Chats.jsx'
import Models from './pages/Models.jsx'
import Config from './pages/Config.jsx'
import Destinations from './pages/Destinations.jsx'
import System from './pages/System.jsx'

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_user')) } catch { return null }
  })
  const [page, setPage] = useState('dashboard')

  const handleLogin = (u) => { setUser(u); localStorage.setItem('admin_user', JSON.stringify(u)) }
  const handleLogout = () => { setUser(null); localStorage.removeItem('admin_user') }

  // 仪表盘快速入口事件
  React.useEffect(() => {
    const handler = (e) => setPage(e.detail)
    window.addEventListener('admin-nav', handler)
    return () => window.removeEventListener('admin-nav', handler)
  }, [])

  if (!user) return <Login onLogin={handleLogin} />

  const pages = { dashboard: Dashboard, users: Users, chats: Chats, models: Models, config: Config, destinations: Destinations, system: System }
  const PageComp = pages[page] || Dashboard

  return (
    <Layout page={page} onNav={setPage} onLogout={handleLogout} username={user.username}>
      <PageComp />
    </Layout>
  )
}
