import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import axiosInstance from './services/axios.config.ts';
import { getToken, clearAuthData } from './services/auth.service.ts';

// Setup Axios interceptors
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if it's a 401 and we're not already on the login page.
    // This prevents redirect loops on login failure.
    if (error.response?.status === 401 && window.location.pathname !== '/auth/login') {
      clearAuthData();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)