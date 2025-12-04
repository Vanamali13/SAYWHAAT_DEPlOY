
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth'); // We will create this middleware

// GET /api/users - List all users (for admin dashboard/lists)
router.get('/', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/donors/register - Register a new donor
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password,
            role
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id,
                role: user.role
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST /api/donors/login - Authenticate donor and get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// GET /api/users/me - Get current user details (for AuthContext)
router.get('/me', auth, async (req, res) => {
    try {
        // req.user.id comes from the auth middleware
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/users/dashboard - Efficient dashboard data for a user
router.get('/dashboard', auth, async (req, res) => {
    try {
        // req.user.id is from the auth middleware
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            // This case might happen if the user was deleted but the token is still valid
            return res.status(404).json({ msg: 'User not found' });
        }

        // Get stats
        const donations = await Donation.find({ donor_id: user._id });
        const stats = {
            totalDonations: donations.length,
            totalAmount: donations.reduce((sum, d) => sum + (d.amount || 0), 0),
            // These stats might need more complex queries in the future
            peopleHelped: 0,
            confirmedDeliveries: 0,
        };

        // Get recent donations
        const recentDonations = await Donation.find({ donor_id: user._id })
            .sort({ createdAt: -1 }) // Use createdAt for more reliable sorting
            .limit(5)
            .populate('receiver_id'); // Populate receiver details

        res.json({
            // The frontend expects a 'donor' object, so we'll alias 'user'
            donor: user,
            stats,
            recentDonations,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// GET /api/users/donations - Get all donations for the current user
router.get('/donations', auth, async (req, res) => {
    try {
        const donations = await Donation.find({ donor: req.user.id })
            .sort({ createdAt: -1 })
            .populate('receiver_id'); // Keep populating for now, though receiver might be null
        res.json(donations);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});




// PUT /api/users/me - Update current user details
router.put('/me', auth, async (req, res) => {
    const { name, phone_number } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (name) user.name = name;
        if (phone_number) user.phone_number = phone_number;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
