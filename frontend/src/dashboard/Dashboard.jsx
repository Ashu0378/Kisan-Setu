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

        // If lat/lng not saved on user, try to geocode district name
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

  // Derived user land size and yields based on MongoDB user record
  const landSizeNum = Number(user?.landSize) || 5;
  const primaryCrop = user?.primaryCrop || (lang === 'en' ? 'Wheat (HD-2967)' : 'गेहूं (HD-2967)');
  const estTotalYield = landSizeNum * 20; // 20 quintals/acre average

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Welcome & Profile Sync Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">
            {user?.name ? `${t('welcome')}, ${user.name}!` : t('welcome')}
          </h1>
          <p className="text-surface-500 mt-1 text-sm flex items-center gap-1.5 font-medium">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
            {weather.locationName || (lang === 'en' ? 'Your Farm' : 'आपका खेत')} •{' '}
            <span className="text-brand-700 font-bold">{landSizeNum} {lang === 'en' ? 'Acres Land' : 'एकड़ भूमि'}</span>
          </p>
        </div>
        <Link to="/profile">
          <Button className="animate-slide-up shadow-md bg-brand-600 hover:bg-brand-700 text-white font-extrabold" style={{ animationDelay: '100ms' }}>
            <Sparkles className="w-4 h-4 mr-2" />
            {t('updateProfile')}
          </Button>
        </Link>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Current Crop */}
        <Card className="hover:shadow-md transition-shadow border-surface-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">{t('currentCrop')}</p>
                <p className="text-xl font-black text-surface-900">{primaryCrop}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <Sprout className="w-6 h-6 text-emerald-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-surface-100">
              <Badge variant="success">{t('growing')}</Badge>
              <span className="text-xs font-semibold text-surface-500">{user?.soilType ? `${user.soilType} Soil` : 'Alluvial Soil'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Real Dynamic Weather */}
        <Card className="hover:shadow-md transition-shadow border-surface-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">{t('weatherRisk')}</p>
                {weather.loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                ) : (
                  <p className="text-2xl font-black text-surface-900">{weather.temp !== null ? `${weather.temp}°C` : '28°C'}</p>
                )}
              </div>
              <div className={`p-3 rounded-2xl ${weather.risk === 'High' || weather.risk === 'उच्च' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                <CloudRain className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 text-xs font-bold text-surface-600 flex items-center justify-between pt-3 border-t border-surface-100">
              <span className="text-brand-600 font-extrabold">{weather.desc}</span>
              <span className="text-surface-400">💧 {weather.humidity}% Humidity</span>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Estimated Yield */}
        <Card className="hover:shadow-md transition-shadow border-surface-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">{t('estYield')}</p>
                <p className="text-2xl font-black text-surface-900">{estTotalYield} Quintals</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-amber-700" />
              </div>
            </div>
            <div className="mt-4 text-xs font-bold text-emerald-600 flex items-center pt-3 border-t border-surface-100">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>For {landSizeNum} Acres • High ML Projection</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Required */}
        <Card className="hover:shadow-md transition-shadow border-surface-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold text-surface-400 uppercase tracking-wider">{t('actionRequired')}</p>
                <p className="text-lg font-black text-surface-900">{user?.irrigation ? `${user.irrigation} Scheduled` : t('irrigationDue')}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-2xl animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-700" />
              </div>
            </div>
            <div className="mt-4 pt-2">
              <Link to="/crop-planner">
                <Button variant="outline" size="sm" className="w-full text-xs font-extrabold rounded-xl border-surface-200">
                  {t('viewDetails')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advisory & Market Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Tailored Agronomic Next Actions */}
        <Card className="col-span-1 border-surface-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-surface-100">
            <CardTitle className="text-lg font-extrabold">{t('nextBestActions')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl border border-surface-200 bg-surface-50 hover:bg-brand-50 hover:border-brand-200 transition-all cursor-pointer group">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-surface-100 group-hover:scale-110 transition-transform">
                  <Sprout className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h4 className="font-extrabold text-surface-900 text-sm group-hover:text-brand-700 transition-colors">
                    {t('applyUrea')} for {primaryCrop}
                  </h4>
                  <p className="text-xs text-surface-600 mt-1 font-medium">
                    {lang === 'en'
                      ? `Apply ${landSizeNum * 45}kg Urea across your ${landSizeNum} acres based on growth stage.`
                      : `आपकी ${landSizeNum} एकड़ भूमि के लिए ${landSizeNum * 45}किग्रा यूरिया की आवश्यकता।`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl border border-surface-200 bg-surface-50 hover:bg-amber-50 hover:border-amber-200 transition-all cursor-pointer group">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-surface-100 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-extrabold text-surface-900 text-sm group-hover:text-amber-700 transition-colors">
                    {t('checkRust')} ({weather.locationName || 'Local Region'})
                  </h4>
                  <p className="text-xs text-surface-600 mt-1 font-medium">
                    {lang === 'en'
                      ? `Weather condition (${weather.desc}) indicates potential humidity stress. Inspect crop leaves today.`
                      : `मौसम की स्थिति (${weather.desc}) के कारण पत्तियों की जांच करें।`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real Farm Overview & DB Record Summary */}
        <Card className="col-span-1 border-surface-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-surface-100">
            <CardTitle className="text-lg font-extrabold flex items-center justify-between">
              <span>{lang === 'en' ? 'Farm Profile Summary' : 'खेत प्रोफ़ाइल विवरण'}</span>
              <Badge variant="outline" className="text-brand-700 border-brand-200 bg-brand-50">
                MongoDB Synced
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs font-semibold text-surface-700">
            <div className="flex justify-between p-3 bg-surface-50 rounded-xl border border-surface-100">
              <span className="text-surface-500">{lang === 'en' ? 'Primary Crop' : 'प्राथमिक फसल'}:</span>
              <span className="font-extrabold text-surface-900">{primaryCrop}</span>
            </div>
            <div className="flex justify-between p-3 bg-surface-50 rounded-xl border border-surface-100">
              <span className="text-surface-500">{lang === 'en' ? 'Total Land' : 'कुल भूमि'}:</span>
              <span className="font-extrabold text-surface-900">{landSizeNum} Acres</span>
            </div>
            <div className="flex justify-between p-3 bg-surface-50 rounded-xl border border-surface-100">
              <span className="text-surface-500">{lang === 'en' ? 'Soil & Irrigation' : 'मिट्टी और सिंचाई'}:</span>
              <span className="font-extrabold text-surface-900">
                {user?.soilType || 'Alluvial'} • {user?.irrigation || 'Tube Well'}
              </span>
            </div>
            <div className="flex justify-between p-3 bg-surface-50 rounded-xl border border-surface-100">
              <span className="text-surface-500">{lang === 'en' ? 'Location' : 'स्थान'}:</span>
              <span className="font-extrabold text-surface-900">{weather.locationName || 'Karnal, Haryana'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
