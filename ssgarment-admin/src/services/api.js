// src/services/api.js
import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;
const api = axios.create({
  baseURL: `${apiUrl}/admin-role`,
  withCredentials: true,
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  withXSRFToken: true, 
});

// Har request ke saath token attach karega agar available ho
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;