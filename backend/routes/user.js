const express = require('express');
const { register, login, logout } = require('../controllers/UserController');
const verifyToken = require('../middlewares/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', verifyToken, logout);

module.exports = router;
