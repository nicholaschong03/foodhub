import { faker } from '@faker-js/faker';
import { UserModel } from '../models/User';
import { FollowModel } from '../models/Follow';
import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://foodport-api:Foodport2024@foodportcluster.qpjmr1f.mongodb.net/foodHubDB?retryWrites=true&w=majority&appName=FoodportCluster';

// Configuration for generating follows
const FOLLOW_GENERATION_CONFIG = {
    // Percentage of users that should follow others (0.0 to 1.0)
    activeUsersPercentage: 0.8,
    // Average follows per user (will vary around this number)
    averageFollowsPerUser: 12,
    // Maximum follows per user
    maxFollowsPerUser: 30,
    // Minimum follows per user
    minFollowsPerUser: 1,
    // Date range for follows (in days from now)
    followDateRangeDays: 90
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

// Helper function to generate realistic follow patterns
const generateFollowPattern = (userCount: number) => {
    const follows: Array<{ follower: string; following: string; createdAt: Date }> = [];

    // Calculate how many users should be active followers
    const activeUsers = Math.floor(userCount * FOLLOW_GENERATION_CONFIG.activeUsersPercentage);

    // Get all users
    const allUsers = Array.from({ length: userCount }, (_, i) => `user_${i}`);

    // Select users who will follow others
    const usersWhoFollow = faker.helpers.arrayElements(allUsers, activeUsers);

    for (const followerId of usersWhoFollow) {
        // Generate number of follows for this user (using a simple random distribution)
        const baseFollows = FOLLOW_GENERATION_CONFIG.averageFollowsPerUser;
        const variance = baseFollows * 0.8; // 80% variance
        const followCount = Math.max(
            FOLLOW_GENERATION_CONFIG.minFollowsPerUser,
            Math.min(
                FOLLOW_GENERATION_CONFIG.maxFollowsPerUser,
                Math.floor(baseFollows + (faker.number.float({ min: -variance, max: variance })))
            )
        );

        // Select random users to follow (excluding self)
        const potentialFollowings = allUsers.filter(userId => userId !== followerId);
        const usersToFollow = faker.helpers.arrayElements(potentialFollowings, Math.min(followCount, potentialFollowings.length));

        for (const followingId of usersToFollow) {
            follows.push({
                follower: followerId,
                following: followingId,
                createdAt: getRandomDate(FOLLOW_GENERATION_CONFIG.followDateRangeDays)
            });
        }
    }

    return follows;
};

async function main() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get actual users from database
        const users = await UserModel.find({}, '_id').lean();

        console.log(`Found ${users.length} users`);

        if (users.length === 0) {
            console.log('No users found. Please ensure you have data in your database.');
            return;
        }

        // Clear existing follows (optional - comment out if you want to keep existing follows)
        console.log('Clearing existing follows...');
        await FollowModel.deleteMany({});
        console.log('Existing follows cleared');

        // Generate follow patterns
        const followPatterns = generateFollowPattern(users.length);

        console.log(`Generated ${followPatterns.length} follow patterns`);

        // Create actual follow records
        const followRecords = followPatterns.map(pattern => {
            const followerIndex = parseInt(pattern.follower.split('_')[1]);
            const followingIndex = parseInt(pattern.following.split('_')[1]);

            return {
                follower: users[followerIndex]._id,
                following: users[followingIndex]._id,
                createdAt: pattern.createdAt
            };
        });

        // Insert follows in batches
        const batchSize = 100;
        let insertedCount = 0;

        for (let i = 0; i < followRecords.length; i += batchSize) {
            const batch = followRecords.slice(i, i + batchSize);
            await FollowModel.insertMany(batch);
            insertedCount += batch.length;
            console.log(`Inserted ${insertedCount}/${followRecords.length} follows`);
        }

        console.log('✅ Successfully generated dummy follow relationships!');
        console.log(`📊 Statistics:`);
        console.log(`   - Total follows created: ${insertedCount}`);
        console.log(`   - Average follows per user: ${(insertedCount / users.length).toFixed(2)}`);

    } catch (error) {
        console.error('❌ Error generating follow relationships:', error);
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