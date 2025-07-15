import { PostModel } from '../models/Posts';
import { Post, PostSchema } from "../validators/post.validators";
import { PostLikeModel } from '../models/PostLikes';
import { PostSaveModel } from '../models/PostSaves';
import { FollowModel } from '../models/Follow';
import { UserModel } from '../models/User';
import mongoose from 'mongoose';
import { PipelineStage } from 'mongoose';
import { CommentModel } from '../models/Comment';
import { Request, Response } from 'express';


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
    const createdPost = await post.save();

    // Call sentiment analysis service (non-blocking)
    (async () => {
        try {
            const sentimentRes = await fetch(`${process.env.SENTIMENT_SERVICE_URL || 'https://nicholas03-food-rec.hf.space/update-sentiment'}/${createdPost._id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const sentimentData = await sentimentRes.json() as {
                success: boolean;
                post_id: string;
                sentiment: string;
                sentiment_score: number;
            };
            if (sentimentData.success) {
                await PostModel.findByIdAndUpdate(createdPost._id, {
                    sentiment: sentimentData.sentiment,
                    sentiment_score: sentimentData.sentiment_score
                });
            }
        } catch (err) {
            console.error('Failed to update sentiment:', err);
        }
    })();

    return createdPost;
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

export async function getCommentsForPost(postId: string) {
    return CommentModel.find({ postId })
        .sort({ createdAt: 1 })
        .populate('userId', 'username profilePicture')
        .lean();
}

export async function addCommentToPost(postId: string, userId: string, text: string) {
    const comment = await CommentModel.create({ postId, userId, text });
    // Increment commentsCount in Post
    await PostModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });
    // Populate userId with username and profilePicture
    const populatedComment = await comment.populate('userId', 'username profilePicture');
    return populatedComment;
}

export async function getTrendingPosts(page: number = 1, limit: number = 10, userId?: string) {
    const skip = (page - 1) * limit;

    const posts = await PostModel.find({}, {
        title: 1,
        postPictureUrl: 1,
        likesCount: 1,
        authorId: 1,
        createdAt: 1,
        restaurantName: 1,
        menuItemName: 1,
        foodCategory: 1,
        cusineType: 1,
        foodRating: 1
    })
        .sort({ likesCount: -1, createdAt: -1 }) // Sort by likes count descending, then by creation date
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'authorId',
            select: 'username profilePicture',
        })
        .lean();

    const total = await PostModel.countDocuments();

    // Get user's like/save status if userId is provided
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

export async function getFollowingPosts(page: number = 1, limit: number = 10, userId: string) {
    const skip = (page - 1) * limit;

    // Get the list of users that the current user is following
    const followingUsers = await FollowModel.find({ follower: userId })
        .distinct('following');

    if (followingUsers.length === 0) {
        return {
            posts: [],
            total: 0,
            page,
            pageSize: limit,
            totalPages: 0
        };
    }

    const posts = await PostModel.find({
        authorId: { $in: followingUsers }
    }, {
        title: 1,
        postPictureUrl: 1,
        likesCount: 1,
        authorId: 1,
        createdAt: 1,
        restaurantName: 1,
        menuItemName: 1,
        foodCategory: 1,
        cusineType: 1,
        foodRating: 1
    })
        .sort({ createdAt: -1 }) // Sort by creation date descending (newest first)
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'authorId',
            select: 'username profilePicture',
        })
        .lean();

    const total = await PostModel.countDocuments({ authorId: { $in: followingUsers } });

    // Get user's like/save status
    let likedPostIds: string[] = [];
    let savedPostIds: string[] = [];
    likedPostIds = (await PostLikeModel.find({ userId }).distinct('postId')).map(id => id.toString());
    savedPostIds = (await PostSaveModel.find({ userId }).distinct('postId')).map(id => id.toString());

    const postsWithLikedAndSaved = posts.map(post => ({
        ...post,
        liked: likedPostIds.includes(post._id.toString()),
        saved: savedPostIds.includes(post._id.toString())
    }));

    return {
        posts: postsWithLikedAndSaved,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
    };
}

export async function getPostsByFoodCategory(foodCategory: 'Savory' | 'Sweet', page: number = 1, limit: number = 10, userId?: string) {
    const skip = (page - 1) * limit;

    const posts = await PostModel.find({
        foodCategory: foodCategory
    }, {
        title: 1,
        postPictureUrl: 1,
        likesCount: 1,
        authorId: 1,
        createdAt: 1,
        restaurantName: 1,
        menuItemName: 1,
        foodCategory: 1,
        cusineType: 1,
        foodRating: 1
    })
        .sort({ createdAt: -1 }) // Sort by creation date descending (newest first)
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'authorId',
            select: 'username profilePicture',
        })
        .lean();

    const total = await PostModel.countDocuments({ foodCategory: foodCategory });

    // Get user's like/save status if userId is provided
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

export async function getTopRatedPosts(page: number = 1, limit: number = 10, userId?: string) {
    const skip = (page - 1) * limit;

    const posts = await PostModel.find({
        foodRating: { $gte: 4, $lte: 5 }
    }, {
        title: 1,
        postPictureUrl: 1,
        likesCount: 1,
        authorId: 1,
        createdAt: 1,
        restaurantName: 1,
        menuItemName: 1,
        foodCategory: 1,
        cusineType: 1,
        foodRating: 1
    })
        .sort({ foodRating: -1, createdAt: -1 }) // Sort by food rating descending, then by creation date
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'authorId',
            select: 'username profilePicture',
        })
        .lean();

    const total = await PostModel.countDocuments({ foodRating: { $gte: 4, $lte: 5 } });

    // Get user's like/save status if userId is provided
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

export async function getRecommendedPosts(userId: string, page: number = 1, limit: number = 10) {
    try {
        // Call the recommendation service
        const recommendationServiceUrl = process.env.RECOMMENDATION_SERVICE_URL || 'https://nicholas03-food-rec.hf.space/recommendations';
        const recommendationResponse = await fetch(recommendationServiceUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                num_recommendations: limit
            })
        });

        if (!recommendationResponse.ok) {
            throw new Error('Failed to fetch recommendations');
        }

        const recommendationData = await recommendationResponse.json() as {
            success: boolean;
            message: string;
            recommended_post_ids: string[];
            scores?: number[];
        };
        console.log('Recommendation service response:', recommendationData);
        if (!recommendationData.success || !recommendationData.recommended_post_ids) {
            throw new Error('Invalid recommendation response');
        }

        const recommendedPostIds = recommendationData.recommended_post_ids;
        const scores = recommendationData.scores || [];

        // Fetch posts by the recommended IDs
        const posts = await PostModel.find({
            _id: { $in: recommendedPostIds }
        }, {
            title: 1,
            postPictureUrl: 1,
            likesCount: 1,
            authorId: 1,
            createdAt: 1,
            restaurantName: 1,
            menuItemName: 1,
            foodCategory: 1,
            cusineType: 1,
            foodRating: 1
        })
            .populate({
                path: 'authorId',
                select: 'username profilePicture',
            })
            .lean();

        // Sort posts by the order they appear in recommendedPostIds
        const sortedPosts = recommendedPostIds.map((postId: string, index: number) => {
            const post = posts.find(p => p._id.toString() === postId);
            return post ? { ...post, recommendationScore: scores[index] || 0 } : null;
        }).filter(Boolean);

        // Get user's like/save status
        let likedPostIds: string[] = [];
        let savedPostIds: string[] = [];
        likedPostIds = (await PostLikeModel.find({ userId }).distinct('postId')).map(id => id.toString());
        savedPostIds = (await PostSaveModel.find({ userId }).distinct('postId')).map(id => id.toString());

        const postsWithLikedAndSaved = sortedPosts.map(post => ({
            ...post,
            liked: likedPostIds.includes(post!._id.toString()),
            saved: savedPostIds.includes(post!._id.toString())
        }));

        return {
            posts: postsWithLikedAndSaved,
            total: sortedPosts.length,
            page,
            pageSize: limit,
            totalPages: Math.ceil(sortedPosts.length / limit)
        };
    } catch (error) {
        console.error('Error fetching recommended posts:', error);
        // Fallback to regular posts if recommendation service fails
        return getPostsPaginated(page, limit, userId);
    }
}

export async function getPostsByCuisineType(
    cusineType: 'Japanese' | 'Korean' | 'Chinese' | 'Western',
    page: number = 1,
    limit: number = 10,
    userId?: string
) {
    const skip = (page - 1) * limit;

    const posts = await PostModel.find(
        { cusineType },
        {
            title: 1,
            postPictureUrl: 1,
            likesCount: 1,
            authorId: 1,
            createdAt: 1,
            restaurantName: 1,
            menuItemName: 1,
            foodCategory: 1,
            cusineType: 1,
            foodRating: 1,
        }
    )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'authorId',
            select: 'username profilePicture',
        })
        .lean();

    const total = await PostModel.countDocuments({ cusineType });

    let likedPostIds: string[] = [];
    let savedPostIds: string[] = [];
    if (userId) {
        likedPostIds = (await PostLikeModel.find({ userId }).distinct('postId')).map(id => id.toString());
        savedPostIds = (await PostSaveModel.find({ userId }).distinct('postId')).map(id => id.toString());
    }

    const postsWithLikedAndSaved = posts.map(post => ({
        ...post,
        liked: userId ? likedPostIds.includes(post._id.toString()) : false,
        saved: userId ? savedPostIds.includes(post._id.toString()) : false,
    }));

    return {
        posts: postsWithLikedAndSaved,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
    };
}

/**
 * PATCH /posts/:postId/ai-analysis
 * Update nutritionAnalysis and ingredientsAnalysis for a post
 */
export async function updatePostAIAnalysis(req: Request, res: Response) {
    const { postId } = req.params;
    const { nutritionAnalysis, ingredientsAnalysis } = req.body;
    try {
        const updated = await PostModel.findByIdAndUpdate(
            postId,
            {
                nutritionAnalysis,
                ingredientsAnalysis,
            },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Post not found' });
        res.json({ data: updated });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update AI analysis' });
    }
}
