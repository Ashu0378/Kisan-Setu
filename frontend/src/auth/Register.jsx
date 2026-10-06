import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Sprout, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal',
];

export function Register() {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    state: '',
    district: '',
    landSize: '',
    soilType: 'Alluvial',
    preferredLanguage: 'hi',
    lat: null,
    lng: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert(lang === 'en' ? 'Geolocation is not supported by your browser.' : 'आपका ब्राउज़र जियोलोकेशन का समर्थन नहीं करता।');
      return;
    }
    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode using OpenStreetMap Nominatim (free, no API key needed)
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await resp.json();
          const addr = data.address || {};

          // Extract district and state from Nominatim response
          const detectedDistrict =
            addr.county ||
            addr.district ||
            addr.city_district ||
            addr.city ||
            addr.town ||
            addr.village ||
            '';

          const detectedState = addr.state || '';

          setFormData((prev) => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            district: detectedDistrict || prev.district,
            state: detectedState || prev.state,
          }));
        } catch {
          // Even if reverse geocoding fails, save raw coordinates
          setFormData((prev) => ({ ...prev, lat: latitude, lng: longitude }));
          setError(lang === 'en' ? 'Got GPS location but could not detect district. Please enter manually.' : 'GPS मिला लेकिन जिला पता नहीं चला। कृपया मैन्युअल दर्ज करें।');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        const messages = {
          1: lang === 'en' ? 'Location permission denied. Please allow access in browser settings.' : 'स्थान अनुमति अस्वीकृत। कृपया ब्राउज़र सेटिंग में अनुमति दें।',
          2: lang === 'en' ? 'Location unavailable. Try again.' : 'स्थान उपलब्ध नहीं। पुनः प्रयास करें।',
          3: lang === 'en' ? 'Location request timed out.' : 'स्थान अनुरोध समय समाप्त।',
        };
        setError(messages[err.code] || (lang === 'en' ? 'Could not get location.' : 'स्थान प्राप्त नहीं हो सका।'));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setError(lang === 'en' ? 'Name and phone are required.' : 'नाम और फ़ोन आवश्यक हैं।');
      return;
    }
    if (formData.password.length < 6) {
      setError(lang === 'en' ? 'Password must be at least 6 characters.' : 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए।');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(lang === 'en' ? 'Passwords do not match.' : 'पासवर्ड मेल नहीं खाते।');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({
        name: formData.name,
        phone: formData.phone,
        password: formData.password,
        state: formData.state,
        district: formData.district,
        landSize: formData.landSize ? Number(formData.landSize) : undefined,
        preferredLanguage: formData.preferredLanguage,
      });
      navigate('/');
    } catch (err) {
      setError(err.message || (lang === 'en' ? 'Registration failed. Please try again.' : 'पंजीकरण विफल। कृपया पुनः प्रयास करें।'));
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-surface-50 to-brand-100 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <Button variant="outline" size="sm" onClick={toggleLanguage}>
          {lang === 'en' ? 'हिन्दी' : 'English'}
        </Button>
      </div>

      <div className="max-w-md w-full animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg mb-4 animate-slide-up">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent animate-slide-up" style={{ animationDelay: '100ms' }}>
            {lang === 'en' ? 'Join KisanSetu AI' : 'किसान सेतु AI से जुड़ें'}
          </h1>
          <p className="text-surface-500 mt-2 text-center animate-slide-up" style={{ animationDelay: '150ms' }}>
            {lang === 'en' ? 'Create your digital farm profile for smart insights.' : 'स्मार्ट इनसाइट्स के लिए अपना डिजिटल फार्म प्रोफाइल बनाएं।'}
          </p>
          {/* Step indicator */}
          <div className="flex gap-2 mt-4">
            {[1, 2].map((s) => (
              <div key={s} className={`h-2 w-8 rounded-full transition-all duration-300 ${step >= s ? 'bg-brand-500' : 'bg-surface-200'}`} />
            ))}
          </div>
        </div>

        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <form onSubmit={step === 1 ? handleNext : handleRegister}>
            <CardContent className="pt-6">

              {/* Error banner */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {step === 1 ? (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      {lang === 'en' ? 'Full Name' : 'पूरा नाम'}
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                      placeholder={lang === 'en' ? 'e.g., Ramesh Kumar' : 'जैसे, रमेश कुमार'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      {lang === 'en' ? 'Phone Number' : 'फ़ोन नंबर'}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                      placeholder="9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      {lang === 'en' ? 'Password' : 'पासवर्ड'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      {lang === 'en' ? 'Confirm Password' : 'पासवर्ड की पुष्टि करें'}
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                      placeholder="••••••••"
                    />
                  </div>
                  <Button type="submit" className="w-full mt-4">
                    {lang === 'en' ? 'Continue' : 'जारी रखें'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      {lang === 'en' ? 'State' : 'राज्य'}
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option value="">{lang === 'en' ? 'Select state' : 'राज्य चुनें'}</option>
                      {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      {lang === 'en' ? 'District' : 'जिला'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                        placeholder={lang === 'en' ? 'e.g., Karnal' : 'जैसे, करनाल'}
                      />
                      <Button type="button" variant="outline" onClick={handleGetLocation} className="whitespace-nowrap px-3" disabled={locating}>
                        {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4 text-brand-600" />}
                      </Button>
                    </div>
                    {formData.lat && (
                      <p className="text-xs text-brand-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {formData.district && formData.state
                          ? `${formData.district}, ${formData.state}`
                          : lang === 'en' ? '✓ GPS Coordinates Captured!' : '✓ जीपीएस निर्देशांक प्राप्त!'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      {lang === 'en' ? 'Land Size (Acres)' : 'जमीन का आकार (एकड़)'}
                    </label>
                    <input
                      type="number"
                      name="landSize"
                      value={formData.landSize}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                      placeholder="e.g., 5"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      {lang === 'en' ? 'Preferred Language' : 'पसंदीदा भाषा'}
                    </label>
                    <select
                      name="preferredLanguage"
                      value={formData.preferredLanguage}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option value="hi">हिन्दी</option>
                      <option value="en">English</option>
                      <option value="mr">मराठी</option>
                      <option value="pa">ਪੰਜਾਬੀ</option>
                      <option value="gu">ગુજરાતી</option>
                      <option value="ta">தமிழ்</option>
                      <option value="te">తెలుగు</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button type="button" variant="secondary" className="w-1/3" onClick={() => { setStep(1); setError(''); }} disabled={loading}>
                      {lang === 'en' ? 'Back' : 'पीछे'}
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {lang === 'en' ? 'Creating…' : 'बना रहे हैं…'}
                        </span>
                      ) : (
                        lang === 'en' ? 'Create Profile' : 'प्रोफ़ाइल बनाएं'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="mt-6 text-center text-sm text-surface-600 border-t border-surface-100 pt-4">
                {lang === 'en' ? 'Already have an account?' : 'पहले से खाता है?'}{' '}
                <Link to="/signin" className="text-brand-600 hover:text-brand-700 font-bold">
                  {lang === 'en' ? 'Sign In' : 'साइन इन करें'}
                </Link>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
