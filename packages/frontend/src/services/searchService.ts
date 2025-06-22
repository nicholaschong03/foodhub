import axiosInstance from './axios.config';

export interface SearchUser {
    id: string;
    username: string;
    name: string;
    profilePicture: string | null;
}

export interface SearchPost {
    id: string;
    title: string;
    menuItemName: string;
    imageUrl: string;
}

export interface SearchPagination {
    users: {
        hasMore: boolean;
        total: number;
    };
    posts: {
        hasMore: boolean;
        total: number;
    };
}

export interface SearchResults {
    users: SearchUser[];
    posts: SearchPost[];
    pagination: SearchPagination;
}

export const search = async (query: string, page: number = 1, limit: number = 5): Promise<SearchResults> => {
    const response = await axiosInstance.get(`/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
};