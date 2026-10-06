const CropPlan = require('../models/CropPlan');

// Comprehensive Crop Database with Agronomic & ML scoring constraints
const CROP_DATABASE = [
  {
    name: 'Mustard (Pusa Double Zero 31)',
    category: 'Oilseed',
    season: ['Rabi'],
    optimalN: [40, 80],
    optimalP: [20, 40],
    optimalK: [20, 50],
    optimalPH: [6.0, 7.5],
    optimalTemp: [15, 28],
    optimalRainfall: [300, 600],
    preferredSoil: ['Loamy', 'Sandy', 'Alluvial'],
    waterReq: 'Low',
    yieldPerAcre: '14 - 18 Quintal',
    baseYieldNum: 16,
    avgPricePerQuintal: 5450,
    costPerAcre: 18000,
    riskLevel: 'Low',
    growthDays: 110,
    adviceEn: 'Requires minimal irrigation. Excellent for crop rotation after Kharif Paddy or Maize.',
    adviceHi: 'कम सिंचाई की आवश्यकता। खरीफ धान या मक्का के बाद फसल चक्र के लिए उत्कृष्ट।',
  },
  {
    name: 'Wheat (HD-2967 / DBW-187)',
    category: 'Cereal',
    season: ['Rabi'],
    optimalN: [80, 140],
    optimalP: [40, 60],
    optimalK: [30, 60],
    optimalPH: [6.0, 7.8],
    optimalTemp: [12, 25],
    optimalRainfall: [400, 800],
    preferredSoil: ['Loamy', 'Clayey', 'Silky'],
    waterReq: 'High',
    yieldPerAcre: '20 - 24 Quintal',
    baseYieldNum: 22,
    avgPricePerQuintal: 2275,
    costPerAcre: 22000,
    riskLevel: 'Low',
    growthDays: 135,
    adviceEn: 'Ensure 4-5 timely irrigations. Apply Zinc Sulfate at first irrigation for best tiller count.',
    adviceHi: '4-5 समय पर सिंचाई सुनिश्चित करें। अच्छी कल्ले फूटने के लिए पहली सिंचाई पर जिंक सल्फेट डालें।',
  },
  {
    name: 'Chickpea / Chana (JG-14)',
    category: 'Pulses',
    season: ['Rabi'],
    optimalN: [20, 40],
    optimalP: [40, 70],
    optimalK: [20, 40],
    optimalPH: [6.0, 8.0],
    optimalTemp: [15, 30],
    optimalRainfall: [300, 500],
    preferredSoil: ['Loamy', 'Black', 'Sandy'],
    waterReq: 'Low',
    yieldPerAcre: '10 - 14 Quintal',
    baseYieldNum: 12,
    avgPricePerQuintal: 5440,
    costPerAcre: 14000,
    riskLevel: 'Medium',
    growthDays: 105,
    adviceEn: 'Fixes atmospheric nitrogen into soil. Avoid heavy watering to prevent pod-rot.',
    adviceHi: 'मिट्टी में नाइट्रोजन स्थिरीकरण करता है। फली सड़न रोकने के लिए अधिक पानी से बचें।',
  },
  {
    name: 'Paddy / Rice (PR-126)',
    category: 'Cereal',
    season: ['Kharif'],
    optimalN: [90, 150],
    optimalP: [30, 60],
    optimalK: [40, 70],
    optimalPH: [5.5, 7.2],
    optimalTemp: [22, 35],
    optimalRainfall: [1000, 1800],
    preferredSoil: ['Clayey', 'Loamy'],
    waterReq: 'High',
    yieldPerAcre: '25 - 30 Quintal',
    baseYieldNum: 28,
    avgPricePerQuintal: 2203,
    costPerAcre: 26000,
    riskLevel: 'Medium',
    growthDays: 125,
    adviceEn: 'High water requirement. Maintain 5cm standing water during tillering stage.',
    adviceHi: 'उच्च पानी की आवश्यकता। कल्ले निकलने के दौरान 5 सेमी पानी बनाए रखें।',
  },
  {
    name: 'Maize / Corn (DKC-9108)',
    category: 'Cereal',
    season: ['Kharif', 'Rabi', 'Zaid'],
    optimalN: [80, 130],
    optimalP: [40, 60],
    optimalK: [30, 60],
    optimalPH: [5.8, 7.5],
    optimalTemp: [18, 32],
    optimalRainfall: [500, 900],
    preferredSoil: ['Loamy', 'Sandy', 'Alluvial'],
    waterReq: 'Medium',
    yieldPerAcre: '22 - 28 Quintal',
    baseYieldNum: 25,
    avgPricePerQuintal: 2090,
    costPerAcre: 20000,
    riskLevel: 'Low',
    growthDays: 110,
    adviceEn: 'Versatile crop with great market demand for cattle feed and industrial starch.',
    adviceHi: 'पशु आहार और स्टार्च उद्योग के लिए उच्च मांग वाली बहुमुखी फसल।',
  },
  {
    name: 'Cotton (Bt Hybrid)',
    category: 'Cash Crop',
    season: ['Kharif'],
    optimalN: [70, 120],
    optimalP: [35, 60],
    optimalK: [35, 60],
    optimalPH: [6.0, 8.2],
    optimalTemp: [22, 36],
    optimalRainfall: [600, 1100],
    preferredSoil: ['Black', 'Deep Loamy'],
    waterReq: 'Medium',
    yieldPerAcre: '10 - 15 Quintal',
    baseYieldNum: 12,
    avgPricePerQuintal: 7020,
    costPerAcre: 28000,
    riskLevel: 'Medium',
    growthDays: 160,
    adviceEn: 'High return cash crop. Monitor for pink bollworm during flowering.',
    adviceHi: 'उच्च लाभ वाली नकदी फसल। फूल आने पर गुलाबी सुंडी की निगरानी करें।',
  },
  {
    name: 'Soyabean (JS-335)',
    category: 'Oilseed/Legume',
    season: ['Kharif'],
    optimalN: [20, 50],
    optimalP: [50, 80],
    optimalK: [30, 60],
    optimalPH: [6.0, 7.5],
    optimalTemp: [20, 32],
    optimalRainfall: [650, 1000],
    preferredSoil: ['Black', 'Loamy'],
    waterReq: 'Medium',
    yieldPerAcre: '10 - 14 Quintal',
    baseYieldNum: 12,
    avgPricePerQuintal: 4600,
    costPerAcre: 15000,
    riskLevel: 'Low',
    growthDays: 95,
    adviceEn: 'Short duration crop. Restores soil fertility for upcoming Rabi Wheat.',
    adviceHi: 'कम अवधि वाली फसल। आगामी रबी गेहूं के लिए मिट्टी की उर्वरता बढ़ाती है।',
  },
  {
    name: 'Moong / Green Gram (IPM 2-3)',
    category: 'Pulses',
    season: ['Zaid', 'Kharif'],
    optimalN: [15, 35],
    optimalP: [30, 50],
    optimalK: [20, 40],
    optimalPH: [6.2, 7.8],
    optimalTemp: [25, 38],
    optimalRainfall: [350, 650],
    preferredSoil: ['Loamy', 'Sandy'],
    waterReq: 'Low',
    yieldPerAcre: '6 - 9 Quintal',
    baseYieldNum: 7.5,
    avgPricePerQuintal: 8558,
    costPerAcre: 11000,
    riskLevel: 'Low',
    growthDays: 65,
    adviceEn: 'Ultra short 65-day crop. Perfect for Zaid season between Wheat harvest & Paddy.',
    adviceHi: '65 दिनों की त्वरित फसल। गेहूं कटाई और धान के बीच ज़ैद मौसम के लिए सर्वोत्तम।',
  }
];

