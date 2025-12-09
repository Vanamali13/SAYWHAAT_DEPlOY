const mongoose = require('mongoose');
const Donation = require('./models/Donation');
const User = require('./models/User');

const MONGO_URI = "mongodb+srv://Pranathi:Vanamali06@cluster0.revma6b.mongodb.net/say-whatt?appName=Cluster0";
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('MongoDB connected successfully');
        try {
            const donations = await Donation.find({});
            console.log(`Found ${donations.length} total donations.`);

            donations.forEach(d => {
                console.log(`ID: ${d._id}\n  Status: ${d.status}\n  Type: ${d.donation_type}\n  CollStatus: ${d.collection_status}\n  Address: ${d.address ? 'Yes' : 'No'}\n  Items: ${d.items?.length}`);
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
