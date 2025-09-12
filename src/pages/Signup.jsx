import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../services/auth'

export default function Signup(){
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if(!user || !pass){ 
      setError('Please enter both username and password'); 
      return;
    }
    
    if(pass !== confirmPass) {
      setError('Passwords do not match');
      return;
    }
    
    if(pass.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true)
    try {
      await auth.signup(user, pass)
      navigate('/dashboard')
    } catch(err) { 
      setError(err.message || 'Signup failed. Please try again.') 
      setIsLoading(false)
    }
  }

  return (
    <div className="unauthenticated-wrapper">
      <div className="login-card-container">
        <div className="card">
          <h2 style={{textAlign: 'center', marginTop: 0}}>Create Account</h2>
          <form onSubmit={onSubmit}>
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)'}}>
                Username
              </label>
              <input 
                value={user} 
                onChange={e => setUser(e.target.value)} 
                placeholder="Choose a username"
                disabled={isLoading}
              />
            </div>
            
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)'}}>
                Password
              </label>
              <input 
                type="password" 
                value={pass} 
                onChange={e => setPass(e.target.value)} 
                placeholder="Create a password"
                disabled={isLoading}
              />
            </div>
            
            <div style={{marginBottom: '16px'}}>
              <label style={{display: 'block', marginBottom: '8px', color: 'var(--text-secondary)'}}>
                Confirm Password
              </label>
              <input 
                type="password" 
                value={confirmPass} 
                onChange={e => setConfirmPass(e.target.value)} 
                placeholder="Confirm your password"
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
                marginBottom: '16px'
              }}>
                {error}
              </div>
            ) : null}
            
            <div style={{ 
              marginTop: '20px', 
              display: 'flex', 
              gap: '12px',
              justifyContent: 'space-between'
            }}>
              <button 
                type="submit" 
                style={{flex: 1}}
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
              
              <Link 
                to="/login" 
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '10px 16px',
                  background: 'rgba(102, 178, 255, 0.1)',
                  color: 'var(--accent)',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  border: '1px solid var(--accent)',
                  fontWeight: '600',
                  textAlign: 'center'
                }}
              >
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
