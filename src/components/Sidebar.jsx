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
      <div className="sidebar-header">
        <h3 className="vape-shop-title">Vape Shop Inventory</h3>
      </div>
      <ul>
        <li className={isActive('/dashboard')}>
          <i className="sidebar-icon dashboard-icon"></i>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li className={isActive('/inventory')}>
          <i className="sidebar-icon inventory-icon"></i>
          <Link to="/inventory">Inventory</Link>
        </li>
        <li className={isActive('/orders')}>
          <i className="sidebar-icon orders-icon"></i>
          <Link to="/orders">Orders</Link>
        </li>
        <li className={isActive('/reports')}>
          <i className="sidebar-icon reports-icon"></i>
          <Link to="/reports">Reports</Link>
        </li>
      </ul>
    </aside>
  )
}
