// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('inv_token');
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const api = {
  // Dashboard data
  fetchDashboard: async () => {
    const response = await apiRequest('/dashboard');
    return response.data;
  },

  // Basic CRUD operations
  fetchCustomers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/customers${queryString ? `?${queryString}` : ''}`);
    return response.data.customers;
  },

  fetchDistributors: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/distributors${queryString ? `?${queryString}` : ''}`);
    return response.data.distributors;
  },

  fetchWarehouse: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/warehouse${queryString ? `?${queryString}` : ''}`);
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data.logs)) return response.data.logs;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.logs)) return response.logs;
    return [];
  },
  
  fetchReports: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/reports/inventory${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // Test API connection
  testInventory: async () => {
    try {
      const response = await apiRequest('/inventory/test');
      console.log('Inventory test response:', response);
      return response;
    } catch (error) {
      console.error('Inventory test error:', error);
      throw error;
    }
  },

  // Inventory specific operations
  fetchInventory: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiRequest(`/inventory${queryString ? `?${queryString}` : ''}`);
      if (!response) return [];
      if (Array.isArray(response)) return response;
      if (response.data && Array.isArray(response.data.items)) return response.data.items;
      if (Array.isArray(response.data)) return response.data;
      if (Array.isArray(response.items)) return response.items;
      // Fallback: try to find items nested arbitrarily
      return (response.data && response.data.items) || response.items || [];
    } catch (error) {
      console.error('Inventory API error:', error);
      throw error;
    }
  },
  getInventoryItem: async (id) => {
    const response = await apiRequest(`/inventory/${id}`);
    return response.data.item;
  },

  createInventoryItem: async (item) => {
    const response = await apiRequest('/inventory', {
      method: 'POST',
      body: JSON.stringify(item)
    });
    return response.data.item;
  },

  updateInventoryItem: async (id, updatedData) => {
    const response = await apiRequest(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData)
    });
    return response.data.item;
  },

  deleteInventoryItem: async (id) => {
    await apiRequest(`/inventory/${id}`, {
      method: 'DELETE'
    });
    return true;
  },

  // Customer operations
  createCustomer: async (customer) => {
    const response = await apiRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customer)
    });
    return response.data.customer;
  },

  updateCustomer: async (id, updatedData) => {
    const response = await apiRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData)
    });
    return response.data.customer;
  },

  deleteCustomer: async (id) => {
    await apiRequest(`/customers/${id}`, {
      method: 'DELETE'
    });
    return true;
  },

  // Distributor operations
  createDistributor: async (distributor) => {
    const response = await apiRequest('/distributors', {
      method: 'POST',
      body: JSON.stringify(distributor)
    });
    return response.data.distributor;
  },

  updateDistributor: async (id, updatedData) => {
    const response = await apiRequest(`/distributors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData)
    });
    return response.data.distributor;
  },

  deleteDistributor: async (id) => {
    await apiRequest(`/distributors/${id}`, {
      method: 'DELETE'
    });
    return true;
  },

  // Order operations
  fetchOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/orders${queryString ? `?${queryString}` : ''}`);
    return response.data.orders;
  },

  createOrder: async (order) => {
    const response = await apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
    return response.data.order;
  },

  updateOrder: async (id, updatedData) => {
    const response = await apiRequest(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData)
    });
    return response.data.order;
  },

  updateOrderStatus: async (id, status) => {
    const response = await apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    return response.data.order;
  },

  deleteOrder: async (id) => {
    await apiRequest(`/orders/${id}`, {
      method: 'DELETE'
    });
    return true;
  },

  // Warehouse operations
  createWarehouseLog: async (log) => {
    const response = await apiRequest('/warehouse', {
      method: 'POST',
      body: JSON.stringify(log)
    });
    return response.data.log;
  },

  updateWarehouseLog: async (id, updatedData) => {
    const response = await apiRequest(`/warehouse/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData)
    });
    return response.data.log;
  },

  deleteWarehouseLog: async (id) => {
    await apiRequest(`/warehouse/${id}`, {
      method: 'DELETE'
    });
    return true;
  },

  // Reports
  fetchInventoryReport: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/reports/inventory${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  fetchCustomerReport: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/reports/customers${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  fetchMonthlyReport: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await apiRequest(`/reports/monthly${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  fetchStockAlerts: async () => {
    const response = await apiRequest('/reports/stock-alerts');
    return response.data;
  }
};
