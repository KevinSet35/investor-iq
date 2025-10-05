import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from './services/api';

// Environment configuration - moved from HomePage
export interface EnvironmentConfig {
    CLIENT_PORT: string;
    SERVER_PORT: string;
    API_URL: string;
    // apiEndpoint: string;
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
    const CLIENT_PORT = process.env['REACT_APP_CLIENT_PORT'] || '3000';
    const SERVER_PORT = process.env['REACT_APP_SERVER_PORT'] || '5000';
    const API_URL = process.env['REACT_APP_API_URL'] || `http://localhost:${SERVER_PORT}/api`;
    // const apiEndpoint = `${API_URL}/generatescript`;

    // Log environment configuration in development
    if (process.env.NODE_ENV === 'development') {
        console.log('Environment Configuration:');
        console.log(`- REACT_APP_CLIENT_PORT: ${CLIENT_PORT}`);
        console.log(`- REACT_APP_SERVER_PORT: ${SERVER_PORT}`);
        console.log(`- API URL: ${API_URL}`);
        // console.log(`- API Endpoint: ${apiEndpoint}`);
    }

    return { CLIENT_PORT, SERVER_PORT, API_URL }; //, apiEndpoint };
};

interface User {
    id: string;
    name?: string;
    email?: string;
    // Add other user properties as needed
}



const App: React.FC = () => {
    // Environment configuration
    const { CLIENT_PORT, SERVER_PORT, API_URL }: EnvironmentConfig = getEnvironmentConfig();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getUsersUrl = (): string => {
        const url = `${API_URL}/users`;
        console.log('user url:', url);
        return url;
    }

    // API Service
    const apiService = {
        getUsers: async (): Promise<User[]> => {
            const response = await api.get('/users');
            console.log(response);
            return response.data.payload;
        },


    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await apiService.getUsers(); //'http://localhost:3000/users');
                console.log('ress', response);
                setUsers(response);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Users</h1>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        <div>ID: {user.id}</div>
                        {user.name && <div>Name: {user.name}</div>}
                        {user.email && <div>Email: {user.email}</div>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default App;