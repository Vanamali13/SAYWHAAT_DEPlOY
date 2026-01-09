const mongoose = require('mongoose');
const User = require('../models/User');
const Donation = require('../models/Donation');

// Connect to MongoDB
const db = "mongodb+srv://Pranathi:Vanamali06@cluster0.revma6b.mongodb.net/say-whatt?appName=Cluster0";

const run = async () => {
    try {
        await mongoose.connect(db);
        console.log('MongoDB Connected...');

        const email = "vana@mail.com";
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found.`);
        } else {
            console.log(`User Found: ${user.name}`);
            console.log(`  _id: ${user._id}`);
            console.log(`  donorId: ${user.donorId}`);

            const donations = await Donation.find({ donor: user._id });
            console.log(`Donations matching user._id: ${donations.length}`);
        }

        console.log('--- All Donations Sample ---');
        const allDonations = await Donation.find().limit(5);
        allDonations.forEach(d => {
            console.log(`Donation ${d._id}:`);
            console.log(`  donor (field): ${d.donor}`);
            console.log(`  amount: ${d.amount}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
};

run();
