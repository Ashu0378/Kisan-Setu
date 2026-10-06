const express = require('express');
const router = express.Router();
const {
  getCropPlans, getCropPlan, createCropPlan, updateCropPlan, deleteCropPlan
} = require('../controllers/cropPlanController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getCropPlans).post(createCropPlan);
router.route('/:id').get(getCropPlan).put(updateCropPlan).delete(deleteCropPlan);

module.exports = router;
