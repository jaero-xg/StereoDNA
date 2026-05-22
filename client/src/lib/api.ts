import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshResponse = await axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        )

        const { accessToken } = refreshResponse.data
        localStorage.setItem('access_token', accessToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        window.location.href = '/'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const spotifyApi = {
  login: () => {
    window.location.href = '/api/auth/spotify'
  },

  logout: async () => {
    await api.post('/auth/logout')
    localStorage.removeItem('access_token')
    window.location.href = '/'
  },

  getMe: () => api.get('/users/me'),
  getDashboard: (timeRange: string = 'medium_term') => 
    api.get(`/dashboard?timeRange=${timeRange}`),
  getTopArtists: (timeRange: string = 'medium_term', limit: number = 20) =>
    api.get(`/artists/top?timeRange=${timeRange}&limit=${limit}`),
  getTopTracks: (timeRange: string = 'medium_term', limit: number = 20) =>
    api.get(`/tracks/top?timeRange=${timeRange}&limit=${limit}`),
  getRecentlyPlayed: (limit: number = 50) =>
    api.get(`/tracks/recent?limit=${limit}`),
  getHeatmap: () => api.get('/analytics/heatmap'),
  getGenres: () => api.get('/analytics/genres'),
  getPersonality: () => api.get('/analytics/personality'),
  getRoast: () => api.get('/analytics/roast'),
  getTrends: () => api.get('/analytics/trends'),
  getStats: () => api.get('/analytics/stats'),
}
