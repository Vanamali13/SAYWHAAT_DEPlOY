const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const User = require('../models/User');
const Pool = require('../models/Pool');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// @route   POST /api/donations
// @desc    Create a new donation for approval
// @access  Private (Donor)
router.post('/', auth, async (req, res) => {
    try {
        // The user's ID is retrieved from the authentication token
        const user = await User.findById(req.user.id);

        if (!user || user.role !== 'Donor') {
            return res.status(403).json({ msg: 'User is not a donor or not found.' });
        }

        let assignedPool = null;
        const amount = parseFloat(req.body.amount);

        // Automatic Pool Assignment Logic
        // Assign if:
        // 1. Explicitly requested via join_pool: true (for > 7000)
        // 2. Amount is between 100 and 7000 AND not explicitly opted out (join_pool !== false)
        const shouldJoinPool = (req.body.join_pool === true) ||
            (amount && amount >= 100 && amount <= 7000 && req.body.join_pool !== false);

        if (amount && shouldJoinPool) {
            // Find an active pool where adding this amount won't exceed the target
            const activePools = await Pool.find({ status: 'active' });

            for (const pool of activePools) {
                if ((pool.current_amount + amount) <= pool.target_amount) {
                    assignedPool = pool._id;
                    break; // Assign to the first available pool
                }
            }
        }

        // Create the new donation
        const initialStatus = req.body.donation_type === 'money' ? 'pending' : 'pending_approval';

        const newDonation = new Donation({
            ...req.body,
            donor: user._id, // Link to the User document
            status: initialStatus,
            pool: assignedPool
        });

        const savedDonation = await newDonation.save();

        // Create notification if pool assigned
        if (assignedPool) {
            const pool = await Pool.findById(assignedPool);
            await Notification.create({
                recipient: user._id,
                message: `Your donation of $${amount} has been tentatively assigned to the pool: "${pool.title}". It will be confirmed upon admin approval.`,
                type: 'info'
            });
        }

        // Notify Admins if it's a money donation (auto-approved)
        if (req.body.donation_type === 'money') {
            const admins = await User.find({ role: 'Administrator' });
            const notifications = admins.map(admin => ({
                recipient: admin._id,
                message: `New money donation of $${amount} received from ${user.name}. Auto-approved.`,
                type: 'success'
            }));
            if (notifications.length > 0) {
                await Notification.insertMany(notifications);
            }
        }

        res.status(201).json({
            message: 'Donation submitted for approval.',
            donation: savedDonation
        });

    } catch (err) {
        console.error('Error creating donation:', err.message);
        res.status(500).json({ error: 'Server error while creating donation.' });
    }
});

// @route   GET /api/donations
// @desc    Get all donations for the logged-in donor
// @access  Private (Donor)
router.get('/', auth, async (req, res) => {
    try {
        const donations = await Donation.find({ donor: req.user.id })
            .populate('pool')
            .sort({ createdAt: -1 });
        res.json(donations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;