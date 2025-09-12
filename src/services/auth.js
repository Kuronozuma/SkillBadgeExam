const tokenKey = 'inv_token'

export const auth = {
  login: async (username, password) => {
    // mock
    if (username && password) {
      const token = btoa(username + ':' + password)
      localStorage.setItem(tokenKey, token)
      return { token }
    }
    throw new Error('Invalid')
  },
  logout: () => {
    localStorage.removeItem(tokenKey)
  },
  isAuthenticated: () => !!localStorage.getItem(tokenKey),
  getToken: () => localStorage.getItem(tokenKey)
}
