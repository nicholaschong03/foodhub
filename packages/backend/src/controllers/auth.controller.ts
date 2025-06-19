import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/auth.middleware';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Authentication successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                username: user.username,
                profilePicture: user.profilePicture,
                gender: user.gender,
                dob: user.dob,
                height: user.height,
                weight: user.weight,
                goal: user.goal,
                activityLevel: user.activityLevel,
                restrictions: user.restrictions,
                cusines: user.cusines,
                allergies: user.allergies,
                adventurousness: user.adventurousness
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const verifyToken = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'No user data found' });
        }

        const user = await UserModel.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                username: user.username,
                profilePicture: user.profilePicture,
                gender: user.gender,
                dob: user.dob,
                height: user.height,
                weight: user.weight,
                goal: user.goal,
                activityLevel: user.activityLevel,
                restrictions: user.restrictions,
                cusines: user.cusines,
                allergies: user.allergies,
                adventurousness: user.adventurousness
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};