import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { auth } from '../services/auth'

export default function Header(){
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
      <div className="logo">Inventory App</div>
      {authed ? (
        <nav className="nav">
          <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
          <Link to="/customers" className={isActive('/customers')}>Customers</Link>
          <Link to="/distributors" className={isActive('/distributors')}>Distributors</Link>
          <Link to="/warehouse" className={isActive('/warehouse')}>Warehouse</Link>
          <Link to="/reports" className={isActive('/reports')}>Reports</Link>
        </nav>
      ) : null}
      <div className="header-right">
        {user ? <span>Hi, {user.username}</span> : null}
        {authed ? <button onClick={onLogout}>Logout</button> : <Link to="/login">Login</Link>}
      </div>
    </header>
  )
}
