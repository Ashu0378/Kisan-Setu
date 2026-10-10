const CropPlan = require('../models/CropPlan');
const { spawn } = require('child_process');
const path = require('path');
const https = require('https');
const http = require('http');
const { getGeminiCropRecommendations } = require('../services/geminiService');

// ─── REAL KVK LAB DATABASE (District-wise, India) ────────────────────────────
// Source: ICAR KVK directory + State Agriculture Dept
const KVK_DATABASE = [
  // Punjab
  { name: 'KVK Ludhiana (PAU)', district: 'ludhiana', state: 'punjab', lat: 30.9010, lng: 75.8573, contact: '0161-2401960', address: 'PAU Campus, Ludhiana, Punjab 141004', type: 'ICAR-KVK', services: ['Soil NPK', 'pH', 'Micronutrient', 'Water Quality'], cost: 'Free / ₹50', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Amritsar', district: 'amritsar', state: 'punjab', lat: 31.6340, lng: 74.8723, contact: '0183-2220988', address: 'ICAR KVK, GT Road, Amritsar, Punjab', type: 'ICAR-KVK', services: ['Soil Testing', 'Fertilizer Advisory'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Patiala', district: 'patiala', state: 'punjab', lat: 30.3398, lng: 76.3869, contact: '0175-2352800', address: 'ICAR KVK, Patiala, Punjab 147001', type: 'ICAR-KVK', services: ['Soil NPK', 'pH Testing', 'Seed Testing'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Gurdaspur', district: 'gurdaspur', state: 'punjab', lat: 32.0382, lng: 75.4044, contact: '01874-221247', address: 'ICAR KVK, Gurdaspur, Punjab', type: 'ICAR-KVK', services: ['Soil Testing', 'Water Quality'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  // Haryana
  { name: 'KVK Karnal (ICAR-IARI)', district: 'karnal', state: 'haryana', lat: 29.6857, lng: 76.9905, contact: '0184-2267990', address: 'ICAR-CCARI, Karnal, Haryana 132001', type: 'ICAR-KVK', services: ['Soil NPK', 'pH', 'Micronutrient', 'Soil Health Card'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Hisar (HAU)', district: 'hisar', state: 'haryana', lat: 29.1492, lng: 75.7217, contact: '01662-231478', address: 'HAU Campus, Hisar, Haryana 125004', type: 'State Agriculture', services: ['Soil Testing', 'Fertilizer Advisory', 'Seed Analysis'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Ambala', district: 'ambala', state: 'haryana', lat: 30.3752, lng: 76.7821, contact: '0171-2530412', address: 'ICAR KVK Campus, Ambala, Haryana', type: 'ICAR-KVK', services: ['Soil Health Card', 'Micronutrient'], cost: 'Free / ₹20', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Sirsa', district: 'sirsa', state: 'haryana', lat: 29.5337, lng: 75.0169, contact: '01666-247682', address: 'ICAR KVK, Sirsa, Haryana', type: 'ICAR-KVK', services: ['Soil Testing', 'Water Quality Test'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  // Uttar Pradesh
  { name: 'KVK Lucknow (ICAR-NBSS)', district: 'lucknow', state: 'uttar pradesh', lat: 26.8467, lng: 80.9462, contact: '0522-2716772', address: 'ICAR-NBSS&LUP, Lucknow, UP 226003', type: 'ICAR-KVK', services: ['Soil Classification', 'NPK', 'pH', 'Heavy Metal'], cost: 'Free / ₹100', timing: '10AM-5PM (Mon-Fri)' },
  { name: 'KVK Varanasi', district: 'varanasi', state: 'uttar pradesh', lat: 25.3176, lng: 82.9739, contact: '0542-2575300', address: 'BHU Campus, Varanasi, UP', type: 'ICAR-KVK', services: ['Soil NPK', 'Soil Health Card'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Agra', district: 'agra', state: 'uttar pradesh', lat: 27.1767, lng: 78.0081, contact: '0562-2520078', address: 'ICAR KVK, Agra, UP', type: 'ICAR-KVK', services: ['Soil Testing', 'Fertilizer Advisory'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Meerut', district: 'meerut', state: 'uttar pradesh', lat: 28.9845, lng: 77.7064, contact: '0121-2764245', address: 'ICAR KVK, Meerut, UP', type: 'ICAR-KVK', services: ['Soil NPK', 'pH Testing'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  // Madhya Pradesh
  { name: 'KVK Bhopal (JNKVV)', district: 'bhopal', state: 'madhya pradesh', lat: 23.2599, lng: 77.4126, contact: '0755-2678066', address: 'JNKVV Campus, Bhopal, MP 462038', type: 'ICAR-KVK', services: ['Soil NPK', 'pH', 'Micronutrient Analysis'], cost: 'Free / ₹50', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Indore (RVSKVV)', district: 'indore', state: 'madhya pradesh', lat: 22.7196, lng: 75.8577, contact: '0731-2470200', address: 'RVSKVV Campus, Indore, MP', type: 'ICAR-KVK', services: ['Soil Testing', 'Water Quality', 'Seed Testing'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  // Maharashtra
  { name: 'KVK Pune (ICAR-ARI)', district: 'pune', state: 'maharashtra', lat: 18.5204, lng: 73.8567, contact: '020-25652124', address: 'ICAR-ARI, Pune, Maharashtra 411005', type: 'ICAR-KVK', services: ['Soil NPK', 'pH', 'Heavy Metal Analysis'], cost: 'Free / ₹100', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Nagpur', district: 'nagpur', state: 'maharashtra', lat: 21.1458, lng: 79.0882, contact: '0712-2801360', address: 'ICAR KVK, Nagpur, Maharashtra', type: 'ICAR-KVK', services: ['Soil Testing', 'Fertilizer Recommendation'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Aurangabad', district: 'aurangabad', state: 'maharashtra', lat: 19.8762, lng: 75.3433, contact: '0240-2331750', address: 'ICAR KVK, Aurangabad, Maharashtra', type: 'ICAR-KVK', services: ['Soil NPK', 'pH Testing'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  // Rajasthan
  { name: 'KVK Jaipur (SKNAU)', district: 'jaipur', state: 'rajasthan', lat: 26.9124, lng: 75.7873, contact: '0141-2711862', address: 'SKNAU Campus, Jaipur, Rajasthan 302033', type: 'ICAR-KVK', services: ['Soil Testing', 'Water Quality', 'NPK Analysis'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Jodhpur', district: 'jodhpur', state: 'rajasthan', lat: 26.2389, lng: 73.0243, contact: '0291-2790208', address: 'ICAR-CAZRI, Jodhpur, Rajasthan', type: 'ICAR-KVK', services: ['Arid Soil Testing', 'Water Quality'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Kota', district: 'kota', state: 'rajasthan', lat: 25.2138, lng: 75.8648, contact: '0744-2472101', address: 'ICAR KVK, Kota, Rajasthan', type: 'ICAR-KVK', services: ['Soil NPK', 'Micronutrient'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  // Gujarat
  { name: 'KVK Ahmedabad (ICAR)', district: 'ahmedabad', state: 'gujarat', lat: 23.0225, lng: 72.5714, contact: '079-22685019', address: 'ICAR KVK, Ahmedabad, Gujarat', type: 'ICAR-KVK', services: ['Soil NPK', 'pH', 'Micronutrient'], cost: 'Free / ₹50', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Anand (AAU)', district: 'anand', state: 'gujarat', lat: 22.5645, lng: 72.9289, contact: '02692-261234', address: 'AAU Campus, Anand, Gujarat 388110', type: 'ICAR-KVK', services: ['Soil Testing', 'Water Quality', 'Seed Testing'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  // Karnataka
  { name: 'KVK Bangalore (UAS)', district: 'bangalore', state: 'karnataka', lat: 12.9716, lng: 77.5946, contact: '080-23330153', address: 'UAS Campus, GKVK, Bengaluru, Karnataka 560065', type: 'ICAR-KVK', services: ['Soil NPK', 'pH', 'Micronutrient', 'Plant Tissue Analysis'], cost: 'Free / ₹100', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Dharwad', district: 'dharwad', state: 'karnataka', lat: 15.4589, lng: 75.0078, contact: '0836-2214104', address: 'UAS Dharwad, Karnataka', type: 'ICAR-KVK', services: ['Soil Testing', 'Water Quality'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  // Tamil Nadu
  { name: 'KVK Chennai (TNAU)', district: 'chennai', state: 'tamil nadu', lat: 13.0827, lng: 80.2707, contact: '044-22350586', address: 'TNAU Campus, Coimbatore, Tamil Nadu', type: 'ICAR-KVK', services: ['Soil NPK', 'pH', 'Micronutrient'], cost: 'Free / ₹50', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Coimbatore (TNAU)', district: 'coimbatore', state: 'tamil nadu', lat: 11.0168, lng: 76.9558, contact: '0422-6611200', address: 'TNAU, Coimbatore, Tamil Nadu 641003', type: 'ICAR-KVK', services: ['Soil Testing', 'Water Quality', 'Plant Analysis'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  // Bihar
  { name: 'KVK Patna (BAU)', district: 'patna', state: 'bihar', lat: 25.5941, lng: 85.1376, contact: '0612-2224481', address: 'BAU Campus, Patna, Bihar', type: 'ICAR-KVK', services: ['Soil NPK', 'pH Testing', 'Fertilizer Advisory'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  { name: 'KVK Muzaffarpur', district: 'muzaffarpur', state: 'bihar', lat: 26.1197, lng: 85.3910, contact: '0621-2240040', address: 'ICAR KVK, Muzaffarpur, Bihar', type: 'ICAR-KVK', services: ['Soil Testing', 'Water Quality'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  // West Bengal
  { name: 'KVK Kolkata (BCKV)', district: 'kolkata', state: 'west bengal', lat: 22.5726, lng: 88.3639, contact: '033-25820213', address: 'BCKV, Mohanpur, Nadia, West Bengal', type: 'ICAR-KVK', services: ['Soil NPK', 'pH', 'Micronutrient', 'Heavy Metal'], cost: 'Free / ₹100', timing: '9AM-5PM (Mon-Sat)' },
  // Andhra Pradesh
  { name: 'KVK Hyderabad (ANGRAU)', district: 'hyderabad', state: 'andhra pradesh', lat: 17.3850, lng: 78.4867, contact: '040-24015011', address: 'ANGRAU, Rajendranagar, Hyderabad, AP', type: 'ICAR-KVK', services: ['Soil Testing', 'Water Quality', 'Seed Testing'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  // Delhi
  { name: 'IARI Soil Science Lab', district: 'delhi', state: 'delhi', lat: 28.6388, lng: 77.1605, contact: '011-25843588', address: 'ICAR-IARI, Pusa Road, New Delhi 110012', type: 'ICAR National Lab', services: ['Advanced ICP Micronutrient', 'Heavy Metal Analysis', 'Soil Health Card'], cost: '₹100 per sample', timing: '10AM-4:30PM (Mon-Fri)' },
  { name: 'KVK New Delhi', district: 'new delhi', state: 'delhi', lat: 28.6139, lng: 77.2090, contact: '011-25841670', address: 'Dept of Agriculture Complex, New Delhi', type: 'State Agriculture', services: ['Soil Health Card', 'Fertilizer Recommendation'], cost: '₹20 per sample', timing: '9:30AM-5:30PM (Mon-Fri)' },
  // Odisha
  { name: 'KVK Bhubaneswar (OUAT)', district: 'bhubaneswar', state: 'odisha', lat: 20.2961, lng: 85.8245, contact: '0674-2397683', address: 'OUAT Campus, Bhubaneswar, Odisha', type: 'ICAR-KVK', services: ['Soil NPK', 'pH', 'Micronutrient'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
  // Assam
  { name: 'KVK Guwahati (AAU)', district: 'guwahati', state: 'assam', lat: 26.1445, lng: 91.7362, contact: '0361-2310108', address: 'AAU Campus, Jorhat, Assam', type: 'ICAR-KVK', services: ['Soil Testing', 'Water Quality'], cost: 'Free', timing: '9AM-5PM (Mon-Sat)' },
];

// ─── Haversine Distance Formula ───────────────────────────────────────────────
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Fetch real-time weather + historical annual rainfall from Open-Meteo ──────
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
      res.on('error', reject);
    });
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
    req.on('error', reject);
  });
}

async function fetchWeather(lat, lng) {
  try {
    // Build date range: past 365 days for accurate annual rainfall
    const today = new Date();
    const end   = today.toISOString().slice(0, 10);
    const start = new Date(today - 365 * 86400000).toISOString().slice(0, 10);

    const [currentJson, histJson] = await Promise.allSettled([
      // Current conditions
      httpGet(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&current=temperature_2m,relative_humidity_2m,precipitation` +
        `&timezone=Asia%2FKolkata&forecast_days=1`
      ),
      // Historical precipitation sum for past 365 days → true annual rainfall
      httpGet(
        `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}` +
        `&start_date=${start}&end_date=${end}` +
        `&daily=precipitation_sum&timezone=Asia%2FKolkata`
      ),
    ]);

    const current  = currentJson.status  === 'fulfilled' ? (currentJson.value.current  || {}) : {};
    const histData = histJson.status     === 'fulfilled' ? (histJson.value.daily       || {}) : {};

    // Sum all daily precipitation values from the past year
    const annualRainfall = (histData.precipitation_sum || [])
      .reduce((sum, v) => sum + (v || 0), 0);

    return {
      temperature: parseFloat((current.temperature_2m        ?? 28).toFixed(1)),
      humidity:    parseFloat((current.relative_humidity_2m   ?? 60).toFixed(1)),
      // Use historical sum if we got at least 30 days of data, else sensible default
      rainfall:   histData.precipitation_sum?.length >= 30
                    ? parseFloat(annualRainfall.toFixed(0))
                    : 800,
    };
  } catch {
    return { temperature: 28, humidity: 60, rainfall: 800 };
  }
}


// ─── Python ML Inference Bridge ───────────────────────────────────────────────
function runPythonML(features) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', 'ml', 'predict_crop.py');
    const inputJson = JSON.stringify(features);
    const py = spawn('python', [scriptPath, inputJson], { timeout: 30000 });

    let stdout = '';
    let stderr = '';
    py.stdout.on('data', (d) => (stdout += d.toString()));
    py.stderr.on('data', (d) => (stderr += d.toString()));

    py.on('close', (code) => {
      try {
        const result = JSON.parse(stdout.trim());
        if (result.error) reject(new Error(result.error));
        else resolve(result);
      } catch {
        reject(new Error(`Python ML failed (code ${code}): ${stderr.slice(0, 200)}`));
      }
    });
    py.on('error', (err) => reject(new Error(`Cannot spawn python: ${err.message}`)));
  });
}

// ─── Crop Agronomic Database (for enriching ML output) ───────────────────────
const CROP_ENRICH = {
  rice:        { category: 'Cereal',        yield: '25-30 Quintal/Acre', waterReq: 'High',   risk: 'Medium', growthDays: 125, pricePerQ: 2203, costPerAcre: 26000, adviceEn: 'Maintain 5cm standing water during tillering. Use PR-126 variety for early harvest.', adviceHi: 'कल्ले निकलने के दौरान 5 सेमी पानी बनाए रखें। PR-126 किस्म से जल्दी कटाई करें।' },
  wheat:       { category: 'Cereal',        yield: '20-24 Quintal/Acre', waterReq: 'High',   risk: 'Low',    growthDays: 135, pricePerQ: 2275, costPerAcre: 22000, adviceEn: 'Apply 4-5 timely irrigations. Zinc Sulfate at first irrigation improves tiller count.', adviceHi: '4-5 सिंचाई समय पर करें। पहली सिंचाई पर जिंक सल्फेट दें।' },
  maize:       { category: 'Cereal',        yield: '22-28 Quintal/Acre', waterReq: 'Medium', risk: 'Low',    growthDays: 110, pricePerQ: 2090, costPerAcre: 20000, adviceEn: 'Versatile crop for cattle feed and industrial starch. DKC-9108 hybrid recommended.', adviceHi: 'पशु आहार और स्टार्च के लिए बहुमुखी फसल। DKC-9108 हाइब्रिड अनुशंसित।' },
  chickpea:    { category: 'Pulses',        yield: '10-14 Quintal/Acre', waterReq: 'Low',    risk: 'Medium', growthDays: 105, pricePerQ: 5440, costPerAcre: 14000, adviceEn: 'Nitrogen-fixing legume. Avoid heavy irrigation to prevent pod-rot.', adviceHi: 'नाइट्रोजन स्थिरीकरण करने वाली फसल। फली सड़न रोकने के लिए कम पानी दें।' },
  kidneybeans: { category: 'Pulses',        yield: '8-12 Quintal/Acre',  waterReq: 'Medium', risk: 'Medium', growthDays: 90,  pricePerQ: 7200, costPerAcre: 15000, adviceEn: 'High protein legume. Ensure well-drained soil. Susceptible to waterlogging.', adviceHi: 'उच्च प्रोटीन फली। अच्छी जल निकासी सुनिश्चित करें।' },
  pigeonpeas:  { category: 'Pulses',        yield: '8-12 Quintal/Acre',  waterReq: 'Low',    risk: 'Low',    growthDays: 180, pricePerQ: 6000, costPerAcre: 12000, adviceEn: 'Drought-tolerant. Ideal for dryland farming. Intercrop with cotton or sorghum.', adviceHi: 'सूखा सहिष्णु। शुष्क खेती के लिए आदर्श। कपास के साथ अंतरफसल लें।' },
  mothbeans:   { category: 'Pulses',        yield: '5-8 Quintal/Acre',   waterReq: 'Low',    risk: 'Low',    growthDays: 75,  pricePerQ: 5500, costPerAcre: 9000,  adviceEn: 'Extreme drought tolerance. Best for arid Rajasthan & Gujarat regions.', adviceHi: 'अत्यधिक सूखा सहिष्णु। राजस्थान और गुजरात के शुष्क क्षेत्रों के लिए उत्तम।' },
  mungbean:    { category: 'Pulses',        yield: '6-9 Quintal/Acre',   waterReq: 'Low',    risk: 'Low',    growthDays: 65,  pricePerQ: 8558, costPerAcre: 11000, adviceEn: 'Ultra-short 65-day crop. Perfect for Zaid season between wheat and paddy.', adviceHi: '65 दिनों की फसल। गेहूं और धान के बीच जैद मौसम के लिए उत्तम।' },
  blackgram:   { category: 'Pulses',        yield: '6-10 Quintal/Acre',  waterReq: 'Low',    risk: 'Low',    growthDays: 80,  pricePerQ: 6500, costPerAcre: 10000, adviceEn: 'High market demand. Grows well in loamy and clay-loam soils.', adviceHi: 'उच्च बाजार मांग। दोमट और चिकनी दोमट मिट्टी में अच्छी उपज।' },
  lentil:      { category: 'Pulses',        yield: '8-10 Quintal/Acre',  waterReq: 'Low',    risk: 'Low',    growthDays: 100, pricePerQ: 5800, costPerAcre: 11000, adviceEn: 'Cool season crop. Ideal for Rabi in North India. Minimal irrigation needed.', adviceHi: 'ठंडे मौसम की फसल। उत्तर भारत के रबी के लिए आदर्श।' },
  pomegranate: { category: 'Horticulture',  yield: '10-15 Ton/Acre',     waterReq: 'Low',    risk: 'Low',    growthDays: 365, pricePerQ: 8000, costPerAcre: 60000, adviceEn: 'High-value perennial. Drip irrigation recommended. Suitable for arid regions.', adviceHi: 'उच्च मूल्य की बहुवर्षीय फसल। टपक सिंचाई अनुशंसित।' },
  banana:      { category: 'Horticulture',  yield: '20-35 Ton/Acre',     waterReq: 'High',   risk: 'Medium', growthDays: 300, pricePerQ: 1500, costPerAcre: 50000, adviceEn: 'High water crop. Tissue culture planting recommended. Prone to panama wilt.', adviceHi: 'अधिक पानी वाली फसल। टिशू कल्चर रोपण अनुशंसित।' },
  mango:       { category: 'Horticulture',  yield: '10-20 Ton/Acre',     waterReq: 'Medium', risk: 'Low',    growthDays: 365, pricePerQ: 3000, costPerAcre: 40000, adviceEn: 'Long-duration perennial. Alphonso variety fetches premium prices.', adviceHi: 'दीर्घकालिक बहुवर्षीय फसल। अल्फांसो किस्म प्रीमियम मूल्य देती है।' },
  grapes:      { category: 'Horticulture',  yield: '12-18 Ton/Acre',     waterReq: 'Medium', risk: 'Medium', growthDays: 180, pricePerQ: 6000, costPerAcre: 80000, adviceEn: 'High investment but excellent returns. Drip irrigation and trellis system essential.', adviceHi: 'उच्च निवेश, उत्कृष्ट लाभ। टपक सिंचाई और ट्रेलिस प्रणाली आवश्यक।' },
  watermelon:  { category: 'Vegetables',    yield: '15-20 Ton/Acre',     waterReq: 'Medium', risk: 'Low',    growthDays: 90,  pricePerQ: 1000, costPerAcre: 20000, adviceEn: 'Summer cash crop. Sandy loam soil ideal. Drip irrigation for best quality.', adviceHi: 'गर्मियों की नकदी फसल। बलुई दोमट मिट्टी आदर्श।' },
  muskmelon:   { category: 'Vegetables',    yield: '10-15 Ton/Acre',     waterReq: 'Medium', risk: 'Low',    growthDays: 80,  pricePerQ: 1200, costPerAcre: 18000, adviceEn: 'High demand in summer. Thrives in sandy to sandy loam soils.', adviceHi: 'गर्मियों में उच्च मांग। रेतीली से दोमट मिट्टी में अच्छी उपज।' },
  cotton:      { category: 'Cash Crop',     yield: '10-15 Quintal/Acre', waterReq: 'Medium', risk: 'Medium', growthDays: 160, pricePerQ: 7020, costPerAcre: 28000, adviceEn: 'High-return cash crop. Monitor for pink bollworm during flowering stage.', adviceHi: 'उच्च लाभ नकदी फसल। फूल आने पर गुलाबी सुंडी पर नजर रखें।' },
  jute:        { category: 'Cash Crop',     yield: '20-30 Quintal/Acre', waterReq: 'High',   risk: 'Medium', growthDays: 120, pricePerQ: 3500, costPerAcre: 18000, adviceEn: 'Thrives in humid tropical climate. Important fiber crop for West Bengal.', adviceHi: 'आर्द्र उष्णकटिबंधीय जलवायु में पनपता है। पश्चिम बंगाल की महत्वपूर्ण रेशा फसल।' },
  coffee:      { category: 'Plantation',    yield: '4-6 Ton/Acre',       waterReq: 'Medium', risk: 'Medium', growthDays: 365, pricePerQ: 15000, costPerAcre: 70000, adviceEn: 'Shade-grown coffee fetches premium prices. Ideal for Western Ghats.', adviceHi: 'छाया में उगाई गई कॉफी प्रीमियम मूल्य देती है। पश्चिमी घाट के लिए आदर्श।' },
  coconut:     { category: 'Plantation',    yield: '12-16 Quintals (Copra)/Acre',waterReq: 'High',   risk: 'Low',    growthDays: 365, pricePerQ: 9500, costPerAcre: 35000, adviceEn: 'Perennial crop. Intercropping with cacao or pineapple increases profitability. Drip irrigation recommended.', adviceHi: 'बहुवर्षीय फसल। कोकोआ या अनानास के साथ अंतरफसल से लाभप्रदता बढ़ती है। टपक सिंचाई अनुशंसित।' },
  papaya:      { category: 'Horticulture',  yield: '20-30 Ton/Acre',     waterReq: 'Medium', risk: 'Medium', growthDays: 270, pricePerQ: 1800, costPerAcre: 35000, adviceEn: 'Fast-yielding fruit crop. Avoid waterlogging. High demand in urban markets.', adviceHi: 'तेजी से उपज देने वाली फल फसल। जल भराव से बचें।' },
  orange:      { category: 'Horticulture',  yield: '8-12 Ton/Acre',      waterReq: 'Medium', risk: 'Low',    growthDays: 365, pricePerQ: 4000, costPerAcre: 45000, adviceEn: 'Nagpur orange is world-famous. Ideal for Vidarbha and MP regions.', adviceHi: 'नागपुर संतरा विश्व प्रसिद्ध है। विदर्भ और मध्य प्रदेश क्षेत्र के लिए आदर्श।' },
  apple:       { category: 'Horticulture',  yield: '10-15 Ton/Acre',     waterReq: 'Medium', risk: 'Medium', growthDays: 365, pricePerQ: 8000, costPerAcre: 60000, adviceEn: 'Cold climate crop. Himachal Pradesh and J&K are ideal regions.', adviceHi: 'ठंडे जलवायु की फसल। हिमाचल प्रदेश और जम्मू-कश्मीर आदर्श क्षेत्र।' },
};

function calculateRealCostBreakdown(cropName, category = '', totalCost = 25000) {
  const cat = (category || '').toLowerCase();
  const cName = (cropName || '').toLowerCase();

  let seedsPct = 0.14;
  let fertPct = 0.20;
  let pestPct = 0.12;
  let irrPct = 0.09;
  let elecPct = 0.08;
  let labourPct = 0.25;
  let machPct = 0.12;

  if (cat.includes('veg') || cName.includes('tomato') || cName.includes('onion') || cName.includes('potato') || cName.includes('chili')) {
    seedsPct = 0.16;
    fertPct = 0.20;
    pestPct = 0.16;
    irrPct = 0.09;
    elecPct = 0.07;
    labourPct = 0.22;
    machPct = 0.10;
  } else if (cat.includes('fruit') || cat.includes('plantation') || cat.includes('horticulture')) {
    seedsPct = 0.18;
    fertPct = 0.22;
    pestPct = 0.14;
    irrPct = 0.11;
    elecPct = 0.08;
    labourPct = 0.19;
    machPct = 0.08;
  } else if (cat.includes('pulse') || cat.includes('oil')) {
    seedsPct = 0.16;
    fertPct = 0.16;
    pestPct = 0.12;
    irrPct = 0.07;
    elecPct = 0.07;
    labourPct = 0.28;
    machPct = 0.14;
  }

  const seeds = Math.round(totalCost * seedsPct);
  const fertilizers = Math.round(totalCost * fertPct);
  const pesticides = Math.round(totalCost * pestPct);
  const irrigation = Math.round(totalCost * irrPct);
  const electricityFuel = Math.round(totalCost * elecPct);
  const labour = Math.round(totalCost * labourPct);
  const machineryTillage = totalCost - (seeds + fertilizers + pesticides + irrigation + electricityFuel + labour);

  return {
    seeds: `₹${seeds.toLocaleString('en-IN')}`,
    seedsNum: seeds,
    fertilizers: `₹${fertilizers.toLocaleString('en-IN')}`,
    fertilizersNum: fertilizers,
    pesticides: `₹${pesticides.toLocaleString('en-IN')}`,
    pesticidesNum: pesticides,
    irrigation: `₹${irrigation.toLocaleString('en-IN')}`,
    irrigationNum: irrigation,
    electricityFuel: `₹${electricityFuel.toLocaleString('en-IN')}`,
    electricityFuelNum: electricityFuel,
    labourCharge: `₹${labour.toLocaleString('en-IN')}`,
    labourChargeNum: labour,
    machineryTillage: `₹${machineryTillage.toLocaleString('en-IN')}`,
    machineryTillageNum: machineryTillage,
    totalCost: `₹${totalCost.toLocaleString('en-IN')}`,
    totalCostNum: totalCost,
  };
}

function enrichCrop(cropName, confidence, pyData = {}) {
  const key = cropName.toLowerCase().replace(/\s+/g, '');
  const info = CROP_ENRICH[key] || CROP_ENRICH[cropName.toLowerCase()] || {};
  let yieldNum = pyData.yieldNum || (info.yield ? parseFloat(info.yield.split('-')[1] || '15') : 15);
  // Guard against unit mismatch (e.g. if raw yield in nuts like 10000 was passed)
  if (yieldNum > 500) yieldNum = parseFloat((yieldNum / 600).toFixed(1)); // Convert nuts to copra quintals
  
  const pricePerQ = pyData.pricePerQ || info.pricePerQ || 3000;
  const costPerAcre = pyData.costPerAcre || info.costPerAcre || 20000;
  const grossIncome = pyData.grossRevenue || Math.round(yieldNum * pricePerQ);
  const netProfit = pyData.netProfit || (grossIncome - costPerAcre);

  const costBreakdown = pyData.costBreakdown
    ? {
        seeds: typeof pyData.costBreakdown.seeds === 'number' ? `₹${pyData.costBreakdown.seeds.toLocaleString('en-IN')}` : pyData.costBreakdown.seeds,
        seedsNum: typeof pyData.costBreakdown.seeds === 'number' ? pyData.costBreakdown.seeds : parseInt(String(pyData.costBreakdown.seeds).replace(/\D/g, '')),
        fertilizers: typeof pyData.costBreakdown.fertilizers === 'number' ? `₹${pyData.costBreakdown.fertilizers.toLocaleString('en-IN')}` : pyData.costBreakdown.fertilizers,
        fertilizersNum: typeof pyData.costBreakdown.fertilizers === 'number' ? pyData.costBreakdown.fertilizers : parseInt(String(pyData.costBreakdown.fertilizers).replace(/\D/g, '')),
        pesticides: typeof pyData.costBreakdown.pesticides === 'number' ? `₹${pyData.costBreakdown.pesticides.toLocaleString('en-IN')}` : pyData.costBreakdown.pesticides,
        pesticidesNum: typeof pyData.costBreakdown.pesticides === 'number' ? pyData.costBreakdown.pesticides : parseInt(String(pyData.costBreakdown.pesticides).replace(/\D/g, '')),
        irrigation: typeof pyData.costBreakdown.irrigation === 'number' ? `₹${pyData.costBreakdown.irrigation.toLocaleString('en-IN')}` : pyData.costBreakdown.irrigation,
        irrigationNum: typeof pyData.costBreakdown.irrigation === 'number' ? pyData.costBreakdown.irrigation : parseInt(String(pyData.costBreakdown.irrigation).replace(/\D/g, '')),
        electricityFuel: typeof pyData.costBreakdown.electricityFuel === 'number' ? `₹${pyData.costBreakdown.electricityFuel.toLocaleString('en-IN')}` : pyData.costBreakdown.electricityFuel,
        electricityFuelNum: typeof pyData.costBreakdown.electricityFuel === 'number' ? pyData.costBreakdown.electricityFuel : parseInt(String(pyData.costBreakdown.electricityFuel).replace(/\D/g, '')),
        labourCharge: typeof pyData.costBreakdown.labourCharge === 'number' ? `₹${pyData.costBreakdown.labourCharge.toLocaleString('en-IN')}` : (pyData.costBreakdown.labourCharge || pyData.costBreakdown.labour),
        labourChargeNum: typeof pyData.costBreakdown.labourCharge === 'number' ? pyData.costBreakdown.labourCharge : parseInt(String(pyData.costBreakdown.labourCharge || pyData.costBreakdown.labour).replace(/\D/g, '')),
        machineryTillage: typeof pyData.costBreakdown.machineryTillage === 'number' ? `₹${pyData.costBreakdown.machineryTillage.toLocaleString('en-IN')}` : pyData.costBreakdown.machineryTillage,
        machineryTillageNum: typeof pyData.costBreakdown.machineryTillage === 'number' ? pyData.costBreakdown.machineryTillage : parseInt(String(pyData.costBreakdown.machineryTillage).replace(/\D/g, '')),
        totalCost: `₹${costPerAcre.toLocaleString('en-IN')}`,
        totalCostNum: costPerAcre,
      }
    : calculateRealCostBreakdown(cropName, pyData.category || info.category, costPerAcre);

  return {
    crop: cropName.charAt(0).toUpperCase() + cropName.slice(1),
    category: pyData.category || info.category || 'Crop',
    confidence: parseFloat((pyData.confidence || confidence).toFixed(1)),
    seasonal_fit: pyData.seasonal_fit || 'In Season',
    season_tag: pyData.season_tag || 'Kharif / Rabi',
    climateSuitability: pyData.climateSuitability || '85% Match',
    scoreBreakdown: pyData.scoreBreakdown || { soilMl: confidence, season: 85, revenue: 80, climate: 80 },
    yield: pyData.yield || info.yield || '15-25 Quintal/Acre',
    yieldNum,
    water: pyData.water || info.waterReq || 'Medium',
    risk: pyData.risk || info.risk || 'Medium',
    growthDays: info.growthDays || 120,
    netProfit: netProfit,
    profit: pyData.profit || `₹${netProfit.toLocaleString('en-IN')}/acre`,
    grossRevenue: `₹${grossIncome.toLocaleString('en-IN')}`,
    costPerAcre: `₹${costPerAcre.toLocaleString('en-IN')}`,
    costBreakdown,
    roiPct: pyData.roiPct || Math.round((netProfit / costPerAcre) * 100),
    adviceEn: info.adviceEn || `${cropName} grows well in suitable soil and climate conditions.`,
    adviceHi: info.adviceHi || `${cropName} उपयुक्त मिट्टी और जलवायु परिस्थितियों में अच्छी तरह उगती है।`,
    fertilizerNotes: [],
  };
}


// ─── @desc  Run Python ML Crop Recommendation ─────────────────────────────────
// @route POST /api/crop-plans/recommend
// @access Public
const recommendCrops = async (req, res, next) => {
  try {
    const {
      nitrogen = 45,
      phosphorus = 20,
      potassium = 30,
      ph = 6.5,
      texture = 'Loamy',
      temperature,
      humidity,
      rainfall,
      latitude = 28.6139,
      longitude = 77.209,
      sowingSeason = 'Kharif',
      sowingMonth,
      previousCrop = '',
      waterAvailability = 'Medium',
      budget = 50000,
      cropCategory,
      category,
    } = req.body;

    const requestedCategory = (cropCategory || category || '').trim();

    const lat = Number(latitude);
    const lng = Number(longitude);

    let temp = Number(temperature) || 28;
    let hum  = Number(humidity)    || 60;
    let rain = Number(rainfall)    || 800;

    const wx = await fetchWeather(lat, lng);
    temp = wx.temperature;
    hum  = wx.humidity;
    rain = wx.rainfall;

    const targetMonth = sowingMonth ? Number(sowingMonth) : (new Date().getMonth() + 1);

    const features = {
      N: Number(nitrogen),
      P: Number(phosphorus),
      K: Number(potassium),
      temperature: temp,
      humidity: hum,
      ph: Number(ph),
      rainfall: rain,
      month: targetMonth,   // 1=Jan … 12=Dec
      sowingSeason,
      cropCategory: requestedCategory,
      budget: Number(budget),
    };

    // Helper to group recommendations into categories
    const buildCategorized = (recs) => {
      const grouped = {
        Cereals: [],
        Pulses: [],
        Vegetables: [],
        Fruits: [],
        Oilseeds: [],
        CashCrops: [],
        Spices: [],
        FlowersMedicinal: []
      };

      recs.forEach((r) => {
        const cat = (r.category || '').toLowerCase();
        if (cat.includes('cereal')) grouped.Cereals.push(r);
        else if (cat.includes('pulse')) grouped.Pulses.push(r);
        else if (cat.includes('veg')) grouped.Vegetables.push(r);
        else if (cat.includes('fruit') || cat.includes('horticulture')) grouped.Fruits.push(r);
        else if (cat.includes('oil')) grouped.Oilseeds.push(r);
        else if (cat.includes('cash') || cat.includes('plantation')) grouped.CashCrops.push(r);
        else if (cat.includes('spice')) grouped.Spices.push(r);
        else grouped.FlowersMedicinal.push(r);
      });

      return grouped;
    };

    // 1. Try Gemini AI API first for real-time dynamic recommendations
    try {
      const geminiRecs = await getGeminiCropRecommendations({
        nitrogen,
        phosphorus,
        potassium,
        ph,
        texture,
        district: 'Karnal',
        state: 'Haryana',
        temperature: temp,
        humidity: hum,
        rainfall: rain,
        sowingSeason,
        sowingMonth: targetMonth,
        waterAvailability,
        budget,
        previousCrop,
        cropCategory: requestedCategory,
      });

      if (geminiRecs && geminiRecs.length > 0) {
        let finalGeminiRecs = geminiRecs;
        if (requestedCategory && requestedCategory.toLowerCase() !== 'all') {
          const reqLower = requestedCategory.toLowerCase();
          const filtered = geminiRecs.filter((r) => (r.category || '').toLowerCase().includes(reqLower));
          if (filtered.length > 0) finalGeminiRecs = filtered;
        }

        finalGeminiRecs.sort((a, b) => b.netProfit - a.netProfit);

        return res.json({
          success: true,
          count: finalGeminiRecs.length,
          engine: 'Gemini 2.0 AI Agronomic Engine (Real-Time AI Market & Soil Data)',
          weatherUsed: { temperature: temp, humidity: hum, rainfall: rain },
          inputParams: { ...features, texture, sowingSeason, waterAvailability, sowingMonth: targetMonth, cropCategory: requestedCategory },
          recommendations: finalGeminiRecs,
          categorizedRecommendations: buildCategorized(geminiRecs),
        });
      }
    } catch (gErr) {
      console.warn('Gemini API call failed, falling back to ML model:', gErr.message);
    }

    // 2. Run Python ML model
    let mlResult;
    try {
      mlResult = await runPythonML(features);
    } catch (mlErr) {
      console.error('Python ML failed, using fallback scoring:', mlErr.message);
      mlResult = null;
    }

    let recommendations = [];

    if (mlResult && mlResult.recommendations && mlResult.recommendations.length > 0) {
      // Use real ML predictions
      recommendations = mlResult.recommendations.map((r) =>
        enrichCrop(r.crop, r.confidence, r)
      );
    } else {
      // Fallback: simple heuristic scoring
      const fallbackCrops = Object.keys(CROP_ENRICH);
      recommendations = fallbackCrops
        .map((name) => enrichCrop(name, 50 + Math.random() * 40))
        .slice(0, 5);
    }

    // Filter by requestedCategory if provided
    if (requestedCategory && requestedCategory.toLowerCase() !== 'all') {
      const reqLower = requestedCategory.toLowerCase();
      const filtered = recommendations.filter((r) => (r.category || '').toLowerCase().includes(reqLower));
      if (filtered.length > 0) recommendations = filtered;
    }

    // Sort all recommendations strictly by Net Profit descending
    recommendations.sort((a, b) => b.netProfit - a.netProfit);

    // 3. Add fertilizer deficiency notes to top result
    const N = Number(nitrogen);
    const P = Number(phosphorus);
    const K = Number(potassium);
    const fertNotes = [];
    if (N < 40) fertNotes.push(`Low Nitrogen: Add Urea (~${40 - N} kg/acre equivalent)`);
    if (P < 20) fertNotes.push('Low Phosphorus: Apply DAP or SSP fertilizer');
    if (K < 20) fertNotes.push('Low Potassium: Add MOP (Muriate of Potash)');
    if (Number(ph) < 5.5) fertNotes.push('Acidic Soil: Apply Agricultural Lime to raise pH');
    if (Number(ph) > 8.2) fertNotes.push('Alkaline Soil: Apply Gypsum or Sulfur to lower pH');

    if (recommendations[0]) recommendations[0].fertilizerNotes = fertNotes;

    res.json({
      success: true,
      count: recommendations.length,
      engine: mlResult ? 'Multi-Factor Agronomic ML Engine (Soil + Season + Revenue + Climate)' : 'Heuristic Fallback Engine',
      weatherUsed: { temperature: temp, humidity: hum, rainfall: rain },
      inputParams: { ...features, texture, sowingSeason, waterAvailability, sowingMonth: targetMonth, cropCategory: requestedCategory },
      recommendations,
      categorizedRecommendations: buildCategorized(recommendations),
    });
  } catch (error) {
    next(error);
  }
};

// ─── Overpass API query for real KVK / Agri offices near GPS ─────────────────
function fetchOverpassLabs(lat, lng, radiusKm = 100) {
  return new Promise((resolve) => {
    const r = radiusKm * 1000; // metres
    // Search for: KVK, agricultural labs, soil testing, government agri offices
    const query = `
[out:json][timeout:25];
(
  node["office"="government"]["name"~"KVK|Krishi|Agriculture|Soil|Farm",i](around:${r},${lat},${lng});
  node["amenity"="research_institute"]["name"~"KVK|Krishi|ICAR|Agriculture|Soil",i](around:${r},${lat},${lng});
  node["landuse"="farmyard"]["name"~"KVK|Krishi",i](around:${r},${lat},${lng});
  way["office"="government"]["name"~"KVK|Krishi|Agriculture|Soil|Farm",i](around:${r},${lat},${lng});
  way["amenity"="research_institute"]["name"~"KVK|Krishi|ICAR|Agriculture|Soil",i](around:${r},${lat},${lng});
  relation["office"="government"]["name"~"KVK|Krishi|Agriculture|Soil|Farm",i](around:${r},${lat},${lng});
);
out center 30;
`.trim();

    const postData = `data=${encodeURIComponent(query)}`;
    const options = {
      hostname: 'overpass-api.de',
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'KisanSetu/1.0 (agricultural app)',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const elements = json.elements || [];
          const labs = elements
            .filter((el) => el.tags && el.tags.name)
            .map((el) => {
              const elLat = el.lat || el.center?.lat || lat;
              const elLng = el.lon || el.center?.lon || lng;
              const tags = el.tags || {};
              const name = tags.name || 'Agricultural Office';
              const phone = tags.phone || tags['contact:phone'] || tags['phone:IN'] || '';
              const addr = [
                tags['addr:housename'],
                tags['addr:street'],
                tags['addr:city'] || tags['addr:district'],
                tags['addr:state'],
              ]
                .filter(Boolean)
                .join(', ') || tags['addr:full'] || district + ', ' + state;

              return {
                name,
                type: tags.amenity === 'research_institute' ? 'ICAR-KVK' : 'Govt Agricultural Office',
                address: addr,
                distanceKm: parseFloat(haversineKm(lat, lng, elLat, elLng).toFixed(1)),
                contact: phone || 'Contact via district agriculture office',
                timing: '9AM-5PM (Mon-Sat)',
                services: ['Soil Testing', 'Fertilizer Advisory', 'Seed Testing'],
                cost: 'Free / Nominal',
                lat: elLat,
                lng: elLng,
                mapLink: `https://www.google.com/maps/search/?api=1&query=${elLat},${elLng}`,
                source: 'osm',
              };
            })
            .sort((a, b) => a.distanceKm - b.distanceKm);
          resolve(labs);
        } catch {
          resolve([]);
        }
      });
      res.on('error', () => resolve([]));
    });

    req.on('error', () => resolve([]));
    req.setTimeout(20000, () => { req.destroy(); resolve([]); });
    req.write(postData);
    req.end();
  });
}

// ─── @desc  Find Nearest Real KVK Soil Testing Labs ───────────────────────────
// @route POST /api/crop-plans/nearest-lab
// @access Public
const findNearestLab = async (req, res, next) => {
  try {
    const { latitude, longitude, district = '', state = '' } = req.body;

    const lat = Number(latitude) || 28.6139;
    const lng = Number(longitude) || 77.209;
    const districtLower = district.toLowerCase().trim();
    const stateLower = state.toLowerCase().trim();

    // ── 1. Query Overpass (real live OSM data) ───────────────────────────────
    let osmLabs = [];
    try {
      osmLabs = await fetchOverpassLabs(lat, lng, 100);
    } catch { /* fall through to static DB */ }

    // ── 2. Static DB – always calculate distances & sort ────────────────────
    const staticWithDist = KVK_DATABASE.map((lab) => ({
      ...lab,
      distanceKm: parseFloat(haversineKm(lat, lng, lab.lat, lab.lng).toFixed(1)),
      source: 'static',
      mapLink: `https://www.google.com/maps/search/?api=1&query=${lab.lat},${lab.lng}`,
    })).sort((a, b) => a.distanceKm - b.distanceKm);

    // Prioritize static labs from same district / state first
    const sameDistrict = staticWithDist.filter((l) => l.district === districtLower);
    const sameState    = staticWithDist.filter((l) => l.state === stateLower && l.district !== districtLower);
    const others       = staticWithDist.filter((l) => l.state !== stateLower);

    const staticPrioritized = [
      ...sameDistrict.slice(0, 2),
      ...sameState.slice(0, 2),
      ...others.slice(0, 2),
    ];

    // ── 3. Merge: OSM first (real data), then static DB to fill gaps ─────────
    // De-duplicate by name similarity within 1km
    const merged = [...osmLabs];
    for (const sl of staticPrioritized) {
      const isDup = merged.some(
        (m) => haversineKm(m.lat || lat, m.lng || lng, sl.lat, sl.lng) < 1
      );
      if (!isDup) merged.push(sl);
      if (merged.length >= 8) break;
    }

    // Sort merged list by distance
    merged.sort((a, b) => a.distanceKm - b.distanceKm);

    // Use top 6 results
    const labsList = merged.slice(0, 6);

    // If nothing found at all, fallback to nearest 5 from static DB
    const finalList = labsList.length > 0 ? labsList : staticWithDist.slice(0, 5);

    res.json({
      success: true,
      coords: { lat, lng },
      district,
      state,
      totalLabsSearched: KVK_DATABASE.length + osmLabs.length,
      osmResultsFound: osmLabs.length,
      labs: finalList.map((l) => ({
        name: l.name,
        type: l.type,
        address: l.address,
        distanceKm: l.distanceKm,
        contact: l.contact,
        timing: l.timing,
        services: l.services,
        cost: l.cost,
        mapLink: l.mapLink,
        source: l.source || 'static',
      })),
    });
  } catch (error) {
    next(error);
  }
};

// ─── CRUD for saved crop plans ────────────────────────────────────────────────
const getCropPlans = async (req, res, next) => {
  try {
    const plans = await CropPlan.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: plans.length, data: plans });
  } catch (error) { next(error); }
};

const getCropPlan = async (req, res, next) => {
  try {
    const plan = await CropPlan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Crop plan not found' });
    res.json({ success: true, data: plan });
  } catch (error) { next(error); }
};

const createCropPlan = async (req, res, next) => {
  try {
    const plan = await CropPlan.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: plan });
  } catch (error) { next(error); }
};

const updateCropPlan = async (req, res, next) => {
  try {
    const plan = await CropPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!plan) return res.status(404).json({ success: false, message: 'Crop plan not found' });
    res.json({ success: true, data: plan });
  } catch (error) { next(error); }
};

const deleteCropPlan = async (req, res, next) => {
  try {
    const plan = await CropPlan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!plan) return res.status(404).json({ success: false, message: 'Crop plan not found' });
    res.json({ success: true, message: 'Crop plan deleted' });
  } catch (error) { next(error); }
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
