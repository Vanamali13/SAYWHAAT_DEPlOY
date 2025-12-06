
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');

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

// POST /api/donors/social-login - Login or Register with Google
router.post('/social-login', async (req, res) => {
    const { email, name, providerId, role } = req.body;
    console.log('Social Login Request Body:', req.body); // DEBUG LOG

    try {
        let user = await User.findOne({ email });

        if (user) {
            // User exists, generate token
            const payload = {
                user: {
                    id: user.id,
                    role: user.role
                }
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
        } else {
            // New user
            // If role is not provided, we cannot register them yet.
            if (!role) {
                return res.status(404).json({ msg: 'User not found. Please sign up to select your role.', requiresSignup: true });
            }

            // Generate a random password since they won't use it
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

            user = new User({
                name: name || 'Social User',
                email,
                password: randomPassword,
                role: role, // Use provided role
                isSocialLogin: true
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(randomPassword, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id,
                    role: user.role
                }
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
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST /api/donors/login - Authenticate donor and get token
router.post('/login', async (req, res) => {
    const { email, password, phone_number } = req.body;

    // Allow login with either email or phone_number
    const identifier = email || phone_number;

    if (!identifier) {
        return res.status(400).json({ msg: 'Please provide email or phone number' });
    }

    try {
        let query = {};
        const isEmail = identifier.includes('@');

        if (isEmail) {
            query = { email: identifier };
        } else {
            query = { phone_number: identifier };
        }

        let user = await User.findOne(query);
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
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Get stats
        console.log(`[Dashboard] Fetching donations for donor: ${req.user.id}`);
        const donations = await Donation.find({ donor: new mongoose.Types.ObjectId(req.user.id) }).populate('pool');
        console.log(`[Dashboard] Found ${donations.length} donations`);

        // Calculate Impact Created
        const poolContributions = {};
        donations.forEach(d => {
            if (d.pool && d.pool.target_amount > 0) {
                if (!poolContributions[d.pool._id]) {
                    poolContributions[d.pool._id] = {
                        amount: 0,
                        target: d.pool.target_amount
                    };
                }
                poolContributions[d.pool._id].amount += (d.amount || 0);
            }
        });

        let totalPercentage = 0;
        const poolsCount = Object.keys(poolContributions).length;
        for (const poolId in poolContributions) {
            const { amount, target } = poolContributions[poolId];
            totalPercentage += (amount / target) * 100;
        }
        const impactCreated = poolsCount > 0 ? (totalPercentage / poolsCount).toFixed(1) : 0;

        const stats = {
            totalDonations: donations.length,
            totalAmount: donations.reduce((sum, d) => sum + (d.amount || 0), 0),
            impactCreated: impactCreated,
            confirmedDeliveries: donations.filter(d => d.status === 'confirmed').length,
        };

        // Get recent donations
        const recentDonations = await Donation.find({ donor: new mongoose.Types.ObjectId(req.user.id) })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('receiver_id');
        res.json({
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
            .populate('receiver_id');
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
