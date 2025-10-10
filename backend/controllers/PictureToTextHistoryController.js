const connection = require('../config/db');

// Fetch history of extracted texts
const getHistory = (req, res) => {
  connection.execute(
    'SELECT id, filename, text_content, created_at FROM extracted_texts ORDER BY created_at DESC',
    (err, results) => {
      if (err) {
        console.error('Error fetching history:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(results);
    }
  );
};

module.exports = { getHistory };
