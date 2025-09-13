import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { auth } from '../services/auth'
import '../styles/components/Header.css'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = auth.getUser()
  const onLogout = () => { auth.logout(); navigate('/login') }
  const authed = auth.isAuthenticated()

  // Function to check if link is active
  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  return (
    <header className="header">
      {/* Graffiti-styled logo */}
      <div className="logo">Wyart Vape Shop</div>

      <div className="header-right">
        {user ? <span>Hi, {user.username}</span> : null}

        {/* Divider */}
        <div className="divider"></div>

        {/* Auth button */}
        {authed ? (
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        ) : (
          <Link className="login-btn" to="/login">Login</Link>
        )}
      </div>
    </header>
  )
}
