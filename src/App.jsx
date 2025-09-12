import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Distributors from './pages/Distributors'
import Warehouse from './pages/Warehouse'
import Reports from './pages/Reports'
import Inventory from './pages/Inventory'
import { auth } from './services/auth'
import Header from './components/Header'
import Sidebar from './components/Sidebar'

// Private route component to protect authenticated routes
function PrivateRoute({ children }) {
  return auth.isAuthenticated() ? children : <Navigate to="/login" />
}

// Not Found component for 404 pages
function NotFound() {
  return (
    <div className="not-found-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      textAlign: 'center'
    }}>
      <h2 style={{
        fontSize: '28px',
        marginBottom: '20px',
        color: 'var(--accent)'
      }}>
        Page Not Found
      </h2>
      <div style={{
        background: 'rgba(102, 178, 255, 0.1)',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        maxWidth: '500px'
      }}>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button onClick={() => window.location.href = '/dashboard'}>
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function App() {
  // Check if we're on an authentication page
  const isAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup';
  
  return (
    <div className="app">
      {!isAuthPage && <Header />}
      
      {isAuthPage ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      ) : (
        <div className="layout">
          <Sidebar />
          <main className="main">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/dashboard" 
                element={<PrivateRoute><Dashboard /></PrivateRoute>} 
              />
              <Route 
                path="/customers" 
                element={<PrivateRoute><Customers /></PrivateRoute>} 
              />
              <Route 
                path="/distributors" 
                element={<PrivateRoute><Distributors /></PrivateRoute>} 
              />
              <Route 
                path="/warehouse" 
                element={<PrivateRoute><Warehouse /></PrivateRoute>} 
              />
              <Route 
                path="/reports" 
                element={<PrivateRoute><Reports /></PrivateRoute>} 
              />
              <Route 
                path="/inventory" 
                element={<PrivateRoute><Inventory /></PrivateRoute>} 
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      )}
    </div>
  )
}
