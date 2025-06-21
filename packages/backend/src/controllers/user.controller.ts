import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { UserSchema } from '../validators/user.validator';
import { AuthRequest } from '../middlewares/auth.middleware';
import { PostModel } from '../models/Posts';
import { UserModel } from '../models/User';
import { followUser, unfollowUser, isFollowing, getFollowers, getFollowing } from '../services/user.service';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

export class UserController {
    static async register(req: Request, res: Response) {
        try {
            // Validate request body
            const validatedData = UserSchema.parse(req.body);

            // Create user
            const user = await UserService.createUser(validatedData);

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user._id,
                    email: user.email
                },
                JWT_SECRET as string,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                success: true,
                data: user,
                token
            });
        } catch (error) {
            console.error('User registration error:', error);
            if (error instanceof Error && error.message === 'User with this email or username already exists') {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Error creating user'
            });
        }
    }

    static async checkUsername(req: Request, res: Response) {
        const { username } = req.query;
        if (!username || typeof username !== 'string') {
            return res.status(400).json({ available: false, message: 'Username is required' });
        }
        const exists = await UserService.isUsernameTaken(username);
        res.json({ available: !exists });
    }

    static async checkEmail(req: Request, res: Response) {
        const { email } = req.query;
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ available: false, message: 'Email is required' });
        }
        const exists = await UserService.isEmailTaken(email);
        res.json({ available: !exists });
    }

    static async getCustomPlan(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const user = await UserService.getUserById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }
            const plan = UserService.calculateCustomPlan(user);
            res.json({ success: true, data: plan });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error calculating custom plan'
            });
        }
    }

    static async updateProfile(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

            // Convert string fields to correct types if using FormData
            if (typeof req.body.height === 'string') req.body.height = Number(req.body.height);
            if (typeof req.body.weight === 'string') req.body.weight = Number(req.body.weight);
            if (typeof req.body.adventurousness === 'string') req.body.adventurousness = Number(req.body.adventurousness);
            if (typeof req.body.age === 'string') req.body.age = Number(req.body.age);
            ['restrictions', 'cusines', 'allergies'].forEach(field => {
                if (typeof req.body[field] === 'string') {
                    try {
                        req.body[field] = JSON.parse(req.body[field]);
                    } catch {
                        req.body[field] = [];
                    }
                }
            });

            // Validate request body (allow partial updates, so use .partial())
            const validatedData = UserSchema.partial().parse(req.body);

            // If password is present, hash it
            if (validatedData.password) {
                const bcrypt = require('bcryptjs');
                const salt = await bcrypt.genSalt(10);
                validatedData.password = await bcrypt.hash(validatedData.password, salt);
            }

            // If a new profile image was uploaded, set the profilePicture field
            if (req.file && req.file.path) {
                validatedData.profilePicture = req.file.path;
            }

            // Update user
            const user = await UserService.updateUserById(userId, validatedData);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            // Remove password from response
            const { password, ...userResponse } = user.toObject();
            res.json({ success: true, data: userResponse });
        } catch (error) {
            res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Invalid data' });
        }
    }

    static async getUserById(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
            const user = await UserService.getUserById(userId);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            const postCount = await PostModel.countDocuments({ authorId: userId });
            const { password, ...userResponse } = user.toObject();
            res.json({ success: true, data: { ...userResponse, postCount } });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error fetching user' });
        }
    }

    static async getUserByUsername(req: Request, res: Response) {
        try {
            const { username } = req.params;
            const user = await UserService.getUserByUsername(username);
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            const postCount = await PostModel.countDocuments({ authorId: user._id });
            const { password, ...userResponse } = user.toObject();
            res.json({ success: true, data: { ...userResponse, postCount } });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error fetching user by username' });
        }
    }

    static async follow(req: AuthRequest, res: Response) {
        try {
            const followerId = req.user?.userId;
            const { userId } = req.params;
            if (!followerId) return res.status(401).json({ success: false, error: 'Unauthorized' });
            if (!userId) return res.status(400).json({ success: false, error: 'Missing userId' });
            await followUser(followerId, userId);
            res.json({ success: true });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    static async unfollow(req: AuthRequest, res: Response) {
        try {
            const followerId = req.user?.userId;
            const { userId } = req.params;
            if (!followerId) return res.status(401).json({ success: false, error: 'Unauthorized' });
            if (!userId) return res.status(400).json({ success: false, error: 'Missing userId' });
            await unfollowUser(followerId, userId);
            res.json({ success: true });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    static async isFollowing(req: AuthRequest, res: Response) {
        try {
            const followerId = req.user?.userId;
            const { userId } = req.params;
            if (!followerId) return res.status(401).json({ success: false, error: 'Unauthorized' });
            if (!userId) return res.status(400).json({ success: false, error: 'Missing userId' });
            const following = await isFollowing(followerId, userId);
            res.json({ success: true, following });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    static async getFollowers(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await getFollowers(userId, page, limit);
            res.json({ success: true, ...result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    static async getFollowing(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await getFollowing(userId, page, limit);
            res.json({ success: true, ...result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}