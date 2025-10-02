const express = require('express');
const router = express.Router();
const { adminDashboard } = require('../controllers/AdminController');

// Admin dashboard route
router.get('/admin/dashboard', adminDashboard);

module.exports = router;