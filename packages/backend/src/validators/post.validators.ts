import { z } from 'zod';

// Enums
const foodCategory = z.enum(['Savory', 'Sweet']);
const cusineType = z.enum(['Chinese', 'Western', 'Japanese', 'Malay', 'Indian', 'Korean', 'Thai']);
const dietaryTags = z.enum(['Vegetarian', 'Vegan', 'Halal', 'Pescatarian', 'Pork-free', 'Beef-free', 'Dairy-free', 'Gluten-free']);

// Aspect rating object schema (optional)
const aspectRatingSchema = z.object({
    taste: z.number().min(1).max(5),
    price: z.number().min(1).max(5),
    service: z.number().min(1).max(5),
    ambience: z.number().min(1).max(5),
}).partial();

// Text sentiment schema (optional)
const SentimentSchema = z.object({
    label: z.enum(['positive', 'negative', 'neutral']),
    score: z.number().min(0).max(1)
}).optional();

// Nutrition schema (optional)
const NutritionEstimateSchema = z.object({
    calories: z.number().min(0),
    protein: z.number().min(0),
    carbs: z.number().min(0),
    fat: z.number().min(0),
}).partial();

// Nutrition analysis schema (optional)
const NutritionAnalysisSchema = z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    fat: z.number().optional(),
    saturated_fat: z.number().optional(),
    carbs: z.number().optional(),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
    cholesterol: z.number().optional(),
    vitamin_a: z.number().optional(),
    vitamin_c: z.number().optional(),
    vitamin_d: z.number().optional(),
    calcium: z.number().optional(),
    iron: z.number().optional(),
    potassium: z.number().optional(),
    sodium: z.number().optional(),
}).partial();

// Location GeoPoint schema
const GeoPointSchema = z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()])
});

// Post schema
export const PostSchema = z.object({
    title: z.string().min(1).max(120),
    description: z.string().min(1).max(1000),
    postPictureUrl: z.string(),

    foodCategory: foodCategory,
    cusineType: cusineType,
    dietaryTags: z.array(dietaryTags),

    foodRating: z.number().min(1).max(5),
    aspectRating: aspectRatingSchema.optional(),

    restaurantName: z.string().min(1).max(120),
    restaurantLocation: GeoPointSchema,

    menuItemName: z.string().min(1).max(120),
    menuItemPrice: z.number().min(0),

    imageFeatures: z.array(z.string()).optional(),
    imageEmbedding: z.array(z.number()).optional(),

    textSentimentScore: SentimentSchema.optional(),
    nutritionalEstimate: NutritionEstimateSchema.optional(),
    nutritionAnalysis: NutritionAnalysisSchema.optional(),
    ingredientsAnalysis: z.array(z.string()).optional(),

    likesCount: z.number().int().nonnegative().optional().default(0),
    commentsCount: z.number().int().nonnegative().optional().default(0),
    savesCount: z.number().int().nonnegative().optional().default(0),

    authorId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId"),

})

export type Post = z.infer<typeof PostSchema>;