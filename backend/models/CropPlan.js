const mongoose = require('mongoose');

const cropPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    season: {
      type: String,
      enum: ['Kharif', 'Rabi', 'Zaid'],
      required: true,
    },
    year: { type: Number, required: true },
    crops: [
      {
        cropName: { type: String, required: true },
        area: { type: Number, required: true }, // in acres
        expectedYield: { type: Number }, // in quintals
        actualYield: { type: Number },
        status: {
          type: String,
          enum: ['planned', 'sowing', 'growing', 'harvested'],
          default: 'planned',
        },
        sowingDate: { type: Date },
        harvestDate: { type: Date },
        notes: { type: String },
      },
    ],
    totalArea: { type: Number }, // in acres
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CropPlan', cropPlanSchema);
