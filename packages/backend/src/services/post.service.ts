import { PostModel } from '../models/Posts';
import { Post, PostSchema } from "../validators/post.validators";

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

export async function getPostsPaginated(page: number = 1, limit: number = 10) {
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
    return {
        posts,
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

export async function getPostsByUser(userId: string, page: number = 1, limit: number = 10) {
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
    return {
        posts,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit)
    };
}
