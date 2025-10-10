const express = require('express');
const router = express.Router();
const { getHistory } = require('../controllers/PictureToTextHistoryController');
// const verifyToken = require('../middlewares/auth'); // JWT middleware

// Route to get history (protected)
router.get('/', getHistory);

module.exports = router;
