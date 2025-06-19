import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { PostModel } from '../models/Posts';

export const search = async (req: Request, res: Response) => {
    try {
        const { query, page = '1', limit = '5' } = req.query;
        const pageNumber = parseInt(page as string);
        const limitNumber = parseInt(limit as string);
        const skip = (pageNumber - 1) * limitNumber;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Search for users
        const [users, totalUsers] = await Promise.all([
            UserModel.find({
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { name: { $regex: query, $options: 'i' } }
                ]
            })
                .select('_id username name profilePicture')
                .skip(skip)
                .limit(limitNumber),
            UserModel.countDocuments({
                $or: [
                    { username: { $regex: query, $options: 'i' } },
                    { name: { $regex: query, $options: 'i' } }
                ]
            })
        ]);

        // Search for posts
        const [posts, totalPosts] = await Promise.all([
            PostModel.find({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { menuItemName: { $regex: query, $options: 'i' } }
                ]
            })
                .select('_id title menuItemName postPictureUrl')
                .skip(skip)
                .limit(limitNumber),
            PostModel.countDocuments({
                $or: [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { menuItemName: { $regex: query, $options: 'i' } }
                ]
            })
        ]);

        const hasMoreUsers = totalUsers > pageNumber * limitNumber;
        const hasMorePosts = totalPosts > pageNumber * limitNumber;

        res.json({
            users: users.map(user => ({
                id: user._id,
                username: user.username,
                name: user.name,
                profilePicture: user.profilePicture
            })),
            posts: posts.map(post => ({
                id: post._id,
                title: post.title,
                menuItemName: post.menuItemName,
                imageUrl: post.postPictureUrl
            })),
            pagination: {
                users: {
                    hasMore: hasMoreUsers,
                    total: totalUsers
                },
                posts: {
                    hasMore: hasMorePosts,
                    total: totalPosts
                }
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Error performing search' });
    }
};