const connection = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISTER
const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        connection.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword],
            (err, result) => {
                if (err) {
                    console.error('Insert error:', err);
                    return res.status(500).json({ message: 'Database error.' });
                }
                res.status(201).json({ message: 'Registered successfully.' });
            }
        );
    } catch (error) {
        console.error('Hashing error:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};


// LOGIN
const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    connection.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        async (err, results) => {
            if (err) {
                console.error('Query error:', err);
                return res.status(500).json({ message: 'Database error.' });
            }

            if (results.length === 0) {
                return res.status(400).json({ message: 'Invalid email or password.' });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password.' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            if (!token) {
                return res.status(500).json({ success: false, message: 'Token generation failed' });
            }

            // ✅ Send user info without role
            res.status(200).json({
                message: 'Login successful.',
                user: {
                    id: user.id,
                    email: user.email,
                    token
                }
            });
        }
    );
};



// LOGOUT
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Error logging out.' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out successfully.' });
    });
};

module.exports = { register, login, logout };