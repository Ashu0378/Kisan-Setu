const mongoose = require('mongoose');

const mandiPriceSchema = new mongoose.Schema(
  {
    commodity: { type: String, required: true, trim: true },
    market: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    minPrice: { type: Number }, // per quintal in INR
    maxPrice: { type: Number },
    modalPrice: { type: Number, required: true }, // most common price
    priceDate: { type: Date, required: true, default: Date.now },
    unit: { type: String, default: 'Quintal' },
    variety: { type: String },
    source: { type: String, default: 'manual' }, // 'manual' | 'api'
  },
  { timestamps: true }
);

// Index for fast queries by commodity + state + date
mandiPriceSchema.index({ commodity: 1, state: 1, priceDate: -1 });

module.exports = mongoose.model('MandiPrice', mandiPriceSchema);
