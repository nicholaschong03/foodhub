import axiosInstance from './axios.config';

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

export async function getPosts(page = 1, limit = 10): Promise<GetPostsResponse> {
    const res = await axiosInstance.get('/posts/recommended', {
        params: { page, limit },
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
    const res = await axiosInstance.get(`/posts/${postId}`);
    return res.data.data;
}

export async function getMyPosts(page = 1, limit = 10) {
    const res = await axiosInstance.get('/posts/my-posts', {
        params: { page, limit },
    });
    return res.data;
}

export async function likePost(postId: string) {
    const res = await axiosInstance.post(`/posts/${postId}/like`);
    return res.data;
}

export async function unlikePost(postId: string) {
    const res = await axiosInstance.delete(`/posts/${postId}/like`);
    return res.data;
}

export async function hasLikedPost(postId: string) {
    const res = await axiosInstance.get(`/posts/${postId}/like`);
    return res.data.hasLiked;
}

export async function savePost(postId: string) {
    const res = await axiosInstance.post(`/posts/${postId}/save`);
    return res.data;
}

export async function unsavePost(postId: string) {
    const res = await axiosInstance.delete(`/posts/${postId}/save`);
    return res.data;
}

export async function hasSavedPost(postId: string) {
    const res = await axiosInstance.get(`/posts/${postId}/save`);
    return res.data.hasSaved;
}

export async function getLikedPosts(page = 1, limit = 10) {
    const res = await axiosInstance.get('/posts/liked', {
        params: { page, limit },
    });
    return res.data;
}

export async function getSavedPosts(page = 1, limit = 10) {
    const res = await axiosInstance.get('/posts/saved', {
        params: { page, limit },
    });
    return res.data;
}

export async function getPostsByUsername(username: string, page = 1, limit = 10) {
    const res = await axiosInstance.get(`/posts/user/${username}`, { params: { page, limit } });
    return res.data;
}

export async function getLikedPostsByUsername(username: string, page = 1, limit = 10) {
    const res = await axiosInstance.get(`/posts/liked/${username}`, { params: { page, limit } });
    return res.data;
}

export async function getSavedPostsByUsername(username: string, page = 1, limit = 10) {
    const res = await axiosInstance.get(`/posts/saved/${username}`, { params: { page, limit } });
    return res.data;
}

export async function getPostsWithDistance(
    page = 1,
    limit = 10,
    location: { latitude: number; longitude: number }
): Promise<GetPostsWithDistanceResponse> {
    const res = await axiosInstance.get('/posts/nearby', {
        params: {
            page,
            limit,
            latitude: location.latitude,
            longitude: location.longitude
        },
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

export async function getComments(postId: string) {
    const res = await axiosInstance.get(`/posts/${postId}/comments`);
    return res.data.map((comment: any) => ({
        id: comment._id,
        userId: {
            username: comment.userId.username,
            profilePicture: comment.userId.profilePicture,
        },
        text: comment.text,
        createdAt: comment.createdAt,
    }));
}

export async function addComment(postId: string, text: string) {
    const res = await axiosInstance.post(`/posts/${postId}/comments`, { text });
    return res.data;
}