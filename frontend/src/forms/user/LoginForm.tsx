import axios from "axios"
import React, { useState } from "react"
import { api } from "../../api/axios"
import { validateEmail } from "../../utils/validate"
import { useAuth } from "../../hooks/auth.context"

function LoginForm() {
  const [data, setData] = useState({
    email: "",
    password: "",
  })

  const { setAuth } = useAuth()

  const [errMessage, setErrMessage] = useState({
    email: "",
    password: "",
  })
  

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.currentTarget

    if(name === "email") {
      if(!validateEmail(value)) {
                setErrMessage((prev) => ({
          ...prev,
          email: "Bad email format"
        }))
      }
    }

    if(name === "password") {
      if(value.length < 6) {
        setErrMessage((prev) => ({
          ...prev,
          password: "Password length minimum is 6"
        }))
      }
    }

    setData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handeleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const res = await api.post("/user/login", data)

      setAuth(res.data.userId)
      console.log(res.data)
      console.log(res.data.message)
    } catch (e: unknown) {
      if(axios.isAxiosError(e)) {
        console.log(e.response?.data?.message)
      }
    }
  }

  return (
    <div>
      <form onSubmit={handeleSubmit}>
          <div className="input-rel">
            <input id="email"
              className="input-field"
              name="email"
              type="text"
              placeholder=" "
              value={data.email || ""}
              onChange={handleInput}
            />
            <label className="input-label" htmlFor="email">Email</label>
            <span className="error-message hide__form"></span>
          </div>

          <div className="input-rel">
            <input id="password"
              className="input-field"
              name="password"
              type="text"
              placeholder=" "
              value={data.password || ""}
              onChange={handleInput}
            />
            <label className="input-label" htmlFor="password">Password</label>
            <span className="error-message hide__form"></span>
          </div>

          <button className="btn-default success-btn" type="submit">Login</button>  
      </form>
    </div>
  )


}

export default LoginForm
