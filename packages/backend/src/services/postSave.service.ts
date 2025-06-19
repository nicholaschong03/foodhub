import mongoose from 'mongoose';
import { PostSaveModel } from '../models/PostSaves';
import { PostModel } from '../models/Posts';
import { UserModel } from '../models/User';

export async function savePost(userId: string, postId: string) {
    const post = await PostModel.findById(postId);
    if (!post) {
        throw new Error('Post not found');
    }
    await PostSaveModel.create({ userId, postId });
    await PostModel.findByIdAndUpdate(postId, { $inc: { savesCount: 1 } });
}

export async function unsavePost(userId: string, postId: string) {
    const result = await PostSaveModel.deleteOne({ userId, postId });
    if (result.deletedCount === 0) {
        throw new Error('Save not found');
    }
    await PostModel.findByIdAndUpdate(postId, { $inc: { savesCount: -1 } });
}

export async function hasUserSavedPost(userId: string, postId: string) {
    return await PostSaveModel.exists({ userId, postId });
}

export async function getSavedPostIds(userId: string) {
    return (await PostSaveModel.find({ userId }).distinct('postId')).map(id => id.toString());
}

export async function getSavedPostsByUser(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [saves, total] = await Promise.all([
        PostSaveModel.find({ userId: new mongoose.Types.ObjectId(userId) })
            .populate({
                path: 'postId',
                select: 'title postPictureUrl likesCount authorId',
                populate: {
                    path: 'authorId',
                    select: 'username profilePicture'
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        PostSaveModel.countDocuments({ userId: new mongoose.Types.ObjectId(userId) })
    ]);

    return {
        posts: saves.map(save => save.postId),
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalSaves: total
    };
}

export async function getSavedPostsByUsername(username: string, page: number = 1, limit: number = 10) {
    const user = await UserModel.findOne({ username });
    if (!user) throw new Error('User not found');
    return getSavedPostsByUser((user._id as mongoose.Types.ObjectId).toString(), page, limit);
}