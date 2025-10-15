const connection = require('../config/db');

// ✅ Save history
const saveTtsHistory = (req, res) => {
    const { user_id, text_content, engine_used } = req.body;

    if (!user_id || !text_content || !engine_used) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    const query = `
        INSERT INTO tts_history (user_id, text_content, engine_used)
        VALUES (?, ?, ?)
    `;

    connection.execute(query, [user_id, text_content, engine_used], (err, results) => {
        if (err) {
            console.error('Error saving TTS history:', err);
            return res.status(500).json({ message: 'Database error.' });
        }

        return res.status(201).json({
            message: 'TTS history saved successfully.'
        });
    });
};

// ✅ Get history by user
const getTtsHistoryByUser = (req, res) => {
    const { user_id } = req.params;

    const query = `
        SELECT text_content, engine_used, created_at
        FROM tts_history
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    connection.execute(query, [user_id], (err, results) => {
        if (err) {
            console.error('Error fetching TTS history:', err);
            return res.status(500).json({ message: 'Database error.' });
        }

        res.json(results);
    });
};

module.exports = {
    saveTtsHistory,
    getTtsHistoryByUser
};
