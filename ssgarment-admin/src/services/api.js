// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/admin-role',
  withCredentials: true,  // Django backend URL, baad me production URL se replace karna
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