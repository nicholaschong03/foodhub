import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../validators/user.validator';

// Mongoose schema
const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Prefer not to say'] },
    dob: { type: Date, required: true },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    goal: { type: String, required: true, enum: ['Lose weight', 'Maintain', 'Gain Weight'] },
    activityLevel: { type: String, required: true },
    restrictions: [{ type: String }],
    cusines: [{ type: String }],
    allergies: [{ type: String }],
    adventurousness: { type: Number, required: true, min: 1, max: 5 },
    profilePicture: { type: String, default: null },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for BMI calculation
userSchema.virtual('bmi').get(function () {
    // Convert height from cm to m and calculate BMI
    const heightInMeters = this.height / 100;
    return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
});

// Create and export the model
export const UserModel = mongoose.model<User & Document>('User', userSchema);