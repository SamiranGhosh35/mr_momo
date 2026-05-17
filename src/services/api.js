import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
};

// Profile
export const profileAPI = {
  update: (data) => api.put('/profile', data),
  changePassword: (data) => api.put('/profile/change-password', data),
  getAddresses: () => api.get('/profile/addresses'),
  addAddress: (data) => api.post('/profile/addresses', data),
  updateAddress: (id, data) => api.put(`/profile/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/profile/addresses/${id}`),
  setDefault: (id) => api.put(`/profile/addresses/${id}/default`),
};

// Users (Admin)
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),
};

// Categories
export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  remove: (id) => api.delete(`/categories/${id}`),
};

// Items
export const itemsAPI = {
  getAll: (params) => api.get('/items', { params }),
  getById: (id) => api.get(`/items/${id}`),
  adminGetAll: (params) => api.get('/items/admin/all', { params }),
  create: (data) => api.post('/items', data),
  update: (id, data) => api.put(`/items/${id}`, data),
  remove: (id) => api.delete(`/items/${id}`),
  toggleAvailability: (id) => api.put(`/items/${id}/availability`),
  updateStock: (id, data) => api.put(`/items/${id}/stock`, data),
};

// Orders
export const ordersAPI = {
  place: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
};

// Reports (Admin)
export const reportsAPI = {
  dashboard: () => api.get('/reports/dashboard'),
  orders: (params) => api.get('/reports/orders', { params }),
  items: (params) => api.get('/reports/items', { params }),
  users: (params) => api.get('/reports/users', { params }),
};

export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

export default api;
