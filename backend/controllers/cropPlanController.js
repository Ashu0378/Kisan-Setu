const CropPlan = require('../models/CropPlan');

// @desc    Get all crop plans for logged-in user
// @route   GET /api/crop-plans
// @access  Private
const getCropPlans = async (req, res, next) => {
  try {
    const plans = await CropPlan.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: plans.length, data: plans });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single crop plan
// @route   GET /api/crop-plans/:id
// @access  Private
const getCropPlan = async (req, res, next) => {
  try {
    const plan = await CropPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Crop plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new crop plan
// @route   POST /api/crop-plans
// @access  Private
const createCropPlan = async (req, res, next) => {
  try {
    const plan = await CropPlan.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a crop plan
// @route   PUT /api/crop-plans/:id
// @access  Private
const updateCropPlan = async (req, res, next) => {
  try {
    const plan = await CropPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Crop plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a crop plan
// @route   DELETE /api/crop-plans/:id
// @access  Private
const deleteCropPlan = async (req, res, next) => {
  try {
    const plan = await CropPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Crop plan not found' });
    }
    res.json({ success: true, message: 'Crop plan deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCropPlans, getCropPlan, createCropPlan, updateCropPlan, deleteCropPlan };
