const tokenKey = 'inv_token'
const userKey = 'inv_user'

export const auth = {
  login: async (username, password) => {
    // mock login: accept any non-empty
    if (username && password) {
      const token = btoa(username + ':' + password)
      localStorage.setItem(tokenKey, token)
      localStorage.setItem(userKey, JSON.stringify({ username }))
      return { token }
    }
    throw new Error('Invalid')
  },
  signup: async (username, password) => {
    // very small mock signup: just store the user
    if (username && password) {
      // in a real app you'd call the backend
      localStorage.setItem(userKey, JSON.stringify({ username }))
      const token = btoa(username + ':' + password)
      localStorage.setItem(tokenKey, token)
      return { token }
    }
    throw new Error('Invalid')
  },
  logout: () => {
    localStorage.removeItem(tokenKey)
    localStorage.removeItem(userKey)
  },
  isAuthenticated: () => !!localStorage.getItem(tokenKey),
  getToken: () => localStorage.getItem(tokenKey),
  getUser: () => {
    try {
      const s = localStorage.getItem(userKey)
      return s ? JSON.parse(s) : null
    } catch { return null }
  }
}
