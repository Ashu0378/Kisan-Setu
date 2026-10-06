const YieldPrediction = require('../models/YieldPrediction');

// @desc    Get all yield predictions for user
// @route   GET /api/yield
// @access  Private
const getYieldPredictions = async (req, res, next) => {
  try {
    const predictions = await YieldPrediction.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: predictions.length, data: predictions });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a yield prediction result
// @route   POST /api/yield
// @access  Private
const saveYieldPrediction = async (req, res, next) => {
  try {
    const prediction = await YieldPrediction.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: prediction });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a yield prediction
// @route   DELETE /api/yield/:id
// @access  Private
const deleteYieldPrediction = async (req, res, next) => {
  try {
    const prediction = await YieldPrediction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!prediction) {
      return res.status(404).json({ success: false, message: 'Prediction not found' });
    }
    res.json({ success: true, message: 'Prediction deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getYieldPredictions, saveYieldPrediction, deleteYieldPrediction };
