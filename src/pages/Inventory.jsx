import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Card from '../components/Card';
import ErrorBoundary from '../components/ErrorBoundary';
import { mockVapeCatalogue } from '../data/mockVapeData';
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
    brand: '',
    type: '',
    flavor: '',
    nicotineStrength: '',
    priceText: '',
    priceMin: 0,
    priceMax: 0,
    stock: 0,
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
      // First check if user is authenticated
      const token = localStorage.getItem('inv_token');
      if (!token) {
        console.warn('No auth token found, user may need to login');
        setError('Please login to view inventory items');
        setItems([]);
        setIsLoading(false);
        return;
      }
      
      // Use mock data instead of API for now
      console.log('Using mock vape shop catalogue data');
      setItems(mockVapeCatalogue);
      
      // For future real API implementation (commented for now)
      /*
      try {
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
          console.warn('Unexpected data format from API:', data);
          setItems([]);
        }
      } catch (apiError) {
        console.error('API fetch failed:', apiError);
        throw apiError;
      }
      */
      
    } catch (error) {
      console.error('Failed to load inventory data:', error);
      setError('Failed to load inventory data. Please try again.');
      setItems([]); // Use empty inventory on error
    } finally {
      setIsLoading(false);
    }
  };

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.flavor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.nicotineStrength.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.supplier && item.supplier.toLowerCase().includes(searchQuery.toLowerCase()))
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
      brand: '',
      type: '',
      flavor: '',
      nicotineStrength: '',
      priceText: '',
      priceMin: 0,
      priceMax: 0,
      stock: 0,
      supplier: ''
    });
    setShowModal(true);
  };

  // Open modal for editing item
  const openEditModal = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      brand: item.brand || '',
      type: item.type || '',
      flavor: item.flavor || '',
      nicotineStrength: item.nicotineStrength || '',
      priceText: item.priceText || '',
      priceMin: item.price?.min || 0,
      priceMax: item.price?.max || 0,
      stock: item.stock || 0,
      supplier: item.supplier || ''
    });
    setShowModal(true);
  };

  // Save item (create or update)
  const saveItem = async () => {
    try {
      // Create formatted item data from form
      const itemData = {
        ...formData,
        price: {
          min: parseInt(formData.priceMin) || 0,
          max: parseInt(formData.priceMax) || 0
        }
      };
      
      // Remove redundant fields
      delete itemData.priceMin;
      delete itemData.priceMax;
      
      if (currentItem) {
        // Update existing item - for mock data, we'll update the local state directly
        const updatedItems = items.map(item => 
          item.id === currentItem.id ? { ...item, ...itemData } : item
        );
        setItems(updatedItems);
        
        // In a real app, we would call the API:
        // await api.updateInventoryItem(currentItem.id, itemData);
      } else {
        // Create new item - for mock data, add to local state
        const newItem = {
          ...itemData,
          id: Math.max(0, ...items.map(item => item.id)) + 1
        };
        setItems([...items, newItem]);
        
        // In a real app, we would call the API:
        // await api.createInventoryItem(itemData);
      }

      setShowModal(false);
    } catch (error) {
      console.error('Failed to save item:', error);
      alert('Failed to save item. Please try again.');
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        // For mock data, filter out the deleted item from local state
        setItems(items.filter(item => item.id !== id));
        
        // In a real app, we would call the API:
        // await api.deleteInventoryItem(id);
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
            placeholder="Search by name, brand, type, flavor or nicotine strength..."
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
                      <th>#</th>
                      <th>Product Name</th>
                      <th>Brand/Origin</th>
                      <th>Type</th>
                      <th>Flavor Profile</th>
                      <th>Nicotine Strength</th>
                      <th>Price Range</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(item => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td className="item-name">{item.name}</td>
                        <td>{item.brand}</td>
                        <td>{item.type}</td>
                        <td>{item.flavor}</td>
                        <td>{item.nicotineStrength}</td>
                        <td className="price-text">{item.priceText}</td>
                        <td className={item.stock < (item.minStockLevel || 10) ? 'low-stock' : ''}>
                          {item.stock}
                        </td>
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
                Brand/Origin
              </label>
              <input
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Local, Imported, etc."
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Type
              </label>
              <input
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="Salt Nic, Freebase, etc."
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Flavor Profile
              </label>
              <input
                name="flavor"
                value={formData.flavor}
                onChange={handleInputChange}
                placeholder="Describe the flavor"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Nicotine Strength
              </label>
              <input
                name="nicotineStrength"
                value={formData.nicotineStrength}
                onChange={handleInputChange}
                placeholder="3mg / 6mg / 12mg, etc."
                required
              />
            </div>

            <div className="form-row">
              <div className="form-column">
                <label className="form-label">
                  Min Price (₱)
                </label>
                <input
                  type="number"
                  name="priceMin"
                  value={formData.priceMin}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="form-column">
                <label className="form-label">
                  Max Price (₱)
                </label>
                <input
                  type="number"
                  name="priceMax"
                  value={formData.priceMax}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Price Text (Display Format)
              </label>
              <input
                name="priceText"
                value={formData.priceText}
                onChange={handleInputChange}
                placeholder="₱300-₱500 for 30-60mL"
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
                  Supplier
                </label>
                <input
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  placeholder="Supplier name"
                />
              </div>
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
