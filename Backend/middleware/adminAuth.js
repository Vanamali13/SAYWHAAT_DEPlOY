const User = require('../models/User');

const isAdmin = async (req, res, next) => {
    try {
        // req.user is expected to be set by a preceding authentication middleware (e.g., verifyToken)
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.role !== 'Administrator') {
            return res.status(403).json({ message: 'Forbidden: Administrator access required.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Error verifying admin status.', error: error.message });
    }
};

module.exports = isAdmin;
