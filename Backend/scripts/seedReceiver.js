const mongoose = require('mongoose');
const Receiver = require('../models/Receiver');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sayWhattDB';

async function seed() {
  await mongoose.connect(MONGO_URI);
  const receiver = new Receiver({
    full_name: 'Sample Receiver',
    phone_number: '1234567890',
    email: 'receiver@example.com',
    address: '123 Main St',
    verification_status: 'verified',
    family_size: 4,
    needs_description: 'Needs food and clothing.'
  });
  await receiver.save();
  console.log('Sample verified receiver seeded:', receiver);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
