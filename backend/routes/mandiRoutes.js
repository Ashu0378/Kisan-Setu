const express = require('express');
const router = express.Router();
const { getMandiPrices, getLatestPrices, addMandiPrice } = require('../controllers/mandiController');
const { protect } = require('../middleware/auth');

router.get('/', getMandiPrices);         // Public
router.get('/latest', getLatestPrices);  // Public
router.post('/', protect, addMandiPrice); // Protected

module.exports = router;
