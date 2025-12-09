// src/plugins/axios.js
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? '/app';

// Crea un cliente Axios configurado con baseURL y token cuando exista
const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;