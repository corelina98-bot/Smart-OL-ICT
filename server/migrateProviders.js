const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/smartolict");

// User model (temporary for migration)
const userSchema = new mongoose.Schema({
  provider: String,
  providers: [String],
  // ... other fields
}, { strict: false });

const User = mongoose.model("User", userSchema);

async function migrateProviders() {
  try {
    console.log("Starting provider migration...");

    // Find all users with the old provider field
    const users = await User.find({ provider: { $exists: true } });

    console.log(`Found ${users.length} users to migrate`);

    for (const user of users) {
      // Convert single provider to array
      user.providers = [user.provider];
      // Remove old field
      user.provider = undefined;
      await user.save();
      console.log(`Migrated user: ${user.email}`);
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    mongoose.connection.close();
  }
}

migrateProviders();