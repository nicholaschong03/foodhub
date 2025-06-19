import axios from 'axios';

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
    const token = localStorage.getItem('token');
    const response = await axios.get(`/api/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response.data;
};