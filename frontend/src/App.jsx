import React, { useState, useEffect, useCallback } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Chat from "./components/Chat";
import MobileLogin from "./components/MobileLogin";
import MobileRegister from "./components/MobileRegister";
import MobileChat from "./components/MobileChat";

const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";
const STORAGE_KEY = "tm_user";

function isMobileDevice() {
  const ua = navigator.userAgent || "";
  const mobileUA = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  return mobileUA || window.innerWidth < 768;
}

function App() {
  const [page, setPage] = useState("login");

  // 启动时从 localStorage 恢复登录状态，刷新不掉线
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [isMobile, setIsMobile] = useState(() => isMobileDevice());
  const [preloaded, setPreloaded] = useState({ bookings: null, budget: null, loaded: false });

  // 监听窗口大小变化
  useEffect(() => {
    const handler = () => setIsMobile(isMobileDevice());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const preload = useCallback(async (token) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [bookingsRes, budgetRes] = await Promise.allSettled([
        fetch(`${API}/user/bookings/`, { headers }).then(r => r.json()),
        fetch(`${API}/budget/`, { headers }).then(r => r.json()),
      ]);
      setPreloaded({
        bookings: bookingsRes.status === "fulfilled" ? bookingsRes.value : { flights: [], hotels: [], cars: [] },
        budget:   budgetRes.status   === "fulfilled" ? budgetRes.value   : { budget: null, spent: 0, records: [] },
        loaded: true,
      });
    } catch {
      setPreloaded(p => ({ ...p, loaded: true }));
    }
  }, []);

  // 恢复登录后自动预加载数据
  useEffect(() => {
    if (user?.token && !preloaded.loaded) {
      preload(user.token);
    }
  }, [user, preloaded.loaded, preload]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setPage("chat");
    preload(userData.token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    setPage("login");
    setPreloaded({ bookings: null, budget: null, loaded: false });
  };

  const refreshPreload = useCallback(() => {
    if (user?.token) preload(user.token);
  }, [user, preload]);

  if (user) return (
    isMobile ? (
      <MobileChat
        onLogout={handleLogout}
        token={user.token}
        username={user.username}
        createTime={user.create_time}
        preloaded={preloaded}
        onRefreshPreload={refreshPreload}
      />
    ) : (
      <Chat
        onLogout={handleLogout}
        token={user.token}
        username={user.username}
        createTime={user.create_time}
        preloaded={preloaded}
        onRefreshPreload={refreshPreload}
      />
    )
  );

  if (page === "register") return (
    isMobile
      ? <MobileRegister onRegister={handleLogin} onSwitchToLogin={() => setPage("login")} />
      : <><div className="noise-overlay" /><Register onRegister={handleLogin} onSwitchToLogin={() => setPage("login")} /></>
  );

  return (
    isMobile
      ? <MobileLogin onLogin={handleLogin} onSwitchToRegister={() => setPage("register")} />
      : <><div className="noise-overlay" /><Login onLogin={handleLogin} onSwitchToRegister={() => setPage("register")} /></>
  );
}

export default App;
