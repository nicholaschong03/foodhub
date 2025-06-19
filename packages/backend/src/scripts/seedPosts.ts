import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import { PostModel } from '../models/Posts';
import { UserModel } from '../models/User';
import mongoose, { Connection, Document } from 'mongoose';

dotenv.config();

// Define interfaces for old documents
interface OldMenuItem {
    _id: mongoose.Types.ObjectId;
    menuItemName?: string;
    menuItemPrice?: number;
    menuItemCategory?: string;
}

interface OldPost {
    _id: mongoose.Types.ObjectId;
    postReview?: string;
    postPhotoUrls?: string[];
    postDeliciousRating?: number;
    menuItemDetails?: {
        menuItem_id?: { $oid: string };
        menuItemName?: string;
    };
    businessDetails?: {
        businessName?: string;
        businessOperatingLocation?: {
            coordinates?: { type: string; coordinates: number[] };
        };
    };
}

const oldPostSchema = new mongoose.Schema<OldPost>({}, { strict: false, collection: 'posts' });
const MenuItemSchema = new mongoose.Schema<OldMenuItem>({}, { strict: false, collection: 'menu_items' });

// Cusine and dietary tag enums
const CUISINE_TYPES = ['Chinese', 'Western', 'Japanese', 'Malay', 'Indian', 'Korean', 'Thai'];
const DIETARY_TAGS = ['Vegetarian', 'Vegan', 'Halal', 'Pescatarian', 'Pork-free', 'Beef-free', 'Dairy-free', 'Gluten-free'];

const OLD_DB_URI = 'mongodb+srv://foodport-api:Foodport2024@foodportcluster.qpjmr1f.mongodb.net/productionDB?retryWrites=true&w=majority&appName=FoodportCluster'
const NEW_DB_URI = 'mongodb+srv://foodport-api:Foodport2024@foodportcluster.qpjmr1f.mongodb.net/foodHubDB?retryWrites=true&w=majority&appName=FoodportCluster'

type AnyDoc = Document & { [key: string]: any };

// Utility to get a random element(s)
const getRandomArrayElement = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomArrayElements = <T>(arr: T[], min = 1, max = 3) => faker.helpers.arrayElements(arr, { min, max });

const migratePosts = async () => {
    // Connect to old and new DBs
    const oldDb: Connection = await mongoose.createConnection(OLD_DB_URI).asPromise();
    await mongoose.connect(NEW_DB_URI);

    // Delete all existing posts in the new database
    console.log('Cleaning up existing posts...');
    await PostModel.deleteMany({});
    console.log('Existing posts deleted successfully');

    // Models for old DB with proper typing
    const OldPost = oldDb.model<OldPost>('OldPost', oldPostSchema);
    const MenuItem = oldDb.model<OldMenuItem>('MenuItem', MenuItemSchema);

    // Cache all new users
    const users = await UserModel.find({}, '_id');
    if (!users.length) throw new Error('No users found in new DB. Seed users first');

    // Cache all menu items for price/category lookups
    const menuItems = await MenuItem.find({});
    const menuItemMap = new Map<string, OldMenuItem>();
    menuItems.forEach(item => {
        menuItemMap.set(item._id.toString(), item);
    });

    // Get old posts
    const oldPosts = await OldPost.find({});

    let migrated = 0;
    for (const old of oldPosts) {
        try {
            const menuItemId = old.menuItemDetails?.menuItem_id?.$oid;
            const menuItem = menuItemId ? menuItemMap.get(menuItemId) : null;

            // foodCategory logic
            let foodCategory: 'Savory' | 'Sweet' = 'Savory';
            if (menuItem?.menuItemCategory) {
                foodCategory = menuItem.menuItemCategory === 'Sweet' ? 'Sweet' : 'Savory';
            }

            // Random user as author
            const randomUser = getRandomArrayElement(users);

            // Map to new schema
            const postData = {
                title: 'Good Food',
                description: old.postReview || '',
                postPictureUrl: old.postPhotoUrls?.[0] || '',
                foodCategory,
                cusineType: getRandomArrayElement([...CUISINE_TYPES]),
                dietaryTags: getRandomArrayElements([...DIETARY_TAGS], 1, 3),
                foodRating: old.postDeliciousRating ?? 3,
                aspectRating: undefined,
                restaurantName: old.businessDetails?.businessName || '',
                restaurantLocation:
                    old.businessDetails?.businessOperatingLocation?.coordinates ||
                    { type: 'Point', coordinates: [0, 0] },
                menuItemName: old.menuItemDetails?.menuItemName || '',
                menuItemPrice: menuItem?.menuItemPrice ?? 0,
                likesCount: 0,
                commentsCount: 0,
                savesCount: 0,
                authorId: randomUser._id,

            };

            // Cerate in new DB
            await PostModel.create(postData);
            migrated++;
        } catch (err) {
            console.error('Failed to migrate post:', err);
        }
    }

    console.log(`Migration complete: ${migrated}/${oldPosts.length} posts migrated.`);
    await oldDb.close();
    await mongoose.disconnect();
};
migratePosts().catch(err => {
    console.error('Migration error:', err);
    process.exit(1);
});






