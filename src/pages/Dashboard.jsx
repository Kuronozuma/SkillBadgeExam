import React, { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Dashboard(){
  const [data, setData] = useState(null)
  useEffect(()=>{api.fetchDashboard().then(setData)},[])
  if(!data) return <div className="card">Loading...</div>
  return (
    <div>
      <h2>Dashboard</h2>
      <div className="grid">
        <div className="card">
          <h4>Most ordered</h4>
          <div>{data.most.name} ({data.most.ordered})</div>
        </div>
        <div className="card">
          <h4>Least ordered</h4>
          <div>{data.least.name} ({data.least.ordered})</div>
        </div>
        <div className="card">
          <h4>Top customer</h4>
          <div>{data.topCustomer.name} ({data.topCustomer.orders})</div>
        </div>
        <div className="card">
          <h4>Categories</h4>
          <div>{data.categories.join(', ')}</div>
        </div>
      </div>
    </div>
  )
}
