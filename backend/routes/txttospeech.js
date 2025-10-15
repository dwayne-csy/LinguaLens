const express = require('express');
const router = express.Router();
const { saveTtsHistory, getTtsHistoryByUser } = require('../controllers/TxttoSpeechController');

router.post('/tts-history', saveTtsHistory);
router.get('/tts-history/:user_id', getTtsHistoryByUser);

module.exports = router;
