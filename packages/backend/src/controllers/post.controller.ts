import { Request, Response } from 'express';
import { createPost, getPostsPaginated, getPostById, getPostsByUser, deletePost, getPostsPaginatedWithDistance, getCommentsForPost, addCommentToPost } from '../services/post.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as postService from '../services/post.service';
import { UserModel } from '../models/User';

export class PostController {
    static async create(req: Request, res: Response) {
        try {
            if (typeof req.body.restaurantLocation === 'string') {
                req.body.restaurantLocation = JSON.parse(req.body.restaurantLocation);
            }
            if (typeof req.body.dietaryTags === 'string') {
                req.body.dietaryTags = JSON.parse(req.body.dietaryTags);
            }
            req.body.postPictureUrl = req.file?.path;
            req.body.foodRating = Number(req.body.foodRating);
            req.body.menuItemPrice = Number(req.body.menuItemPrice);
            const post = await createPost(req.body);
            res.status(201).json({
                success: true,
                data: post,
            })
        } catch (error) {
            // Handle validation errors and other known errors
            if (error instanceof Error && error.message.startsWith('Invalid post data')) {
                console.error('Sending 400 error:', {
                    success: false,
                    error: 'Invalid post data',
                    details: (error as any).details || error.message,
                });
                res.status(400).json({
                    success: false,
                    error: 'Invalid post data',
                    details: error.message,
                });
                return;

            }
            // Unknown errors
            res.status(500).json({
                success: false,
                error: 'Error creating post'
            })
        }
    }

    static async list(req: AuthRequest, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const userId = req.user?.userId;
            const result = await getPostsPaginated(page, limit, userId);
            res.json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error fetching posts' });
        }
    }

    static async getOne(req: Request, res: Response) {
        try {
            const postId = req.params.id;
            const post = await getPostById(postId);
            if (!post) {
                return res.status(404).json({ success: false, error: 'Post not found' });
            }
            res.json({ success: true, data: post });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error fetching post details' });
        }
    }

    static async getPostsByUser(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await getPostsByUser(userId, page, limit);
            res.json({ success: true, ...result });
        } catch (error) {
            console.error('Error fetching user posts:', error);
            res.status(500).json({ success: false, error: error });
        }
    }

    static async delete(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            const postId = req.params.id;
            if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
            await deletePost(postId, userId);
            res.json({ success: true });
        } catch (error) {
            if (error instanceof Error && error.message === 'Unauthorized') {
                return res.status(403).json({ success: false, error: 'You are not allowed to delete this post.' });
            }
            if (error instanceof Error && error.message === 'Post not found') {
                return res.status(404).json({ success: false, error: 'Post not found.' });
            }
            res.status(500).json({ success: false, error: 'Error deleting post' });
        }
    }

    static async getPostsByUsername(req: Request, res: Response) {
        try {
            const { username } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            // Try to get current user ID from req.user (if authenticated)
            const userId = (req as any).user?.userId;
            const result = await postService.getPostsByUsername(username, page, limit, userId);
            res.json({ success: true, ...result });
        } catch (error: any) {
            if (error.message === 'User not found') {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            res.status(500).json({ success: false, error: 'Error fetching posts by username' });
        }
    }

    static async listWithDistance(req: AuthRequest, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const userId = req.user?.userId;

            // Get location from query params
            const latitude = parseFloat(req.query.latitude as string);
            const longitude = parseFloat(req.query.longitude as string);

            if (isNaN(latitude) || isNaN(longitude)) {
                return res.status(400).json({
                    success: false,
                    error: 'Latitude and longitude are required'
                });
            }

            const result = await getPostsPaginatedWithDistance(
                page,
                limit,
                { latitude, longitude },
                userId
            );

            res.json({ success: true, ...result });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error fetching posts' });
        }
    }

    static async getCommentsForPostController(req: AuthRequest, res: Response) {
        try {
            const { postId } = req.params;
            const comments = await getCommentsForPost(postId);
            res.json(comments);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch comments' });
        }
    }

    static async addCommentToPostController(req: AuthRequest, res: Response) {
        try {
            const { postId } = req.params;
            const userId = req.user?.userId;
            const { text } = req.body;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            if (!text || typeof text !== 'string' || !text.trim()) {
                return res.status(400).json({ error: 'Comment text is required' });
            }
            const comment = await addCommentToPost(postId, userId, text.trim());
            res.status(201).json(comment);
        } catch (err) {
            res.status(500).json({ error: 'Failed to add comment' });
        }
    }
}
