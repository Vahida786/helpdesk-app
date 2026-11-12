import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import Icon from "../components/Icons"
import { getTicket, getComments, addComment, errorMessage } from "../api/services"

const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"

function TicketDetail() {
  const { id } = useParams()
  const [ticket, setTicket] = useState(null)
  const [comments, setComments] = useState([])
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([getTicket(id), getComments(id)])
      .then(([t, c]) => {
        setTicket(t.data)
        setComments(c.data)
      })
      .catch((err) =>
        setError(err.response?.status === 404 ? "Ticket not found" : errorMessage(err))
      )
      .finally(() => setLoading(false))
  }, [id])

  async function handleComment(e) {
    e.preventDefault()
    if (!body.trim()) return
    setSending(true)
    try {
      const res = await addComment(id, body.trim())
      setComments([...comments, res.data])
      setBody("")
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  if (loading) return <p className="loading">Loading ticket...</p>

  if (!ticket)
    return (
      <div className="empty">
        <strong>{error || "Ticket not found"}</strong>
        <Link className="back" to="/">Back to dashboard</Link>
      </div>
    )

  return (
    <div>
      <Link className="back" to="/"><Icon name="back" size={16} />Back to dashboard</Link>
      <div className="detail">
        <div className="panel">
          <div className="panel-body">
            <h1>{ticket.title}</h1>
            <p className="desc">{ticket.description}</p>

            <div className="section-title">Comments ({comments.length})</div>
            {comments.length === 0 && <p style={{ color: "var(--muted)" }}>No comments yet.</p>}
            {comments.map((c) => (
              <div className="comment" key={c.id}>
                <span className="avatar">{c.author[0]}</span>
                <div>
                  <b>{c.author}</b><small>{fmt(c.created_at)}</small>
                  <p>{c.body}</p>
                </div>
              </div>
            ))}

            {error && <p className="error" style={{ marginTop: 12 }}>{error}</p>}
            <form className="comment-form" onSubmit={handleComment}>
              <input placeholder="Write a comment..." value={body} onChange={(e) => setBody(e.target.value)} />
              <button className="btn" type="submit" disabled={sending}>{sending ? "Sending..." : "Send"}</button>
            </form>
          </div>
        </div>

        <div className="panel">
          <div className="panel-body">
            <div className="kv"><span>Ticket ID</span><span className="mono">TK-{String(ticket.id).padStart(4, "0")}</span></div>
            <div className="kv"><span>Created by</span><span>{ticket.created_by}</span></div>
            <div className="kv"><span>Status</span><span className={`badge ${ticket.status}`}>{ticket.status.replace("_", " ")}</span></div>
            <div className="kv"><span>Priority</span><span className={`badge ${ticket.priority}`}>{ticket.priority}</span></div>
            <div className="kv"><span>Created</span><span>{fmt(ticket.created_at)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketDetail