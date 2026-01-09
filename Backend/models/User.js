const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    donorId: {
        type: String,
        unique: true,
        sparse: true // Allows null values for non-donors without violating unique constraint
    },
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true }, // Verified email is key
    isEmailVerified: { type: Boolean, default: false },
    password: { type: String, required: false }, // Optional for mobile-only signup
    role: {
        type: String,
        enum: ['Donor', 'Batch staff', 'Administrator'],
        required: true
    },
    phone_number: { type: String, unique: true, sparse: true },
    isPhoneVerified: { type: Boolean, default: false },
    otp: { type: String, select: false }, // Don't return OTP in queries by default
    otpExpires: { type: Date, select: false },
    address: { type: String },
    total_donations: { type: Number, default: 0 },
    total_amount_donated: { type: Number, default: 0 },
}, { timestamps: true });

// The pre-save hook has been removed as per the new requirements.
// donorId will now be assigned by an admin upon first donation approval.

module.exports = mongoose.model('User', UserSchema);