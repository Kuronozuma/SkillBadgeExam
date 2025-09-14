import React, { useEffect, useMemo, useState } from 'react'
import '../styles/pages/Orders.css'

export default function Orders() {
  const initialOrders = useMemo(() => ([
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
  ]), []);

  const [orders, setOrders] = useState(initialOrders);

  const [filterStatus, setFilterStatus] = useState('all');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', customer: '', date: '', total: 0, status: 'pending' });

  // Load from localStorage once
  useEffect(() => {
    try {
      const raw = localStorage.getItem('orders_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) setOrders(parsed);
      } else {
        // seed storage on first run
        localStorage.setItem('orders_data', JSON.stringify(initialOrders));
      }
    } catch (e) {
      console.warn('Failed to load orders from storage:', e);
    }
  }, [initialOrders]);

  // Persist on change
  useEffect(() => {
    try {
      localStorage.setItem('orders_data', JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save orders:', e);
    }
  }, [orders]);

  const openEdit = (order) => {
    setEditForm({
      id: order.id,
      customer: order.customer,
      date: order.date,
      total: order.total,
      status: order.status,
    });
    setIsEditOpen(true);
  };

  const closeEdit = () => setIsEditOpen(false);

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: name === 'total' ? Number(value) : value }));
  };

  const saveEdit = () => {
    setOrders((prev) => prev.map((o) => (o.id === editForm.id ? { ...o, ...editForm } : o)));
    setIsEditOpen(false);
  };
  
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
                  <button className="action-button" onClick={() => openEdit(order)}>Edit</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isEditOpen && (
        <div className="orders-modal-overlay" onClick={closeEdit}>
          <div className="orders-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Order</h3>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Order ID</label>
                  <input value={editForm.id} disabled />
                </div>
                <div className="form-group">
                  <label>Customer</label>
                  <input name="customer" value={editForm.customer} onChange={onEditChange} />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="date" value={editForm.date} onChange={onEditChange} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={editForm.status} onChange={onEditChange}>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Total ($)</label>
                  <input type="number" step="0.01" min="0" name="total" value={editForm.total} onChange={onEditChange} />
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="action-button" onClick={closeEdit}>Cancel</button>
              <button className="action-button primary" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}