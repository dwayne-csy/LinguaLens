// routes/translatorRoutes.js
const express = require('express');
const router = express.Router();
const { translateText } = require('../controllers/translatorController'); // <- updated controller

router.post('/translate', translateText);

module.exports = router;
