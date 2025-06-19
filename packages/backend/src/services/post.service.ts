import { PostModel } from '../models/Posts';
import { Post, PostSchema } from "../validators/post.validators";
import { PostLikeModel } from '../models/PostLikes';
import { PostSaveModel } from '../models/PostSaves';
import { UserModel } from '../models/User';
import mongoose from 'mongoose';
import { PipelineStage } from 'mongoose';

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export async function createPost(postData: Post) {
    // Validate with Zod
    const parsed = PostSchema.safeParse(postData);
    if (!parsed.success) {
        throw new Error('Invalid post data' + JSON.stringify(parsed.error.format()));
    }
    // Mongoose will validate and save the post
    const post = new PostModel(postData);
    return await post.save();
}

export async function getPostsPaginated(page: number = 1, limit: number = 10, userId?: string) {
    const skip = (page - 1) * limit;
    const posts = await PostModel.find({}, {
        title: 1,
        postPictureUrl: 1,
        likesCount: 1,
        authorId: 1,
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'authorId',
            select: 'username profilePicture',
        })
        .lean();
    const total = await PostModel.countDocuments();

    let likedPostIds: string[] = [];
    let savedPostIds: string[] = [];
    if (userId) {
        likedPostIds = (await PostLikeModel.find({ userId }).distinct('postId')).map(id => id.toString());
        savedPostIds = (await PostSaveModel.find({ userId }).distinct('postId')).map(id => id.toString());
    }

    const postsWithLikedAndSaved = posts.map(post => ({
        ...post,
        liked: userId ? likedPostIds.includes(post._id.toString()) : false,
        saved: userId ? savedPostIds.includes(post._id.toString()) : false
    }));

    return {
        posts: postsWithLikedAndSaved,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
    };
}

export async function getPostById(postId: string) {
    const post = await PostModel.findById(postId)
        .populate({
            path: 'authorId',
            select: 'username profilePicture',
        })
        .lean();
    if (!post) return null;
    return post;
}

export async function getPostsByUser(userId: string, page: number = 1, limit: number = 10, currentUserId?: string) {
    const skip = (page - 1) * limit;
    const posts = await PostModel.find({ authorId: userId }, {
        title: 1,
        postPictureUrl: 1,
        likesCount: 1,
        authorId: 1,
        createdAt: 1,
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'authorId',
            select: 'username profilePicture',
        })
        .lean();
    const total = await PostModel.countDocuments({ authorId: userId });

    // Get the current user's id for like/save status
    let likedPostIds: string[] = [];
    let savedPostIds: string[] = [];
    if (currentUserId) {
        likedPostIds = (await PostLikeModel.find({ userId: currentUserId }).distinct('postId')).map(id => id.toString());
        savedPostIds = (await PostSaveModel.find({ userId: currentUserId }).distinct('postId')).map(id => id.toString());
    }

    const postsWithLikedAndSaved = posts.map(post => ({
        ...post,
        liked: currentUserId ? likedPostIds.includes(post._id.toString()) : false,
        saved: currentUserId ? savedPostIds.includes(post._id.toString()) : false
    }));

    return {
        posts: postsWithLikedAndSaved,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
    };
}

export async function getPostsByUsername(username: string, page: number = 1, limit: number = 10, currentUserId?: string) {
    const user = await UserModel.findOne({ username });
    if (!user) throw new Error('User not found');
    return getPostsByUser((user._id as mongoose.Types.ObjectId).toString(), page, limit, currentUserId);
}

export async function deletePost(postId: string, userId: string) {
    const post = await PostModel.findById(postId);
    if (!post) throw new Error('Post not found');
    if (post.authorId.toString() !== userId) throw new Error('Unauthorized');
    await PostModel.deleteOne({ _id: postId });
    return true;
}

export async function getPostsPaginatedWithDistance(
    page: number = 1,
    limit: number = 10,
    userLocation: { latitude: number; longitude: number },
    userId?: string
) {
    const skip = (page - 1) * limit;

    const [lat, lon] = [userLocation.latitude, userLocation.longitude];

    const pipeline: PipelineStage[] = [
        {
            $geoNear: {
                near: { type: 'Point', coordinates: [lon, lat] },
                distanceField: 'distance',
                spherical: true,
                query: { restaurantLocation: { $exists: true } },
            }
        },
        { $sort: { distance: 1 } },
        { $skip: skip },
        { $limit: limit },
        {
            $lookup: {
                from: 'users',
                localField: 'authorId',
                foreignField: '_id',
                as: 'author'
            }
        },
        { $unwind: '$author' },
        {
            $project: {
                title: 1,
                postPictureUrl: 1,
                likesCount: 1,
                author: {
                    username: '$author.username',
                    profilePicture: '$author.profilePicture',
                },
                restaurantLocation: 1,
                restaurantName: 1,
                createdAt: 1,
                menuItemName: 1,
                distance: {
                    $round: [
                        { $divide: ['$distance', 1000] },
                        2
                    ]
                }
            }
        }
    ]

    const posts = await PostModel.aggregate(pipeline);
    const total = await PostModel.countDocuments({ 'restaurantLocation': { $exists: true } });

    // then fetch liked/saved IDs

    return { posts, total, page, pageSize: limit, totalPages: Math.ceil(total / limit) };

}
