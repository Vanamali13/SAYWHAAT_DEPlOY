const mongoose = require('mongoose');
const Pool = require('../models/Pool');
const Donation = require('../models/Donation');

// Connect to MongoDB
const db = "mongodb+srv://Pranathi:Vanamali06@cluster0.revma6b.mongodb.net/say-whatt?appName=Cluster0";

const run = async () => {
    try {
        await mongoose.connect(db);
        console.log('MongoDB Connected...');

        const pools = await Pool.find();
        console.log(`Found ${pools.length} pools.`);

        for (const pool of pools) {
            console.log(`\nProcessing Pool: ${pool.title}`);

            const donations = await Donation.find({
                pool: pool._id,
                status: { $nin: ['pending_approval', 'rejected'] }
            });

            const calculatedSum = donations.reduce((sum, d) => sum + d.amount, 0);

            console.log(`  Current Amount (DB): $${pool.current_amount}`);
            console.log(`  Calculated Sum: $${calculatedSum}`);

            if (pool.current_amount !== calculatedSum) {
                console.log(`  FIXING: Updating current_amount to $${calculatedSum}`);
                pool.current_amount = calculatedSum;
                await pool.save();
                console.log('  Updated.');
            } else {
                console.log('  Data is consistent.');
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
};

run();
