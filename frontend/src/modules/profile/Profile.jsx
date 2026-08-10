import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserCircle, Save, MapPin, Leaf, Phone } from 'lucide-react';

export function Profile() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Ramesh Kumar',
    phone: '+91 98765 43210',
    landSize: '5',
    soilType: 'Alluvial',
    district: 'Karnal, Haryana',
    crop: 'Wheat (HD-2967)'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert(lang === 'en' ? 'Profile Updated Successfully!' : 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!');
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-brand-100 rounded-xl">
          <UserCircle className="w-6 h-6 text-brand-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{lang === 'en' ? 'Farmer Profile' : 'किसान प्रोफ़ाइल'}</h1>
          <p className="text-surface-500">{lang === 'en' ? 'Manage your personal and farm details.' : 'अपने व्यक्तिगत और खेत के विवरण प्रबंधित करें।'}</p>
        </div>
      </div>

      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-surface-400" />
            {lang === 'en' ? 'Edit Details' : 'विवरण संपादित करें'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  {lang === 'en' ? 'Full Name' : 'पूरा नाम'}
                </label>
                <div className="relative">
                  <UserCircle className="w-5 h-5 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  {lang === 'en' ? 'Phone Number' : 'फ़ोन नंबर'}
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>
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
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  {lang === 'en' ? 'Soil Type' : 'मिट्टी का प्रकार'}
                </label>
                <div className="relative">
                  <Leaf className="w-5 h-5 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select 
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white appearance-none"
                  >
                    <option value="Alluvial">Alluvial (जलोढ़)</option>
                    <option value="Black">Black (काली)</option>
                    <option value="Red">Red (लाल)</option>
                    <option value="Laterite">Laterite (लेटराइट)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  {lang === 'en' ? 'District / State' : 'ज़िला / राज्य'}
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">
                  {lang === 'en' ? 'Current Crop' : 'वर्तमान फसल'}
                </label>
                <input 
                  type="text" 
                  name="crop"
                  value={formData.crop}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-surface-100">
              <Button type="submit" className="flex items-center gap-2" isLoading={loading}>
                <Save className="w-4 h-4" />
                {lang === 'en' ? 'Save Changes' : 'परिवर्तन सहेजें'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
