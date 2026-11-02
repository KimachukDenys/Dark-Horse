import { useState } from "react";
import LoginForm from "../../forms/user/LoginForm";
import RegisterForm from "../../forms/user/RegisterForm";
import "../../styles/user/authentification.css"

function Authentication() {
  const [mode, setMode] = useState<"login" | "register">("login")

  return (
    <div className="authentication">
      <div className="page-header-container">
        <button
          className="btn-default action-btn"
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button 
          className="btn-default action-btn" 
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>


      {mode === "login" ? (
        <LoginForm />
      ) : (
        <RegisterForm />
      )}
    </div>
  )
}

export default Authentication