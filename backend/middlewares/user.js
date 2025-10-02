// middlewares/auth.js

const auth = (req, res, next) => {
    // Adjust based on how you store user data
    const user = req.session?.user || req.user;

    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    req.user = user; // Attach user data for later use
    next();
};

module.exports = auth;
