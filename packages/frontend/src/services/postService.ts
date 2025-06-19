import axios from 'axios';

export interface Author {
    username: string;
    avatar: string;
}

export interface Post {
    id: string;
    title: string;
    imageUrl: string;
    postPictureUrl: string;
    author: Author;
    likes: number;
    liked: boolean;
    saved: boolean;
    menuItemName: string;
}

export interface GetPostsResponse {
    posts: Post[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface PostWithDistance extends Post {
    distance?: number;
    restaurant?: {
        name: string;
        location?: {
            latitude: number;
            longitude: number;
        };
    };
}

export interface GetPostsWithDistanceResponse extends GetPostsResponse {
    posts: PostWithDistance[];
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getPosts(page = 1, limit = 10): Promise<GetPostsResponse> {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/posts/recommended', {
        params: { page, limit },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    // Map backend response to frontend Post type
    const posts: Post[] = res.data.posts.map((post: any) => ({
        id: post._id,
        title: post.title,
        imageUrl: post.postPictureUrl,
        postPictureUrl: post.postPictureUrl,
        author: {
            username: post.authorId?.username || 'Unknown',
            avatar: post.authorId?.profilePicture || '',
        },
        likes: post.likesCount || 0,
        liked: !!post.liked,
        saved: !!post.saved,
        menuItemName: post.menuItemName,
    }));
    return {
        posts,
        total: res.data.total,
        page: res.data.page,
        pageSize: res.data.pageSize,
        totalPages: res.data.totalPages,
    };
}

export async function getPostDetails(postId: string) {
    const token = localStorage.getItem('token');
    const res = await axios.get(`/api/posts/${postId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data.data;
}

export async function getMyPosts(page = 1, limit = 10) {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/posts/my-posts', {
        params: { page, limit },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
}

export async function likePost(postId: string) {
    const token = localStorage.getItem('token');
    const res = await axios.post(`/api/posts/${postId}/like`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
}

export async function unlikePost(postId: string) {
    const token = localStorage.getItem('token');
    const res = await axios.delete(`/api/posts/${postId}/like`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
}

export async function hasLikedPost(postId: string) {
    const token = localStorage.getItem('token');
    const res = await axios.get(`/api/posts/${postId}/like`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data.hasLiked;
}

export async function savePost(postId: string) {
    const token = localStorage.getItem('token');
    const res = await axios.post(`/api/posts/${postId}/save`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
}

export async function unsavePost(postId: string) {
    const token = localStorage.getItem('token');
    const res = await axios.delete(`/api/posts/${postId}/save`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
}

export async function hasSavedPost(postId: string) {
    const token = localStorage.getItem('token');
    const res = await axios.get(`/api/posts/${postId}/save`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data.hasSaved;
}

export async function getLikedPosts(page = 1, limit = 10): Promise<GetPostsResponse> {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/posts/liked', {
        params: { page, limit },
        headers: { Authorization: `Bearer ${token}` },
    });
    // Map backend response to frontend Post type
    const posts: Post[] = res.data.posts.map((post: any) => ({
        id: post._id,
        title: post.title,
        imageUrl: post.postPictureUrl,
        menuItemName: post.menuItemName,
        author: {
            name: post.authorId?.username || 'Unknown',
            avatar: post.authorId?.profilePicture || '',
        },
        likes: post.likesCount || 0,
        liked: true, // These are liked posts
        saved: !!post.saved,
    }));
    return {
        posts,
        total: res.data.totalLikes,
        page: res.data.currentPage,
        pageSize: limit,
        totalPages: res.data.totalPages,
    };
}

export async function getSavedPosts(page = 1, limit = 10): Promise<GetPostsResponse> {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/posts/saved', {
        params: { page, limit },
        headers: { Authorization: `Bearer ${token}` },
    });
    // Map backend response to frontend Post type
    const posts: Post[] = res.data.posts.map((post: any) => ({
        id: post._id,
        title: post.title,
        imageUrl: post.postPictureUrl,
        menuItemName: post.menuItemName,
        author: {
            name: post.authorId?.username || 'Unknown',
            avatar: post.authorId?.profilePicture || '',
        },
        likes: post.likesCount || 0,
        liked: !!post.liked,
        saved: true, // These are saved posts
    }));
    return {
        posts,
        total: res.data.totalSaves,
        page: res.data.currentPage,
        pageSize: limit,
        totalPages: res.data.totalPages,
    };
}

export async function getPostsByUsername(username: string, page = 1, limit = 10) {
    const res = await axios.get(`/api/posts/user/${username}`, { params: { page, limit }, headers: getAuthHeaders() });
    return res.data;
}

export async function getLikedPostsByUsername(username: string, page = 1, limit = 10) {
    const res = await axios.get(`/api/posts/liked/${username}`, { params: { page, limit }, headers: getAuthHeaders() });
    return res.data;
}

export async function getSavedPostsByUsername(username: string, page = 1, limit = 10) {
    const res = await axios.get(`/api/posts/saved/${username}`, { params: { page, limit }, headers: getAuthHeaders() });
    return res.data;
}

export async function getPostsWithDistance(
    page = 1,
    limit = 10,
    location: { latitude: number; longitude: number }
): Promise<GetPostsWithDistanceResponse> {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/posts/nearby', {
        params: {
            page,
            limit,
            latitude: location.latitude,
            longitude: location.longitude
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    // Map backend response to frontend Post type with distance
    const posts: PostWithDistance[] = res.data.posts.map((post: any) => ({
        id: post._id,
        title: post.title,
        imageUrl: post.postPictureUrl,
        postPictureUrl: post.postPictureUrl,
        author: {
            username: post.author?.username || 'Unknown',
            avatar: post.author?.profilePicture || '',
        },
        likes: post.likesCount || 0,
        liked: !!post.liked,
        saved: !!post.saved,
        distance: post.distance,
        restaurant: {
            name: post.restaurantName,
            location: post.restaurantLocation && post.restaurantLocation.coordinates ? {
                latitude: post.restaurantLocation.coordinates[1],
                longitude: post.restaurantLocation.coordinates[0]
            } : undefined
        },
        menuItemName: post.menuItemName,
    }));

    return {
        posts,
        total: res.data.total,
        page: res.data.page,
        pageSize: res.data.pageSize,
        totalPages: res.data.totalPages,
    };
}