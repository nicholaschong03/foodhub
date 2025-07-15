import { faker } from '@faker-js/faker';
import { PostModel } from '../models/Posts';
import { UserModel } from '../models/User';
import { PostSaveModel } from '../models/PostSaves';
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://foodport-api:Foodport2024@foodportcluster.qpjmr1f.mongodb.net/foodHubDB?retryWrites=true&w=majority&appName=FoodportCluster';

// Configuration for generating saves (saves are typically less frequent than likes)
const SAVE_GENERATION_CONFIG = {
    // Percentage of posts that should have saves (0.0 to 1.0)
    postsWithSavesPercentage: 0.6,
    // Percentage of users that should have saved posts (0.0 to 1.0)
    activeUsersPercentage: 0.5,
    // Average saves per post (will vary around this number)
    averageSavesPerPost: 8,
    // Maximum saves per post
    maxSavesPerPost: 25,
    // Minimum saves per post
    minSavesPerPost: 1,
    // Date range for saves (in days from now)
    saveDateRangeDays: 60
};

// Helper function to get random date within range
const getRandomDate = (daysBack: number): Date => {
    const now = new Date();
    const daysAgo = faker.number.int({ min: 0, max: daysBack });
    const hoursAgo = faker.number.int({ min: 0, max: 23 });
    const minutesAgo = faker.number.int({ min: 0, max: 59 });

    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(date.getHours() - hoursAgo);
    date.setMinutes(date.getMinutes() - minutesAgo);

    return date;
};

// Helper function to generate realistic save patterns
const generateSavePattern = (postCount: number, userCount: number) => {
    const saves: Array<{ postId: string; userId: string; createdAt: Date }> = [];

    // Calculate how many posts should have saves
    const postsWithSaves = Math.floor(postCount * SAVE_GENERATION_CONFIG.postsWithSavesPercentage);
    const activeUsers = Math.floor(userCount * SAVE_GENERATION_CONFIG.activeUsersPercentage);

    // Get all posts and users
    const allPosts = Array.from({ length: postCount }, (_, i) => `post_${i}`);
    const allUsers = Array.from({ length: userCount }, (_, i) => `user_${i}`);

    // Select posts that will have saves
    const postsToSave = faker.helpers.arrayElements(allPosts, postsWithSaves);

    for (const postId of postsToSave) {
        // Generate number of saves for this post (using a simple random distribution)
        const baseSaves = SAVE_GENERATION_CONFIG.averageSavesPerPost;
        const variance = baseSaves * 0.7; // 70% variance
        const saveCount = Math.max(
            SAVE_GENERATION_CONFIG.minSavesPerPost,
            Math.min(
                SAVE_GENERATION_CONFIG.maxSavesPerPost,
                Math.floor(baseSaves + (faker.number.float({ min: -variance, max: variance })))
            )
        );

        // Select random users to save this post
        const usersWhoSaved = faker.helpers.arrayElements(allUsers, Math.min(saveCount, activeUsers));

        for (const userId of usersWhoSaved) {
            saves.push({
                postId,
                userId,
                createdAt: getRandomDate(SAVE_GENERATION_CONFIG.saveDateRangeDays)
            });
        }
    }

    return saves;
};

async function main() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get actual posts and users from database
        const posts = await PostModel.find({}, '_id').lean();
        const users = await UserModel.find({}, '_id').lean();

        console.log(`Found ${posts.length} posts and ${users.length} users`);

        if (posts.length === 0 || users.length === 0) {
            console.log('No posts or users found. Please ensure you have data in your database.');
            return;
        }

        // Clear existing saves (optional - comment out if you want to keep existing saves)
        console.log('Clearing existing saves...');
        await PostSaveModel.deleteMany({});
        console.log('Existing saves cleared');

        // Generate save patterns
        const savePatterns = generateSavePattern(posts.length, users.length);

        console.log(`Generated ${savePatterns.length} save patterns`);

        // Create actual save records
        const saveRecords = savePatterns.map(pattern => {
            const postIndex = parseInt(pattern.postId.split('_')[1]);
            const userIndex = parseInt(pattern.userId.split('_')[1]);

            return {
                postId: posts[postIndex]._id,
                userId: users[userIndex]._id,
                createdAt: pattern.createdAt
            };
        });

        // Insert saves in batches
        const batchSize = 100;
        let insertedCount = 0;

        for (let i = 0; i < saveRecords.length; i += batchSize) {
            const batch = saveRecords.slice(i, i + batchSize);
            await PostSaveModel.insertMany(batch);
            insertedCount += batch.length;
            console.log(`Inserted ${insertedCount}/${saveRecords.length} saves`);
        }

        // Update save counts on posts
        console.log('Updating save counts on posts...');
        const saveCounts = await PostSaveModel.aggregate([
            {
                $group: {
                    _id: '$postId',
                    count: { $sum: 1 }
                }
            }
        ]);

        for (const saveCount of saveCounts) {
            await PostModel.updateOne(
                { _id: saveCount._id },
                { $set: { savesCount: saveCount.count } }
            );
        }

        console.log('✅ Successfully generated dummy post saves!');
        console.log(`📊 Statistics:`);
        console.log(`   - Total saves created: ${insertedCount}`);
        console.log(`   - Posts with saves: ${saveCounts.length}`);
        console.log(`   - Average saves per post: ${(insertedCount / saveCounts.length).toFixed(2)}`);

    } catch (error) {
        console.error('❌ Error generating post saves:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run the script
main().catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
});