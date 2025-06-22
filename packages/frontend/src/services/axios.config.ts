import axios from 'axios';

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

export default axiosInstance;