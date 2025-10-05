import axios from 'axios';

// Base API configuration
const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Add this if you're using credentials: true in CORS
});

// Health check API call
export const checkServerHealth = async () => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error) {
        console.error('Error checking server health:', error);
        throw error;
    }
};

export default api;
