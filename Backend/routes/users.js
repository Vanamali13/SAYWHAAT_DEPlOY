
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');
const axios = require('axios');
const nodemailer = require('nodemailer');

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
    const { name, email, phone_number, password, role } = req.body;

    if (!email && !phone_number) {
        return res.status(400).json({ msg: 'Please provide either email or phone number' });
    }

    try {
        let query = {};
        if (email) query.email = email;
        if (phone_number) query.phone_number = phone_number;

        // Ideally check them separately to give specific error, but $or works for "already exists" generic
        let checkQuery = [];
        if (email) checkQuery.push({ email });
        if (phone_number) checkQuery.push({ phone_number });

        let user = await User.findOne({ $or: checkQuery });
        if (user) {
            return res.status(400).json({ msg: 'User with this email or phone already exists' });
        }

        user = new User({
            name,
            password,
            role
        });

        if (email) user.email = email;
        if (phone_number) {
            user.phone_number = phone_number;
            // If signing up with phone, we can assume it's verified via OTP flow later, 
            // BUT traditionally we verify AFTER signup. 
            // For simplify, we start unverified.
        }

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
            // Update existing user to be verified if not already (since they logged in securely with Google)
            if (!user.isEmailVerified) {
                user.isEmailVerified = true;
                await user.save();
            }

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
                isSocialLogin: true,
                isEmailVerified: true // Auto-verify email from Google
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
            .limit(5);
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
            .sort({ createdAt: -1 });
        res.json(donations);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// PUT /api/users/me - Update current user details
router.put('/me', auth, async (req, res) => {
    const { name, email, phone_number, address } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (name) user.name = name;
        if (email) user.email = email; // Allow updating email (e.g. if sparse/missing)
        if (phone_number) user.phone_number = phone_number;
        if (address) user.address = address;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'Email or Mobile number already in use by another account.' });
        }
        res.status(500).send('Server Error');
    }
});

