import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import Icon from "../components/Icons"
import { createTicket, errorMessage } from "../api/services"

function TicketForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return setError("Title is required")
    if (title.length > 120) return setError("Title must be 120 characters or less")
    if (!description.trim()) return setError("Description is required")

    setSaving(true)
    setError("")
    try {
      await createTicket({ title: title.trim(), description: description.trim(), priority })
      navigate("/")
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <Link className="back" to="/"><Icon name="back" size={16} />Back to dashboard</Link>
      <div className="page-head">
        <div>
          <h1>New ticket</h1>
          <p>Describe the problem and our team will look into it.</p>
        </div>
      </div>
      <div className="panel">
        <form className="panel-body stack" onSubmit={handleSubmit}>
          <div className="field">
            <label>Title</label>
            <input placeholder="Short summary of the issue" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea rows="6" placeholder="What happened? Add any details that help." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="field">
            <label>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          {error && <p className="error">{error}</p>}
          <div>
            <button className="btn" type="submit" disabled={saving}>
              {saving ? "Submitting..." : "Submit ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TicketForm