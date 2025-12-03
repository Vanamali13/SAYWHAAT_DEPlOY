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
    donation_type: String,
    amount: Number,
    items: [{ name: String, quantity: Number, category: String }],
    status: {
        type: String,
        enum: ['pending_approval', 'rejected', 'pending', 'in_transit', 'delivered', 'confirmed'],
        default: 'pending_approval'
    },
    delivery_notes: String,
    scheduled_delivery: Date,
    actual_delivery: Date,
    proof_sent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Donation', DonationSchema);