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

// @route   GET /api/donations/:id
// @desc    Get specific donation details
// @access  Private (Donor/Admin)
router.get('/:id', auth, async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate('pool')
            // .populate('assigned_staff', 'name email phone_number') // Removed
            .populate('donor', 'name');

        if (!donation) {
            return res.status(404).json({ msg: 'Donation not found' });
        }

        // Security check: Ensure user owns this donation or is Admin
        if (donation.donor._id.toString() !== req.user.id && req.user.role !== 'Administrator' && req.user.role !== 'Batch staff') {
            return res.status(403).json({ msg: 'Not authorized to view this donation' });
        }

        let response = { ...donation.toObject() };

        // Calculate Pool Rank if it's a money donation in a pool
        if (donation.pool) {
            // Aggregate all donations for this pool
            const poolDonations = await Donation.find({ pool: donation.pool._id }).populate('donor', 'name email role');

            // Group by donor and sum amounts
            const donorTotals = {};
            poolDonations.forEach(d => {
                const dId = d.donor ? d.donor._id.toString() : 'unknown';
                donorTotals[dId] = (donorTotals[dId] || 0) + (d.amount || 0);
            });

            // Sort donors by amount descending
            const sortedDonors = Object.keys(donorTotals).sort((a, b) => donorTotals[b] - donorTotals[a]);

            // Find rank of current donor
            const rank = sortedDonors.indexOf(donation.donor._id.toString()) + 1;

            response.isTopContributor = rank <= 3; // Top 3 are top contributors
            response.poolRank = rank;
            response.poolTotalDonors = sortedDonors.length;

            // [ADMIN ONLY] Attach full list of donors for this pool
            if (req.user.role === 'Administrator') {
                console.log('DEBUG: Filtering Admins. Total pool donations:', poolDonations.length);
                response.poolDonationsList = poolDonations
                    .filter(d => {
                        if (!d.donor) return false;
                        console.log(`DEBUG: Checking donor ${d.donor.name} with role '${d.donor.role}'`);
                        const role = d.donor.role || '';
                        return role !== 'Administrator' && role !== 'Admin' && role !== 'admin';
                    })
                    .map(d => ({
                        _id: d._id,
                        donorName: d.donor ? d.donor.name : 'Unknown Donor',
                        amount: d.amount,
                        date: d.createdAt
                    }))
                    .sort((a, b) => new Date(b.date) - new Date(a.date));
            }
        }

        res.json(response);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Donation not found' });
        }
        res.status(500).send('Server Error');
    }
});


module.exports = router;