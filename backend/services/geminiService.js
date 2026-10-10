const { GoogleGenAI } = require('@google/genai');
const https = require('https');

/**
 * Fetch dynamic crop recommendations & real agronomic market data using Gemini API
 */
async function getGeminiCropRecommendations(params) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.warn('Gemini API Key missing (GEMINI_API_KEY). Using sanitized ML agronomic engine.');
    return null;
  }

  const {
    nitrogen = 45,
    phosphorus = 20,
    potassium = 30,
    ph = 6.5,
    texture = 'Loamy',
    district = 'Karnal',
    state = 'Haryana',
    temperature = 28,
    humidity = 60,
    rainfall = 800,
    sowingSeason = 'Kharif',
    sowingMonth = 7,
    waterAvailability = 'Medium',
    budget = 50000,
    previousCrop = 'Wheat',
  } = params;

  const prompt = `
You are an expert Indian agricultural scientist and farm economist.
Analyze the following farm parameters and return the top 5 most suitable, profitable crop recommendations for the farmer:

FARM & SOIL PROFILE:
- Soil NPK: Nitrogen=${nitrogen} kg/ha, Phosphorus=${phosphorus} kg/ha, Potassium=${potassium} kg/ha
- Soil pH: ${ph}, Soil Texture: ${texture}
- Location: District=${district}, State=${state}
- Weather: Temperature=${temperature}°C, Humidity=${humidity}%, Annual Rainfall=${rainfall} mm
- Agronomic Context: Sowing Season=${sowingSeason}, Sowing Month=${sowingMonth} (1=Jan..12=Dec), Water Availability=${waterAvailability}
- Economic Context: Farmer Budget=₹${budget}/Acre, Previous Crop=${previousCrop}

STRICT INSTRUCTIONS:
1. CRITICAL SEASON FILTER: Recommend ONLY crops that are actively sown in the requested Sowing Season ("${sowingSeason}", Month ${sowingMonth}).
   - If Sowing Season is "Kharif" (Monsoon): Recommend ONLY Kharif crops (e.g. Paddy, Maize, Cotton, Soybean, Groundnut, Jute, Turmeric, Pigeonpea, Sorghum, Perennials). NEVER recommend Rabi crops like Wheat, Mustard, Chickpea, Barley.
   - If Sowing Season is "Rabi" (Winter): Recommend ONLY Rabi crops (e.g. Wheat, Mustard, Chickpea, Potato, Garlic, Onion, Barley, Lentil, Spices, Perennials). NEVER recommend Kharif crops like Paddy, Cotton, Jute.
   - If Sowing Season is "Zaid" (Summer): Recommend ONLY Zaid/Summer crops (e.g. Watermelon, Muskmelon, Cucumber, Okra, Moong, Summer Maize, Perennials).
2. Sort the top 5 recommendations by netProfit descending (most profitable seasonal crop first).
3. Provide accurate, real-world Indian agricultural yields (in Quintals or Tons per acre) and current market prices (in ₹ per Quintal).
4. Calculate grossRevenue = (yieldNum in Quintals) * (pricePerQ in ₹/Quintal).
5. Calculate netProfit = grossRevenue - costPerAcre.
6. ROI % = Math.round((netProfit / costPerAcre) * 100).
7. For Coconut: Note that 1 acre yields ~12-16 Quintals of dried copra (or ~6,000-8,000 nuts worth ~₹1.2-1.5 Lakhs gross). Cost is ~₹35,000-45,000/acre. Net profit MUST BE realistic (~₹80,000 to ₹1,10,000/acre). NEVER return negative numbers or multi-crore numbers.
8. Provide clear agronomic advice in English ("adviceEn") and Hindi ("adviceHi").
9. Include 2-3 specific fertilizer/soil diagnostic notes ("fertilizerNotes").
10. Include an itemized costBreakdown object with numeric amounts (in ₹/acre) for: seeds, fertilizers, pesticides, irrigation, electricityFuel, labourCharge, machineryTillage. Total should equal costPerAcre.

Return ONLY valid JSON format (an array of 5 crop objects) without markdown formatting or code wrappers:
[
  {
    "crop": "Coconut",
    "category": "Plantation",
    "confidence": 92,
    "seasonal_fit": "Optimal Season",
    "season_tag": "Year-Round",
    "climateSuitability": "92% Match",
    "scoreBreakdown": { "soilMl": 90, "season": 95, "revenue": 90, "climate": 93 },
    "yield": "14 Quintals (Copra) / Acre",
    "yieldNum": 14,
    "water": "High",
    "risk": "Low",
    "growthDays": 365,
    "pricePerQ": 9500,
    "costPerAcre": 38000,
    "grossRevenue": "₹1,33,000",
    "profit": "₹95,000/acre",
    "netProfit": 95000,
    "roiPct": 250,
    "costBreakdown": {
      "seeds": 6840,
      "fertilizers": 8360,
      "pesticides": 5320,
      "irrigation": 4180,
      "electricityFuel": 3040,
      "labourCharge": 7220,
      "machineryTillage": 3040
    },
    "adviceEn": "Maintain drip irrigation and apply potassium sulfate to boost copra oil content.",
    "adviceHi": "ड्रिप सिंचाई बनाए रखें और कोपरा तेल सामग्री बढ़ाने के लिए पोटेशियम सल्फेट डालें।",
    "fertilizerNotes": ["Apply 1kg Urea + 2kg SSP per tree annually", "Ensure good basin drainage"]
  }
]
`;

  try {
    let jsonText = '';

    // Try @google/genai SDK first
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });
      jsonText = response.text || '';
    } catch (sdkErr) {
      console.warn('SDK call failed, using REST endpoint:', sdkErr.message);
      // Fallback to Direct REST endpoint
      jsonText = await callGeminiRest(apiKey, prompt);
    }

    if (!jsonText) return null;

    // Clean JSON response
    const cleanJson = jsonText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const recommendations = JSON.parse(cleanJson);

    if (Array.isArray(recommendations) && recommendations.length > 0) {
      const formatted = recommendations.map((r) => {
        const costNum = typeof r.costPerAcre === 'number' ? r.costPerAcre : parseInt(String(r.costPerAcre).replace(/\D/g, '')) || 30000;
        const netNum = typeof r.netProfit === 'number' ? r.netProfit : parseInt(String(r.profit || r.netProfit).replace(/[^\d-]/g, '')) || 50000;
        const grossNum = r.grossRevenue ? (typeof r.grossRevenue === 'number' ? r.grossRevenue : parseInt(String(r.grossRevenue).replace(/\D/g, ''))) : (netNum + costNum);
        
        return {
          crop: r.crop,
          category: r.category || 'Crop',
          confidence: Number(r.confidence) || 88,
          seasonal_fit: r.seasonal_fit || 'Optimal Season',
          season_tag: r.season_tag || 'Kharif / Rabi',
          climateSuitability: r.climateSuitability || '90% Match',
          scoreBreakdown: r.scoreBreakdown || { soilMl: r.confidence || 88, season: 90, revenue: 85, climate: 90 },
          yield: r.yield || `${r.yieldNum || 15} Quintal/Acre`,
          yieldNum: r.yieldNum || 15,
          water: r.water || 'Medium',
          risk: r.risk || 'Low',
          growthDays: r.growthDays || 120,
          netProfit: netNum,
          profit: `₹${netNum.toLocaleString('en-IN')}/acre`,
          grossRevenue: `₹${grossNum.toLocaleString('en-IN')}`,
          costPerAcre: `₹${costNum.toLocaleString('en-IN')}`,
          roiPct: r.roiPct || Math.round((netNum / costNum) * 100),
          costBreakdown: r.costBreakdown || null,
          adviceEn: r.adviceEn || `${r.crop} is highly suitable for your regional soil & climate profile.`,
          adviceHi: r.adviceHi || `${r.crop} आपकी मिट्टी और जलवायु के लिए अत्यधिक उपयुक्त है।`,
          fertilizerNotes: r.fertilizerNotes || [],
          source: 'gemini-ai'
        };
      });

      formatted.sort((a, b) => b.netProfit - a.netProfit);
      return formatted;
    }

    return null;
  } catch (err) {
    console.error('Error fetching crop recommendations from Gemini API:', err.message);
    return null;
  }
}

function callGeminiRest(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          resolve(text);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Gemini REST API timeout')); });
    req.write(postData);
    req.end();
  });
}

module.exports = { getGeminiCropRecommendations };
