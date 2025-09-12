import React, { useEffect, useState } from 'react'
import { api } from '../services/api'

export default function Distributors(){
  const [rows, setRows] = useState([])
  useEffect(()=>{api.fetchDistributors().then(setRows)},[])
  return (
    <div>
      <h2>Distributors</h2>
      <div className="card">
        <ul>
          {rows.map(r=> <li key={r.id}>{r.name}</li>)}
        </ul>
      </div>
    </div>
  )
}
