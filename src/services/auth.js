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
    
    // Check if the server is reachable
    if (!response) {
      throw new Error('Cannot reach the server. Please check your connection.');
    }
    
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    
    // Provide more user-friendly error messages
    if (error.message.includes('fetch')) {
      throw new Error('Server is unreachable. Please check if the backend is running.');
    }
    
    throw error;
  }
};

export const auth = {
  login: async (username, password) => {
    try {
      console.log('Attempting login with username:', username);
      
      // Always try the backend connection first, even for demo user
      try {
        const response = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password })
        });
        
        console.log('Login response:', response);
        
        // Handle different response formats
        let userData, tokenValue;
        
        if (response.data && response.data.user && response.data.token) {
          userData = response.data.user;
          tokenValue = response.data.token;
        } else if (response.user && response.token) {
          userData = response.user;
          tokenValue = response.token;
        } else {
          console.error('Unexpected login response format:', response);
          throw new Error('Server returned an invalid response format');
        }
        
        localStorage.setItem(tokenKey, tokenValue);
        localStorage.setItem(userKey, JSON.stringify(userData));
        
        return { token: tokenValue, user: userData };
      } catch (apiError) {
        // If API call fails, use fallback demo login
        if (username === 'demo' && password === 'demo123') {
          console.log('Backend unreachable, using demo fallback login');
          const mockUserData = {
            id: 1,
            username: 'demo',
            firstName: 'Demo',
            lastName: 'User',
            role: 'Admin'
          };
          const mockToken = 'demo-token-12345';
          
          localStorage.setItem(tokenKey, mockToken);
          localStorage.setItem(userKey, JSON.stringify(mockUserData));
          
          return { token: mockToken, user: mockUserData };
        } else {
          // Only demo account works in fallback mode
          throw apiError;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Give specific error message for backend connection issues
      if (error.message.includes('unreachable')) {
        throw new Error('Server is unreachable. Try using demo/demo123 to login.');
      }
      
      throw new Error(error.message || 'Login failed');
    }
  },

  signup: async (userData) => {
    try {
      // Extract username for validation
      const { username } = userData;
      
      // For demo purposes in case the backend is down
      if (username === 'demo') {
        throw new Error('Username "demo" is reserved. Please choose another username.');
      }
      
      console.log('Attempting registration with data:', userData);
      
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });

      console.log('Registration response:', response);
      
      // Handle different response formats
      let userData, tokenValue;
      
      if (response.data && response.data.user && response.data.token) {
        userData = response.data.user;
        tokenValue = response.data.token;
      } else if (response.user && response.token) {
        userData = response.user;
        tokenValue = response.token;
      } else if (response.success && response.token) {
        // Some APIs might not return full user object
        userData = { username };
        tokenValue = response.token;
      } else {
        console.error('Unexpected registration response format:', response);
        throw new Error('Server returned an invalid response format');
      }
      
      localStorage.setItem(tokenKey, tokenValue);
      localStorage.setItem(userKey, JSON.stringify(userData));
      
      return { token: tokenValue, user: userData };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Give specific error message for backend connection issues
      if (error.message.includes('unreachable')) {
        throw new Error('Server is unreachable. Try using demo/demo123 to login instead.');
      }
      
      throw new Error(error.message || 'Registration failed');
    }
  },

  logout: async () => {
    try {
      // Call logout endpoint if token exists
      const token = localStorage.getItem(tokenKey);
      if (token && token !== 'demo-token-12345') { // Skip API call for demo token
        try {
          await apiRequest('/auth/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } catch (error) {
          console.error('Logout API call failed:', error);
        }
      }
    } finally {
      // Always clear local storage
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem(tokenKey);
    if (!token) return false;
    
    // For demo token, always return true
    if (token === 'demo-token-12345') return true;
    
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
