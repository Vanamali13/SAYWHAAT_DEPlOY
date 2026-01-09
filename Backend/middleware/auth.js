const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const bearerToken = authHeader.substring(7, authHeader.length);
            if (bearerToken) {
                try {
                    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET || 'your_jwt_secret');
                    req.user = decoded.user;
                    return next();
                } catch (err) {
                    return res.status(401).json({ msg: 'Token is not valid' });
                }
            }
        }
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
