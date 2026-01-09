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
    // receiver_id removed per user request
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
    wish_message: String, // Message to be imprinted on NFC tag
    scheduled_delivery: Date,
    actual_delivery: Date,
    proof_sent: { type: Boolean, default: false },
    address: String, // Pickup address provided by donor

    warehouse_info: {
        name: String,
        address: String,
        contact: String,
        location: {
            coordinates: [Number]
        }
    },
    nfc_info: {
        dealer_name: String,
        dealer_address: String,
        cost_per_tag: Number,
        total_cost: Number,
        amazon_link: String,
        flipkart_link: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Donation', DonationSchema);