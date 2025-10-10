const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    console.log(req.headers);
    const authHeader = req.headers['authorization']; // <-- lowercase

    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    console.log(token)
    if (!token) {
        return res.status(401).json({ error: 'Invalid token format' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // store user data in request
        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

module.exports = verifyToken;