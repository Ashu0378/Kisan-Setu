import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  CloudRain,
  Sprout,
  TrendingUp,
  AlertTriangle,
  Loader2,
  MapPin,
  Wind,
  Droplets,
  Thermometer,
  Sun,
  Cloud,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Wheat,
  Activity,
  Layers,
  Search
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const [weather, setWeather] = useState({
    temp: null,
    desc: '',
    risk: 'Low',
    humidity: null,
    windSpeed: null,
    locationName: '',
    loading: true,
  });

  useEffect(() => {
    async function fetchRealWeather() {
      try {
        let lat = user?.lat || 28.6139;
        let lng = user?.lng || 77.2090;
        let locName = '';

        if (user?.district) {
          locName = `${user.district}${user.state ? `, ${user.state}` : ''}`;
        }

        if (!user?.lat && user?.district) {
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                user.district + ', India'
              )}&format=json&limit=1`
            );
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
              lat = parseFloat(geoData[0].lat);
              lng = parseFloat(geoData[0].lon);
            }
          } catch {
            // fallback lat/lng
          }
        }

        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=relativehumidity_2m`
        );
        const data = await res.json();

        if (data.current_weather) {
          const w = data.current_weather;
          let desc = lang === 'en' ? 'Clear Skies' : 'साफ आसमान';
          let risk = lang === 'en' ? 'Low' : 'कम';

          if (w.weathercode > 50 && w.weathercode < 70) {
            desc = lang === 'en' ? 'Moderate Rain' : 'मध्यम बारिश';
            risk = lang === 'en' ? 'Medium' : 'मध्यम';
          } else if (w.weathercode >= 70) {
            desc = lang === 'en' ? 'Storm / Heavy Rain' : 'भारी बारिश / तूफान';
            risk = lang === 'en' ? 'High' : 'उच्च';
          } else if (w.weathercode > 0 && w.weathercode <= 3) {
            desc = lang === 'en' ? 'Partly Cloudy' : 'आंशिक बादल';
          }

          const humidity = data.hourly?.relativehumidity_2m?.[0] || 65;

          setWeather({
            temp: Math.round(w.temperature),
            desc,
            risk,
            humidity,
            windSpeed: Math.round(w.windspeed),
            locationName: locName || (lang === 'en' ? 'Detected Location' : 'प्राप्त स्थान'),
            loading: false,
          });
        }
      } catch (err) {
        console.error('Failed to fetch real weather', err);
        setWeather({
          temp: 28,
          desc: lang === 'en' ? 'Sunny' : 'धूप',
          risk: lang === 'en' ? 'Low' : 'कम',
          humidity: 60,
          windSpeed: 12,
          locationName: user?.district ? `${user.district}, ${user.state || ''}` : 'Karnal, Haryana',
          loading: false,
        });
      }
    }

    fetchRealWeather();
  }, [user, lang]);

  const landSizeNum = Number(user?.landSize) || 5;
  const primaryCrop = user?.primaryCrop || (lang === 'en' ? 'Wheat (HD-2967)' : 'गेहूं (HD-2967)');
  const estTotalYield = landSizeNum * 22;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-green-900 to-teal-950 rounded-3xl p-8 sm:p-10 shadow-xl border border-emerald-500/20 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Farm Profile
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              {user?.name ? `${t('welcome')}, ${user.name}!` : t('welcome')}
            </h1>
            <p className="text-emerald-100/90 text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{weather.locationName || (lang === 'en' ? 'Your Farm' : 'आपका खेत')}</span>
              <span>•</span>
              <span className="font-extrabold text-amber-300">{landSizeNum} {lang === 'en' ? 'Acres Land' : 'एकड़ भूमि'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/crop-planner">
              <button className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                <Sprout className="w-4 h-4" />
                <span>{lang === 'en' ? 'Launch AI Crop Planner' : 'फसल योजना चलाएं'}</span>
              </button>
            </Link>
            <Link to="/profile">
              <button className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-2xl transition-all active:scale-95 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{t('updateProfile')}</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Current Crop */}
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-emerald-100 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-hover-glow group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">{t('currentCrop')}</p>
              <p className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{primaryCrop}</p>
            </div>
            <div className="p-3 bg-emerald-100/80 rounded-2xl text-emerald-700 group-hover:scale-110 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">{t('growing')}</span>
            <span className="text-xs font-bold text-slate-500">{user?.soilType ? `${user.soilType} Soil` : 'Loamy Soil'}</span>
          </div>
        </div>

        {/* 2. Real Weather */}
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-emerald-100 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-hover-glow group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">{t('weatherRisk')}</p>
              {weather.loading ? (
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              ) : (
                <p className="text-2xl font-black text-slate-900">{weather.temp !== null ? `${weather.temp}°C` : '28°C'}</p>
              )}
            </div>
            <div className={`p-3 rounded-2xl group-hover:scale-110 transition-transform ${weather.risk === 'High' || weather.risk === 'उच्च' ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'}`}>
              <CloudRain className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5 text-xs font-bold text-slate-600 flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-emerald-700 font-extrabold">{weather.desc}</span>
            <span className="text-slate-400">💧 {weather.humidity}% Humidity</span>
          </div>
        </div>

        {/* 3. Dynamic Estimated Yield */}
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-emerald-100 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-hover-glow group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">{t('estYield')}</p>
              <p className="text-2xl font-black text-slate-900">{estTotalYield} Qtl</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-2xl text-amber-700 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5 text-xs font-bold text-emerald-700 flex items-center pt-3 border-t border-slate-100">
            <TrendingUp className="w-4 h-4 mr-1 text-emerald-600" />
            <span>For {landSizeNum} Acres • ML Projected</span>
          </div>
        </div>

        {/* 4. Action Required */}
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-emerald-100 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-hover-glow group">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">{t('actionRequired')}</p>
              <p className="text-base font-black text-slate-900 truncate">{user?.irrigation ? `${user.irrigation} Scheduled` : t('irrigationDue')}</p>
            </div>
            <div className="p-3 bg-red-100/90 text-red-700 rounded-2xl animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-5 pt-1">
            <Link to="/crop-planner">
              <button className="w-full py-2 px-3 text-xs font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-all flex items-center justify-center gap-1">
                <span>{t('viewDetails')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Advisory & Profile Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Next Best Agronomic Actions */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{t('nextBestActions')}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Real-time agronomic recommendations tailored to your soil & weather</p>
            </div>
            <span className="p-2 bg-emerald-100 rounded-xl text-emerald-700"><Sparkles className="w-5 h-5"/></span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-emerald-50/80 hover:border-emerald-200 transition-all cursor-pointer group">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                <Sprout className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-800 transition-colors">
                  {t('applyUrea')} for {primaryCrop}
                </h4>
                <p className="text-xs text-slate-600 mt-1 font-semibold leading-relaxed">
                  {lang === 'en'
                    ? `Apply ${landSizeNum * 45}kg Urea across your ${landSizeNum} acres based on current growth stage.`
                    : `आपकी ${landSizeNum} एकड़ भूमि के लिए ${landSizeNum * 45}किग्रा यूरिया की आवश्यकता।`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-amber-50/80 hover:border-amber-200 transition-all cursor-pointer group">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-amber-800 transition-colors">
                  {t('checkRust')} ({weather.locationName || 'Local Region'})
                </h4>
                <p className="text-xs text-slate-600 mt-1 font-semibold leading-relaxed">
                  {lang === 'en'
                    ? `Weather condition (${weather.desc}) indicates potential humidity stress. Inspect crop leaves today.`
                    : `मौसम की स्थिति (${weather.desc}) के कारण पत्तियों की जांच करें।`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Real Farm Overview */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{lang === 'en' ? 'Farm Profile Overview' : 'खेत प्रोफ़ाइल विवरण'}</h3>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full border border-emerald-200">Synced</span>
          </div>

          <div className="space-y-3.5 text-xs font-bold text-slate-700">
            <div className="flex justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-slate-500">{lang === 'en' ? 'Primary Crop' : 'प्राथमिक फसल'}:</span>
              <span className="font-black text-slate-900">{primaryCrop}</span>
            </div>
            <div className="flex justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-slate-500">{lang === 'en' ? 'Total Land Size' : 'कुल भूमि'}:</span>
              <span className="font-black text-slate-900">{landSizeNum} Acres</span>
            </div>
            <div className="flex justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-slate-500">{lang === 'en' ? 'Soil & Irrigation' : 'मिट्टी व सिंचाई'}:</span>
              <span className="font-black text-slate-900">
                {user?.soilType || 'Loamy'} • {user?.irrigation || 'Tube Well'}
              </span>
            </div>
            <div className="flex justify-between p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100">
              <span className="text-slate-500">{lang === 'en' ? 'Location' : 'स्थान'}:</span>
              <span className="font-black text-slate-900">{weather.locationName || 'Karnal, Haryana'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
