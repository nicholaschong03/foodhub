import { faker } from '@faker-js/faker';
import { PostModel } from '../models/Posts';
import { UserModel } from '../models/User';
import { PostLikeModel } from '../models/PostLikes';
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://foodport-api:Foodport2024@foodportcluster.qpjmr1f.mongodb.net/foodHubDB?retryWrites=true&w=majority&appName=FoodportCluster';

// Configuration for generating likes
const LIKE_GENERATION_CONFIG = {
    // Percentage of posts that should have likes (0.0 to 1.0)
    postsWithLikesPercentage: 0.8,
    // Percentage of users that should have liked posts (0.0 to 1.0)
    activeUsersPercentage: 0.7,
    // Average likes per post (will vary around this number)
    averageLikesPerPost: 15,
    // Maximum likes per post
    maxLikesPerPost: 50,
    // Minimum likes per post
    minLikesPerPost: 1,
    // Date range for likes (in days from now)
    likeDateRangeDays: 30
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

// Helper function to generate realistic like patterns
const generateLikePattern = (postCount: number, userCount: number) => {
    const likes: Array<{ postId: string; userId: string; createdAt: Date }> = [];

    // Calculate how many posts should have likes
    const postsWithLikes = Math.floor(postCount * LIKE_GENERATION_CONFIG.postsWithLikesPercentage);
    const activeUsers = Math.floor(userCount * LIKE_GENERATION_CONFIG.activeUsersPercentage);

    // Get all posts and users
    const allPosts = Array.from({ length: postCount }, (_, i) => `post_${i}`);
    const allUsers = Array.from({ length: userCount }, (_, i) => `user_${i}`);

    // Select posts that will have likes
    const postsToLike = faker.helpers.arrayElements(allPosts, postsWithLikes);

    for (const postId of postsToLike) {
        // Generate number of likes for this post (using a simple random distribution)
        const baseLikes = LIKE_GENERATION_CONFIG.averageLikesPerPost;
        const variance = baseLikes * 0.6; // 60% variance
        const likeCount = Math.max(
            LIKE_GENERATION_CONFIG.minLikesPerPost,
            Math.min(
                LIKE_GENERATION_CONFIG.maxLikesPerPost,
                Math.floor(baseLikes + (faker.number.float({ min: -variance, max: variance })))
            )
        );

        // Select random users to like this post
        const usersWhoLiked = faker.helpers.arrayElements(allUsers, Math.min(likeCount, activeUsers));

        for (const userId of usersWhoLiked) {
            likes.push({
                postId,
                userId,
                createdAt: getRandomDate(LIKE_GENERATION_CONFIG.likeDateRangeDays)
            });
        }
    }

    return likes;
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

        // Clear existing likes (optional - comment out if you want to keep existing likes)
        console.log('Clearing existing likes...');
        await PostLikeModel.deleteMany({});
        console.log('Existing likes cleared');

        // Generate like patterns
        const likePatterns = generateLikePattern(posts.length, users.length);

        console.log(`Generated ${likePatterns.length} like patterns`);

        // Create actual like records
        const likeRecords = likePatterns.map(pattern => {
            const postIndex = parseInt(pattern.postId.split('_')[1]);
            const userIndex = parseInt(pattern.userId.split('_')[1]);

            return {
                postId: posts[postIndex]._id,
                userId: users[userIndex]._id,
                createdAt: pattern.createdAt
            };
        });

        // Insert likes in batches
        const batchSize = 100;
        let insertedCount = 0;

        for (let i = 0; i < likeRecords.length; i += batchSize) {
            const batch = likeRecords.slice(i, i + batchSize);
            await PostLikeModel.insertMany(batch);
            insertedCount += batch.length;
            console.log(`Inserted ${insertedCount}/${likeRecords.length} likes`);
        }

        // Update like counts on posts
        console.log('Updating like counts on posts...');
        const likeCounts = await PostLikeModel.aggregate([
            {
                $group: {
                    _id: '$postId',
                    count: { $sum: 1 }
                }
            }
        ]);

        for (const likeCount of likeCounts) {
            await PostModel.updateOne(
                { _id: likeCount._id },
                { $set: { likesCount: likeCount.count } }
            );
        }

        console.log('✅ Successfully generated dummy post likes!');
        console.log(`📊 Statistics:`);
        console.log(`   - Total likes created: ${insertedCount}`);
        console.log(`   - Posts with likes: ${likeCounts.length}`);
        console.log(`   - Average likes per post: ${(insertedCount / likeCounts.length).toFixed(2)}`);

    } catch (error) {
        console.error('❌ Error generating post likes:', error);
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