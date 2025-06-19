import bcrypt from 'bcryptjs';
import { UserModel } from '../models/User';
import { User } from '../validators/user.validator';
import { FollowModel } from '../models/Follow';
import mongoose from 'mongoose';

export class UserService {
    static async createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>) {
        // Check if user already exists
        const existingUser = await UserModel.findOne({
            $or: [
                { email: userData.email },
                { username: userData.username }
            ]
        });

        if (existingUser) {
            throw new Error('User with this email or username already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Create new user
        const user = await UserModel.create({
            ...userData,
            password: hashedPassword
        });

        // Remove password from response
        const { password, ...userResponse } = user.toObject();
        return userResponse;
    }

    static async isUsernameTaken(username: string) {
        const user = await UserModel.findOne({ username });
        return !!user;
    }

    static calculateCustomPlan(user: {
        gender: string;
        dob: Date;
        height: number;
        weight: number;
        goal: string;
        activityLevel: string;
        allergies: string[];
    }) {
        // Age
        const age = new Date().getFullYear() - new Date(user.dob).getFullYear();

        // BMR
        let bmr;
        if (user.gender === 'Male') {
            bmr = 10 * user.weight + 6.25 * user.height - 5 * age + 5;
        } else if (user.gender === 'Female') {
            bmr = 10 * user.weight + 6.25 * user.height - 5 * age - 161;
        } else {
            bmr = 10 * user.weight + 6.25 * user.height - 5 * age;
        }

        // TDEE
        const activityMultipliers: Record<string, number> = {
            'Sedentary': 1.2,
            'Lightly Active': 1.375,
            'Moderately Active': 1.55,
            'Very Active': 1.725,
            'Super Active': 1.9,
        };
        const tdee = bmr * (activityMultipliers[user.activityLevel] || 1.2);

        // Adjust calories for goal
        let calories;
        if (user.goal === 'Lose Weight') {
            calories = tdee * 0.85;
        } else if (user.goal === 'Gain Weight') {
            calories = tdee * 1.15;
        } else {
            calories = tdee;
        }
        calories = Math.round(calories);

        // Macros
        const protein = Math.round((calories * 0.3) / 4);
        const carbs = Math.round((calories * 0.45) / 4);
        const fats = Math.round((calories * 0.25) / 9);

        // BMI
        const bmi = (user.weight / ((user.height / 100) ** 2));

        // Health Score
        let healthScore = 10;
        if (bmi < 18.5 && bmi > 30) {
            healthScore -= 2;
        }
        if (user.allergies && user.allergies.length > 0) {
            healthScore -= 1;
        }
        if (user.activityLevel === 'Sedentary') {
            healthScore -= 1;
        }
        if (user.goal === 'Gain Weight' && bmi > 25) {
            healthScore -= 1;
        }
        if (healthScore < 1) {
            healthScore = 1;
        }
        return {
            bmi: bmi.toFixed(1),
            calories,
            protein,
            carbs,
            fats,
            healthScore,
        };
    }

    static async getUserById(id: string) {
        return UserModel.findById(id);
    }

    static async isEmailTaken(email: string) {
        const user = await UserModel.findOne({ email });
        return !!user;
    }

    static async updateUserById(id: string, update: Partial<User>) {
        // Do not allow updating email or username to an existing one
        if (update.email) {
            const exists = await UserModel.findOne({ email: update.email, _id: { $ne: id } });
            if (exists) throw new Error('Email already in use');
        }
        if (update.username) {
            const exists = await UserModel.findOne({ username: update.username, _id: { $ne: id } });
            if (exists) throw new Error('Username already in use');
        }
        // Update and return the user
        return UserModel.findByIdAndUpdate(id, update, { new: true });
    }

    static async getUserByUsername(username: string) {
        return UserModel.findOne({ username });
    }
}

// Follow a user
export async function followUser(followerId: string, followingId: string) {
    if (followerId === followingId) throw new Error('Cannot follow yourself');
    return FollowModel.create({ follower: followerId, following: followingId });
}

// Unfollow a user
export async function unfollowUser(followerId: string, followingId: string) {
    return FollowModel.deleteOne({ follower: followerId, following: followingId });
}

// Check if followerId is following followingId
export async function isFollowing(followerId: string, followingId: string) {
    return !!(await FollowModel.findOne({ follower: followerId, following: followingId }));
}

// Get followers of a user
export async function getFollowers(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const followers = await FollowModel.find({ following: userId })
        .populate('follower', 'username profilePicture name')
        .skip(skip)
        .limit(limit)
        .lean();
    const total = await FollowModel.countDocuments({ following: userId });
    return { followers, total, page, pageSize: limit, totalPages: Math.ceil(total / limit) };
}

// Get users that a user is following
export async function getFollowing(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const following = await FollowModel.find({ follower: userId })
        .populate('following', 'username profilePicture name')
        .skip(skip)
        .limit(limit)
        .lean();
    const total = await FollowModel.countDocuments({ follower: userId });
    return { following, total, page, pageSize: limit, totalPages: Math.ceil(total / limit) };
}
