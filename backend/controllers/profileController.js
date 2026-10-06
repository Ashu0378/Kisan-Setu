const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'email', 'state', 'district', 'village', 'pincode',
      'landSize', 'preferredLanguage', 'profilePicture', 'age',
      'kcc', 'soilType', 'irrigation', 'equipment', 'primaryCrop',
      'secondaryCrop', 'livestock', 'storageCapacity',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/profile/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, changePassword };
