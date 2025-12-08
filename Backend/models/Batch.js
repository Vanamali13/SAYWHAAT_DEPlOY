const mongoose = require('mongoose');

const BatchSchema = new mongoose.Schema({
    batchId: {
        type: String,
        unique: true,
        required: true
    },
    assigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Can be created without immediate assignment if needed, though UI enforces it
    },
    status: {
        type: String,
        enum: ['created', 'assigned', 'in_transit', 'delivered'],
        default: 'created'
    },
    items: [{
        donation_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Donation',
            required: true
        },
        item_name: String, // Snapshot of item name
        quantity: Number, // Quantity in this batch
        donor_name: String // Snapshot of donor name for easy display
    }],
    notes: {
        type: String
    },
    proofs: [{
        type: String // URLs of uploaded proof images/videos
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Batch', BatchSchema);
