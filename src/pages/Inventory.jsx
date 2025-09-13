import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Card from '../components/Card';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: 0,
    price: 0,
    supplier: ''
  });

  // Load inventory data
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const data = await api.fetchInventory();
      setItems(data);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === 'stock' || name === 'price'
      ? parseFloat(value) || 0
      : value;

    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };

  // Open modal for creating new item
  const openCreateModal = () => {
    setCurrentItem(null);
    setFormData({
      name: '',
      category: '',
      stock: 0,
      price: 0,
      supplier: ''
    });
    setShowModal(true);
  };

  // Open modal for editing item
  const openEditModal = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      stock: item.stock || 0,
      price: item.price || 0,
      supplier: item.supplier || ''
    });
    setShowModal(true);
  };

  // Save item (create or update)
  const saveItem = async () => {
    try {
      if (currentItem) {
        // Update existing item
        await api.updateInventoryItem(currentItem.id, formData);
      } else {
        // Create new item
        await api.createInventoryItem(formData);
      }

      setShowModal(false);
      fetchInventory(); // Refresh inventory list
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('Failed to save item. Please try again.');
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await api.deleteInventoryItem(id);
        fetchInventory(); // Refresh inventory list
      } catch (error) {
        console.error('Failed to delete item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  return (
    <div>
      <h2>Inventory Management</h2>

      {/* Search and Add Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ width: '60%' }}>
          <input
            type="text"
            placeholder="Search by name, category or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border)'
            }}
          />
        </div>
        <button
          onClick={openCreateModal}
          style={{
            padding: '12px 20px',
            fontWeight: '600'
          }}
        >
          + Add New Item
        </button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="loading-container">
          <Card>
            <div className="loading-spinner">Loading inventory data...</div>
          </Card>
        </div>
      ) : (
        <>
          {/* No Results */}
          {filteredItems.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <h3 style={{ marginBottom: '10px', color: 'var(--accent)' }}>No Items Found</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  {items.length === 0
                    ? "Your inventory is empty. Click 'Add New Item' to add your first inventory item."
                    : "No items match your search criteria. Try adjusting your search."}
                </p>
                {items.length === 0 && (
                  <button onClick={openCreateModal}>Add New Item</button>
                )}
              </div>
            </Card>
          ) : (
            // Inventory Table
            <Card>
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Price</th>
                      <th>Orders</th>
                      <th>Supplier</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(item => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td style={{ fontWeight: '500' }}>{item.name}</td>
                        <td>{item.category}</td>
                        <td style={{
                          color: item.stock < 20 ? 'var(--error)' : 'inherit',
                          fontWeight: item.stock < 20 ? '600' : 'inherit'
                        }}>
                          {item.stock}
                        </td>
                        <td>₱{item.price?.toFixed(2) || '0.00'}</td>
                        <td>{item.ordered}</td>
                        <td>{item.supplier || 'N/A'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => openEditModal(item)}
                              style={{
                                padding: '4px 8px',
                                background: 'rgba(102, 178, 255, 0.1)',
                                color: 'var(--accent)',
                                border: '1px solid var(--accent)'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              style={{
                                padding: '4px 8px',
                                background: 'rgba(255, 107, 107, 0.1)',
                                color: 'var(--error)',
                                border: '1px solid var(--error)'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            background: 'linear-gradient(135deg, var(--card-gradient-start), var(--card-gradient-end))',
            borderRadius: '10px',
            padding: '25px',
            boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{
              marginTop: 0,
              color: 'var(--accent)',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '10px'
            }}>
              {currentItem ? 'Edit Item' : 'Add New Item'}
            </h3>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Item name"
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                Category
              </label>
              <input
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Food, Hygiene, etc."
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                  Stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-secondary)' }}>
                Supplier
              </label>
              <input
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                placeholder="Supplier name"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveItem}
                disabled={!formData.name || !formData.category}
              >
                {currentItem ? 'Update Item' : 'Create Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
