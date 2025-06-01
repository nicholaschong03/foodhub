import axios from 'axios';

export interface Author {
    name: string;
    avatar: string;
}

export interface Post {
    id: string;
    title: string;
    imageUrl: string;
    author: Author;
    likes: number;
}

export interface GetPostsResponse {
    posts: Post[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
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
        author: {
            name: post.authorId?.username || 'Unknown',
            avatar: post.authorId?.profilePicture || '',
        },
        likes: post.likesCount || 0,
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