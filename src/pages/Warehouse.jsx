import React, { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Warehouse(){
  const [rows, setRows] = useState([])
  useEffect(()=>{api.fetchWarehouse().then(setRows)},[])
  return (
    <div>
      <h2>Warehouse</h2>
      <div className="card">
        <table className="table">
          <thead><tr><th>ID</th><th>Status</th><th>Note</th></tr></thead>
          <tbody>{rows.map(r=> <tr key={r.id}><td>{r.id}</td><td>{r.status}</td><td>{r.note}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}
