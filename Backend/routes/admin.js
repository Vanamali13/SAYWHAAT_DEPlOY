const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Donation = require('../models/Donation');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Helper function to generate a unique ID for a donor
const generateDonorId = (name) => {
    const hash = crypto.createHash('sha256');
    hash.update(name + new Date().getTime().toString() + Math.random().toString());
    return 'DNR-' + hash.digest('hex').substring(0, 8).toUpperCase();
};

// Helper function to generate a unique ID for a donation
const generateDonationId = (donorId) => {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 7);
    return `DON-${donorId}-${timestamp}-${randomPart}`.toUpperCase();
};

// @route   GET /api/admin/donations
// @desc    Get all donations for the admin requests page
// @access  Private (Admin only)
router.get('/donations', [auth, adminAuth], async (req, res) => {
    try {
        const allDonations = await Donation.find({})
            .populate('donor', ['name', 'email'])
            .sort({ createdAt: -1 });
        res.json(allDonations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/history
// @desc    Get donations older than 30 days for history
// @access  Private (Admin only)
router.get('/history', [auth, adminAuth], async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const oldDonations = await Donation.find({ createdAt: { $lt: thirtyDaysAgo } })
            .populate('donor', ['name', 'email'])
            .sort({ createdAt: -1 });
        res.json(oldDonations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/pending-donations
// @desc    Get all donations awaiting approval
// @access  Private (Admin only)
router.get('/pending-donations', [auth, adminAuth], async (req, res) => {
    try {
        const pendingDonations = await Donation.find({ status: 'pending_approval' })
            .populate('donor', ['name', 'email', 'phone_number']) // Populate with donor's info
            .populate('receiver_id', ['name', 'location']) // Populate with receiver's info
            .sort({ createdAt: -1 });

        res.json(pendingDonations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/admin/donations/:id/approve
// @desc    Approve a donation, generate IDs if necessary
// @access  Private (Admin only)
router.post('/donations/:id/approve', [auth, adminAuth], async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id).populate('donor');
        if (!donation) {
            return res.status(404).json({ msg: 'Donation not found' });
        }

        if (donation.status !== 'pending_approval') {
            return res.status(400).json({ msg: 'Donation is not pending approval' });
        }

        const donor = donation.donor;

        // If the donor doesn't have a donorId yet (first approved donation)
        if (!donor.donorId) {
            donor.donorId = generateDonorId(donor.name);
        }

        // Generate a unique donationId
        donation.donationId = generateDonationId(donor.donorId);
        donation.status = 'pending'; // Move to the next stage

        await donor.save();
        await donation.save();

        res.json({
            msg: 'Donation approved successfully.',
            donorId: donor.donorId,
            donationId: donation.donationId,
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/admin/donations/:id/reject
// @desc    Reject a donation
// @access  Private (Admin only)
router.post('/donations/:id/reject', [auth, adminAuth], async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id);
        if (!donation) {
            return res.status(404).json({ msg: 'Donation not found' });
        }

        if (donation.status !== 'pending_approval') {
            return res.status(400).json({ msg: 'Donation is not pending approval' });
        }

        donation.status = 'rejected';
        await donation.save();

        res.json({ msg: 'Donation has been rejected.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
