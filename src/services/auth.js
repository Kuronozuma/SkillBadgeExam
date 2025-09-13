const API_BASE_URL = 'http://localhost:3001/api';
const tokenKey = 'inv_token';
const userKey = 'inv_user';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
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

export const auth = {
  login: async (username, password) => {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      const { user, token } = response.data;
      
      localStorage.setItem(tokenKey, token);
      localStorage.setItem(userKey, JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  },

  signup: async (username, password) => {
    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      const { user, token } = response.data;
      
      localStorage.setItem(tokenKey, token);
      localStorage.setItem(userKey, JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  },

  logout: async () => {
    try {
      // Call logout endpoint if token exists
      const token = localStorage.getItem(tokenKey);
      if (token) {
        await apiRequest('/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(tokenKey);
    if (!token) return false;
    
    try {
      // Check if token is expired (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  },

  getToken: () => localStorage.getItem(tokenKey),

  getUser: () => {
    try {
      const userStr = localStorage.getItem(userKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });

      const { user } = response.data;
      localStorage.setItem(userKey, JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw new Error(error.message || 'Profile update failed');
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      await apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      return true;
    } catch (error) {
      throw new Error(error.message || 'Password change failed');
    }
  }
};
