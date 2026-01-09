const mongoose = require('mongoose');
const Donation = require('./Backend/models/Donation');
const User = require('./Backend/models/User'); // In case it's needed for population

// DB Connection
const MONGO_URI = 'mongodb://localhost:27017/sayWhattDB';
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('MongoDB connected successfully');
        try {
            const donations = await Donation.find({});
            console.log(`Found ${donations.length} total donations.`);

            donations.forEach(d => {
                console.log(`ID: ${d._id}, Status: ${d.status}, Type: ${d.donation_type}, CollStatus: ${d.collection_status}, Address: ${d.address ? 'Yes' : 'No'}`);
            });

            const pending = await Donation.find({
                status: { $in: ['pending', 'confirmed'] },
                $or: [
                    { collection_status: 'pending' },
                    { collection_status: { $exists: false } }
                ]
            });
            console.log(`\nPending Query would return: ${pending.length} items.`);

        } catch (err) {
            console.error(err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error('MongoDB connection error:', err));
