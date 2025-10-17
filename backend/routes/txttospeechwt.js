// LinguaLens/backend/routes/txttospeechwt.js
const express = require('express');
const router = express.Router();
const { handleTtsWithTranslate } = require('../controllers/TxttoSpeechWTController');

// Minimal POST endpoint (currently returns 204). Frontend handles translate+TTS.
router.post('/speak-with-translate', handleTtsWithTranslate);

module.exports = router;
