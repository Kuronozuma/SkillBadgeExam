import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import Card from '../components/Card'
import '../styles/pages/Dashboard.css'

export default function Dashboard(){
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    api.fetchDashboard()
      .then(data => {
        setData(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Failed to load dashboard data:", err)
        setIsLoading(false)
      })
  }, [])
  
  if(isLoading) {
    return (
      <div className="loading-container">
        <Card>
          <div className="loading-spinner">Loading dashboard data...</div>
        </Card>
      </div>
    )
  }
  
  if(!data) {
    return <Card>Failed to load dashboard data. Please try again.</Card>
  }
  
  return (
    <div>
      <h2>Dashboard Overview</h2>
      <div className="grid">
        <Card title="Most Ordered Item">
          <div style={{fontSize:20, fontWeight:600, marginBottom:8}}>{data.most.name}</div>
          <div style={{color:'var(--accent)', fontWeight:500}}>{data.most.ordered} orders</div>
        </Card>

        <Card title="Least Ordered Item">
          <div style={{fontSize:20, fontWeight:600, marginBottom:8}}>{data.least.name}</div>
          <div style={{color:'var(--accent)', fontWeight:500}}>{data.least.ordered} orders</div>
        </Card>

        <Card title="Top Customer">
          <div style={{fontSize:20, fontWeight:600, marginBottom:8}}>{data.topCustomer.name}</div>
          <div style={{color:'var(--accent)', fontWeight:500}}>{data.topCustomer.orders} orders</div>
        </Card>

        <Card title="Product Categories">
          <div style={{color:'var(--text-secondary)', fontSize:16}}>
            {data.categories.join(', ')}
          </div>
        </Card>
      </div>

      <div style={{marginTop:24}}>
        <Card title="Top Performing Items">
          <ul>
            {data.topItems?.map(item => (
              <li key={item.id}>
                <span style={{color:'var(--text)', fontWeight:500}}>{item.name}</span>
                <span style={{color:'var(--accent)', marginLeft:8}}>— {item.ordered} orders</span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <Link to="/inventory" style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: 'rgba(102, 178, 255, 0.1)',
              color: 'var(--accent)',
              borderRadius: '6px',
              textDecoration: 'none',
              border: '1px solid var(--accent)',
              fontWeight: '500'
            }}>
              Manage Inventory →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
