import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as postLikeService from '../services/postLike.service';
import { GetPostLikesQuerySchema } from '../validators/postLike.validator';
import { UserModel } from '../models/User';

export const likePost = async (req: AuthRequest, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const like = await postLikeService.createPostLike(userId, postId);
        res.status(201).json({ message: 'Post liked successfully', like });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already liked this post' });
        }
        if (error.message === 'Post not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error liking post", error: error.message });
    }
};

export const unlikePost = async (req: AuthRequest, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await postLikeService.removePostLike(userId, postId);
        res.status(200).json({ message: "Post unliked successfully" });
    } catch (error: any) {
        if (error.message === 'Like not found') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Error unliking post", error: error.message });
    }
};

export const getPostLikes = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const validatedQuery = GetPostLikesQuerySchema.parse(req.query);

        const likes = await postLikeService.getPostLikes(
            postId,
            validatedQuery.page,
            validatedQuery.limit
        );

        res.status(200).json(likes);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: 'Invalid query parameters', errors: error.errors });
        }
        res.status(500).json({ message: "Error fetching post likes", error: error.message });
    }
};

export const getLikedPosts = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const validatedQuery = GetPostLikesQuerySchema.parse(req.query);
        const likedPosts = await postLikeService.getLikedPostsByUser(
            userId,
            validatedQuery.page,
            validatedQuery.limit
        );

        res.status(200).json(likedPosts);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ message: 'Invalid query parameters', errors: error.errors });
        }
        res.status(500).json({ message: "Error fetching liked posts", error: error.message });
    }
};

export const checkLikeStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const hasLiked = await postLikeService.hasUserLikedPost(userId, postId);
        res.status(200).json({ hasLiked });
    } catch (error: any) {
        res.status(500).json({ message: "Error checking like status", error: error.message });
    }
};

export const getLikedPostsByUsername = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const likedPosts = await postLikeService.getLikedPostsByUsername(username, page, limit);
        res.status(200).json(likedPosts);
    } catch (error: any) {
        if (error.message === 'User not found') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).json({ message: 'Error fetching liked posts', error: error.message });
    }
};