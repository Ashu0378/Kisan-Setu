const express = require('express');
const router = express.Router();
const { getSchemes, getMatchedSchemes } = require('../controllers/schemeController');
const { protect } = require('../middleware/auth');

router.get('/', getSchemes);               // Public - browse all schemes
router.get('/match', protect, getMatchedSchemes); // Private - personalized matches

module.exports = router;
