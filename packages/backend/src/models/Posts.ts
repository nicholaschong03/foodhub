import mongoose, {Schema, Document} from 'mongoose';
import { Post } from '../validators/post.validators';

const AspectRatingSchema = new Schema({
    taste: {type: Number, min: 1, max: 5},
    price: {type: Number, min: 1, max: 5},
    service: {type: Number, min: 1, max: 5},
    ambience: {type: Number, min: 1, max: 5},
}, {_id: false});

const SentimentSchema = new Schema({
    label: {type: String, enum: ['positive', 'negative', 'neutral']},
    score: {type: Number, min: 0, max: 1},

}, {_id: false});

const NutritionEstimateSchema = new Schema({
    calories: {type: Number, min: 0},
    protein: {type: Number, min: 0},
    carbs: {type: Number, min: 0},
    fat: {type: Number, min: 0},
}, {_id: false});

const GeoPointSchema = new Schema({
    type: {type: String, enum: ['Point']},
    coordinates: {type: [Number], index: '2dsphere'}, // [longitude, latitude]
}, {_id: false});

const PostSchema = new Schema({
    title: {type: String, required: true, maxLength: 120},
    description: {type: String, required: true, maxLength: 1000},
    postPictureUrl: {type: String, required: true},

    foodCategory: {type: String, enum: ['Savory', 'Sweet'], required: true},
    cusineType: {type: String, enum: ['Chinese', 'Western', 'Japanese', 'Malay', 'Indian', 'Korean', 'Thai'], required: true},
    dietaryTags: {type: [String], enum: ['Vegetarian', 'Vegan', 'Halal', 'Pescatarian', 'Pork-free', 'Beef-free', 'Dairy-free', 'Gluten-free'], required: true},

    foodRating: {type: Number, min: 1, max: 5, required: true},
    aspectRating: {type: AspectRatingSchema, default: undefined},

    restaurantName: {type: String, required: true, maxLength: 120},
    restaurantLocation: {type: GeoPointSchema, required: true},

    menuItemName: {type: String, required: true, maxLength: 120},
    menuItemPrice: {type: Number, min: 0, required: true},

    imageFeatures: {type: [String], default: undefined},
    imageEmbedding: {type: [Number], default: undefined},

    textSentimentScore: {type: SentimentSchema, default: undefined},
    nutritionalEstimate: {type: NutritionEstimateSchema, default: undefined},

    likesCount: {type: Number, default: 0, min: 0},
    commentsCount: {type: Number, default: 0, min: 0},
    savesCount: {type: Number, default: 0, min: 0},

    authorId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
}, {timestamps: true});

// Crate and export the model
export const PostModel = mongoose.model<Post & Document>('Post', PostSchema);
