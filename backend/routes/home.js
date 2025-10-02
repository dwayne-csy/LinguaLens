const express = require('express');
const router = express.Router();
const { homePage } = require('../controllers/HomeController');

router.get('/home', homePage);

module.exports = router;