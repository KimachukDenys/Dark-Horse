import axios from "axios"
import React, { useState } from "react"
import { api } from "../../api/axios"
import { validateEmail } from "../../utils/validate"
import { useAuth } from "../../hooks/auth.context"

function RegisterForm() {
  const [data, setData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })

  const { setAuth } = useAuth()

  const [errMessage, setErrMessage] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.currentTarget

    if(name === "userName") {
      if(value.length < 3) {
        setErrMessage((prev) => ({
          ...prev,
          userName: "User name length minimum is 3"
        }))
      }
    }

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

      if(data.confirmPassword && data.confirmPassword !== value) {
        setErrMessage((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match"
        }))
      }
    }

    if(name === "confirmPassword") {
      if(value !== data.password) {
          setErrMessage((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match"
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

    const body = {
      userName: data.userName,
      email: data.email,
      password: data.password
    }

    try {
      const res = await api.post("/user/register", body)

      const resData = res.data

      setAuth(resData.userId)
      
      console.log(resData.message)
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
            <input id="userName"
              className="input-field"
              name="userName"
              type="text"
              placeholder=" "
              maxLength={15}
              value={data.userName || ""}
              onChange={handleInput}
            />
            <label className="input-label" htmlFor="userName">User Name</label>
            <span className="error-message hide__form"></span>
          </div>

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

          <div className="input-rel">
            <input id="userName"
              className="input-field"
              name="confirmPassword"
              type="text"
              placeholder=" "
              value={data.confirmPassword || ""}
              onChange={handleInput}
            />
            <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
            <span className="error-message hide__form"></span>
          </div>

          <button className="btn-default success-btn" type="submit">Register</button>
      </form>
    </div>
  )


}

export default RegisterForm
