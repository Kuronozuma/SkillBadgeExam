import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../services/auth'

export default function Login() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(()=>{
    if(auth.isAuthenticated()) navigate('/dashboard')
  },[navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if(!user || !pass){ setError('Please enter both username and password'); return }
    
    setIsLoading(true)
    try {
      await auth.login(user, pass)
      navigate('/dashboard')
    } catch(err) { 
      setError(err.message || 'Login failed. Please check your credentials.') 
      setIsLoading(false)
    }
  }

  return (
    <div className="unauthenticated-wrapper">
      <div className="login-card-container">
        <div style={{
          padding: '30px',
          textAlign: 'center'
        }}>
          {/* User icon */}
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 25px',
            backgroundColor: '#e0e0e0',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {/* Basic user silhouette */}
            <div style={{
              width: '50%',
              height: '50%',
              borderRadius: '50%',
              backgroundColor: '#757575',
              position: 'absolute',
              top: '25%'
            }}></div>
            <div style={{
              width: '70%',
              height: '35%',
              borderRadius: '50% 50% 0 0',
              backgroundColor: '#757575',
              position: 'absolute',
              bottom: '10%'
            }}></div>
          </div>

          <form onSubmit={onSubmit} style={{maxWidth: '400px', margin: '0 auto'}}>
            <div style={{marginBottom: '16px'}}>
              <label style={{
                display: 'block', 
                marginBottom: '8px', 
                color: '#ffffff',
                textAlign: 'left',
                fontSize: '16px'
              }}>
                Username
              </label>
              <input 
                value={user} 
                onChange={e => setUser(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  borderRadius: '50px',
                  padding: '12px 20px'
                }}
                disabled={isLoading}
              />
            </div>
            
            <div style={{marginBottom: '20px'}}>
              <label style={{
                display: 'block', 
                marginBottom: '8px', 
                color: '#ffffff',
                textAlign: 'left',
                fontSize: '16px'
              }}>
                Password
              </label>
              <input 
                type="password" 
                value={pass} 
                onChange={e => setPass(e.target.value)}
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  borderRadius: '50px',
                  padding: '12px 20px'
                }}
                disabled={isLoading}
              />
            </div>
            
            {error ? (
              <div style={{
                color: '#ff6b6b', 
                marginTop: '12px', 
                padding: '8px', 
                borderRadius: '4px',
                background: 'rgba(255, 107, 107, 0.1)',
                marginBottom: '16px',
                textAlign: 'left'
              }}>
                {error}
              </div>
            ) : null}
            
            <div style={{ 
              marginTop: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <button 
                type="submit" 
                style={{
                  width: '100%',
                  backgroundColor: '#001835',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  padding: '12px',
                  borderRadius: '50px',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'LOGIN'}
              </button>
              
              <Link 
                to="/signup" 
                style={{
                  display: 'inline-block',
                  textAlign: 'center',
                  marginTop: '10px',
                  color: 'rgba(255,255,255,0.7)',
                  textDecoration: 'underline',
                  fontSize: '14px'
                }}
              >
                Need an account? Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
