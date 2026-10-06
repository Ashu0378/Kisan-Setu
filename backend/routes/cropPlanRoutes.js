const express = require('express');
const router = express.Router();
const {
  recommendCrops,
  findNearestLab,
  getCropPlans,
  getCropPlan,
  createCropPlan,
  updateCropPlan,
  deleteCropPlan,
} = require('../controllers/cropPlanController');
const { protect } = require('../middleware/auth');

// Public/Optional auth for AI recommendation & lab search
router.post('/recommend', recommendCrops);
router.post('/nearest-lab', findNearestLab);

// Protected routes for saving and reading crop plans
router.use(protect);
router.route('/').get(getCropPlans).post(createCropPlan);
router.route('/:id').get(getCropPlan).put(updateCropPlan).delete(deleteCropPlan);

module.exports = router;
