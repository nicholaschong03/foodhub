import { PostLikeModel } from '../models/PostLikes';
import { PostModel } from '../models/Posts';
import { CreatePostLike } from '../validators/postLike.validator';
import mongoose from 'mongoose';
import { UserModel } from '../models/User';

export async function createPostLike(userId: string, postId: string) {
    // Check if post exists
    const post = await PostModel.findById(postId);
    if (!post) {
        throw new Error('Post not found');
    }

    // Create like record
    const like = await PostLikeModel.createLike({
        userId,
        postId
    });

    // Increment likes count in post
    await PostModel.findByIdAndUpdate(postId, {
        $inc: { likesCount: 1 }
    });

    return like;
}

export async function removePostLike(userId: string, postId: string) {
    // Delete like record
    const result = await PostLikeModel.deleteOne({
        userId: new mongoose.Types.ObjectId(userId),
        postId: new mongoose.Types.ObjectId(postId)
    });

    if (result.deletedCount === 0) {
        throw new Error('Like not found');
    }

    // Decrement likes count in post
    await PostModel.findByIdAndUpdate(postId, {
        $inc: { likesCount: -1 }
    });

    return true;
}

export async function getPostLikes(postId: string, page: number = 1, limit: number = 10) {
    return await PostLikeModel.getLikesByPost(postId, page, limit);
}

export async function hasUserLikedPost(userId: string, postId: string) {
    return await PostLikeModel.hasLiked(userId, postId);
}

export async function getLikedPostsByUser(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [likes, total] = await Promise.all([
        PostLikeModel.find({ userId: new mongoose.Types.ObjectId(userId) }).populate({
            path: 'postId',
            select: 'title postPictureUrl likesCount authorId',
            populate: {
                path: 'authorId',
                select: 'username profilePicture'
            }
        }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        PostLikeModel.countDocuments({ userId: new mongoose.Types.ObjectId(userId) })
    ]);

    return {
        posts: likes.map(like => like.postId),
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalLikes: total
    };
}

export async function getLikedPostsByUsername(username: string, page: number = 1, limit: number = 10) {
    const user = await UserModel.findOne({ username });
    if (!user) throw new Error('User not found');
    return getLikedPostsByUser((user._id as mongoose.Types.ObjectId).toString(), page, limit);}