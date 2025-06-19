import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPostSave extends Document {
    userId: mongoose.Types.ObjectId;
    postId: mongoose.Types.ObjectId;
    createdAt: Date;
}

interface IPostSaveModel extends Model<IPostSave> { }

const PostSaveSchema = new Schema<IPostSave>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    createdAt: { type: Date, default: Date.now, index: true }
});

PostSaveSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const PostSaveModel = mongoose.model<IPostSave, IPostSaveModel>('PostSave', PostSaveSchema);