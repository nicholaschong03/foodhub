# Interaction Data Generation Scripts

This directory contains scripts to generate dummy interaction data for your recommendation system to solve cold start problems.

## Scripts Overview

### 1. `generatePostLikes.ts`
Generates realistic post likes data across users and posts.

**Features:**
- Creates likes for 80% of posts
- 70% of users will have liked posts
- Average 15 likes per post (varies with normal distribution)
- Likes spread over the last 30 days

**Configuration:**
```typescript
const LIKE_GENERATION_CONFIG = {
    postsWithLikesPercentage: 0.8,
    activeUsersPercentage: 0.7,
    averageLikesPerPost: 15,
    maxLikesPerPost: 50,
    minLikesPerPost: 1,
    likeDateRangeDays: 30
};
```

### 2. `generatePostSaves.ts`
Generates post saves data (typically less frequent than likes).

**Features:**
- Creates saves for 60% of posts
- 50% of users will have saved posts
- Average 8 saves per post
- Saves spread over the last 60 days

**Configuration:**
```typescript
const SAVE_GENERATION_CONFIG = {
    postsWithSavesPercentage: 0.6,
    activeUsersPercentage: 0.5,
    averageSavesPerPost: 8,
    maxSavesPerPost: 25,
    minSavesPerPost: 1,
    saveDateRangeDays: 60
};
```

### 3. `generateFollows.ts`
Generates follow relationships between users.

**Features:**
- 80% of users will follow others
- Average 12 follows per user
- Follows spread over the last 90 days
- Prevents self-following

**Configuration:**
```typescript
const FOLLOW_GENERATION_CONFIG = {
    activeUsersPercentage: 0.8,
    averageFollowsPerUser: 12,
    maxFollowsPerUser: 30,
    minFollowsPerUser: 1,
    followDateRangeDays: 90
};
```

### 4. `generateAllInteractionData.ts`
Master script that runs all three scripts in sequence.

## Usage

### Prerequisites
1. Ensure you have users and posts in your database
2. Make sure you're in the backend directory
3. Install dependencies: `npm install` or `pnpm install`

### Running Individual Scripts

```bash
# Generate post likes
npx ts-node src/scripts/generatePostLikes.ts

# Generate post saves
npx ts-node src/scripts/generatePostSaves.ts

# Generate follow relationships
npx ts-node src/scripts/generateFollows.ts
```

### Running All Scripts at Once

```bash
# Run the master script
npx ts-node src/scripts/generateAllInteractionData.ts
```

## What Each Script Does

### Post Likes Generation
1. Connects to MongoDB
2. Fetches all posts and users
3. Generates realistic like patterns using normal distribution
4. Creates like records with random timestamps
5. Updates `likesCount` on posts
6. Provides statistics

### Post Saves Generation
1. Similar to likes but with different frequency patterns
2. Saves are typically less frequent than likes
3. Updates `savesCount` on posts

### Follow Generation
1. Creates follow relationships between users
2. Prevents users from following themselves
3. Uses realistic distribution patterns

## Configuration

You can modify the configuration constants in each script to adjust:
- Percentage of active users/posts
- Average interactions per user/post
- Date ranges for timestamps
- Maximum and minimum values

## Database Impact

**⚠️ Important:** These scripts will:
- Clear existing interaction data (likes, saves, follows)
- Insert new dummy data
- Update count fields on posts

If you want to keep existing data, comment out the `deleteMany()` calls in each script.

## Output

Each script provides detailed console output including:
- Connection status
- Data counts found
- Progress updates
- Final statistics
- Success/error messages

## Recommendation System Benefits

This data will help your recommendation system with:

1. **Collaborative Filtering**: User-user and item-item similarities
2. **Content-Based Filtering**: User preferences based on interactions
3. **Hybrid Approaches**: Combining both methods
4. **Cold Start Solutions**: New users and items can get recommendations

## Troubleshooting

### Common Issues:
1. **No users/posts found**: Ensure your database has data
2. **Connection errors**: Check MongoDB URI
3. **Memory issues**: Reduce batch sizes for large datasets
4. **Duplicate key errors**: Scripts handle this automatically

### Debugging:
- Check console output for detailed error messages
- Verify database connectivity
- Ensure all required models are imported correctly