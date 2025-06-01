import axios from 'axios';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getUserProfile(userId: string) {
    const res = await axios.get(`/api/users/${userId}`, { headers: getAuthHeaders() });
    return res.data.data;
}

export async function updateUserProfile(userId: string, data: any) {
    const res = await axios.put(`/api/users/${userId}`, data, { headers: getAuthHeaders() });
    return res.data.data;
}