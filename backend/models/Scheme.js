const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    ministry: { type: String },
    eligibility: {
      minLandSize: { type: Number }, // acres
      maxLandSize: { type: Number },
      states: [{ type: String }], // empty = all India
      categories: [{ type: String }], // SC/ST/OBC/General
      maxIncome: { type: Number }, // annual income limit
    },
    benefits: { type: String },
    applicationLink: { type: String },
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// User-Scheme match result
const schemeMatchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    matchedSchemes: [
      {
        scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme' },
        matchScore: { type: Number }, // 0-100
        reason: { type: String },
      },
    ],
    lastChecked: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Scheme = mongoose.model('Scheme', schemeSchema);
const SchemeMatch = mongoose.model('SchemeMatch', schemeMatchSchema);

module.exports = { Scheme, SchemeMatch };
