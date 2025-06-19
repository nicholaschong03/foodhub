import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { UserModel } from '../models/User';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.DEV_MONGODB_URI || 'mongodb://localhost:27017/foodhub';

const generateFakeUser = async () => {
    const password = '12345678';
    const hashedPassword = await bcrypt.hash(password, 10);

    return {
        email: faker.internet.email(),
        password: hashedPassword,
        name: faker.person.fullName(),
        username: faker.internet.username(),
        gender: faker.helpers.arrayElement(['Male', 'Female', 'Prefer not to say']),
        dob: faker.date.between({ from: '1980-01-01', to: '2005-12-31' }),
        height: faker.number.int({ min: 150, max: 200 }), // height in cm
        weight: faker.number.int({ min: 45, max: 120 }), // weight in kg
        goal: faker.helpers.arrayElement(['Lose weight', 'Maintain', 'Gain Weight']),
        activityLevel: faker.helpers.arrayElement(['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active']),
        restrictions: faker.helpers.arrayElements(['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Halal', 'Kosher'], { min: 0, max: 3 }),
        cusines: faker.helpers.arrayElements(['Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese', 'Thai', 'Mediterranean'], { min: 1, max: 5 }),
        allergies: faker.helpers.arrayElements(['Peanuts', 'Shellfish', 'Eggs', 'Milk', 'Soy', 'Wheat', 'Tree Nuts'], { min: 0, max: 3 }),
        adventurousness: faker.number.int({ min: 1, max: 5 }),
        profilePicture: faker.image.avatar(),
    };
};

const seedUsers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Generate and insert 100 fake users
        const users = await Promise.all(
            Array.from({ length: 100 }, () => generateFakeUser())
        );

        await UserModel.insertMany(users);
        console.log('Successfully added 100 new users to the database');

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();