import axios from 'axios';
import { getToken, clearAuthData } from './auth.service';

// Use relative path for development (to use the proxy)
// and an absolute path in production.
const API_URL = import.meta.env.PROD
    ? import.meta.env.VITE_API_URL
    : '/api';

// In production, the VITE_API_URL must be set.
if (import.meta.env.PROD && !API_URL) {
    throw new Error("VITE_API_URL is not set for production build.");
}

// Create axios instance with base URL
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to all requests
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

// Handle 401 responses (token expired)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            clearAuthData();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;