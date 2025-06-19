import { faker } from '@faker-js/faker';
import { PostModel } from '../models/Posts';
import mongoose from 'mongoose';

const foodEmojis = [
    "🍜", "🍛", "🍲", "🍣", "🍤", "🍱", "🍔", "🍟", "🍕", "🍗", "🥟",
    "🥘", "🍙", "🍚", "🥢", "🌶️", "🥗", "🥩", "🍦", "🍧", "🍩", "🍰", "🍺"
];

const adjectives = [
    'Delicious', 'Tasty', 'Amazing', 'Yummy', 'Spicy', 'Authentic', 'Classic',
    'Hearty', 'Satisfying', 'Fresh', 'Savory', 'Fluffy', 'Juicy', 'Crispy'
];

const patterns = [
    '{emoji} {adj} {dishName}',
    'Must-Try: {dishName} {emoji}',
    'Loved the {dishName} {emoji}',
    '{dishName}: A Delight! {emoji}',
    'Best {dishName} in Town {emoji}',
    '{emoji} {dishName} Experience',
    '{adj} {dishName} - Highly Recommended! {emoji}',
    'Craving for {dishName} {emoji}',
    'My Review: {dishName}',
    "Today's Special: {dishName} {emoji}",
    "Don't Miss: {dishName} {emoji}"
];

// Helper to sometimes include an emoji
const maybeEmoji = () => (Math.random() < 0.7 ? faker.helpers.arrayElement(foodEmojis) : '');

const generateFoodPostTitle = (dishName: string): string => {
    // Pick random pattern, adjective, emoji
    const pattern = faker.helpers.arrayElement(patterns);
    const adj = faker.helpers.arrayElement(adjectives);
    const emoji = maybeEmoji();

    // Replace placeholders
    return pattern
        .replace('{emoji}', emoji)
        .replace('{adj}', adj)
        .replace('{dishName}', dishName || faker.food.dish());
};

const MONGODB_URI = 'mongodb+srv://foodport-api:Foodport2024@foodportcluster.qpjmr1f.mongodb.net/foodHubDB?retryWrites=true&w=majority&appName=FoodportCluster';

async function main() {
    await mongoose.connect(MONGODB_URI);

    const posts = await PostModel.find({ title: "Good Food" });

    for (const post of posts) {
        const dishName = post.menuItemName || faker.food.dish();
        const newTitle = generateFoodPostTitle(dishName);
        post.title = newTitle;
        await post.save();
        console.log(`Updated post ${post._id} to "${newTitle}"`);
    }
    console.log("All post titles updated with emojis and variety!");

    await mongoose.disconnect();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});