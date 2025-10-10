const connection = require('../config/db');
const path = require('path');

// Get user profile
const getProfile = (req, res) => {
    const userId = req.user.id;

    connection.query(
        'SELECT id, name, email, profile_photo, contact_number, address FROM users WHERE id = ?',
        [userId],
        (err, results) => {
            if (err) {
                console.error('Profile fetch error:', err);
                return res.status(500).json({ message: 'Database error.' });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }
            res.status(200).json({ user: results[0] });
        }
    );
};

// Update user profile
const updateProfile = (req, res) => {
    const userId = req.user.id;
    const { name, contact_number, address } = req.body;

    if (!contact_number || !address) {
        return res.status(400).json({ message: 'Contact number and address are required.' });
    }

    connection.query(
        'UPDATE users SET name = ?, contact_number = ?, address = ? WHERE id = ?',
        [name, contact_number, address, userId],
        (err, result) => {
            if (err) {
                console.error('Profile update error:', err);
                return res.status(500).json({ message: 'Database error.' });
            }
            res.status(200).json({ message: 'Profile updated successfully.' });
        }
    );
};

// Upload user profile photo
const uploadProfilePhoto = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    const userId = req.user.id;
    const photoPath = `/uploads/${req.file.filename}`;

    connection.query(
        'UPDATE users SET profile_photo = ? WHERE id = ?',
        [photoPath, userId],
        (err, result) => {
            if (err) {
                console.error('Photo upload error:', err);
                return res.status(500).json({ message: 'Database error.' });
            }
            res.status(200).json({ message: 'Profile photo updated.', profile_photo: photoPath });
        }
    );
};

module.exports = { getProfile, updateProfile, uploadProfilePhoto };