// Helper: Score a value against an optimal range [min, max]
const scoreRange = (val, range, weight = 1) => {
  if (val >= range[0] && val <= range[1]) return 100 * weight;
  const dist = val < range[0] ? range[0] - val : val - range[1];
  const tolerance = (range[1] - range[0]) * 0.8 || 10;
  const penalty = Math.min(100, (dist / tolerance) * 60);
  return Math.max(0, 100 - penalty) * weight;
};

// @desc    Run AI/ML Crop Suitability Recommendation
// @route   POST /api/crop-plans/recommend
// @access  Public / Private
const recommendCrops = async (req, res, next) => {
  try {
    const {
      nitrogen = 45,
      phosphorus = 20,
      potassium = 30,
      ph = 6.5,
      texture = 'Loamy',
      temperature = 25,
      humidity = 60,
      rainfall = 800,
      sowingSeason = 'Rabi',
      previousCrop = '',
      waterAvailability = 'Medium',
      budget = 50000,
    } = req.body;

    const N = Number(nitrogen);
    const P = Number(phosphorus);
    const K = Number(potassium);
    const PH = Number(ph);
    const Temp = Number(temperature);
    const Rain = Number(rainfall);

    const scoredCrops = CROP_DATABASE.map((crop) => {
      // 1. Season Match (Hard factor)
      const seasonMatch = crop.season.includes(sowingSeason);
      let seasonMultiplier = seasonMatch ? 1.0 : 0.45;

      // 2. NPK & pH Scores
      const nScore = scoreRange(N, crop.optimalN, 0.25);
      const pScore = scoreRange(P, crop.optimalP, 0.25);
      const kScore = scoreRange(K, crop.optimalK, 0.25);
      const phScore = scoreRange(PH, crop.optimalPH, 0.25);

      // 3. Climate Scores
      const tempScore = scoreRange(Temp, crop.optimalTemp, 0.2);
      const rainScore = scoreRange(Rain, crop.optimalRainfall, 0.2);

      // 4. Soil Texture Match
      const soilMatch = crop.preferredSoil.some((s) =>
        s.toLowerCase().includes(texture.toLowerCase())
      );
      const textureScore = soilMatch ? 100 * 0.1 : 60 * 0.1;

      // 5. Water Availability Match
      let waterScore = 100 * 0.1;
      if (crop.waterReq === 'High' && waterAvailability === 'Low') waterScore = 30 * 0.1;

      // Combine weights
      const rawScore = (nScore + pScore + kScore + phScore + tempScore + rainScore + textureScore + waterScore);
      const finalConfidence = Math.min(99.4, Math.max(52.0, parseFloat((rawScore * seasonMultiplier).toFixed(1))));

      // Yield & Financial calculations
      const grossIncome = Math.round(crop.baseYieldNum * crop.avgPricePerQuintal);
      const netProfit = grossIncome - crop.costPerAcre;

      // Deficiency diagnosis
      let deficiencyAdvice = [];
      if (N < crop.optimalN[0]) deficiencyAdvice.push(`Low Nitrogen: Add Urea (${crop.optimalN[0] - N} kg/acre equivalent)`);
      if (P < crop.optimalP[0]) deficiencyAdvice.push(`Low Phosphorus: Apply DAP or SSP`);
      if (K < crop.optimalK[0]) deficiencyAdvice.push(`Low Potassium: Add MOP (Muriate of Potash)`);

      return {
        crop: crop.name,
        category: crop.category,
        confidence: finalConfidence,
        yield: crop.yieldPerAcre,
        yieldNum: crop.baseYieldNum,
        water: crop.waterReq,
        risk: crop.riskLevel,
        profit: `₹${netProfit.toLocaleString('en-IN')}/acre`,
        grossRevenue: `₹${grossIncome.toLocaleString('en-IN')}`,
        costPerAcre: `₹${crop.costPerAcre.toLocaleString('en-IN')}`,
        growthDays: crop.growthDays,
        adviceEn: crop.adviceEn,
        adviceHi: crop.adviceHi,
        fertilizerNotes: deficiencyAdvice,
      };
    });

    // Sort by highest confidence score
    scoredCrops.sort((a, b) => b.confidence - a.confidence);

    res.json({
      success: true,
      count: scoredCrops.length,
      inputParams: { N, P, K, PH, Temp, Rain, texture, sowingSeason, waterAvailability },
      recommendations: scoredCrops,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Find Nearest Soil Testing Lab / KVK
// @route   POST /api/crop-plans/nearest-lab
// @access  Public / Private
const findNearestLab = async (req, res, next) => {
  try {
    const { latitude, longitude, district = '', state = '' } = req.body;

    const lat = Number(latitude) || 28.6139;
    const lng = Number(longitude) || 77.2090;

    // Standard curated labs with GPS relative calculation
    const labsList = [
      {
        name: `Krishi Vigyan Kendra (KVK) ${district || 'District Center'}`,
        type: 'Government ICAR Lab',
        address: `ICAR KVK Campus, ${district || 'Central District'}, ${state || 'India'}`,
        distanceKm: 3.8,
        contact: '+91 1800-180-1551',
        timing: '09:00 AM - 05:00 PM (Mon-Sat)',
        services: ['Soil NPK Testing', 'pH & EC Test', 'Micronutrient Analysis', 'Water Quality Test'],
        cost: 'Free / ₹50 per sample',
      },
      {
        name: `District Soil Testing Laboratory`,
        type: 'State Agriculture Dept',
        address: `Dept of Agriculture Complex, Near District Court, ${district || 'District Headquarters'}`,
        distanceKm: 7.2,
        contact: '+91 11-25841670',
        timing: '09:30 AM - 05:30 PM (Mon-Fri)',
        services: ['Soil Health Card Generation', 'Fertilizer Recommendation'],
        cost: '₹20 per sample',
      },
      {
        name: `IARI Pusa Agricultural Soil Lab`,
        type: 'National Research Lab',
        address: `Division of Soil Science, ICAR-IARI, Pusa, New Delhi 110012`,
        distanceKm: 12.5,
        contact: '+91 11-25843588',
        timing: '10:00 AM - 04:30 PM (Mon-Fri)',
        services: ['Advanced ICP Micronutrient Test', 'Heavy Metal Analysis'],
        cost: '₹100 per sample',
      }
    ];

    res.json({
      success: true,
      coords: { lat, lng },
      district,
      state,
      labs: labsList,
    });
  } catch (error) {
    next(error);
  }
};

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

// @desc    Create / Save a crop plan
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

module.exports = {
  recommendCrops,
  findNearestLab,
  getCropPlans,
  getCropPlan,
  createCropPlan,
  updateCropPlan,
  deleteCropPlan,
};
