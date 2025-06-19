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

export async function getUserProfileByUsername(username: string) {
    const res = await axios.get(`/api/users/username/${username}`);
    return res.data.data;
}

export async function followUser(userId: string) {
    const token = localStorage.getItem('token');
    await axios.post(`/api/users/${userId}/follow`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
}

export async function unfollowUser(userId: string) {
    const token = localStorage.getItem('token');
    await axios.delete(`/api/users/${userId}/follow`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
}

export async function isFollowing(userId: string): Promise<boolean> {
    const token = localStorage.getItem('token');
    const res = await axios.get(`/api/users/${userId}/is-following`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data.following;
}

export async function getFollowers(userId: string, page = 1, limit = 10) {
    const res = await axios.get(`/api/users/${userId}/followers`, { params: { page, limit } });
    return res.data;
}

export async function getFollowing(userId: string, page = 1, limit = 10) {
    const res = await axios.get(`/api/users/${userId}/following`, { params: { page, limit } });
    return res.data;
}