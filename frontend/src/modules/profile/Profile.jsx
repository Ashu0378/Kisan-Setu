import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { UserCircle, Save, MapPin, Leaf, Phone, CreditCard, Droplets, Tractor, Warehouse, PawPrint, Calendar } from 'lucide-react';

export function Profile() {
  const { lang } = useLanguage();
  const { user, token, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    age: user?.age || 45,
    kcc: user?.kcc || 'Yes',
    landSize: user?.landSize || '5',
    soilType: user?.soilType || 'Alluvial',
    irrigation: user?.irrigation || 'Tube Well',
    equipment: user?.equipment || 'Tractor, Seed Drill',
    primaryCrop: user?.primaryCrop || 'Wheat (HD-2967)',
    secondaryCrop: user?.secondaryCrop || 'Mustard',
    livestock: user?.livestock || '3 Buffaloes, 2 Cows',
    storageCapacity: user?.storageCapacity || '50',
    district: user?.district || 'Karnal',
    state: user?.state || 'Haryana',
    pincode: user?.pincode || '132001'
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        age: user.age || prev.age,
        kcc: user.kcc || prev.kcc,
        landSize: user.landSize !== undefined ? user.landSize : prev.landSize,
        soilType: user.soilType || prev.soilType,
        irrigation: user.irrigation || prev.irrigation,
        equipment: user.equipment || prev.equipment,
        primaryCrop: user.primaryCrop || prev.primaryCrop,
        secondaryCrop: user.secondaryCrop || prev.secondaryCrop,
        livestock: user.livestock || prev.livestock,
        storageCapacity: user.storageCapacity || prev.storageCapacity,
        district: user.district || prev.district,
        state: user.state || prev.state,
        pincode: user.pincode || prev.pincode,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      if (token) {
        const res = await authService.updateProfile({
          ...formData,
          landSize: formData.landSize ? Number(formData.landSize) : undefined,
          age: formData.age ? Number(formData.age) : undefined,
        }, token);
        if (res.user) {
          updateUser(res.user);
        }
      }
      setSuccessMsg(lang === 'en' ? 'Profile Updated Successfully!' : 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!');
    } catch (err) {
      setErrorMsg(err.message || (lang === 'en' ? 'Failed to update profile.' : 'प्रोफ़ाइल अपडेट करने में विफलता।'));
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, icon: Icon, ...props }) => (
    <div className="relative group">
      <label className="block text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">{label}</label>
      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-3.5 w-4 h-4 text-surface-400 group-focus-within:text-brand-500 transition-colors" />}
        <input 
          {...props} 
          className={`w-full bg-surface-50/50 hover:bg-surface-50 focus:bg-white border border-surface-200 focus:border-brand-400 rounded-xl text-sm transition-all duration-200 outline-none placeholder:text-surface-300 shadow-sm focus:shadow-md ${Icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5'}`} 
        />
      </div>
    </div>
  );

  const SelectField = ({ label, icon: Icon, options, ...props }) => (
    <div className="relative group">
      <label className="block text-[11px] font-bold text-surface-500 uppercase tracking-wider mb-1.5 ml-1">{label}</label>
      <div className="relative flex items-center">
        {Icon && <Icon className="absolute left-3.5 w-4 h-4 text-surface-400 group-focus-within:text-brand-500 transition-colors z-10" />}
        <select 
          {...props} 
          className={`w-full bg-surface-50/50 hover:bg-surface-50 focus:bg-white border border-surface-200 focus:border-brand-400 rounded-xl text-sm transition-all duration-200 outline-none shadow-sm focus:shadow-md appearance-none cursor-pointer ${Icon ? 'pl-10 pr-10 py-2.5' : 'px-4 py-2.5'}`}
        >
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-r from-brand-900 to-brand-800 p-8 rounded-3xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-inner">
            <UserCircle className="w-12 h-12 text-brand-100" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{lang === 'en' ? 'Comprehensive Farmer Profile' : 'व्यापक किसान प्रोफ़ाइल'}</h1>
            <p className="text-brand-200 font-medium mt-1 text-sm max-w-md">{lang === 'en' ? 'Manage your personal, farm, and agronomic data to receive tailored ML insights.' : 'अनुकूलित ML अंतर्दृष्टि प्राप्त करने के लिए अपना डेटा प्रबंधित करें।'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Personal Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-100/50 space-y-6">
            <div className="flex items-center gap-3 border-b border-surface-100 pb-3">
              <div className="p-2 bg-blue-100 rounded-xl"><UserCircle className="w-4 h-4 text-blue-600"/></div>
              <h3 className="font-extrabold text-surface-800 text-base tracking-tight">{lang === 'en' ? 'Personal Details' : 'व्यक्तिगत विवरण'}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <InputField label={lang === 'en' ? 'Full Name' : 'पूरा नाम'} name="name" icon={UserCircle} value={formData.name} onChange={handleChange} />
              </div>
              <InputField label={lang === 'en' ? 'Phone Number' : 'फ़ोन नंबर'} name="phone" type="tel" icon={Phone} value={formData.phone} onChange={handleChange} />
              <InputField label={lang === 'en' ? 'Age' : 'आयु'} name="age" type="number" icon={Calendar} value={formData.age} onChange={handleChange} />
              
              <div className="col-span-2">
                <SelectField 
                  label={lang === 'en' ? 'Kisan Credit Card (KCC) Holder?' : 'किसान क्रेडिट कार्ड (KCC) धारक?'} 
                  name="kcc" 
                  icon={CreditCard} 
                  value={formData.kcc} 
                  onChange={handleChange}
                  options={[
                    { value: 'Yes', label: lang === 'en' ? 'Yes (हाँ)' : 'Yes (हाँ)' },
                    { value: 'No', label: lang === 'en' ? 'No (नहीं)' : 'No (नहीं)' }
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Farm Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-100/50 space-y-6">
            <div className="flex items-center gap-3 border-b border-surface-100 pb-3">
              <div className="p-2 bg-emerald-100 rounded-xl"><Leaf className="w-4 h-4 text-emerald-600"/></div>
              <h3 className="font-extrabold text-surface-800 text-base tracking-tight">{lang === 'en' ? 'Farm & Land Details' : 'खेत और भूमि विवरण'}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <InputField label={lang === 'en' ? 'Total Land (Acres)' : 'कुल भूमि (एकड़)'} name="landSize" type="number" icon={MapPin} value={formData.landSize} onChange={handleChange} />
              <SelectField 
                label={lang === 'en' ? 'Soil Type' : 'मिट्टी का प्रकार'} 
                name="soilType" 
                icon={Leaf} 
                value={formData.soilType} 
                onChange={handleChange}
                options={[
                  { value: 'Alluvial', label: 'Alluvial (जलोढ़)' },
                  { value: 'Black', label: 'Black (काली)' },
                  { value: 'Red', label: 'Red (लाल)' },
                  { value: 'Laterite', label: 'Laterite (लेटराइट)' }
                ]}
              />
              <div className="col-span-2">
                <SelectField 
                  label={lang === 'en' ? 'Primary Irrigation Method' : 'प्राथमिक सिंचाई विधि'} 
                  name="irrigation" 
                  icon={Droplets} 
                  value={formData.irrigation} 
                  onChange={handleChange}
                  options={[
                    { value: 'Tube Well', label: 'Tube Well / Borewell' },
                    { value: 'Canal', label: 'Canal Network' },
                    { value: 'Rainfed', label: 'Rainfed (Mon मानसून)' },
                    { value: 'Drip', label: 'Drip / Sprinkler' }
                  ]}
                />
              </div>
              <div className="col-span-2">
                <InputField label={lang === 'en' ? 'Farm Equipment Owned' : 'कृषि उपकरण'} name="equipment" type="text" icon={Tractor} value={formData.equipment} onChange={handleChange} placeholder="e.g., Tractor, Pump, Harvester" />
              </div>
            </div>
          </div>

          {/* Agricultural Profile */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-100/50 space-y-6">
            <div className="flex items-center gap-3 border-b border-surface-100 pb-3">
              <div className="p-2 bg-amber-100 rounded-xl"><Warehouse className="w-4 h-4 text-amber-600"/></div>
              <h3 className="font-extrabold text-surface-800 text-base tracking-tight">{lang === 'en' ? 'Agricultural Operations' : 'कृषि कार्य'}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <InputField label={lang === 'en' ? 'Primary Crop' : 'प्राथमिक फसल'} name="primaryCrop" type="text" icon={Leaf} value={formData.primaryCrop} onChange={handleChange} />
              <InputField label={lang === 'en' ? 'Secondary Crop' : 'द्वितीयक फसल'} name="secondaryCrop" type="text" value={formData.secondaryCrop} onChange={handleChange} />
              
              <div className="col-span-2">
                <InputField label={lang === 'en' ? 'Livestock / Animals' : 'पशुधन'} name="livestock" type="text" icon={PawPrint} value={formData.livestock} onChange={handleChange} placeholder="e.g., 2 Cows, 1 Buffalo" />
              </div>
              
              <div className="col-span-2">
                <InputField label={lang === 'en' ? 'Storage Capacity (Quintals)' : 'भंडारण क्षमता (क्विंटल)'} name="storageCapacity" type="number" icon={Warehouse} value={formData.storageCapacity} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-100/50 space-y-6">
            <div className="flex items-center gap-3 border-b border-surface-100 pb-3">
              <div className="p-2 bg-purple-100 rounded-xl"><MapPin className="w-4 h-4 text-purple-600"/></div>
              <h3 className="font-extrabold text-surface-800 text-base tracking-tight">{lang === 'en' ? 'Location Details' : 'स्थान का विवरण'}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <InputField label={lang === 'en' ? 'District' : 'ज़िला'} name="district" type="text" value={formData.district} onChange={handleChange} />
              <InputField label={lang === 'en' ? 'State' : 'राज्य'} name="state" type="text" value={formData.state} onChange={handleChange} />
              
              <div className="col-span-2">
                <InputField label={lang === 'en' ? 'Pincode' : 'पिन कोड'} name="pincode" type="number" value={formData.pincode} onChange={handleChange} />
              </div>
            </div>
          </div>

        </div>

        {/* Success/Error Alerts */}
        {successMsg && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-semibold flex items-center gap-2">
            <span>✓</span> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold flex items-center gap-2">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit" className="px-8 py-4 h-auto text-base font-extrabold shadow-xl hover:shadow-2xl rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] transition-all flex items-center gap-2" isLoading={loading}>
            <Save className="w-5 h-5" />
            {lang === 'en' ? 'Save Profile Changes' : 'प्रोफ़ाइल परिवर्तन सहेजें'}
          </Button>
        </div>

      </form>
    </div>
  );
}
