import axiosInstance from './axios.config';

export interface User {
    id: string;
    email: string;
    name: string;
    username: string;
    profilePicture: string | null;
    gender: string;
    dob: Date;
    height: number;
    weight: number;
    goal: string;
    activityLevel: string;
    restrictions: string[];
    cusines: string[];
    allergies: string[];
    adventurousness: number;
}

export const setAuthData = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getToken = () => {
    return localStorage.getItem('token');
};

export const getUser = (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const checkAuthStatus = async (): Promise<User | null> => {
    const token = getToken();
    if (!token) return null;

    try {
        const response = await axiosInstance.get('/auth/verify');
        setAuthData(token, response.data.user);
        return response.data.user;
    } catch (error: any) {
        // Debugging output
        console.error('Auth verify error:', error);
        if (error.response) {
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
            console.error('No response received:', error.request);
        } else {
            console.error('Error setting up request:', error.message);
        }
        clearAuthData();
        return null;
    }
};

export const login = async (email: string, password: string): Promise<{ token: string; user: User }> => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    const { token, user } = response.data;
    setAuthData(token, user);
    return { token, user };
};

export const register = async (userData: any): Promise<{ token: string; user: User }> => {
    const response = await axiosInstance.post('/users/register', userData);
    const { token, data: user } = response.data;
    setAuthData(token, user);
    return { token, user };
};

export const logout = () => {
    clearAuthData();
    window.location.href = '/login';
};