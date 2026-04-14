import React, { useState, useEffect, useCallback } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Chat from "./components/Chat";

const API = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  // 预加载的数据，登录后立即获取
  const [preloaded, setPreloaded] = useState({ bookings: null, budget: null, loaded: false });

  const preload = useCallback(async (token) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [bookingsRes, budgetRes] = await Promise.allSettled([
        fetch(`${API}/user/bookings/`, { headers }).then(r => r.json()),
        fetch(`${API}/budget/`, { headers }).then(r => r.json()),
      ]);
      setPreloaded({
        bookings: bookingsRes.status === "fulfilled" ? bookingsRes.value : { flights:[], hotels:[], cars:[] },
        budget:   budgetRes.status   === "fulfilled" ? budgetRes.value   : { budget:null, spent:0, records:[] },
        loaded: true,
      });
    } catch {
      setPreloaded(p => ({ ...p, loaded: true }));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage("chat");
    // 登录后立即预加载
    preload(userData.token);
  };

  const handleLogout = () => {
    setUser(null);
    setPage("login");
    setPreloaded({ bookings: null, budget: null, loaded: false });
  };

  // 刷新预加载数据（订单变化后调用）
  const refreshPreload = useCallback(() => {
    if (user?.token) preload(user.token);
  }, [user, preload]);

  if (user) return (
    <Chat
      onLogout={handleLogout}
      token={user.token}
      username={user.username}
      createTime={user.create_time}
      preloaded={preloaded}
      onRefreshPreload={refreshPreload}
    />
  );
  if (page === "register") return <Register onRegister={handleLogin} onSwitchToLogin={() => setPage("login")} />;
  return <Login onLogin={handleLogin} onSwitchToRegister={() => setPage("register")} />;
}

export default App;