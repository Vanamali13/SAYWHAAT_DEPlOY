const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const util = require('util');
const log_file = fs.createWriteStream(__dirname + '/backend_debug.log', { flags: 'a' });
const log_stdout = process.stdout;

console.error = function (d) { //
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};
console.log = function (d) { //
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};

const app = express();
const PORT = process.env.PORT || 5002; // Port configuration

// Middleware
app.use(cors());
app.use(express.json());
// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// DB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sayWhattDB';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));


// API Routes
app.use('/api/donations', require('./routes/donations'));
// Receiver route removed per user request
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/pools', require('./routes/pools'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/batches', require('./routes/batches'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/utils', require('./routes/utils'));

app.get('/', (req, res) => {
    res.send('Say Whatt Backend is running!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});