const { Scheme, SchemeMatch } = require('../models/Scheme');

// @desc    Get all active schemes
// @route   GET /api/schemes
// @access  Public
const getSchemes = async (req, res, next) => {
  try {
    const { state, tag } = req.query;
    const filter = { isActive: true };
    if (state) filter['eligibility.states'] = { $in: [state, ''] };
    if (tag) filter.tags = tag;

    const schemes = await Scheme.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: schemes.length, data: schemes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get schemes matched to the logged-in user
// @route   GET /api/schemes/match
// @access  Private
const getMatchedSchemes = async (req, res, next) => {
  try {
    const user = req.user;
    const allSchemes = await Scheme.find({ isActive: true });

    // Simple rule-based matching
    const matched = allSchemes
      .map((scheme) => {
        let score = 50; // base score
        const reasons = [];

        // State match
        if (
          scheme.eligibility.states.length === 0 ||
          scheme.eligibility.states.includes(user.state)
        ) {
          score += 20;
          reasons.push('State eligible');
        } else {
          score -= 30;
        }

        // Land size match
        if (user.landSize) {
          if (
            (!scheme.eligibility.minLandSize || user.landSize >= scheme.eligibility.minLandSize) &&
            (!scheme.eligibility.maxLandSize || user.landSize <= scheme.eligibility.maxLandSize)
          ) {
            score += 30;
            reasons.push('Land size eligible');
          } else {
            score -= 20;
          }
        }

        return {
          scheme: scheme._id,
          schemeDetails: scheme,
          matchScore: Math.min(100, Math.max(0, score)),
          reason: reasons.join(', '),
        };
      })
      .filter((m) => m.matchScore >= 40)
      .sort((a, b) => b.matchScore - a.matchScore);

    // Save match result
    await SchemeMatch.findOneAndUpdate(
      { user: user._id },
      { matchedSchemes: matched.map((m) => ({ scheme: m.scheme, matchScore: m.matchScore, reason: m.reason })), lastChecked: Date.now() },
      { upsert: true, new: true }
    );

    res.json({ success: true, count: matched.length, data: matched });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSchemes, getMatchedSchemes };
