import Icon from "./Icons"

function AuthLayout({ children }) {
  return (
    <div className="auth-wrap">
      <div className="auth-side">
        <div className="logo">
          <span className="logo-mark"><Icon name="ticket" /></span>HelpDesk
        </div>
        <div>
          <h2>Support requests, organised in one place.</h2>
          <p>Create tickets, track their progress and keep every conversation with the support team together.</p>
        </div>
        <small>© 2026 HelpDesk</small>
      </div>
      <div className="auth-main">
        <div className="auth-box">{children}</div>
      </div>
    </div>
  )
}

export default AuthLayout