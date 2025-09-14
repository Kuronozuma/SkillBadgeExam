import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Card from '../components/Card';
import ErrorBoundary from '../components/ErrorBoundary';
import '../styles/pages/Inventory.css';

function Inventory() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
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
    // Start with an empty inventory and try to fetch from API
    fetchInventory();
  }, []);

  // No mock data - starting with empty inventory

  const fetchInventory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Attempt to fetch data from API
      console.log('Attempting to fetch inventory from API...');
      const data = await api.fetchInventory();
      console.log('Inventory data received:', data);
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setItems(data);
      } else if (data?.items && Array.isArray(data.items)) {
        setItems(data.items);
      } else if (data?.data?.items && Array.isArray(data.data.items)) {
        setItems(data.data.items);
      } else if (data?.data && Array.isArray(data.data)) {
        setItems(data.data);
      } else {
        // Fallback to empty array if we can't find items
        console.warn('Unexpected data format from API:', data);
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to load inventory from API:', error);
      setError(error.message || 'Failed to load inventory data');
      setItems([]); // Start with an empty inventory
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
    <div className="inventory-container">
      <div className="inventory-title-row">
        <h2>Inventory Management</h2>
      </div>

      {/* Error Display */}
      {error && (
        <Card>
          <div className="error-message">
            <strong>Error:</strong> {error}
            <div>
              <button onClick={fetchInventory} className="retry-button">
                Retry
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Search and Add Controls */}
      <div className="inventory-header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by name, category or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button
          onClick={openCreateModal}
          className="add-button"
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
              <div className="empty-state">
                <h3>No Items Found</h3>
                <p>
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
              <div className="inventory-table">
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
                        <td className="item-name">{item.name}</td>
                        <td>{item.category}</td>
                        <td className={item.stock < (item.minStockLevel || 20) ? 'low-stock' : ''}>
                          {item.stock}
                        </td>
                        <td>₱{typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}</td>
                        <td>{item.ordered || 0}</td>
                        <td>{item.distributor?.name || 'N/A'}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => openEditModal(item)}
                              className="edit-button"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="delete-button"
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-header">
              {currentItem ? 'Edit Item' : 'Add New Item'}
            </h3>

            <div className="form-group">
              <label className="form-label">
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

            <div className="form-group">
              <label className="form-label">
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

            <div className="form-row">
              <div className="form-column">
                <label className="form-label">
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
              <div className="form-column">
                <label className="form-label">
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

            <div className="form-group">
              <label className="form-label">
                Supplier
              </label>
              <input
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                placeholder="Supplier name"
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowModal(false)}
                className="cancel-button"
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

export default function InventoryWithErrorBoundary() {
  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <Inventory />
    </ErrorBoundary>
  );
}