// DELETE /api/users/me - Delete current user account
router.delete('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Optional: cascaded delete of user's data can go here
        // For now, we just delete the user record.
        await User.findByIdAndDelete(req.user.id);

        res.json({ msg: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/users/send-otp - Generate and send OTP
router.post('/send-otp', async (req, res) => {
    const { identifier, isSignup, name, role } = req.body; // mobile or email, isSignup flag
    if (!identifier) return res.status(400).json({ msg: 'Please provide email or phone number' });

    try {
        // Find user by email or phone
        let query = {};
        if (identifier.includes('@')) {
            query = { email: identifier };
        } else {
            query = { phone_number: identifier };
        }

        let user = await User.findOne(query);

        if (!user) {
            if (isSignup) {
                // Create new user stub for verification
                // Minimal user creation
                if (!role) return res.status(400).json({ msg: 'Role is required for signup' });
                if (!name) return res.status(400).json({ msg: 'Name is required for signup' });

                user = new User({
                    name,
                    role,
                    // If identifier is email, set email. If phone, set phone.
                    email: identifier.includes('@') ? identifier : undefined,
                    phone_number: !identifier.includes('@') ? identifier : undefined,
                });
                // No password set yet (or strictly optional)
            } else {
                return res.status(404).json({ msg: 'User not found' });
            }
        } else {
            // If user exists and we are trying to signup, check if verified
            if (isSignup) {
                // If verified, throw error "User already exists"
                if (identifier.includes('@') && user.isEmailVerified) return res.status(400).json({ msg: "User already exists. Please login." });
                if (!identifier.includes('@') && user.isPhoneVerified) return res.status(400).json({ msg: "User already exists. Please login." });

                // If unverified, we proceed to resend OTP (and maybe update name/role)
                if (name) user.name = name;
                if (role) user.role = role;
            }
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        // Save to DB
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP
        const isEmail = identifier.includes('@');

        if (isEmail) {
            // Email Logic
            const emailUser = process.env.EMAIL_USER;
            // Sanitize password (remove spaces often present in App Passwords)
            const rawPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
            const emailPass = rawPass ? rawPass.replace(/\s+/g, '') : null;

            console.log(`[DEBUG] Email Config Check - User: ${!!emailUser}, Pass: ${!!emailPass}`);

            if (emailUser && emailPass) {
                try {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail', // or configurable host
                        auth: {
                            user: emailUser,
                            pass: emailPass
                        }
                    });

                    await transporter.sendMail({
                        from: emailUser,
                        to: identifier,
                        subject: 'Your Verification Code',
                        text: `Your OTP is: ${otp}. It expires in 10 minutes.`
                    });
                    console.log(`[EMAIL SENT] Sent OTP to ${identifier}`);
                } catch (emailErr) {
                    console.error("[EMAIL ERROR] Failed to send email:", emailErr.message);
                    if (emailErr.code === 'EAUTH') console.error("Check your Email + App Password. Make sure 2FA is ON and you are using an App Password.");
                    console.log(`[EMAIL FALLBACK] OTP for ${identifier} is: ${otp}`);
                }
            } else {
                console.log(`[EMAIL SIMULATION] Config Missing. User: ${emailUser ? 'Set' : 'Missing'}, Pass: ${emailPass ? 'Set' : 'Missing'}`);
                console.log(`[EMAIL SIMULATION] OTP for ${identifier} is: ${otp}`);
            }
        } else {
            // SMS Logic (Fast2SMS)
            if (process.env.FAST2SMS_API_KEY) {
                try {
                    // Determine if it's a phone number (simple check, assuming 10 digits in India)
                    // Fast2SMS expects just the number (e.g. 9999999999). 
                    // We strip non-digits.
                    const phone = identifier.replace(/\D/g, '').slice(-10);

                    if (phone.length === 10) {
                        const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', {
                            "route": "otp",
                            "variables_values": otp,
                            "numbers": phone,
                        }, {
                            headers: {
                                "authorization": process.env.FAST2SMS_API_KEY
                            }
                        });

                        if (response.data && response.data.return === false) {
                            throw new Error(`Fast2SMS API Error: ${response.data.message}`);
                        }

                        console.log(`[SMS SENT] Sent OTP to ${phone} via Fast2SMS. Response:`, response.data);
                    } else {
                        console.log(`[SMS SKIPPED] Identifier ${identifier} is likely not a valid Indian mobile number. Logging OTP: ${otp}`);
                    }
                } catch (smsErr) {
                    console.error("[SMS ERROR] Failed to send SMS via Fast2SMS:", smsErr.response?.data || smsErr.message);
                    console.log(`[SMS FALLBACK] OTP for ${identifier} is: ${otp}`);
                }
            } else {
                // Simulate Sending OTP (Fallback)
                console.log(`[OTP SERVICE] OTP for ${identifier} is: ${otp}`);
            }
        }

        res.json({ msg: 'OTP sent successfully', dev_note: 'Check server console (SIMULATED or SMS)' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /api/users/verify-otp - Verify OTP and Login/Verify Phone
router.post('/verify-otp', async (req, res) => {
    const { identifier, otp, context } = req.body; // context = 'login' or 'verification'

    if (!identifier || !otp) return res.status(400).json({ msg: 'Missing parameters' });

    try {
        let query = {};
        const isEmail = identifier.includes('@');
        if (isEmail) {
            query = { email: identifier };
        } else {
            query = { phone_number: identifier };
        }

        // We need to select OTP fields explicitly
        const user = await User.findOne(query).select('+otp +otpExpires');

        if (!user) return res.status(400).json({ msg: 'Invalid Request' });

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ msg: 'OTP Expired' });
        }

        // OTP Valid
        // Clear OTP
        user.otp = undefined;
        user.otpExpires = undefined;

        if (context === 'verification') {
            // Forced verification context
            if (isEmail) user.isEmailVerified = true;
            else user.isPhoneVerified = true;
        } else {
            // Login context - implicitly verifies the used channel
            if (isEmail) user.isEmailVerified = true;
            else user.isPhoneVerified = true;
        }

        await user.save();

        // If context is login, return token
        if (context === 'login') {
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
                    res.json({ token, msg: 'Login matched' });
                }
            );
        } else {
            res.json({ msg: 'Phone number verified successfully' });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
