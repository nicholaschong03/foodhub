import { Request, Response } from 'express';
import { createPost, getPostsPaginated, getPostById, getPostsByUser } from '../services/post.service';
import { AuthRequest } from '../middlewares/auth.middleware';

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

    static async list(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await getPostsPaginated(page, limit);
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
}
