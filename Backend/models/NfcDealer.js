const mongoose = require('mongoose');

const NfcDealerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number] // [longitude, latitude]
    },
    rate_per_tag: { type: Number, required: true }, // Cost per single NFC tag
    contact_number: String,
    amazon_link: String, // Affiliate or direct link
    flipkart_link: String // Affiliate or direct link
}, { timestamps: true });

NfcDealerSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('NfcDealer', NfcDealerSchema);
