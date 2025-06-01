import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { UserSchema } from '../validators/user.validator';
import { AuthRequest } from '../middlewares/auth.middleware';

export class UserController {
    static async register(req: Request, res: Response) {
        try {
            // Validate request body
            const validatedData = UserSchema.parse(req.body);

            // Create user
            const user = await UserService.createUser(validatedData);

            res.status(201).json({
                success: true,
                data: user
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
            // Validate request body (allow partial updates, so use .partial())
            const validatedData = UserSchema.partial().parse(req.body);

            // If password is present, hash it
            if (validatedData.password) {
                const bcrypt = require('bcryptjs');
                const salt = await bcrypt.genSalt(10);
                validatedData.password = await bcrypt.hash(validatedData.password, salt);
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
            const { password, ...userResponse } = user.toObject();
            res.json({ success: true, data: userResponse });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Error fetching user' });
        }
    }
}