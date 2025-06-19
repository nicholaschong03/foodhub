import mongoose, { Schema, Document, Model } from 'mongoose';
import { CreatePostLike } from '../validators/postLike.validator';

export interface IPostLike extends Document {
    userId: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    createdAt: Date;
}

// Add interface for static methods
interface IPostLikeModel extends Model<IPostLike> {
    createLike(data: CreatePostLike): Promise<IPostLike>;
    getLikesByPost(postId: string, page?: number, limit?: number): Promise<{
        likes: IPostLike[];
        currentPage: number;
        totalPages: number;
        totalLikes: number;
    }>;
    hasLiked(userId: string, postId: string): Promise<boolean>;
}

const PostLikeSchema = new Schema<IPostLike>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Add index for faster queries
    },
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true // Add index for faster queries
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true // Add index for sorting by date
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Create a compound index to prevent duplicate likes
PostLikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

// Static method to create a like with validation
PostLikeSchema.statics.createLike = async function (data: CreatePostLike) {
    const like = new this(data);
    await like.save();
    return like;
};

// Static method to get likes with pagination
PostLikeSchema.statics.getLikesByPost = async function (postId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [likes, total] = await Promise.all([
        this.find({ postId })
            .populate('userId', 'username profilePictureUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        this.countDocuments({ postId })
    ]);

    return {
        likes,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalLikes: total
    };
};

// Static method to check if a user has liked a post
PostLikeSchema.statics.hasLiked = async function (userId: string, postId: string) {
    return await this.exists({ userId, postId });
};

export const PostLikeModel = mongoose.model<IPostLike, IPostLikeModel>('PostLike', PostLikeSchema);