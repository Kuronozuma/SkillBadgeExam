import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../services/auth'

export default function Login() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    await auth.login(user, pass)
    navigate('/dashboard')
  }

  return (
    <div className="card" style={{ maxWidth: 420 }}>
      <h3>Login</h3>
      <form onSubmit={onSubmit}>
        <div>
          <label>Username</label>
          <input value={user} onChange={e => setUser(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} />
        </div>
        <div style={{ marginTop: 8 }}>
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  )
}
