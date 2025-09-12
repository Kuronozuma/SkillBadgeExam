import React from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Distributors from './pages/Distributors'
import Warehouse from './pages/Warehouse'
import Reports from './pages/Reports'
import { auth } from './services/auth'

function PrivateRoute({ children }) {
  return auth.isAuthenticated() ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <div className="app">
      <nav className="nav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/customers">Customers</Link>
        <Link to="/distributors">Distributors</Link>
        <Link to="/warehouse">Warehouse</Link>
        <Link to="/reports">Reports</Link>
        <Link to="/login">Login</Link>
      </nav>
      <main className="main">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/customers"
            element={<PrivateRoute><Customers /></PrivateRoute>}
          />
          <Route
            path="/distributors"
            element={<PrivateRoute><Distributors /></PrivateRoute>}
          />
          <Route path="/warehouse" element={<PrivateRoute><Warehouse /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  )
}
