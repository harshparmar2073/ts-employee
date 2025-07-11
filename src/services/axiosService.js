import axios from 'axios';

const axiosService = axios.create({
  // baseURL: 'https://api.antalyze.uk/v1',
    baseURL: 'http://localhost:8080/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Optional: Add token from localStorage to all requests
axiosService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Global error logging or transformation
axiosService.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosService;