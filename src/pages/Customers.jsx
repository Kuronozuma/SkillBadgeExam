import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import Card from '../components/Card'

export default function Customers(){
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    api.fetchCustomers()
      .then(data => {
        setRows(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch customers:", err)
        setIsLoading(false)
      })
  }, [])
  
  const filtered = rows.filter(r => r.name.toLowerCase().includes(q.toLowerCase()))
  
  return (
    <div>
      <h2>Customer Management</h2>
      
      {isLoading ? (
        <div className="loading-container">
          <Card>
            <div className="loading-spinner">Loading customers data...</div>
          </Card>
        </div>
      ) : (
        <Card>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16
          }}>
            <div className="search-container" style={{width: '100%', maxWidth: 360}}>
              <input 
                placeholder="Search customers..." 
                value={q} 
                onChange={e => setQ(e.target.value)} 
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border)'
                }}
              />
            </div>
            <button 
              style={{
                background: 'var(--accent)',
                color: '#0a1929'
              }}
            >
              Add Customer
            </button>
          </div>
          
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: 'var(--text-secondary)'
            }}>
              No customers found matching your search.
            </div>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Orders</th>
                    <th>Last order</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.name}</td>
                      <td>{r.orders}</td>
                      <td>{r.lastOrder || '-'}</td>
                      <td>
                        <div style={{display: 'flex', gap: '8px'}}>
                          <button 
                            style={{
                              padding: '4px 8px',
                              background: 'rgba(102, 178, 255, 0.1)',
                              color: 'var(--accent)',
                              border: '1px solid var(--accent)'
                            }}
                          >
                            View
                          </button>
                          <button 
                            style={{
                              padding: '4px 8px',
                              background: 'transparent',
                              color: 'var(--text-secondary)',
                              border: '1px solid var(--border)'
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
