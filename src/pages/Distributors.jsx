import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import Card from '../components/Card'

export default function Distributors(){
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    api.fetchDistributors()
      .then(data => {
        setRows(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch distributors:", err)
        setIsLoading(false)
      })
  }, [])
  
  return (
    <div>
      <h2>Distributors</h2>
      
      <div className="distributor-actions" style={{marginBottom: '20px', display: 'flex', justifyContent: 'flex-end'}}>
        <button>Add Distributor</button>
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <Card>
            <div className="loading-spinner">Loading distributors...</div>
          </Card>
        </div>
      ) : (
        <div className="grid">
          {rows.length > 0 ? rows.map(distributor => (
            <Card key={distributor.id} title={distributor.name}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{color: 'var(--text-secondary)'}}>
                  <strong>ID:</strong> {distributor.id}
                </div>
                {distributor.location && (
                  <div style={{color: 'var(--text-secondary)'}}>
                    <strong>Location:</strong> {distributor.location || 'N/A'}
                  </div>
                )}
                {distributor.contactPerson && (
                  <div style={{color: 'var(--text-secondary)'}}>
                    <strong>Contact:</strong> {distributor.contactPerson || 'N/A'}
                  </div>
                )}
                
                <div style={{
                  marginTop: '12px',
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end'
                }}>
                  <button 
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(102, 178, 255, 0.1)',
                      color: 'var(--accent)',
                      border: '1px solid var(--accent)'
                    }}
                  >
                    View Details
                  </button>
                  <button 
                    style={{
                      padding: '6px 12px',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </Card>
          )) : (
            <Card>
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: 'var(--text-secondary)'
              }}>
                No distributors found. Click "Add Distributor" to create one.
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
