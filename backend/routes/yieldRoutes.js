const express = require('express');
const router = express.Router();
const { getYieldPredictions, saveYieldPrediction, deleteYieldPrediction } = require('../controllers/yieldController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getYieldPredictions).post(saveYieldPrediction);
router.delete('/:id', deleteYieldPrediction);

module.exports = router;
