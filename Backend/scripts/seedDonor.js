const mongoose = require('mongoose');
const Donor = require('../models/Donor');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sayWhattDB';

async function seed() {
  await mongoose.connect(MONGO_URI);
  const donor = new Donor({
    created_by: 'testuser@example.com',
    phone_number: '9876543210',
    donor_id: 'DONOR001',
    total_donations: 0,
    total_amount_donated: 0
  });
  await donor.save();
  console.log('Sample donor seeded:', donor);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
