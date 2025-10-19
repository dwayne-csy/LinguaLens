// routes/pictureToTextTranslatorRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');
const { extractAndTranslate } = require('../controllers/PictureToTextTranslatorController');

router.post('/upload', upload.single('image'), extractAndTranslate);

module.exports = router;

