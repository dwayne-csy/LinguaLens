const express = require('express');
const { getProfile, updateProfile, uploadProfilePhoto } = require('../controllers/ProfileController');
const verifyToken = require('../middlewares/auth');
const upload = require('../utils/multer');
const router = express.Router();

router.get('/', verifyToken, getProfile); 
router.put('/', verifyToken, updateProfile);
router.put('/upload-photo', verifyToken, upload.single('profile_photo'), uploadProfilePhoto);

module.exports = router;