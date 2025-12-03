const mongoose = require('mongoose');

const PoolSchema = new mongoose.Schema({
    poolId: {
        type: String,
        unique: true,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    target_amount: Number,
    current_amount: {
        type: Number,
        default: 0
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Pool', PoolSchema);
