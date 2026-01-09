const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../models/User');
require('dotenv').config({ path: '../.env' }); // Adjust path if your .env is elsewhere

const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
};

const generateDonorId = (name) => {
  const hash = crypto.createHash('sha256');
  // Using a combination of name and a random element to ensure uniqueness even if names are the same
  hash.update(name + new Date().getTime().toString() + Math.random().toString());
  return 'DNR-' + hash.digest('hex').substring(0, 8).toUpperCase();
};

const migrateDonors = async () => {
  await connectDB();

  try {
    const donorsToUpdate = await User.find({
      role: 'Donor',
      donorId: { $exists: false } // Find donors that don't have the donorId field
    });

    if (donorsToUpdate.length === 0) {
      console.log('All donors already have a donorId. No migration needed.');
      return;
    }

    console.log(`Found ${donorsToUpdate.length} donor(s) to update.`);

    let updatedCount = 0;
    for (const donor of donorsToUpdate) {
      donor.donorId = generateDonorId(donor.name);
      await donor.save();
      updatedCount++;
      console.log(`Updated donor: ${donor.name} (ID: ${donor._id}) with new donorId: ${donor.donorId}`);
    }

    console.log(`\nMigration complete. Successfully updated ${updatedCount} donor(s).`);

  } catch (error) {
    console.error('An error occurred during migration:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

migrateDonors();
