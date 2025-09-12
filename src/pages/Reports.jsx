import React, { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Reports(){
  const [data, setData] = useState(null)
  useEffect(()=>{api.fetchReports().then(setData)},[])
  if(!data) return <div className="card">Loading...</div>
  return (
    <div>
      <h2>Reports</h2>
      <div className="card">
        <h4>Inventory</h4>
        <ul>{data.inventory.map(i=> <li key={i.id}>{i.name} - {i.ordered}</li>)}</ul>
        <h4>Clients</h4>
        <ul>{data.clients.map(c=> <li key={c.id}>{c.name} ({c.orders})</li>)}</ul>
      </div>
    </div>
  )
}
