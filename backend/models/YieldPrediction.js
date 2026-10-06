const mongoose = require('mongoose');

const yieldPredictionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cropName: { type: String, required: true },
    season: { type: String, enum: ['Kharif', 'Rabi', 'Zaid'], required: true },
    year: { type: Number, required: true },
    // Input parameters
    soilType: { type: String },
    rainfall: { type: Number }, // mm
    temperature: { type: Number }, // Celsius
    humidity: { type: Number }, // percentage
    area: { type: Number }, // acres
    fertilizerUsed: { type: String },
    irrigationType: {
      type: String,
      enum: ['rainfed', 'canal', 'borewell', 'drip'],
    },
    // Prediction result
    predictedYield: { type: Number }, // quintals per acre
    confidenceScore: { type: Number }, // 0-100
    recommendation: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('YieldPrediction', yieldPredictionSchema);
