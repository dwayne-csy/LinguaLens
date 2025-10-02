const express = require('express');
const { register, login, logout } = require('../controllers/UserController');
const admin = require('../middlewares/admin');
const user = require('../middlewares/user');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', user, logout);

module.exports = router;
