const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');
const { extractText } = require('../controllers/PictureToTextController');
// const verifyToken = require('../middlewares/auth'); // JWT middleware

// Protect the upload route with JWT
router.post('/upload', upload.single('image'), extractText);

module.exports = router;
