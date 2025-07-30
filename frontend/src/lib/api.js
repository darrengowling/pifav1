import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

export const playersApi = {
  getAll: () => api.get('/players'),
  getById: (id) => api.get(`/players/${id}`),
  search: (query) => api.get(`/players/search?q=${query}`),
};

export const tournamentsApi = {
  getAll: () => api.get('/tournaments'),
  getById: (id) => api.get(`/tournaments/${id}`),
  create: (tournamentData) => api.post('/tournaments', tournamentData),
  join: (tournamentId, inviteCode) => api.post(`/tournaments/${tournamentId}/join`, { inviteCode }),
  leave: (tournamentId) => api.post(`/tournaments/${tournamentId}/leave`),
  getParticipants: (tournamentId) => api.get(`/tournaments/${tournamentId}/participants`),
};

export const auctionsApi = {
  getAll: () => api.get('/auctions'),
  getById: (id) => api.get(`/auctions/${id}`),
  create: (auctionData) => api.post('/auctions', auctionData),
  placeBid: (auctionId, bidData) => api.post(`/auctions/${auctionId}/bid`, bidData),
  getBids: (auctionId) => api.get(`/auctions/${auctionId}/bids`),
  getParticipants: (auctionId) => api.get(`/auctions/${auctionId}/participants`),
};

export default api;