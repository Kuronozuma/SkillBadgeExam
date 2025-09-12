import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { auth } from '../services/auth'
import '../styles/components/Sidebar.css'

export default function Sidebar(){
  const location = useLocation()
  
  if(!auth.isAuthenticated()) return null
  
  // Function to check if link is active
  const isActive = (path) => {
    return location.pathname === path ? 'active-link' : ''
  }
  
  return (
    <aside className="sidebar">
      <ul>
        <li className={isActive('/dashboard')}>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li className={isActive('/inventory')}>
          <Link to="/inventory">Inventory</Link>
        </li>
        <li className={isActive('/customers')}>
          <Link to="/customers">Customers</Link>
        </li>
        <li className={isActive('/distributors')}>
          <Link to="/distributors">Distributors</Link>
        </li>
        <li className={isActive('/warehouse')}>
          <Link to="/warehouse">Warehouse</Link>
        </li>
        <li className={isActive('/reports')}>
          <Link to="/reports">Reports</Link>
        </li>
      </ul>
    </aside>
  )
}
