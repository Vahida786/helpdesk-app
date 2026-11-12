import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Icon from "../components/Icons"
import useDebounce from "../hooks/useDebounce"
import { getTickets, errorMessage } from "../api/services"

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"

const PAGE_SIZE = 10

function TicketList() {
  const [tickets, setTickets] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const debouncedSearch = useDebounce(search)

  // load the ticket list from the API
  useEffect(() => {
    const params = { page }
    if (debouncedSearch) params.search = debouncedSearch
    if (status) params.status = status
    if (priority) params.priority = priority

    setLoading(true)
    setError("")
    getTickets(params)
      .then((res) => {
        setTickets(res.data.results)
        setCount(res.data.count)
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, status, priority])

  // load the numbers for the 4 cards
  useEffect(() => {
    const statuses = [null, "open", "in_progress", "resolved"]
    Promise.all(statuses.map((s) => getTickets(s ? { status: s } : {})))
      .then(([all, open, progress, resolved]) =>
        setStats({
          total: all.data.count,
          open: open.data.count,
          in_progress: progress.data.count,
          resolved: resolved.data.count,
        })
      )
      .catch(() => {})
  }, [])

  function changeFilter(setter, value) {
    setter(value)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your support requests.</p>
        </div>
        <Link className="btn" to="/new"><Icon name="plus" size={16} />New ticket</Link>
      </div>

      <div className="stats">
        <div className="stat"><span className="stat-icon ic-total"><Icon name="inbox" /></span><div><small>Total tickets</small><strong>{stats.total}</strong></div></div>
        <div className="stat"><span className="stat-icon ic-open"><Icon name="ticket" /></span><div><small>Open</small><strong>{stats.open}</strong></div></div>
        <div className="stat"><span className="stat-icon ic-progress"><Icon name="clock" /></span><div><small>In progress</small><strong>{stats.in_progress}</strong></div></div>
        <div className="stat"><span className="stat-icon ic-resolved"><Icon name="check" /></span><div><small>Resolved</small><strong>{stats.resolved}</strong></div></div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => changeFilter(setSearch, e.target.value)}
          />
          <select value={status} onChange={(e) => changeFilter(setStatus, e.target.value)}>
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select value={priority} onChange={(e) => changeFilter(setPriority, e.target.value)}>
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {error && <p className="error" style={{ margin: 16 }}>{error}</p>}

        {loading ? (
          <p className="loading">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <div className="empty">
            <Icon name="inbox" size={32} />
            <strong>No tickets found</strong>
            Create a ticket or change your filters.
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Ticket</th><th>Created by</th><th>Status</th><th>Priority</th><th>Created</th></tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id}>
                    <td className="mono">TK-{String(t.id).padStart(4, "0")}</td>
                    <td>
                      <Link className="t-title" to={`/tickets/${t.id}`}>{t.title}</Link>
                      <div className="t-sub">{t.description}</div>
                    </td>
                    <td className="mono">{t.created_by}</td>
                    <td><span className={`badge ${t.status}`}>{t.status.replace("_", " ")}</span></td>
                    <td><span className={`badge ${t.priority}`}>{t.priority}</span></td>
                    <td className="mono">{fmt(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pager">
          <span>Page {page} of {totalPages} · {count} tickets</span>
          <div className="actions" style={{ display: "flex", gap: 8 }}>
            <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <button className="btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketList