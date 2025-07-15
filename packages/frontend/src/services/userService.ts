import axiosInstance from './axios.config';

export async function getUserProfile(userId: string) {
    const res = await axiosInstance.get(`/users/${userId}`);
    return res.data.data;
}

export async function updateUserProfile(userId: string, data: any) {
    let payload = data;

    // If sending a File, use FormData
    if (data.profilePicture && data.profilePicture instanceof File) {
        payload = new FormData();
        for (let key in data) {
            if (key === 'profilePicture') {
                payload.append(key, data[key], data[key].name); // Always include filename!
            } else if (Array.isArray(data[key])) {
                payload.append(key, JSON.stringify(data[key]));
            } else if (typeof data[key] === 'number' || typeof data[key] === 'string') {
                payload.append(key, data[key].toString());
            } else if (data[key] !== undefined && data[key] !== null) {
                payload.append(key, JSON.stringify(data[key]));
            }
        }
    }


    // Never set Content-Type manually for FormData!
    const res = await axiosInstance.put(`/users/${userId}`, payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data.data;
}


export async function getUserProfileByUsername(username: string) {
    const res = await axiosInstance.get(`/users/username/${username}`);
    return res.data.data;
}

export async function followUser(userId: string) {
    await axiosInstance.post(`/users/${userId}/follow`);
}

export async function unfollowUser(userId: string) {
    await axiosInstance.delete(`/users/${userId}/follow`);
}

export async function isFollowing(userId: string): Promise<boolean> {
    const res = await axiosInstance.get(`/users/${userId}/is-following`);
    return res.data.following;
}

export async function getFollowers(userId: string, page = 1, limit = 10) {
    const res = await axiosInstance.get(`/users/${userId}/followers`, { params: { page, limit } });
    return res.data;
}

export async function getFollowing(userId: string, page = 1, limit = 10) {
    const res = await axiosInstance.get(`/users/${userId}/following`, { params: { page, limit } });
    return res.data;
}