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
            .sort({ createdAt: -1 });

        res.json(pendingDonations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const Pool = require('../models/Pool');
const Notification = require('../models/Notification');
const Batch = require('../models/Batch');
const Warehouse = require('../models/Warehouse');
const NfcDealer = require('../models/NfcDealer');

// ... (existing imports)

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

        // --- NEW: Assign Logistics & NFC Info ---
        try {
            // 1. Fetch Warehouses and Dealers (Simulating "Nearest" logic)
            // In a real app, we would geocode donation.address and use $near query
            const warehouse = await Warehouse.findOne();
            const dealer = await NfcDealer.findOne();

            if (warehouse) {
                donation.warehouse_info = {
                    name: warehouse.name,
                    address: warehouse.address,
                    contact: warehouse.contact_number,
                    location: warehouse.location
                };
            }

            if (dealer) {
                // Calculate total items
                const totalItems = donation.items.reduce((acc, item) => acc + (item.quantity || 0), 0);
                const totalCost = totalItems * dealer.rate_per_tag;

                donation.nfc_info = {
                    dealer_name: dealer.name,
                    dealer_address: dealer.address,
                    cost_per_tag: dealer.rate_per_tag,
                    total_cost: totalCost,
                    amazon_link: dealer.amazon_link,
                    flipkart_link: dealer.flipkart_link
                };
            }
        } catch (logisticsErr) {
            console.error("Error assigning logistics:", logisticsErr);
            // Don't fail the approval if this optional part fails, just log it
        }
        // ----------------------------------------

        // Update Pool if assigned
        if (donation.pool) {
            const pool = await Pool.findById(donation.pool);
            if (pool) {
                pool.current_amount += donation.amount;
                // Add donor to members if not already present
                if (!pool.members.includes(donor._id)) {
                    pool.members.push(donor._id);
                }

                // Check if pool target reached (optional logic, can be added later)

                await pool.save();

                // Notify Admin about new pool member
                // Assuming the current user (req.user.id) is the admin approving it, 
                // but we might want to notify ALL admins or just log it.
                // For now, let's create a notification for the admin who approved it.
                await Notification.create({
                    recipient: req.user.id,
                    message: `New member ${donor.name} added to pool "${pool.title}" with donation of $${donation.amount}.`,
                    type: 'success'
                });

                // Notify Donor about confirmation
                await Notification.create({
                    recipient: donor._id,
                    message: `Your donation of $${donation.amount} has been approved and confirmed for pool: "${pool.title}".`,
                    type: 'success'
                });
            }
        }

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

// @route   GET /api/admin/available-items
// @desc    Get all garment items available for batching
// @access  Private (Admin only)
router.get('/available-items', [auth, adminAuth], async (req, res) => {
    try {
        // Find donations that are approved (status 'pending' or 'confirmed') and are garments
        const donations = await Donation.find({
            status: { $in: ['pending', 'confirmed'] },
            donation_type: { $regex: /garments/i } // Case insensitive match
        }).populate('donor', 'name email');

        let availableItems = [];

        donations.forEach(donation => {
            if (donation.items && donation.items.length > 0) {
                donation.items.forEach(item => {
                    const distributed = item.distributed || 0;
                    const remaining = item.quantity - distributed;

                    if (remaining > 0) {
                        availableItems.push({
                            donation_id: donation._id,
                            item_id: item._id,
                            donor_name: donation.donor ? donation.donor.name : 'Unknown Donor',
                            donor_email: donation.donor ? donation.donor.email : 'N/A',
                            item_name: item.name,
                            category: item.category,
                            total_quantity: item.quantity,
                            remaining_quantity: remaining,
                            distributed: distributed
                        });
                    }
                });
            }
        });

        res.json(availableItems);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/batch-staff
// @desc    Get all batch staff users
// @access  Private (Admin only)
router.get('/batch-staff', [auth, adminAuth], async (req, res) => {
    try {
        const query = { role: 'Batch staff' };
        // Removed conflict logic based on collection_status
        const staff = await User.find(query).select('name email _id');
        res.json(staff);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/admin/create-batch
// @desc    Create a new batch and assign items
// @access  Private (Admin only)
router.post('/create-batch', [auth, adminAuth], async (req, res) => {
    const { items, assigned_to, notes } = req.body;

    try {
        const batchItems = [];

        for (const batchItem of items) {
            const donation = await Donation.findById(batchItem.donation_id);
            if (!donation) {
                return res.status(404).json({ msg: `Donation not found for item ${batchItem.item_name}` });
            }

            const item = donation.items.id(batchItem.item_id); // Use Mongoose subdocument .id() method
            if (!item) {
                return res.status(404).json({ msg: `Item ${batchItem.item_name} not found in donation` });
            }

            const currentDistributed = item.distributed || 0;
            // Validate: requested quantity vs available
            // Note: batchItem.quantity is what we want to add to this batch
            if ((currentDistributed + batchItem.quantity) > item.quantity) {
                return res.status(400).json({ msg: `Not enough quantity for ${item.name}. Available: ${item.quantity - currentDistributed}` });
            }

            // Update distributed count
            item.distributed = currentDistributed + batchItem.quantity;
            await donation.save();

            // Populate donor info for the Batch record
            let donorName = 'Unknown';
            if (donation.donor) {
                const donor = await User.findById(donation.donor);
                if (donor) donorName = donor.name;
            }

            batchItems.push({
                donation_id: donation._id,
                item_name: item.name,
                quantity: batchItem.quantity,
                donor_name: donorName
            });
        }

        const batchId = 'BATCH-' + Date.now().toString(36).toUpperCase();

        const newBatch = new Batch({
            batchId,
            assigned_to,
            status: assigned_to ? 'assigned' : 'created',
            items: batchItems,
            notes
        });

        await newBatch.save();

        res.json(newBatch);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



// @route   GET /api/admin/donors/:id
// @desc    Get specific donor details and their donation history
// @access  Private (Admin only)
router.get('/donors/:id', [auth, adminAuth], async (req, res) => {
    try {
        const donor = await User.findById(req.params.id).select('-password');
        if (!donor) {
            return res.status(404).json({ msg: 'Donor not found' });
        }

        const donations = await Donation.find({ donor: req.params.id }).sort({ createdAt: -1 });

        res.json({ donor, donations });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Donor not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/staff/:id
// @desc    Get specific staff details and their assigned batches
// @access  Private (Admin only)
router.get('/staff/:id', [auth, adminAuth], async (req, res) => {
    try {
        const staff = await User.findById(req.params.id).select('-password');
        if (!staff) {
            return res.status(404).json({ msg: 'Staff member not found' });
        }

        const batches = await Batch.find({ assigned_to: req.params.id }).sort({ createdAt: -1 });

        res.json({ staff, batches });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Staff member not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
