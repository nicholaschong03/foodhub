import mongoose, { Schema, Document } from 'mongoose';

export interface IFollow extends Document {
    follower: mongoose.Types.ObjectId;
    following: mongoose.Types.ObjectId;
    createdAt: Date;
}

const FollowSchema = new Schema<IFollow>({
    follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    following: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

export const FollowModel = mongoose.model<IFollow>('Follow', FollowSchema);