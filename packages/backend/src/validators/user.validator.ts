import { z } from 'zod';

export const UserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
    username: z.string().min(3),
    gender: z.enum(['Male', 'Female', 'Prefer not to say']),
    dob: z.preprocess((arg) => (typeof arg === 'string' ? new Date(arg) : arg), z.date()),
    height: z.number().min(100).max(250),
    weight: z.number().min(30).max(300),
    goal: z.enum(['Lose weight', 'Maintain', 'Gain Weight']),
    activityLevel: z.string(),
    restrictions: z.array(z.string()),
    cusines: z.array(z.string()),
    allergies: z.array(z.string()),
    adventurousness: z.number().min(1).max(5),
    profilePicture: z.string().nullable().optional(),
});

// Type inference from schema
export type User = z.infer<typeof UserSchema>;