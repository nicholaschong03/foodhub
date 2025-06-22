import axiosInstance from './axios.config';

export async function getUserProfile(userId: string) {
    const res = await axiosInstance.get(`/users/${userId}`);
    return res.data.data;
}

export async function updateUserProfile(userId: string, data: any) {
    let payload = data;

    if (data.profilePicture && data.profilePicture instanceof File) {
        payload = new FormData();
        Object.keys(data).forEach(key => {
            payload.append(key, data[key]);
        });
    }

    const res = await axiosInstance.put(`/users/${userId}`, payload);
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