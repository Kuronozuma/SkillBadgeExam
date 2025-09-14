import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../services/auth'
import '../styles/pages/Signup.css'

export default function Signup(){
  const [user, setUser] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
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
    
    if(email && !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true)
    try {
      // Create user data object with all fields
      const userData = {
        username: user,
        password: pass,
        email: email || undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined
      };
      
      await auth.signup(userData)
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
          <h2 className="form-title">Create Account</h2>
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">
                Username <span className="required">*</span>
              </label>
              <input 
                value={user} 
                onChange={e => setUser(e.target.value)} 
                placeholder="Choose a username"
                disabled={isLoading}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Email
              </label>
              <input 
                type="email"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Your email address"
                disabled={isLoading}
                className="form-input"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label className="form-label">
                  First Name
                </label>
                <input 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)} 
                  placeholder="First name"
                  disabled={isLoading}
                  className="form-input"
                />
              </div>
              
              <div className="form-group half">
                <label className="form-label">
                  Last Name
                </label>
                <input 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)} 
                  placeholder="Last name"
                  disabled={isLoading}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Password <span className="required">*</span>
              </label>
              <input 
                type="password" 
                value={pass} 
                onChange={e => setPass(e.target.value)} 
                placeholder="Create a password"
                disabled={isLoading}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Confirm Password <span className="required">*</span>
              </label>
              <input 
                type="password" 
                value={confirmPass} 
                onChange={e => setConfirmPass(e.target.value)} 
                placeholder="Confirm your password"
                disabled={isLoading}
                className="form-input"
                required
              />
            </div>
            
            {error ? (
              <div className="form-error">
                {error}
              </div>
            ) : null}
            
            <div className="form-actions">
              <button 
                type="submit"
                className="form-button"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </button>
              
              <Link 
                to="/login" 
                className="form-link-button"
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
