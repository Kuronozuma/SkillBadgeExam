import React, { useEffect, useState } from 'react'
import { api } from '../services/api'
import Card from '../components/Card'

export default function Reports(){
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('inventory') // inventory, clients, monthly
  
  useEffect(() => {
    api.fetchReports()
      .then(data => {
        setData(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch reports:", err)
        setIsLoading(false)
      })
  }, [])
  
  if(isLoading) {
    return (
      <div>
        <h2>Reports</h2>
        <div className="loading-container">
          <Card>
            <div className="loading-spinner">Loading report data...</div>
          </Card>
        </div>
      </div>
    )
  }
  
  if(!data) {
    return (
      <div>
        <h2>Reports</h2>
        <Card>
          <div style={{textAlign: 'center', padding: '20px', color: 'var(--text-secondary)'}}>
            Failed to load report data. Please try again later.
          </div>
        </Card>
      </div>
    )
  }
  
  return (
    <div>
      <h2>Reports &amp; Analytics</h2>
      
      <div className="tabs" style={{
        display: 'flex',
        gap: '2px',
        marginBottom: '20px'
      }}>
        <button 
          style={{
            background: activeTab === 'inventory' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'inventory' ? '#0a1929' : 'var(--text-secondary)',
            border: activeTab === 'inventory' ? 'none' : '1px solid var(--border)',
            borderRadius: '6px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        
        <button 
          style={{
            background: activeTab === 'clients' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'clients' ? '#0a1929' : 'var(--text-secondary)',
            border: activeTab === 'clients' ? 'none' : '1px solid var(--border)',
            borderRadius: '6px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
          onClick={() => setActiveTab('clients')}
        >
          Clients
        </button>
        
        <button 
          style={{
            background: activeTab === 'monthly' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'monthly' ? '#0a1929' : 'var(--text-secondary)',
            border: activeTab === 'monthly' ? 'none' : '1px solid var(--border)',
            borderRadius: '6px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly Summary
        </button>
      </div>
      
      {activeTab === 'inventory' && (
        <Card title="Inventory Report">
          <div style={{marginBottom: '16px'}}>
            <p style={{color: 'var(--text-secondary)'}}>
              This report shows all items in inventory and their order metrics.
            </p>
          </div>
          
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item Name</th>
                <th>Orders</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.inventory?.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td style={{fontWeight: '500'}}>{item.name}</td>
                  <td>{item.ordered || 0}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: (item.ordered || 0) > 50 ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 152, 0, 0.15)',
                      color: (item.ordered || 0) > 50 ? '#4caf50' : '#ff9800',
                    }}>
                      {(item.ordered || 0) > 50 ? 'High Demand' : 'Normal'}
                    </span>
                  </td>
                </tr>
              )) || []}
            </tbody>
          </table>
        </Card>
      )}
      
      {activeTab === 'clients' && (
        <Card title="Client Report">
          <div style={{marginBottom: '16px'}}>
            <p style={{color: 'var(--text-secondary)'}}>
              This report shows client order activity and engagement metrics.
            </p>
          </div>
          
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Client Name</th>
                <th>Total Orders</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.clients?.map(client => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td style={{fontWeight: '500'}}>{client.name}</td>
                  <td>{client.orders || 0}</td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: (client.orders || 0) > 30 ? 'rgba(76, 175, 80, 0.15)' : 'rgba(102, 178, 255, 0.15)',
                      color: (client.orders || 0) > 30 ? '#4caf50' : 'var(--accent)',
                    }}>
                      {(client.orders || 0) > 30 ? 'Key Account' : 'Regular'}
                    </span>
                  </td>
                </tr>
              )) || []}
            </tbody>
          </table>
        </Card>
      )}
      
      {activeTab === 'monthly' && (
        <Card title="Monthly Summary">
          <div style={{marginBottom: '16px'}}>
            <p style={{color: 'var(--text-secondary)'}}>
              This report provides a monthly overview of all inventory activity.
            </p>
          </div>
          
          <div style={{
            background: 'rgba(102, 178, 255, 0.05)',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{color: 'var(--accent)', margin: '0 0 10px 0'}}>Performance Highlights</h3>
            <ul style={{color: 'var(--text-secondary)'}}>
              <li>Total Orders: <strong>326</strong></li>
              <li>New Clients: <strong>12</strong></li>
              <li>Revenue Growth: <strong>+14%</strong></li>
              <li>Top Performing Category: <strong>Electronics</strong></li>
            </ul>
          </div>
          
          <p style={{color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic'}}>
            Detailed monthly metrics will be available in the next update.
          </p>
        </Card>
      )}
    </div>
  )
}
