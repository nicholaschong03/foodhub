import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
                profilePicture: user.profilePicture,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};