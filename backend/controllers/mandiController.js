const MandiPrice = require('../models/MandiPrice');

// @desc    Get mandi prices (filter by commodity, state, date)
// @route   GET /api/mandi
// @access  Public
const getMandiPrices = async (req, res, next) => {
  try {
    const { commodity, state, district, limit = 20 } = req.query;
    const filter = {};
    if (commodity) filter.commodity = new RegExp(commodity, 'i');
    if (state) filter.state = new RegExp(state, 'i');
    if (district) filter.district = new RegExp(district, 'i');

    const prices = await MandiPrice.find(filter)
      .sort({ priceDate: -1 })
      .limit(Number(limit));

    res.json({ success: true, count: prices.length, data: prices });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest price for a commodity in each market
// @route   GET /api/mandi/latest
// @access  Public
const getLatestPrices = async (req, res, next) => {
  try {
    const { state } = req.query;
    const match = state ? { state: new RegExp(state, 'i') } : {};

    const prices = await MandiPrice.aggregate([
      { $match: match },
      { $sort: { priceDate: -1 } },
      {
        $group: {
          _id: { commodity: '$commodity', market: '$market' },
          latestPrice: { $first: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$latestPrice' } },
      { $sort: { commodity: 1 } },
    ]);

    res.json({ success: true, count: prices.length, data: prices });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new mandi price entry
// @route   POST /api/mandi
// @access  Private (admin)
const addMandiPrice = async (req, res, next) => {
  try {
    const price = await MandiPrice.create(req.body);
    res.status(201).json({ success: true, data: price });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMandiPrices, getLatestPrices, addMandiPrice };
