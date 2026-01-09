const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Adjust path as script is in scripts/

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sayWhattDB';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        try {
            await mongoose.connection.collection('receivers').drop();
            console.log('Successfully dropped "receivers" collection.');
        } catch (err) {
            if (err.code === 26) {
                console.log('"receivers" collection does not exist.');
            } else {
                console.error('Error dropping collection:', err);
            }
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
