import mongoose from 'mongoose';
import { UserModel } from '../models/User';

const MONGODB_URI = "mongodb+srv://foodport-api:Foodport2024@foodportcluster.qpjmr1f.mongodb.net/foodHubProdDB?retryWrites=true&w=majority&appName=FoodportCluster";

async function replaceKosherRestriction() {
    await mongoose.connect(MONGODB_URI);
    const users = await UserModel.find({ restrictions: 'Kosher' });
    let updatedCount = 0;

    for (const user of users) {
      // Decide randomly: 0 = No Pork, 1 = No Beef, 2 = Both
      const variant = Math.floor(Math.random() * 3);
      let newRestrictions: string[];

      if (variant === 0) {
        newRestrictions = user.restrictions.map((r: string) =>
          r.toLowerCase() === 'kosher' ? 'No Pork' : r
        );
        console.log(`Updated user ${user._id}: replaced 'kosher' with 'No Pork'`);
      } else if (variant === 1) {
        newRestrictions = user.restrictions.map((r: string) =>
          r.toLowerCase() === 'kosher' ? 'No Beef' : r
        );
        console.log(`Updated user ${user._id}: replaced 'kosher' with 'No Beef'`);
      } else {
        // Remove all 'kosher', add both 'No Pork' and 'No Beef' if not already present
        newRestrictions = user.restrictions.filter((r: string) => r.toLowerCase() !== 'kosher');
        if (!newRestrictions.includes('No Pork')) newRestrictions.push('No Pork');
        if (!newRestrictions.includes('No Beef')) newRestrictions.push('No Beef');
        console.log(`Updated user ${user._id}: replaced 'kosher' with BOTH 'No Pork' and 'No Beef'`);
      }

      user.restrictions = newRestrictions;
      await user.save();
      updatedCount++;
    }

    console.log(`\nTotal users updated: ${updatedCount}`);
    await mongoose.disconnect();
  }

  replaceKosherRestriction().catch(err => {
    console.error('Error updating users:', err);
    process.exit(1);
  });