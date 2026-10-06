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
  CloudRain,
  Droplets,
  ShieldCheck,
  Thermometer,
  Percent,
  Activity,
  Search,
  Leaf,
  Wind,
  Mountain,
  BookmarkPlus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export function CropPlanner() {
  const { lang } = useLanguage();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [fertilizerAdvice, setFertilizerAdvice] = useState([]);
  
  const [findingLab, setFindingLab] = useState(false);
  const [labsList, setLabsList] = useState(null);
  const [saveStatus, setSaveStatus] = useState({});

  const [formData, setFormData] = useState({
    nitrogen: 45,
    phosphorus: 20,
    potassium: 30,
    ph: 6.5,
    texture: 'Loamy',
    temperature: 25,
    humidity: 60,
    rainfall: 800,
    latitude: user?.lat || 28.6139,
    longitude: user?.lng || 77.2090,
    district: user?.district || 'Karnal',
    state: user?.state || 'Haryana',
    elevation: 200,
    waterAvailability: 'Medium',
    budget: 50000,
    weatherCondition: 'Sunny',
    sowingSeason: 'Kharif',
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

          // Reverse geocode to get District and State
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
        (error) => {
          console.log('GPS auto-fetch denied or failed:', error);
        },
        { timeout: 10000 }
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleFindLab = async () => {
    setFindingLab(true);
    setLabsList(null);
    try {
      const data = await cropPlanService.findNearestLab({
        latitude: formData.latitude,
        longitude: formData.longitude,
        district: formData.district,
        state: formData.state,
      });
      setLabsList(data.labs || []);
    } catch {
      alert(lang === 'en' ? 'Failed to fetch nearby labs.' : 'निकटतम लैब प्राप्त करने में विफलता।');
    } finally {
      setFindingLab(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    setFertilizerAdvice([]);
    try {
      const data = await cropPlanService.getRecommendations(formData);
      if (data.recommendations) {
        setResults(data.recommendations);
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

  const InputField = ({ label, icon: Icon, ...props }) => (
    <div className="relative group">
      <label className="block text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1.5 ml-1">{label}</label>
      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-3.5 w-4 h-4 text-surface-400 group-focus-within:text-brand-500 transition-colors" />}
        <input
          {...props}
          className={`w-full bg-surface-50/50 hover:bg-surface-50 focus:bg-white border border-surface-200 focus:border-brand-400 rounded-xl text-sm transition-all duration-200 outline-none placeholder:text-surface-300 shadow-sm focus:shadow-md ${Icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5'}`}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-r from-surface-900 to-surface-800 p-8 rounded-3xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
            <Sprout className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{lang === 'en' ? 'AI Crop Intelligence Planner' : 'AI फसल बुद्धिमत्ता योजना'}</h1>
            <p className="text-surface-300 font-medium mt-1 text-sm max-w-md">
              {lang === 'en' ? 'Multi-parameter ML agronomic engine tailored to soil NPK, pH, GPS climate, and market profitability.' : 'मिट्टी के NPK, pH, GPS जलवायु और बाजार लाभप्रदता के लिए बहु-पैरामीटर ML इंजन।'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Inputs Column */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleAnalyze} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-100/50 space-y-8 relative overflow-hidden">
            
            {/* Lab Locator Widget */}
            <div className="bg-gradient-to-br from-brand-50 to-emerald-50 rounded-2xl p-5 border border-brand-100 relative overflow-hidden transition-all hover:shadow-md hover:border-brand-200">
              <div className="absolute -right-4 -bottom-4 opacity-5"><Search className="w-24 h-24" /></div>
              <div className="relative z-10 flex flex-col gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-brand-900">{lang === 'en' ? 'Unsure about your soil?' : 'अपनी मिट्टी के बारे में अनिश्चित हैं?'}</h4>
                  <p className="text-xs text-brand-700/80 mt-0.5 leading-relaxed font-medium">
                    {lang === 'en' ? `Locate Soil Testing & KVK Labs near ${formData.district || 'your district'}.` : `अपने जिले के पास मिट्टी परीक्षण प्रयोगशालाएँ और KVK खोजें।`}
                  </p>
                </div>
                
                {!labsList ? (
                  <Button type="button" variant="primary" size="sm" onClick={handleFindLab} isLoading={findingLab} className="w-fit bg-brand-600 hover:bg-brand-700 text-white border-none shadow-md rounded-xl text-xs px-4 h-9">
                    <Search className="w-3.5 h-3.5 mr-1.5" />
                    {lang === 'en' ? "Find Nearby KVK Labs" : "निकटतम प्रयोगशाला खोजें"}
                  </Button>
                ) : (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-brand-900">{labsList.length} Labs Found</span>
                      <button type="button" onClick={() => setLabsList(null)} className="text-[10px] text-surface-500 hover:underline">Close</button>
                    </div>
                    {labsList.map((lab, index) => (
                      <div key={index} className="bg-white/90 backdrop-blur-sm rounded-xl border border-brand-200 p-3 shadow-sm text-left">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-extrabold text-brand-900 text-xs">{lab.name}</p>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">{lab.distanceKm} km</span>
                        </div>
                        <p className="text-[10px] text-surface-600 flex items-start gap-1"><MapPin className="w-3 h-3 text-surface-400 shrink-0 mt-0.5" />{lab.address}</p>
                        <p className="text-[10px] font-semibold text-brand-700 mt-1">📞 {lab.contact} • {lab.cost}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 1. Soil Health */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-surface-100 pb-3">
                <div className="p-2 bg-emerald-100 rounded-xl"><Leaf className="w-4 h-4 text-emerald-600"/></div>
                <h3 className="font-extrabold text-surface-800 text-base tracking-tight">{lang === 'en' ? 'Soil Composition' : 'मिट्टी की संरचना'}</h3>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <InputField label="Nitrogen (N)" name="nitrogen" type="number" value={formData.nitrogen} onChange={handleChange} />
                <InputField label="Phosphorus (P)" name="phosphorus" type="number" value={formData.phosphorus} onChange={handleChange} />
                <InputField label="Potassium (K)" name="potassium" type="number" value={formData.potassium} onChange={handleChange} />
                <InputField label="pH Level" name="ph" type="number" step="0.1" value={formData.ph} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1.5 ml-1">Soil Texture</label>
                <select name="texture" value={formData.texture} onChange={handleChange} className="w-full bg-surface-50/50 focus:bg-white border border-surface-200 focus:border-brand-400 rounded-xl px-4 py-2.5 text-sm transition-all outline-none shadow-sm focus:shadow-md cursor-pointer">
                  <option value="Sandy">Sandy (बलुई)</option>
                  <option value="Clayey">Clayey (चिकनी)</option>
                  <option value="Loamy">Loamy (दोमट)</option>
                  <option value="Silty">Silty (गाद)</option>
                </select>
              </div>
            </div>

            {/* 2. Climate */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-surface-100 pb-3">
                <div className="p-2 bg-blue-100 rounded-xl"><Wind className="w-4 h-4 text-blue-600"/></div>
                <h3 className="font-extrabold text-surface-800 text-base tracking-tight">{lang === 'en' ? 'Climate Metrics' : 'जलवायु मेट्रिक्स'}</h3>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <InputField label="Temp (°C)" name="temperature" type="number" icon={Thermometer} value={formData.temperature} onChange={handleChange} />
                <InputField label="Humidity (%)" name="humidity" type="number" icon={Percent} value={formData.humidity} onChange={handleChange} />
                <InputField label="Seasonal Rainfall (mm)" name="rainfall" type="number" icon={CloudRain} value={formData.rainfall} onChange={handleChange} />
                <div>
                  <label className="block text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1.5 ml-1">Current Weather</label>
                  <select name="weatherCondition" value={formData.weatherCondition} onChange={handleChange} className="w-full bg-surface-50/50 focus:bg-white border border-surface-200 focus:border-brand-400 rounded-xl px-4 py-2.5 text-sm transition-all outline-none shadow-sm focus:shadow-md cursor-pointer">
                    <option value="Sunny">Sunny (धूप)</option>
                    <option value="Cloudy">Cloudy (बादल)</option>
                    <option value="Rainy">Rainy (बरसात)</option>
                    <option value="Dry">Dry (सूखा)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Spatial Data */}
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-surface-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl"><Mountain className="w-4 h-4 text-amber-600"/></div>
                  <h3 className="font-extrabold text-surface-800 text-base tracking-tight">{lang === 'en' ? 'Spatial & Location' : 'स्थानिक व लोकेशन डेटा'}</h3>
                </div>
                <button 
                  type="button" 
                  onClick={handleFetchGPS}
                  className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors active:scale-95"
                >
                  <MapPin className="w-3 h-3" />
                  {lang === 'en' ? 'GPS Auto-Detect' : 'जीपीएस स्थान'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <InputField label="District" name="district" type="text" value={formData.district} onChange={handleChange} />
                <InputField label="State" name="state" type="text" value={formData.state} onChange={handleChange} />
                <InputField label="Latitude" name="latitude" type="number" step="0.0001" value={formData.latitude} onChange={handleChange} />
                <InputField label="Longitude" name="longitude" type="number" step="0.0001" value={formData.longitude} onChange={handleChange} />
              </div>
            </div>

            {/* 4. Agronomic & Economic */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-surface-100 pb-3">
                <div className="p-2 bg-purple-100 rounded-xl"><Sprout className="w-4 h-4 text-purple-600"/></div>
                <h3 className="font-extrabold text-surface-800 text-base tracking-tight">{lang === 'en' ? 'Agronomic & Season' : 'कृषि व मौसम'}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1.5 ml-1">Water Availability</label>
                  <select name="waterAvailability" value={formData.waterAvailability} onChange={handleChange} className="w-full bg-surface-50/50 focus:bg-white border border-surface-200 focus:border-brand-400 rounded-xl px-4 py-2.5 text-sm transition-all outline-none shadow-sm focus:shadow-md cursor-pointer">
                    <option value="High">High (उच्च)</option>
                    <option value="Medium">Medium (मध्यम)</option>
                    <option value="Low">Low (निम्न)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-surface-400 uppercase tracking-wider mb-1.5 ml-1">Sowing Season</label>
                  <select name="sowingSeason" value={formData.sowingSeason} onChange={handleChange} className="w-full bg-surface-50/50 focus:bg-white border border-surface-200 focus:border-brand-400 rounded-xl px-4 py-2.5 text-sm transition-all outline-none shadow-sm focus:shadow-md cursor-pointer">
                    <option value="Kharif">Kharif (खरीफ)</option>
                    <option value="Rabi">Rabi (रबी)</option>
                    <option value="Zaid">Zaid (ज़ैद)</option>
                  </select>
                </div>
                
                <InputField label="Previous Crop" name="previousCrop" type="text" value={formData.previousCrop} onChange={handleChange} />
                <InputField label="Budget (₹)" name="budget" type="number" value={formData.budget} onChange={handleChange} />
              </div>
            </div>

            <Button type="submit" className="w-full py-4 h-auto text-base font-extrabold shadow-xl hover:shadow-2xl rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] transition-all relative overflow-hidden" isLoading={loading}>
              <Activity className="w-5 h-5 mr-2 animate-pulse" />
              {lang === 'en' ? 'Run Backend ML Analysis' : 'ML विश्लेषण चलाएं'}
            </Button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          {results ? (
            <div className="space-y-6 animate-slide-up">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-2xl text-surface-900 tracking-tight">{lang === 'en' ? 'AI Optimized Recommendations' : 'अनुकूलित सिफारिशें'}</h3>
                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest">ML Backend Active</span>
                </div>
              </div>

              {/* Fertilizer / Agronomic Deficiency Warning */}
              {fertilizerAdvice.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1 text-amber-800"><AlertCircle className="w-4 h-4"/> Agronomic & Fertilizer Diagnostics:</p>
                  {fertilizerAdvice.map((adv, i) => (
                    <p key={i} className="ml-5 font-medium">• {adv}</p>
                  ))}
                </div>
              )}

              {results.map((res, idx) => (
                <div key={idx} className={`relative rounded-[32px] p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl group ${
                  idx === 0 
                  ? 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 text-white shadow-xl shadow-emerald-900/20 border border-emerald-500/30' 
                  : 'bg-white border border-surface-200 text-surface-900 shadow-md hover:border-brand-300'
                }`}>
                  
                  {idx === 0 && (
                    <div className="absolute top-0 right-8 bg-gradient-to-r from-brand-300 to-brand-400 text-brand-950 text-[10px] font-extrabold uppercase tracking-widest px-5 py-2 rounded-b-2xl shadow-lg z-10 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5"/> Top Match
                    </div>
                  )}

                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10">
                    <div className="space-y-6 flex-1 w-full">
                      <div className="flex flex-wrap items-center justify-between xl:justify-start gap-4">
                        <h4 className="font-black text-2xl sm:text-3xl tracking-tight">{res.crop}</h4>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm flex items-center gap-1.5 ${idx === 0 ? 'bg-white/20 backdrop-blur-md text-white border border-white/20' : 'bg-brand-50 text-brand-700 border border-brand-100'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-white' : 'bg-brand-500'}`}></div>
                          {res.confidence}% Conf.
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 sm:gap-5">
                        <div className={`p-4 rounded-2xl transition-colors ${idx === 0 ? 'bg-white/10 hover:bg-white/15' : 'bg-surface-50 hover:bg-surface-100'}`}>
                          <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-1.5 ${idx === 0 ? 'text-emerald-100' : 'text-surface-400'}`}>Est. Yield</p>
                          <p className="font-bold text-sm sm:text-base flex items-center gap-2"><Sprout className="w-4 h-4"/> {res.yield}</p>
                        </div>
                        <div className={`p-4 rounded-2xl transition-colors ${idx === 0 ? 'bg-white/10 hover:bg-white/15' : 'bg-surface-50 hover:bg-surface-100'}`}>
                          <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-1.5 ${idx === 0 ? 'text-emerald-100' : 'text-surface-400'}`}>Risk Profile</p>
                          <p className="font-bold text-sm sm:text-base flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> {res.risk}</p>
                        </div>
                        <div className={`p-4 rounded-2xl transition-colors ${idx === 0 ? 'bg-white/10 hover:bg-white/15' : 'bg-surface-50 hover:bg-surface-100'}`}>
                          <p className={`text-[10px] font-extrabold uppercase tracking-widest mb-1.5 ${idx === 0 ? 'text-emerald-100' : 'text-surface-400'}`}>Water Needs</p>
                          <p className="font-bold text-sm sm:text-base flex items-center gap-2"><Droplets className="w-4 h-4"/> {res.water}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-current/10">
                        <p className={`text-xs leading-relaxed font-medium ${idx === 0 ? 'text-emerald-100' : 'text-surface-600'}`}>
                          <strong className={idx === 0 ? 'text-white font-extrabold' : 'text-surface-900 font-extrabold'}>AI Advisory: </strong> 
                          {lang === 'en' ? res.adviceEn : res.adviceHi}
                        </p>
                      </div>
                    </div>

                    <div className={`w-full xl:w-auto p-6 sm:p-8 rounded-[24px] text-center min-w-[200px] flex flex-col justify-center shadow-inner ${idx === 0 ? 'bg-black/20 backdrop-blur-md border border-white/10 shadow-black/20' : 'bg-surface-50 border border-surface-100 shadow-surface-200/50'}`}>
                      <p className={`text-[11px] font-black uppercase tracking-widest mb-2 ${idx === 0 ? 'text-emerald-200' : 'text-surface-400'}`}>Est. Net Profit</p>
                      <p className={`text-3xl sm:text-4xl font-black tracking-tighter ${idx === 0 ? 'text-white' : 'text-emerald-600'}`}>{res.profit}</p>
                      <p className={`text-[10px] font-semibold mt-1 ${idx === 0 ? 'text-emerald-200' : 'text-surface-500'}`}>Cost: {res.costPerAcre}</p>
                      
                      <button 
                        onClick={() => handleSavePlan(res, idx)}
                        disabled={saveStatus[idx] === 'saved'}
                        className={`mt-4 w-full py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm ${
                          saveStatus[idx] === 'saved'
                            ? 'bg-green-500 text-white cursor-default'
                            : idx === 0
                            ? 'bg-white text-emerald-900 hover:bg-emerald-50'
                            : 'bg-brand-600 text-white hover:bg-brand-700'
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
                  
                  {/* Subtle Confidence Background Bar */}
                  <div className="absolute bottom-0 left-0 h-1.5 w-full overflow-hidden rounded-b-[32px] opacity-80">
                    <div className={`h-full transition-all duration-1000 ease-out ${idx === 0 ? 'bg-white' : 'bg-brand-500'}`} style={{ width: `${res.confidence}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[600px] border-2 border-dashed border-surface-200 rounded-[32px] flex flex-col items-center justify-center bg-surface-50/40 p-10 text-center relative overflow-hidden transition-colors hover:bg-surface-50/80 hover:border-brand-200">
              <div className="relative z-10 flex flex-col items-center">
                <div className="p-6 bg-white rounded-3xl shadow-2xl shadow-brand-500/10 mb-8 border border-surface-100/60 transform transition-transform hover:scale-110 hover:rotate-3">
                  <Activity className="w-16 h-16 text-brand-400" />
                </div>
                <h3 className="text-3xl font-black text-surface-800 mb-4 tracking-tight">{lang === 'en' ? 'Awaiting Soil & Climate Inputs' : 'पैरामीटर की प्रतीक्षा कर रहा है'}</h3>
                <p className="max-w-md text-surface-500 leading-relaxed font-medium text-base">
                  {lang === 'en' ? 'Input your soil composition (NPK, pH), spatial location, and climate metrics to run the ML backend engine for high-yield, risk-adjusted crop recommendations.' : 'मशीन लर्निंग प्रणाली से सिफारिशें प्राप्त करने के लिए अपने मिट्टी, जलवायु, और स्थानिक पैरामीटर दर्ज करें।'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
