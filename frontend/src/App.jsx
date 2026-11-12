import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation } from "react-router-dom"
import Icon from "./components/Icons"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import TicketList from "./pages/TicketList"
import TicketForm from "./pages/TicketForm"
import TicketDetail from "./pages/TicketDetail"
import { login, register, getMe } from "./api/services"

function Layout({ user, onLogout, children }) {
  const { pathname } = useLocation()
  const title =
    pathname === "/new" ? "New ticket" : pathname.startsWith("/tickets/") ? "Ticket details" : "Dashboard"

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-mark"><Icon name="ticket" /></span>HelpDesk
        </div>
        <nav className="nav">
          <NavLink to="/" end><Icon name="list" />Dashboard</NavLink>
          <NavLink to="/new"><Icon name="plus" />New ticket</NavLink>
        </nav>
        <div className="sidebar-foot">
          <span className="avatar">{user.username[0]}</span>
          <div className="who">{user.username}</div>
          <button className="icon-btn" title="Log out" onClick={onLogout}><Icon name="logout" /></button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <span>{title}</span>
          <span>Signed in as <b>{user.username}</b>{user.is_staff && " (staff)"}</span>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!localStorage.getItem("token"))

  // if a token exists, ask the server who the user is
  useEffect(() => {
    if (!localStorage.getItem("token")) return
    getMe()
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false))
  }, [])

  async function handleLogin(username, password) {
    const { data } = await login({ username, password })
    localStorage.setItem("token", data.access)
    const me = await getMe()
    setUser(me.data)
  }

  async function handleSignup(username, password) {
    await register({ username, password })
    await handleLogin(username, password)
  }

  function logout() {
    localStorage.removeItem("token")
    setUser(null)
  }

  if (loading) return <p className="loading">Loading...</p>

  const page = (element) =>
    user ? <Layout user={user} onLogout={logout}>{element}</Layout> : <Navigate to="/login" />
  const guest = (element) => (user ? <Navigate to="/" /> : element)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={guest(<Login onLogin={handleLogin} />)} />
        <Route path="/signup" element={guest(<Signup onSignup={handleSignup} />)} />
        <Route path="/" element={page(<TicketList />)} />
        <Route path="/new" element={page(<TicketForm />)} />
        <Route path="/tickets/:id" element={page(<TicketDetail />)} />
      </Routes>
    </BrowserRouter>
  )
}

export default App