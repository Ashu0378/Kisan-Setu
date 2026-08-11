import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Sprout, MapPin, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function Register() {
  const navigate = useNavigate();
  const { lang, toggleLanguage } = useLanguage();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    landSize: '',
    soilType: 'Alluvial',
    district: '',
    lat: null,
    lng: null
  });

  const [locating, setLocating] = useState(false);

  const handleGetLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            district: "Detected Automatically"
          }));
          setLocating(false);
        },
        (error) => {
          console.error("Error getting location", error);
          setLocating(false);
          alert(lang === 'en' ? 'Could not get location.' : 'स्थान प्राप्त नहीं हो सका।');
        }
      );
    } else {
      setLocating(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep(2);
  
  const handleRegister = (e) => {
    e.preventDefault();
    localStorage.setItem('kisanSetuUser', JSON.stringify(formData));
    console.log("Registered Profile:", formData);
    navigate('/');
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
        </div>

        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <form onSubmit={handleRegister}>
            <CardContent className="pt-6">
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
                      placeholder={lang === 'en' ? "e.g., Ramesh Kumar" : "जैसे, रमेश कुमार"}
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
                      placeholder="+91"
                    />
                  </div>
                  <Button type="button" className="w-full mt-4" onClick={handleNext}>
                    {lang === 'en' ? 'Continue' : 'जारी रखें'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      {lang === 'en' ? 'Land Size (Acres)' : 'जमीन का आकार (एकड़)'}
                    </label>
                    <input 
                      type="number" 
                      name="landSize"
                      required
                      value={formData.landSize}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      {lang === 'en' ? 'Soil Type' : 'मिट्टी का प्रकार'}
                    </label>
                    <select 
                      name="soilType"
                      value={formData.soilType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                    >
                      <option value="Alluvial">Alluvial (जलोढ़)</option>
                      <option value="Black">Black (काली)</option>
                      <option value="Red">Red (लाल)</option>
                      <option value="Laterite">Laterite (लेटराइट)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">
                      {lang === 'en' ? 'Location (GPS)' : 'स्थान (GPS)'}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        name="district"
                        required
                        value={formData.district}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                        placeholder={lang === 'en' ? "e.g., Karnal, Haryana" : "जैसे, करनाल, हरियाणा"}
                      />
                      <Button type="button" variant="outline" onClick={handleGetLocation} className="whitespace-nowrap px-3" disabled={locating}>
                        {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4 text-brand-600" />}
                      </Button>
                    </div>
                    {formData.lat && (
                      <p className="text-xs text-brand-600 mt-1">
                        {lang === 'en' ? 'GPS Coordinates Captured!' : 'जीपीएस निर्देशांक प्राप्त!'}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button type="button" variant="secondary" className="w-1/3" onClick={() => setStep(1)}>
                      {lang === 'en' ? 'Back' : 'पीछे'}
                    </Button>
                    <Button type="submit" className="flex-1">
                      {lang === 'en' ? 'Create Profile' : 'प्रोफ़ाइल बनाएं'}
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
