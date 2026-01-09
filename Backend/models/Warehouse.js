const mongoose = require('mongoose');

const WarehouseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: [Number] // [longitude, latitude]
    },
    contact_number: String,
    manager_name: String
}, { timestamps: true });

WarehouseSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Warehouse', WarehouseSchema);
