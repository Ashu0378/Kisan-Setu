import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { cropPlanService } from '../../services/cropPlanService';
import {
  Sprout,
  MapPin,
  Droplets,
  ShieldCheck,
  Activity,
  Search,
  Leaf,
  Mountain,
  BookmarkPlus,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Zap,
  Wrench,
  Users,
  Wheat,
  Apple,
  Carrot,
  Sparkles
} from 'lucide-react';

const CROP_CATEGORIES = [
  { label: 'All Crops', value: 'All', icon: Sprout },
  { label: 'Cereals & Millets', value: 'Cereal', icon: Wheat },
  { label: 'Vegetables', value: 'Vegetables', icon: Carrot },
  { label: 'Fruits & Plantation', value: 'Fruits', icon: Apple },
  { label: 'Pulses & Legumes', value: 'Pulses', icon: Leaf },
  { label: 'Oilseeds', value: 'Oilseeds', icon: Sparkles },
  { label: 'Cash Crops', value: 'Cash Crop', icon: DollarSign },
];

export function CropPlanner() {
  const { lang } = useLanguage();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [fertilizerAdvice, setFertilizerAdvice] = useState([]);
  const [mlEngine, setMlEngine] = useState('');
  const [weatherUsed, setWeatherUsed] = useState(null);
  
  const [saveStatus, setSaveStatus] = useState({});
  const [expandedCost, setExpandedCost] = useState({});

  const [formData, setFormData] = useState({
    nitrogen: 45,
    phosphorus: 20,
    potassium: 30,
    ph: 6.5,
    texture: 'Loamy',
    latitude: user?.lat || 28.6139,
    longitude: user?.lng || 77.2090,
    district: user?.district || 'Karnal',
    state: user?.state || 'Haryana',
    waterAvailability: 'Medium',
    budget: 50000,
    sowingSeason: 'Kharif',
    sowingMonth: new Date().getMonth() + 1,
    category: 'All',
    previousCrop: 'Wheat',
  });

  useEffect(() => {
    // Auto-fetch GPS on component mount
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(4));
          const lng = parseFloat(position.coords.longitude.toFixed(4));
          
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }));

          try {
            const resp = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const data = await resp.json();
            const addr = data.address || {};
            const dist = addr.county || addr.district || addr.city || addr.town || '';
            const st = addr.state || '';
            
            if (dist || st) {
              setFormData((prev) => ({
                ...prev,
                district: dist || prev.district,
                state: st || prev.state,
              }));
            }
          } catch {
            // ignore fallback
          }
        },
        () => {},
        { timeout: 10000 }
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (catValue) => {
    setFormData((prev) => ({ ...prev, category: catValue }));
  };

  const handleFetchGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(4));
          const lng = parseFloat(position.coords.longitude.toFixed(4));
          
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }));

          try {
            const resp = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const data = await resp.json();
            const addr = data.address || {};
            const dist = addr.county || addr.district || addr.city || addr.town || '';
            const st = addr.state || '';

            setFormData((prev) => ({
              ...prev,
              district: dist || prev.district,
              state: st || prev.state,
            }));
            alert(lang === 'en' ? `GPS Coordinates set to ${dist || 'Location'}, ${st}` : `जीपीएस स्थान सेट किया गया: ${dist || 'स्थान'}, ${st}`);
          } catch {
            alert(lang === 'en' ? 'GPS Lat/Lng captured.' : 'जीपीएस स्थान प्राप्त!');
          }
        },
        () => alert(lang === 'en' ? 'Unable to retrieve your location.' : 'आपका स्थान प्राप्त करने में असमर्थ।')
      );
    } else {
      alert(lang === 'en' ? 'Geolocation is not supported by your browser.' : 'जियोलोकेशन आपके ब्राउज़र द्वारा समर्थित नहीं है।');
    }
  };

  const kvkGoogleMapsUrl = `https://www.google.com/maps/search/KVK+soil+testing+lab+near+${encodeURIComponent((formData.district || '') + ' ' + (formData.state || '') + ' India')}`;

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setResults(null);
    setFertilizerAdvice([]);
    setMlEngine('');
    setWeatherUsed(null);
    try {
      const data = await cropPlanService.getRecommendations(formData);
      if (data.recommendations) {
        setResults(data.recommendations);
        setMlEngine(data.engine || '');
        setWeatherUsed(data.weatherUsed || null);
        if (data.recommendations[0]?.fertilizerNotes) {
          setFertilizerAdvice(data.recommendations[0].fertilizerNotes);
        }
      }
    } catch (err) {
      alert(err.message || (lang === 'en' ? 'ML Analysis failed.' : 'ML विश्लेषण विफल।'));
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async (crop, idx) => {
    if (!token) {
      alert(lang === 'en' ? 'Please sign in to save crop plans.' : 'फसल योजना सहेजने के लिए कृपया साइन इन करें।');
      return;
    }
    setSaveStatus((prev) => ({ ...prev, [idx]: 'saving' }));
    try {
      await cropPlanService.saveCropPlan(
        {
          season: formData.sowingSeason,
          year: new Date().getFullYear(),
          crops: [
            {
              cropName: crop.crop,
              area: Number(user?.landSize || 5),
              expectedYield: crop.yieldNum ? crop.yieldNum * Number(user?.landSize || 5) : 100,
              status: 'planned',
              notes: `ML Confidence: ${crop.confidence}%. Profit: ${crop.profit}`,
            },
          ],
          totalArea: Number(user?.landSize || 5),
          notes: `Created via KisanSetu AI Crop Planner for ${formData.district}, ${formData.state}`,
        },
        token
      );
      setSaveStatus((prev) => ({ ...prev, [idx]: 'saved' }));
    } catch (err) {
      alert(err.message || 'Failed to save plan.');
      setSaveStatus((prev) => ({ ...prev, [idx]: 'error' }));
    }
  };

  const toggleCostBreakdown = (idx) => {
    setExpandedCost((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const InputField = ({ label, icon: Icon, ...props }) => (
    <div className="relative group">
      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">{label}</label>
      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-3.5 w-4 h-4 text-emerald-600/70 group-focus-within:text-emerald-600 transition-colors" />}
        <input
          {...props}
          className={`w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-sm transition-all duration-200 outline-none placeholder:text-slate-400 shadow-sm focus:shadow-md ${Icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5'}`}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* Hero Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-green-950 p-8 sm:p-10 rounded-3xl shadow-xl overflow-hidden relative border border-emerald-500/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 blur-[90px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/15 blur-[90px] rounded-full translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="flex items-start gap-5 relative z-10">
          <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-inner shrink-0">
            <Sprout className="w-10 h-10 text-emerald-400 animate-float" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                AI Agronomic Engine 2.0
              </span>
              <span className="bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                Real Real-Cost Profitability
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {lang === 'en' ? 'AI Crop Recommendation & Cost Intelligence' : 'AI फसल सिफारिश व वास्तविक लागत विश्लेषण'}
            </h1>
            <p className="text-slate-300 font-medium mt-2 text-sm max-w-2xl leading-relaxed">
              {lang === 'en' 
                ? 'Multi-factor agronomic engine analyzing soil NPK, pH, GPS climate, itemized cultivation breakdown (seeds, fertilizer, labour, irrigation, machinery), and mandi profits.' 
                : 'मिट्टी के NPK, pH, GPS जलवायु, श्रम मजदूरी, बीज, उर्वरक, और सिंचाई लागत का वास्तविक बहु-मापदंडीय विश्लेषण।'}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Selector Tabs */}
      <div className="bg-white/80 backdrop-blur-xl p-3 rounded-2xl border border-emerald-100 shadow-soft flex items-center gap-2 overflow-x-auto no-scrollbar">
        {CROP_CATEGORIES.map((cat) => {
          const IconComponent = cat.icon;
          const isActive = formData.category === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => handleCategorySelect(cat.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                  : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/60'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Farm Parameters Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleAnalyze} className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-soft border border-emerald-100/80 space-y-8 relative overflow-hidden">
            
            {/* KVK Soil Testing Center Links */}
            <div className="bg-gradient-to-br from-emerald-50 via-lime-50/50 to-amber-50/40 rounded-2xl p-5 border border-emerald-200/80 relative overflow-hidden shadow-sm">
              <div className="flex flex-col gap-3 relative z-10">
                <div>
                  <h4 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
                    <span className="p-1 bg-emerald-600 text-white rounded-lg text-xs">🔬</span>
                    {lang === 'en' ? 'Find Nearest Soil Testing Lab / KVK' : 'निकटतम मिट्टी परीक्षण केंद्र खोजें'}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    {lang === 'en'
                      ? 'Official government KVK portals for precise soil health card testing near your location.'
                      : 'अपने नजदीकी KVK केंद्र की सटीक जानकारी के लिए सरकारी पोर्टल का उपयोग करें।'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="https://soilhealth.dac.gov.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center gap-2 bg-white border border-amber-200 hover:border-amber-400 rounded-xl px-3 py-2 text-xs font-bold text-amber-900 transition-all hover:shadow-md group"
                  >
                    <span>🌱</span>
                    <span className="truncate">Soil Health Card Portal</span>
                  </a>

                  <a
                    href={kvkGoogleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center gap-2 bg-white border border-blue-200 hover:border-blue-400 rounded-xl px-3 py-2 text-xs font-bold text-blue-900 transition-all hover:shadow-md group"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span className="truncate">Google Maps KVK</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 1. Soil Composition */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-emerald-100 rounded-xl"><Leaf className="w-4 h-4 text-emerald-700"/></div>
                <h3 className="font-extrabold text-slate-900 text-base">{lang === 'en' ? 'Soil Health & NPK Profile' : 'मिट्टी की संरचना (NPK & pH)'}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Nitrogen (N kg/ha)" name="nitrogen" type="number" value={formData.nitrogen} onChange={handleChange} />
                <InputField label="Phosphorus (P kg/ha)" name="phosphorus" type="number" value={formData.phosphorus} onChange={handleChange} />
                <InputField label="Potassium (K kg/ha)" name="potassium" type="number" value={formData.potassium} onChange={handleChange} />
                <InputField label="Soil pH" name="ph" type="number" step="0.1" value={formData.ph} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Soil Texture</label>
                <select name="texture" value={formData.texture} onChange={handleChange} className="w-full bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 transition-all outline-none cursor-pointer">
                  <option value="Loamy">Loamy (दोमट)</option>
                  <option value="Sandy">Sandy (बलुई)</option>
                  <option value="Clayey">Clayey (चिकनी)</option>
                  <option value="Silty">Silty (गाद)</option>
                </select>
              </div>
            </div>

            {/* 2. Spatial Data */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl"><Mountain className="w-4 h-4 text-amber-700"/></div>
                  <h3 className="font-extrabold text-slate-900 text-base">{lang === 'en' ? 'Location & GPS Coordinates' : 'स्थानिक व लोकेशन डेटा'}</h3>
                </div>
                <button 
                  type="button" 
                  onClick={handleFetchGPS}
                  className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors active:scale-95"
                >
                  <MapPin className="w-3 h-3" />
                  {lang === 'en' ? 'Auto GPS' : 'जीपीएस'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="District" name="district" type="text" value={formData.district} onChange={handleChange} />
                <InputField label="State" name="state" type="text" value={formData.state} onChange={handleChange} />
                <InputField label="Latitude" name="latitude" type="number" step="0.0001" value={formData.latitude} onChange={handleChange} />
                <InputField label="Longitude" name="longitude" type="number" step="0.0001" value={formData.longitude} onChange={handleChange} />
              </div>
            </div>

            {/* 3. Agronomic & Season */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="p-2 bg-purple-100 rounded-xl"><Sprout className="w-4 h-4 text-purple-700"/></div>
                <h3 className="font-extrabold text-slate-900 text-base">{lang === 'en' ? 'Sowing Season & Economics' : 'बुआई का मौसम व बजट'}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Sowing Season</label>
                  <select name="sowingSeason" value={formData.sowingSeason} onChange={handleChange} className="w-full bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 transition-all outline-none cursor-pointer">
                    <option value="Kharif">Kharif (Monsoon / खरीफ)</option>
                    <option value="Rabi">Rabi (Winter / रबी)</option>
                    <option value="Zaid">Zaid (Summer / ज़ैद)</option>
                    <option value="Year-Round">Year-Round / Any Season</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Sowing Month</label>
                  <select name="sowingMonth" value={formData.sowingMonth} onChange={handleChange} className="w-full bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 transition-all outline-none cursor-pointer">
                    <option value="1">January (जनवरी)</option>
                    <option value="2">February (फ़रवरी)</option>
                    <option value="3">March (मार्च)</option>
                    <option value="4">April (अप्रैल)</option>
                    <option value="5">May (मई)</option>
                    <option value="6">June (जून)</option>
                    <option value="7">July (जुलाई)</option>
                    <option value="8">August (अगस्त)</option>
                    <option value="9">September (सितंबर)</option>
                    <option value="10">October (अक्टूबर)</option>
                    <option value="11">November (नवंबर)</option>
                    <option value="12">December (दिसंबर)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Water Supply</label>
                  <select name="waterAvailability" value={formData.waterAvailability} onChange={handleChange} className="w-full bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 transition-all outline-none cursor-pointer">
                    <option value="High">High Water (उच्च)</option>
                    <option value="Medium">Medium (मध्यम)</option>
                    <option value="Low">Low (निम्न)</option>
                  </select>
                </div>
                
                <InputField label="Farmer Budget (₹/Acre)" name="budget" type="number" value={formData.budget} onChange={handleChange} />
              </div>
            </div>

            <Button type="submit" className="w-full py-4 text-base font-extrabold rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30 hover:shadow-hover-glow hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.98] transition-all" isLoading={loading}>
              <Activity className="w-5 h-5 mr-2 animate-pulse" />
              {lang === 'en' ? 'Run ML Crop & Cost Engine' : 'ML फसल व लागत विश्लेषण चलाएं'}
            </Button>
          </form>
        </div>

        {/* Dynamic Results Column */}
        <div className="lg:col-span-7">
          {results ? (
            <div className="space-y-6 animate-slide-up">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-2xl text-slate-900 tracking-tight">{lang === 'en' ? 'Recommended Seasonal Crops' : 'अनुकूलित फसल सिफारिशें'}</h3>
                <div className="flex items-center gap-2 bg-emerald-100/90 px-3 py-1.5 rounded-full border border-emerald-300/50 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span className="text-[10px] font-extrabold text-emerald-900 uppercase tracking-widest">{mlEngine.includes('Python') ? 'Python ML Regressor' : 'AI Active'}</span>
                </div>
              </div>

              {/* Weather used by ML */}
              {weatherUsed && (
                <div className="bg-sky-50 border border-sky-200/80 rounded-2xl p-4 flex flex-wrap gap-4 text-xs text-sky-900 shadow-sm">
                  <span className="font-bold text-sky-950 w-full flex items-center gap-1.5">
                    🌤️ Live Weather Metrics Captured for {formData.district}, {formData.state}:
                  </span>
                  <span>🌡️ Temp: <strong>{weatherUsed.temperature}°C</strong></span>
                  <span>💧 Humidity: <strong>{weatherUsed.humidity}%</strong></span>
                  <span>🌧️ Annual Rainfall: <strong>{weatherUsed.rainfall} mm</strong></span>
                </div>
              )}

              {/* Fertilizer Diagnostic Advice */}
              {fertilizerAdvice.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-950 text-xs space-y-1.5 shadow-sm">
                  <p className="font-bold flex items-center gap-1.5 text-amber-900 text-sm">
                    <AlertCircle className="w-4 h-4 text-amber-600"/> Agronomic Diagnostics & Soil Fertilizer Notes:
                  </p>
                  {fertilizerAdvice.map((adv, i) => (
                    <p key={i} className="ml-5 font-semibold leading-relaxed text-amber-800">• {adv}</p>
                  ))}
                </div>
              )}

              {results.map((res, idx) => {
                const isExpanded = expandedCost[idx];
                const bd = res.costBreakdown;

                return (
                  <div key={idx} className={`relative rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group overflow-hidden ${
                    idx === 0 
                    ? 'bg-gradient-to-br from-emerald-800 via-green-800 to-emerald-950 text-white shadow-lg shadow-emerald-950/20 border border-emerald-500/40' 
                    : 'bg-white/90 backdrop-blur-xl border border-emerald-100 text-slate-900 shadow-soft hover:border-emerald-300'
                  }`}>
                    
                    {idx === 0 && (
                      <div className="absolute top-0 right-8 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[10px] font-black uppercase tracking-widest px-5 py-1.5 rounded-b-xl shadow-md z-10 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5"/> #1 Top Profit Crop
                      </div>
                    )}

                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 relative z-10">
                      <div className="space-y-5 flex-1 w-full">
                        <div className="flex flex-wrap items-center justify-between xl:justify-start gap-3">
                          <div>
                            <h4 className="font-black text-2xl sm:text-3xl tracking-tight">{res.crop}</h4>
                            <p className={`text-xs font-bold mt-0.5 ${idx === 0 ? 'text-emerald-200' : 'text-slate-500'}`}>Category: {res.category}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-sm flex items-center gap-1.5 ${idx === 0 ? 'bg-white/20 text-white border border-white/20' : 'bg-emerald-100/80 text-emerald-900 border border-emerald-300/60'}`}>
                              <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-amber-400' : 'bg-emerald-600'}`}></div>
                              {res.confidence}% Composite Score
                            </div>

                            {/* Seasonal Fit Badge */}
                            <div className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              res.seasonal_fit?.includes('Optimal') || res.seasonal_fit?.includes('In Season')
                                ? (idx === 0 ? 'bg-emerald-400 text-emerald-950 font-black' : 'bg-emerald-100 text-emerald-900 border border-emerald-300')
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              🗓️ {res.seasonal_fit || 'In Season'}
                            </div>
                          </div>
                        </div>

                        {/* Agronomic Data Cards */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className={`p-3.5 rounded-2xl transition-colors ${idx === 0 ? 'bg-white/10 hover:bg-white/15' : 'bg-slate-50 hover:bg-emerald-50/50'}`}>
                            <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${idx === 0 ? 'text-emerald-200' : 'text-slate-400'}`}>Yield / Acre</p>
                            <p className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5"><Sprout className="w-4 h-4 text-emerald-500"/> {res.yield}</p>
                          </div>
                          <div className={`p-3.5 rounded-2xl transition-colors ${idx === 0 ? 'bg-white/10 hover:bg-white/15' : 'bg-slate-50 hover:bg-emerald-50/50'}`}>
                            <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${idx === 0 ? 'text-emerald-200' : 'text-slate-400'}`}>Risk Profile</p>
                            <p className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500"/> {res.risk}</p>
                          </div>
                          <div className={`p-3.5 rounded-2xl transition-colors ${idx === 0 ? 'bg-white/10 hover:bg-white/15' : 'bg-slate-50 hover:bg-emerald-50/50'}`}>
                            <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-1 ${idx === 0 ? 'text-emerald-200' : 'text-slate-400'}`}>Water Needs</p>
                            <p className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5"><Droplets className="w-4 h-4 text-sky-500"/> {res.water}</p>
                          </div>
                        </div>

                        <div className="pt-2">
                          <p className={`text-xs leading-relaxed font-medium ${idx === 0 ? 'text-emerald-100' : 'text-slate-600'}`}>
                            <strong className={idx === 0 ? 'text-white font-black' : 'text-slate-900 font-extrabold'}>AI Advisory: </strong> 
                            {lang === 'en' ? res.adviceEn : res.adviceHi}
                          </p>
                        </div>
                      </div>

                      {/* Revenue & Profit Side Banner */}
                      <div className={`w-full xl:w-auto p-6 rounded-2xl text-center min-w-[210px] flex flex-col justify-center border shadow-inner shrink-0 ${
                        idx === 0 ? 'bg-black/30 backdrop-blur-md border-white/20' : 'bg-emerald-50/60 border-emerald-200/80'
                      }`}>
                        <p className={`text-[11px] font-black uppercase tracking-widest mb-1 ${idx === 0 ? 'text-emerald-200' : 'text-slate-500'}`}>Est. Net Profit</p>
                        <p className={`text-3xl font-black tracking-tight ${idx === 0 ? 'text-white' : 'text-emerald-700'}`}>{res.profit}</p>
                        <p className={`text-[11px] font-bold mt-1 ${idx === 0 ? 'text-emerald-200' : 'text-slate-600'}`}>Total Cost: {res.costPerAcre}</p>
                        
                        <div className="mt-4 flex flex-col gap-2">
                          <button 
                            onClick={() => toggleCostBreakdown(idx)}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                              idx === 0 
                                ? 'bg-white/15 text-white hover:bg-white/25 border border-white/20' 
                                : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                            }`}
                          >
                            <span>{isExpanded ? 'Hide Cost Details' : 'View Real Cost Breakdown'}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          <button 
                            onClick={() => handleSavePlan(res, idx)}
                            disabled={saveStatus[idx] === 'saved'}
                            className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                              saveStatus[idx] === 'saved'
                                ? 'bg-green-500 text-white cursor-default'
                                : idx === 0
                                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black hover:from-amber-300 hover:to-amber-400'
                                : 'bg-emerald-700 text-white hover:bg-emerald-800'
                            }`}
                          >
                            {saveStatus[idx] === 'saved' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Saved to Plan
                              </>
                            ) : saveStatus[idx] === 'saving' ? (
                              'Saving...'
                            ) : (
                              <>
                                <BookmarkPlus className="w-3.5 h-3.5" /> Save Plan
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Itemized Cultivation Cost Breakdown Card */}
                    {isExpanded && bd && (
                      <div className={`mt-6 pt-6 border-t animate-slide-up text-xs ${idx === 0 ? 'border-white/20 text-white' : 'border-slate-200 text-slate-800'}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="font-extrabold text-sm flex items-center gap-2">
                            <span>🧾</span> Real Itemized Cultivation Cost Breakdown (Per Acre)
                          </h5>
                          <span className="font-bold text-emerald-400">Total: {bd.totalCost}</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className={`p-3 rounded-xl border ${idx === 0 ? 'bg-white/10 border-white/15' : 'bg-slate-50 border-slate-200'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1 flex items-center gap-1">
                              <Sprout className="w-3 h-3 text-emerald-400" /> Seeds & Nursery
                            </p>
                            <p className="font-extrabold text-sm">{bd.seeds}</p>
                          </div>

                          <div className={`p-3 rounded-xl border ${idx === 0 ? 'bg-white/10 border-white/15' : 'bg-slate-50 border-slate-200'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1 flex items-center gap-1">
                              <Leaf className="w-3 h-3 text-emerald-400" /> Fertilizers & NPK
                            </p>
                            <p className="font-extrabold text-sm">{bd.fertilizers}</p>
                          </div>

                          <div className={`p-3 rounded-xl border ${idx === 0 ? 'bg-white/10 border-white/15' : 'bg-slate-50 border-slate-200'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Pesticides & Protection
                            </p>
                            <p className="font-extrabold text-sm">{bd.pesticides}</p>
                          </div>

                          <div className={`p-3 rounded-xl border ${idx === 0 ? 'bg-white/10 border-white/15' : 'bg-slate-50 border-slate-200'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1 flex items-center gap-1">
                              <Droplets className="w-3 h-3 text-sky-400" /> Irrigation & Canal
                            </p>
                            <p className="font-extrabold text-sm">{bd.irrigation}</p>
                          </div>

                          <div className={`p-3 rounded-xl border ${idx === 0 ? 'bg-white/10 border-white/15' : 'bg-slate-50 border-slate-200'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1 flex items-center gap-1">
                              <Zap className="w-3 h-3 text-amber-400" /> Electricity & Fuel
                            </p>
                            <p className="font-extrabold text-sm">{bd.electricityFuel}</p>
                          </div>

                          <div className={`p-3 rounded-xl border ${idx === 0 ? 'bg-white/10 border-white/15' : 'bg-slate-50 border-slate-200'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1 flex items-center gap-1">
                              <Users className="w-3 h-3 text-amber-400" /> Labour Wages
                            </p>
                            <p className="font-extrabold text-sm">{bd.labourCharge}</p>
                          </div>

                          <div className={`p-3 rounded-xl border ${idx === 0 ? 'bg-white/10 border-white/15' : 'bg-slate-50 border-slate-200'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80 mb-1 flex items-center gap-1">
                              <Wrench className="w-3 h-3 text-slate-400" /> Machinery & Tillage
                            </p>
                            <p className="font-extrabold text-sm">{bd.machineryTillage}</p>
                          </div>

                          <div className={`p-3 rounded-xl border ${idx === 0 ? 'bg-amber-400/20 border-amber-300/40 text-amber-200' : 'bg-emerald-100 border-emerald-300 text-emerald-950'}`}>
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Total Cost / Acre</p>
                            <p className="font-black text-sm">{bd.totalCost}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Confidence Progress Bar */}
                    <div className="absolute bottom-0 left-0 h-1.5 w-full bg-slate-200/40 overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ease-out ${idx === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-300' : 'bg-gradient-to-r from-emerald-500 to-green-600'}`} style={{ width: `${res.confidence}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full min-h-[550px] border-2 border-dashed border-emerald-200/80 rounded-3xl flex flex-col items-center justify-center bg-white/60 p-10 text-center relative overflow-hidden transition-colors hover:border-emerald-400">
              <div className="relative z-10 flex flex-col items-center max-w-md">
                <div className="p-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl shadow-xl shadow-emerald-600/25 mb-6 text-white transform transition-transform hover:scale-105">
                  <Activity className="w-14 h-14 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">{lang === 'en' ? 'Awaiting Soil & Farm Inputs' : 'पैरामीटर की प्रतीक्षा कर रहा है'}</h3>
                <p className="text-slate-600 leading-relaxed font-medium text-sm">
                  {lang === 'en' 
                    ? 'Enter your soil NPK composition, pH level, district location, and sowing season to run the multi-factor agronomic & cost prediction engine.' 
                    : 'मशीन लर्निंग प्रणाली से सिफारिशें व लागत विवरण प्राप्त करने के लिए अपने मिट्टी, जलवायु, और स्थानिक पैरामीटर दर्ज करें।'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
