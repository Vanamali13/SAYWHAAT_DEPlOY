require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

console.log('Testing connection to:', MONGO_URI.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB Atlas!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection failed:', err.message);
        process.exit(1);
    });