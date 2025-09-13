import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../services/auth'
import '../styles/pages/Login.css'

export default function Login() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (auth.isAuthenticated()) navigate('/dashboard')
  }, [navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!user || !pass) {
      setError('Please enter both username and password')
      return
    }

    setIsLoading(true)
    try {
      await auth.login(user, pass)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
      setIsLoading(false)
    }
  }

  return (
    <div className="unauthenticated-wrapper">
      <div className="login-card-container">
        <h1 className="login-logo">Wyart Vape Shop</h1>
        <div className="login-divider"></div>

        {/* Removed user logo */}

        <form onSubmit={onSubmit} className="login-form">
          <div className="form-group">
            <label>Username</label>
            <input
              value={user}
              onChange={(e) => setUser(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'LOGIN'}
            </button>

            <Link to="/signup" className="signup-link">
              Need an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
