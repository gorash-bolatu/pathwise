require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('❌ No token provided');
        return res.status(403).json({ message: 'Token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('❌ Token verification failed:', err.message);
            return res.status(403).json({ message: 'Token invalid' });
        }

        req.user = user;
        next();
    });
};
