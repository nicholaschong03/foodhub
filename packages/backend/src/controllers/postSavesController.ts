import { AuthRequest } from '../middlewares/auth.middleware';
import * as postSaveService from '../services/postSave.service';
import { Response } from 'express';
import { UserModel } from '../models/User';

export const savePost = async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    await postSaveService.savePost(userId, postId);
    res.status(201).json({ message: 'Post saved' });
};

export const unsavePost = async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    await postSaveService.unsavePost(userId, postId);
    res.status(200).json({ message: 'Post unsaved' });
};

export const checkSaveStatus = async (req: AuthRequest, res: Response) => {
    const { postId } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    const hasSaved = await postSaveService.hasUserSavedPost(userId, postId);
    res.status(200).json({ hasSaved: !!hasSaved });
};

export const getSavedPosts = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const savedPosts = await postSaveService.getSavedPostsByUser(userId, page, limit);
        res.status(200).json(savedPosts);
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching saved posts", error: error.message });
    }
};

export const getSavedPostsByUsername = async (req: AuthRequest, res: Response) => {
    try {
        const { username } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const savedPosts = await postSaveService.getSavedPostsByUsername(username, page, limit);
        res.status(200).json(savedPosts);
    } catch (error: any) {
        if (error.message === 'User not found') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).json({ message: 'Error fetching saved posts', error: error.message });
    }
};