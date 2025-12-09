const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    donationId: { // The new unique ID for the donation itself
        type: String,
        unique: true,
        sparse: true
    },
    donor: { // Changed from donor_id and donor_email to a direct reference
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Receiver', required: false },
    pool: { type: mongoose.Schema.Types.ObjectId, ref: 'Pool' },
    donation_type: String,
    amount: Number,
    items: [{
        name: String,
        quantity: Number,
        category: String,
        distributed: { type: Number, default: 0 } // Track how many of this item have been put into batches
    }],
    status: {
        type: String,
        enum: ['pending_approval', 'rejected', 'pending', 'in_transit', 'delivered', 'confirmed'],
        default: 'pending_approval'
    },
    delivery_notes: String,
    scheduled_delivery: Date,
    actual_delivery: Date,
    proof_sent: { type: Boolean, default: false },
    address: String, // Pickup address provided by donor
    assigned_staff: [{ // Staff assigned to collect/process this donation
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    collection_status: {
        type: String,
        enum: ['pending', 'assigned', 'collected'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Donation', DonationSchema);