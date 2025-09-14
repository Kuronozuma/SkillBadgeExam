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

  console.log(`API Request: ${options.method || 'GET'} ${url}`);
  console.log('Request headers:', config.headers);
  
  try {
    // Check if the backend is running before making the request
    // Skip health check for auth endpoints to prevent login issues
    const isAuthEndpoint = endpoint.includes('/auth/');
    
    if (!window.backendChecked && !isAuthEndpoint) {
      try {
        // Try to fetch server status - first try inventory test endpoint
        console.log('Checking if backend is online...');
        
        // Try inventory test endpoint first (doesn't require auth)
        const testUrl = `${API_BASE_URL}/inventory/test`;
        console.log(`Checking backend using test endpoint: ${testUrl}`);
        
        try {
          const testCheck = await fetch(testUrl, { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors'
          });
          
          if (testCheck.ok) {
            const testData = await testCheck.json();
            console.log('Backend test succeeded:', testData);
            window.backendChecked = true;
          } else {
            console.warn('Backend test endpoint failed, trying health endpoint');
            throw new Error('Test endpoint failed');
          }
        } catch (testError) {
          // Fallback to health check endpoint
          const healthUrl = API_BASE_URL.replace(/\/api$/, '') + '/health';
          console.log(`Trying health endpoint: ${healthUrl}`);
          const healthCheck = await fetch(healthUrl, { 
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors'
          });
          
          if (healthCheck.ok) {
            const healthData = await healthCheck.json();
            console.log('Health check succeeded:', healthData);
            window.backendChecked = true;
          } else {
            console.warn('Health check failed with status:', healthCheck.status);
          }
        }
      } catch (healthError) {
        console.error('Backend appears to be offline:', healthError);
        throw new Error('Backend server appears to be offline. Please make sure it is running.');
      }
    }
    
    // Proceed with the actual request
    const response = await fetch(url, config);
    
    // Handle network errors
    if (!response) {
      throw new Error('Network response was not received');
    }
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    // Try to parse response as JSON
    let data;
    try {
      data = await response.json();
      console.log('Response data:', data);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error('Invalid response format');
    }

    // Handle error status codes
    if (!response.ok) {
      const errorMsg = data?.message || `HTTP error! status: ${response.status}`;
      console.error(`API error (${response.status}):`, errorMsg);
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
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
      console.log('Fetching inventory with params:', params);
      const queryString = new URLSearchParams(params).toString();
      const url = `/inventory${queryString ? `?${queryString}` : ''}`;
      console.log('Inventory API URL:', url);
      
      try {
        const response = await apiRequest(url);
        console.log('Raw inventory API response:', response);
        
        // Handle different response formats
        if (!response) {
          console.warn('Empty response from inventory API');
          return [];
        }
        
        if (Array.isArray(response)) {
          console.log('Response is an array with', response.length, 'items');
          return response;
        }
        
        if (response.data && Array.isArray(response.data.items)) {
          console.log('Found items array in response.data.items');
          return response.data.items;
        }
        
        if (Array.isArray(response.data)) {
          console.log('Found items array in response.data');
          return response.data;
        }
        
        if (Array.isArray(response.items)) {
          console.log('Found items array in response.items');
          return response.items;
        }
        
        // Fallback: try to find items nested arbitrarily
        const result = (response.data && response.data.items) || response.items || [];
        console.log('Using fallback result with', result.length, 'items');
        return result;
      } catch (apiError) {
        console.error('API request failed:', apiError);
        throw apiError;
      }
    } catch (error) {
      console.error('Inventory API error:', error);
      // Let the component handle this error and potentially show mock data
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
