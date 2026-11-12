import api from "./client"

export const register = (data) => api.post("/auth/register/", data)
export const login = (data) => api.post("/auth/login/", data)
export const getMe = () => api.get("/auth/me/")
export const getTickets = (params) => api.get("/tickets/", { params })
export const getTicket = (id) => api.get(`/tickets/${id}/`)
export const createTicket = (data) => api.post("/tickets/", data)
export const getComments = (id) => api.get(`/tickets/${id}/comments/`)
export const addComment = (id, body) => api.post(`/tickets/${id}/comments/`, { body })

// turns server errors into one readable message
export function errorMessage(err) {
  const data = err.response?.data
  if (!data) return "Cannot reach the server"
  if (typeof data === "string") return "Something went wrong"
  if (data.detail) return data.detail
  return Object.entries(data)
    .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(" ") : msg}`)
    .join(" | ")
}