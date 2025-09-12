import React, { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Customers(){
  const [rows, setRows] = useState([])
  useEffect(()=>{api.fetchCustomers().then(setRows)},[])
  return (
    <div>
      <h2>Customers</h2>
      <div className="card">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Orders</th></tr>
          </thead>
          <tbody>
            {rows.map(r=> <tr key={r.id}><td>{r.id}</td><td>{r.name}</td><td>{r.orders}</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  )
}
