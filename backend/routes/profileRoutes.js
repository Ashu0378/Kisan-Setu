const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

router.use(protect); // All profile routes require auth

router.route('/').get(getProfile).put(updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
