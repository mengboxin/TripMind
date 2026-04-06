import React, { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Chat from "./components/Chat";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null); // { token, username, create_time }

  const handleLogin = (userData) => { setUser(userData); setPage("chat"); };
  const handleLogout = () => { setUser(null); setPage("login"); };

  if (user) return <Chat onLogout={handleLogout} token={user.token} username={user.username} createTime={user.create_time} />;
  if (page === "register") return <Register onRegister={handleLogin} onSwitchToLogin={() => setPage("login")} />;
  return <Login onLogin={handleLogin} onSwitchToRegister={() => setPage("register")} />;
}

export default App;
