const mongoose = require('mongoose');
const Pool = require('../models/Pool');
const Donation = require('../models/Donation');
const User = require('../models/User');

// Connect to MongoDB
const db = "mongodb+srv://Pranathi:Vanamali06@cluster0.revma6b.mongodb.net/say-whatt?appName=Cluster0";

const run = async () => {
    try {
        await mongoose.connect(db);
        console.log('MongoDB Connected...');

        const pools = await Pool.find();
        console.log(`Found ${pools.length} pools.`);

        for (const pool of pools) {
            console.log(`\n--------------------------------------------------`);
            console.log(`Pool: ${pool.title} (ID: ${pool._id})`);
            console.log(`Target: $${pool.target_amount}, Current (on Pool doc): $${pool.current_amount}`);
            console.log(`Members count (on Pool doc): ${pool.members.length}`);

            const donations = await Donation.find({ pool: pool._id });
            console.log(`Total Donation documents found for this pool: ${donations.length}`);

            let calculatedSum = 0;
            let donationsWithNoDonor = 0;
            let pendingDonations = 0;
            let rejectedDonations = 0;
            let validDonations = 0;

            for (const d of donations) {
                if (d.status === 'pending_approval') pendingDonations++;
                if (d.status === 'rejected') rejectedDonations++;

                if (d.status !== 'pending_approval' && d.status !== 'rejected') {
                    validDonations++;
                    calculatedSum += d.amount;

                    const donor = await User.findById(d.donor);
                    if (!donor) {
                        console.log(`  WARNING: Donation ${d._id} ($${d.amount}) has NO VALID DONOR (ID: ${d.donor})`);
                        donationsWithNoDonor++;
                    } else {
                        console.log(`  Donation ${d._id}: $${d.amount} by ${donor.name} (${d.status})`);
                    }
                } else {
                    console.log(`  Skipped Donation ${d._id}: $${d.amount} (${d.status})`);
                }
            }

            console.log(`Calculated Sum from valid donations: $${calculatedSum}`);
            console.log(`Discrepancy: $${pool.current_amount - calculatedSum}`);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
    }
};

run();
