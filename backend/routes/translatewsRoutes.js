const express = require('express');
const router = express.Router();
const { translateText } = require('../controllers/translatewsController');

router.post('/translate', translateText);

module.exports = router;
