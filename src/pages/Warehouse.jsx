import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import Card from '../components/Card'

export default function Warehouse(){
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'pending', 'shipped', 'delivered'
  
  useEffect(() => {
    api.fetchWarehouse()
      .then(data => {
        const rows = Array.isArray(data) ? data : (data?.logs || []);
        setRows(rows)
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch warehouse data:", err)
        setIsLoading(false)
      })
  }, [])
  
  // Filter items based on status
  const filteredRows = filter === 'all' 
    ? rows 
    : rows.filter(r => r.status?.toLowerCase() === filter)
  
  // Get counts for each status
  const counts = {
    all: rows.length,
    pending: rows.filter(r => r.status?.toLowerCase() === 'pending').length,
    shipped: rows.filter(r => r.status?.toLowerCase() === 'shipped').length,
    delivered: rows.filter(r => r.status?.toLowerCase() === 'delivered').length
  }
  
  // Status color mapping
  const statusColor = (status) => {
    if (!status) return 'var(--text-secondary)';
    switch(status.toLowerCase()) {
      case 'pending': return '#ff9800';
      case 'shipped': return '#66b2ff';
      case 'delivered': return '#4caf50';
      case 'received': return '#4caf50';
      case 'missing': return '#f44336';
      case 'damaged': return '#ff5722';
      case 'spoiled': return '#9c27b0';
      default: return 'var(--text-secondary)';
    }
  }
  
  return (
    <div>
      <h2>Warehouse Management</h2>
      
      {isLoading ? (
        <div className="loading-container">
          <Card>
            <div className="loading-spinner">Loading warehouse data...</div>
          </Card>
        </div>
      ) : (
        <>
          <div className="grid">
            <Card 
              title="Overview" 
              className={`${filter === 'all' ? 'active-card' : ''}`}
              onClick={() => setFilter('all')}
            >
              <div style={{fontSize: 24, fontWeight: 600, marginBottom: 8}}>{counts.all}</div>
              <div style={{color: 'var(--text-secondary)'}}>Total Shipments</div>
            </Card>
            
            <Card 
              title="Pending" 
              className={`${filter === 'pending' ? 'active-card' : ''}`}
              onClick={() => setFilter('pending')}
            >
              <div style={{fontSize: 24, fontWeight: 600, marginBottom: 8, color: '#ff9800'}}>{counts.pending}</div>
              <div style={{color: 'var(--text-secondary)'}}>Awaiting Shipment</div>
            </Card>
            
            <Card 
              title="Shipped" 
              className={`${filter === 'shipped' ? 'active-card' : ''}`}
              onClick={() => setFilter('shipped')}
            >
              <div style={{fontSize: 24, fontWeight: 600, marginBottom: 8, color: '#66b2ff'}}>{counts.shipped}</div>
              <div style={{color: 'var(--text-secondary)'}}>In Transit</div>
            </Card>
            
            <Card 
              title="Delivered" 
              className={`${filter === 'delivered' ? 'active-card' : ''}`}
              onClick={() => setFilter('delivered')}
            >
              <div style={{fontSize: 24, fontWeight: 600, marginBottom: 8, color: '#4caf50'}}>{counts.delivered}</div>
              <div style={{color: 'var(--text-secondary)'}}>Completed</div>
            </Card>
          </div>
          
          <div style={{marginTop: 24}}>
            <Card title={`Shipments ${filter !== 'all' ? `- ${filter.charAt(0).toUpperCase() + filter.slice(1)}` : ''}`}>
              <div style={{overflowX: 'auto'}}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Quantity</th>
                      <th>Item</th>
                      <th>Note</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.length > 0 ? filteredRows.map(r => (
                      <tr key={r.id}>
                        <td>{r.id}</td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: 'rgba(102, 178, 255, 0.1)',
                            color: 'var(--accent)',
                            textTransform: 'capitalize'
                          }}>
                            {r.type}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: `${statusColor(r.status)}20`,
                            color: statusColor(r.status),
                            textTransform: 'capitalize'
                          }}>
                            {r.status}
                          </span>
                        </td>
                        <td>{r.quantity || 0}</td>
                        <td>{r.item?.name || '-'}</td>
                        <td>{r.note || '-'}</td>
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
                              Track
                            </button>
                            <button 
                              style={{
                                padding: '4px 8px',
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border)'
                              }}
                            >
                              Update
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="7" style={{textAlign: 'center', padding: '20px', color: 'var(--text-secondary)'}}>
                          No warehouse logs found with {filter} status.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
