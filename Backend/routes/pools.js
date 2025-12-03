const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Pool = require('../models/Pool');
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
