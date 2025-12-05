const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Pool = require('../models/Pool');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Helper to generate unique Pool ID
const generatePoolId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `POOL-${timestamp}-${random}`;
};

// @route   GET /api/pools
// @desc    Get all pools
// @access  Private (Admin/Donor)
router.get('/', auth, async (req, res) => {
    try {
        const pools = await Pool.find().sort({ createdAt: -1 });
        res.json(pools);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/pools/:id/details
// @desc    Get pool details with donor stats
// @access  Private (Admin only)
router.get('/:id/details', [auth, adminAuth], async (req, res) => {
    try {
        console.log(`[PoolDetails] Fetching details for pool: ${req.params.id}`);
        const pool = await Pool.findById(req.params.id);
        if (!pool) {
            console.log('[PoolDetails] Pool not found');
            return res.status(404).json({ msg: 'Pool not found' });
        }

        // Find all donations for this pool that are confirmed/pending (not rejected or pending_approval)
        console.log('[PoolDetails] Fetching donations...');
        const donations = await Donation.find({
            pool: req.params.id,
            status: { $nin: ['pending_approval', 'rejected'] }
        }).populate('donor', ['name', 'email']);
        console.log(`[PoolDetails] Found ${donations.length} donations`);

        // Aggregate by donor
        const donorStats = {};
        donations.forEach(donation => {
            if (donation.donor) { // Check if donor exists (might be deleted user)
                const donorId = donation.donor._id.toString();
                if (!donorStats[donorId]) {
                    donorStats[donorId] = {
                        donor: donation.donor,
                        totalAmount: 0,
                        donationCount: 0
                    };
                }
                donorStats[donorId].totalAmount += donation.amount;
                donorStats[donorId].donationCount += 1;
            } else {
                console.log(`[PoolDetails] Donation ${donation._id} has no donor attached`);
            }
        });

        // Convert to array and calculate percentages
        const donors = Object.values(donorStats).map(stat => ({
            ...stat,
            percentage: pool.current_amount > 0 ? (stat.totalAmount / pool.current_amount) * 100 : 0
        }));

        // Sort by total amount descending
        donors.sort((a, b) => b.totalAmount - a.totalAmount);

        console.log('[PoolDetails] Sending response');
        res.json({
            pool,
            donors
        });

    } catch (err) {
        console.error('[PoolDetails] Error:', err);
        res.status(500).send('Server Error');
    }
});



// @route   POST /api/pools
// @desc    Create a new pool
// @access  Private (Admin only)
router.post('/', [auth, adminAuth], async (req, res) => {
    const { title, description, target_amount } = req.body;

    try {
        const newPool = new Pool({
            poolId: generatePoolId(),
            title,
            description,
            target_amount
        });

        const pool = await newPool.save();
        res.json(pool);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



module.exports = router;
