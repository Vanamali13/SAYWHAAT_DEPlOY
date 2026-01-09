const mongoose = require('mongoose');
const DonationProofSchema = new mongoose.Schema({
    donation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
    file_url: { type: String, required: true },
    proof_type: { type: String, enum: ['photo', 'video'] },
    quality_score: Number,
    uploaded_by: String,
    upload_notes: String,
    is_selected: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('DonationProof', DonationProofSchema);