import React, { useState } from 'react'
import '../styles/pages/Orders.css'

export default function Orders() {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      customer: 'John Doe',
      date: '2025-09-10',
      total: 89.97,
      status: 'completed',
      items: [
        { name: 'Vapor X Pro', quantity: 1, price: 49.99 },
        { name: 'Blueberry Mint E-Liquid', quantity: 2, price: 19.99 }
      ]
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      date: '2025-09-12',
      total: 134.95,
      status: 'pending',
      items: [
        { name: 'Cloud Master Kit', quantity: 1, price: 79.99 },
        { name: 'Tropical Punch E-Liquid', quantity: 1, price: 24.99 },
        { name: 'Replacement Coils (5-pack)', quantity: 1, price: 29.97 }
      ]
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      date: '2025-09-13',
      total: 59.98,
      status: 'pending',
      items: [
        { name: 'Strawberry Ice E-Liquid', quantity: 3, price: 19.99 }
      ]
    },
    {
      id: 'ORD-004',
      customer: 'Sarah Wilson',
      date: '2025-09-08',
      total: 149.97,
      status: 'cancelled',
      items: [
        { name: 'Premium Vape Kit', quantity: 1, price: 129.99 },
        { name: 'Mint Menthol E-Liquid', quantity: 1, price: 19.98 }
      ]
    }
  ]);

  const [filterStatus, setFilterStatus] = useState('all');
  
  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  return (
    <div className="orders-page">
      <h1>Orders Management</h1>
      
      <div className="order-filters">
        <div className="filter-group">
          <span className="filter-label">Status:</span>
          <select 
            className="filter-select" 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.date}</td>
              <td>${order.total.toFixed(2)}</td>
              <td>
                <span className={`order-status status-${order.status}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </td>
              <td>
                <div className="order-actions">
                  <button className="action-button">View</button>
                  <button className="action-button">Edit</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}