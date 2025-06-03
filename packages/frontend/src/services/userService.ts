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
    let payload = data;
    let headers = getAuthHeaders();

    if (data.profilePicture && data.profilePicture instanceof File) {
        payload = new FormData();
        Object.keys(data).forEach(key => {
            payload.append(key, data[key]);
        });
        headers = getAuthHeaders();
    }

    const res = await axios.put(`/api/users/${userId}`, payload, { headers });
    return res.data.data;
}