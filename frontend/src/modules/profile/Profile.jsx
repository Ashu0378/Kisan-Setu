import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import {
  UserCircle,
  Save,
  MapPin,
  Leaf,
  Phone,
  CreditCard,
  Droplets,
  Tractor,
  Warehouse,
  PawPrint,
  Calendar,
  Lock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Shield,
} from 'lucide-react';

export function Profile() {
  const { lang } = useLanguage();
  const { user, token, updateUser } = useAuth();

  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Main Form Data State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    age: user?.age || 45,
    gender: user?.gender || 'Male',
    kcc: user?.kcc || 'Yes',
    preferredLanguage: user?.preferredLanguage || 'hi',

    state: user?.state || 'Haryana',
    district: user?.district || 'Karnal',
    village: user?.village || '',
    pincode: user?.pincode || '132001',
    lat: user?.lat || null,
    lng: user?.lng || null,

    landSize: user?.landSize || '5',
    soilType: user?.soilType || 'Alluvial',
    irrigation: user?.irrigation || 'Tube Well',
    equipment: user?.equipment || 'Tractor, Seed Drill',

    primaryCrop: user?.primaryCrop || 'Wheat (HD-2967)',
    secondaryCrop: user?.secondaryCrop || 'Mustard',
    livestock: user?.livestock || '3 Buffaloes, 2 Cows',
    storageCapacity: user?.storageCapacity || '50',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
        age: user.age || prev.age,
        kcc: user.kcc || prev.kcc,
        preferredLanguage: user.preferredLanguage || prev.preferredLanguage,
        state: user.state || prev.state,
        district: user.district || prev.district,
        village: user.village || prev.village,
        pincode: user.pincode || prev.pincode,
        landSize: user.landSize !== undefined ? user.landSize : prev.landSize,
        soilType: user.soilType || prev.soilType,
        irrigation: user.irrigation || prev.irrigation,
        equipment: user.equipment || prev.equipment,
        primaryCrop: user.primaryCrop || prev.primaryCrop,
        secondaryCrop: user.secondaryCrop || prev.secondaryCrop,
        livestock: user.livestock || prev.livestock,
        storageCapacity: user.storageCapacity || prev.storageCapacity,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
    if (successMsg) setSuccessMsg('');
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg('');
    if (successMsg) setSuccessMsg('');
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg(lang === 'en' ? 'Geolocation is not supported.' : 'स्थान सेवा समर्थित नहीं है।');
      return;
    }
    setLocating(true);
    setErrorMsg('');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await resp.json();
          const addr = data.address || {};

          const detectedDistrict = addr.county || addr.district || addr.city || addr.town || '';
          const detectedState = addr.state || '';
          const detectedVillage = addr.village || addr.suburb || '';

          setFormData((prev) => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            district: detectedDistrict || prev.district,
            state: detectedState || prev.state,
            village: detectedVillage || prev.village,
          }));
          setSuccessMsg(
            lang === 'en'
              ? `Location Detected: ${detectedDistrict || 'District'}, ${detectedState}`
              : `स्थान प्राप्त: ${detectedDistrict || 'जिला'}, ${detectedState}`
          );
        } catch {
          setFormData((prev) => ({ ...prev, lat: latitude, lng: longitude }));
          setSuccessMsg(lang === 'en' ? 'GPS Coordinates Saved.' : 'जीपीएस निर्देशांक सहेजे गए।');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setErrorMsg(lang === 'en' ? 'Location access denied or failed.' : 'स्थान अनुमति अस्वीकृत।');
      }
    );
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      if (token) {
        const res = await authService.updateProfile(
          {
            ...formData,
            landSize: formData.landSize ? Number(formData.landSize) : undefined,
            age: formData.age ? Number(formData.age) : undefined,
          },
          token
        );
        if (res.user) {
          updateUser(res.user);
        }
      }
      setSuccessMsg(lang === 'en' ? 'Profile Updated Successfully!' : 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!');
    } catch (err) {
      setErrorMsg(err.message || (lang === 'en' ? 'Failed to update profile.' : 'प्रोफ़ाइल अपडेट में विफलता।'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 6) {
      setErrorMsg(lang === 'en' ? 'New password must be at least 6 characters.' : 'नया पासवर्ड कम से कम 6 अक्षर का होना चाहिए।');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrorMsg(lang === 'en' ? 'Passwords do not match.' : 'पासवर्ड मेल नहीं खाते।');
      return;
    }
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL}/profile/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Password update failed');
      setSuccessMsg(lang === 'en' ? 'Password updated successfully!' : 'पासवर्ड सफलतापूर्वक अपडेट किया गया!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: lang === 'en' ? 'Personal Details' : 'व्यक्तिगत विवरण', icon: UserCircle },
    { id: 2, title: lang === 'en' ? 'Location & Spatial' : 'स्थान का विवरण', icon: MapPin },
    { id: 3, title: lang === 'en' ? 'Farm & Soil Specs' : 'खेत और भूमि', icon: Leaf },
    { id: 4, title: lang === 'en' ? 'Crops & Operations' : 'फसल और पशुधन', icon: Warehouse },
    { id: 5, title: lang === 'en' ? 'Account Security' : 'खाता सुरक्षा', icon: Shield },
  ];

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
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-gradient-to-r from-brand-900 via-brand-800 to-emerald-900 p-8 rounded-3xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/3"></div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
            <UserCircle className="w-12 h-12 text-brand-100" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {user?.name ? `${user.name}'s Farm Profile` : lang === 'en' ? 'Farmer Profile' : 'किसान प्रोफ़ाइल'}
            </h1>
            <p className="text-brand-200 font-medium mt-1 text-sm max-w-md">
              {lang === 'en'
                ? 'Structured multi-step profile for personalized agronomic & ML recommendations.'
                : 'व्यक्तिगत एमएल अंतर्दृष्टि के लिए चरणबद्ध डिजिटल प्रोफ़ाइल।'}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Step Progress Navigation */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-surface-100">
        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-2 scrollbar-none">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            const isCompleted = activeStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => {
                  setActiveStep(step.id);
                  setSuccessMsg('');
                  setErrorMsg('');
                }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 scale-105'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-surface-50 text-surface-600 hover:bg-surface-100'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    isActive
                      ? 'bg-white text-brand-700'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-surface-200 text-surface-700'
                  }`}
                >
                  {isCompleted ? '✓' : step.id}
                </div>
                <Icon className="w-4 h-4" />
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-surface-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-brand-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${(activeStep / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Global Alerts */}
      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step Content Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-100">
        
        {/* STEP 1: Personal Details */}
        {activeStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 border-b border-surface-100 pb-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <UserCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-surface-900 text-lg tracking-tight">
                  {lang === 'en' ? 'Step 1: Personal Details' : 'चरण 1: व्यक्तिगत विवरण'}
                </h3>
                <p className="text-surface-500 text-xs font-medium">
                  {lang === 'en' ? 'Basic identification and language preferences' : 'बुनियादी पहचान और भाषा प्राथमिकताएं'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <InputField
                  label={lang === 'en' ? 'Full Name' : 'पूरा नाम'}
                  name="name"
                  icon={UserCircle}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <InputField
                label={lang === 'en' ? 'Phone Number' : 'फ़ोन नंबर'}
                name="phone"
                type="tel"
                icon={Phone}
                value={formData.phone}
                onChange={handleChange}
              />
              <InputField
                label={lang === 'en' ? 'Email Address' : 'ईमेल आईडी'}
                name="email"
                type="email"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. farmer@example.com"
              />
              <InputField
                label={lang === 'en' ? 'Age' : 'आयु'}
                name="age"
                type="number"
                icon={Calendar}
                value={formData.age}
                onChange={handleChange}
              />
              <SelectField
                label={lang === 'en' ? 'Kisan Credit Card (KCC)' : 'किसान क्रेडिट कार्ड (KCC)'}
                name="kcc"
                icon={CreditCard}
                value={formData.kcc}
                onChange={handleChange}
                options={[
                  { value: 'Yes', label: lang === 'en' ? 'Yes (हाँ - KCC धारक)' : 'Yes (हाँ - KCC धारक)' },
                  { value: 'No', label: lang === 'en' ? 'No (नहीं)' : 'No (नहीं)' },
                ]}
              />
              <div className="sm:col-span-2">
                <SelectField
                  label={lang === 'en' ? 'Preferred Language' : 'पसंदीदा भाषा'}
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  options={[
                    { value: 'hi', label: 'हिन्दी (Hindi)' },
                    { value: 'en', label: 'English' },
                    { value: 'mr', label: 'मराठी (Marathi)' },
                    { value: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
                    { value: 'gu', label: 'ગુજરાતી (Gujarati)' },
                    { value: 'ta', label: 'தமிழ் (Tamil)' },
                    { value: 'te', label: 'తెలుగు (Telugu)' },
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Location Details */}
        {activeStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-surface-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-2xl">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-surface-900 text-lg tracking-tight">
                    {lang === 'en' ? 'Step 2: Location & Spatial Data' : 'चरण 2: स्थान का विवरण'}
                  </h3>
                  <p className="text-surface-500 text-xs font-medium">
                    {lang === 'en' ? 'Geographic coordinates for hyper-local weather alerts' : 'मौसम चेतावनियों के लिए भौगोलिक निर्देशांक'}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetLocation}
                isLoading={locating}
                className="text-xs font-extrabold flex items-center gap-1.5 rounded-xl border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100"
              >
                <MapPin className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Detect GPS Location' : 'जीपीएस स्थान पहचानें'}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label={lang === 'en' ? 'State' : 'राज्य'}
                name="state"
                type="text"
                value={formData.state}
                onChange={handleChange}
              />
              <InputField
                label={lang === 'en' ? 'District' : 'ज़िला'}
                name="district"
                type="text"
                value={formData.district}
                onChange={handleChange}
              />
              <InputField
                label={lang === 'en' ? 'Village / Tehsil' : 'गाँव / तहसील'}
                name="village"
                type="text"
                value={formData.village}
                onChange={handleChange}
                placeholder="e.g. Nilokheri"
              />
              <InputField
                label={lang === 'en' ? 'Pincode' : 'पिन कोड'}
                name="pincode"
                type="text"
                value={formData.pincode}
                onChange={handleChange}
              />
              {formData.lat && (
                <div className="sm:col-span-2 bg-purple-50 border border-purple-100 p-3 rounded-2xl text-xs font-semibold text-purple-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span>GPS Lat: {formData.lat.toFixed(4)}, Lng: {formData.lng.toFixed(4)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Farm Specs */}
        {activeStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 border-b border-surface-100 pb-4">
              <div className="p-3 bg-emerald-100 rounded-2xl">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-surface-900 text-lg tracking-tight">
                  {lang === 'en' ? 'Step 3: Farm & Soil Specifications' : 'चरण 3: खेत और भूमि विवरण'}
                </h3>
                <p className="text-surface-500 text-xs font-medium">
                  {lang === 'en' ? 'Land size, soil texture, and irrigation infrastructure' : 'भूमि का आकार, मिट्टी और सिंचाई प्रणाली'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label={lang === 'en' ? 'Total Land Size (Acres)' : 'कुल भूमि (एकड़)'}
                name="landSize"
                type="number"
                icon={MapPin}
                value={formData.landSize}
                onChange={handleChange}
              />
              <SelectField
                label={lang === 'en' ? 'Soil Type' : 'मिट्टी का प्रकार'}
                name="soilType"
                icon={Leaf}
                value={formData.soilType}
                onChange={handleChange}
                options={[
                  { value: 'Alluvial', label: 'Alluvial (जलोढ़ - दोमट)' },
                  { value: 'Black', label: 'Black (काली रेगुर)' },
                  { value: 'Red', label: 'Red (लाल मिट्टी)' },
                  { value: 'Laterite', label: 'Laterite (लेटराइट)' },
                  { value: 'Sandy', label: 'Sandy (बलुई)' },
                ]}
              />
              <div className="sm:col-span-2">
                <SelectField
                  label={lang === 'en' ? 'Primary Irrigation Source' : 'प्राथमिक सिंचाई साधन'}
                  name="irrigation"
                  icon={Droplets}
                  value={formData.irrigation}
                  onChange={handleChange}
                  options={[
                    { value: 'Tube Well', label: 'Tube Well / Borewell (ट्यूबवेल)' },
                    { value: 'Canal', label: 'Canal Network (नहर)' },
                    { value: 'Rainfed', label: 'Rainfed (मानसून आश्रित)' },
                    { value: 'Drip', label: 'Drip / Sprinkler (टपकन सिंचाई)' },
                  ]}
                />
              </div>
              <div className="sm:col-span-2">
                <InputField
                  label={lang === 'en' ? 'Farm Equipment Owned' : 'कृषि उपकरण'}
                  name="equipment"
                  type="text"
                  icon={Tractor}
                  value={formData.equipment}
                  onChange={handleChange}
                  placeholder="e.g., Tractor, Pump, Harvester"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Crops & Operations */}
        {activeStep === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 border-b border-surface-100 pb-4">
              <div className="p-3 bg-amber-100 rounded-2xl">
                <Warehouse className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-surface-900 text-lg tracking-tight">
                  {lang === 'en' ? 'Step 4: Crops & Operations' : 'चरण 4: फसल और पशुधन'}
                </h3>
                <p className="text-surface-500 text-xs font-medium">
                  {lang === 'en' ? 'Crop history, livestock, and grain storage capacity' : 'फसल इतिहास, पशुधन और भंडारण'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField
                label={lang === 'en' ? 'Primary Crop' : 'प्राथमिक फसल'}
                name="primaryCrop"
                type="text"
                icon={Leaf}
                value={formData.primaryCrop}
                onChange={handleChange}
              />
              <InputField
                label={lang === 'en' ? 'Secondary Crop' : 'द्वितीयक फसल'}
                name="secondaryCrop"
                type="text"
                value={formData.secondaryCrop}
                onChange={handleChange}
              />
              <div className="sm:col-span-2">
                <InputField
                  label={lang === 'en' ? 'Livestock / Animals Count' : 'पशुधन संख्या'}
                  name="livestock"
                  type="text"
                  icon={PawPrint}
                  value={formData.livestock}
                  onChange={handleChange}
                  placeholder="e.g., 3 Buffaloes, 2 Cows"
                />
              </div>
              <div className="sm:col-span-2">
                <InputField
                  label={lang === 'en' ? 'Storage Capacity (Quintals)' : 'भंडारण क्षमता (क्विंटल)'}
                  name="storageCapacity"
                  type="number"
                  icon={Warehouse}
                  value={formData.storageCapacity}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Account Security */}
        {activeStep === 5 && (
          <form onSubmit={handleChangePasswordSubmit} className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 border-b border-surface-100 pb-4">
              <div className="p-3 bg-red-100 rounded-2xl">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-surface-900 text-lg tracking-tight">
                  {lang === 'en' ? 'Step 5: Account Security' : 'चरण 5: खाता सुरक्षा'}
                </h3>
                <p className="text-surface-500 text-xs font-medium">
                  {lang === 'en' ? 'Change your account password securely' : 'अपना खाता पासवर्ड सुरक्षित रूप से बदलें'}
                </p>
              </div>
            </div>

            <div className="space-y-5 max-w-md">
              <InputField
                label={lang === 'en' ? 'Current Password' : 'वर्तमान पासवर्ड'}
                name="currentPassword"
                type="password"
                icon={Lock}
                value={passwords.currentPassword}
                onChange={handlePasswordChange}
                required
              />
              <InputField
                label={lang === 'en' ? 'New Password' : 'नया पासवर्ड'}
                name="newPassword"
                type="password"
                icon={Lock}
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                required
              />
              <InputField
                label={lang === 'en' ? 'Confirm New Password' : 'नये पासवर्ड की पुष्टि करें'}
                name="confirmPassword"
                type="password"
                icon={Lock}
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
              <Button
                type="submit"
                isLoading={loading}
                className="w-full py-3 text-sm font-extrabold rounded-xl bg-red-600 hover:bg-red-700 text-white"
              >
                {lang === 'en' ? 'Update Password' : 'पासवर्ड अपडेट करें'}
              </Button>
            </div>
          </form>
        )}

        {/* Wizard Navigation Bar */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-surface-100">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setActiveStep((prev) => Math.max(1, prev - 1));
              setSuccessMsg('');
              setErrorMsg('');
            }}
            disabled={activeStep === 1 || loading}
            className="flex items-center gap-1.5 rounded-xl px-5"
          >
            <ChevronLeft className="w-4 h-4" />
            {lang === 'en' ? 'Previous Step' : 'पीछे'}
          </Button>

          {activeStep < 5 ? (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveProfile}
                isLoading={loading}
                className="rounded-xl px-4 text-xs font-bold"
              >
                <Save className="w-4 h-4 mr-1 text-brand-600" />
                {lang === 'en' ? 'Save Draft' : 'सहेजें'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setActiveStep((prev) => Math.min(5, prev + 1));
                  setSuccessMsg('');
                  setErrorMsg('');
                }}
                className="flex items-center gap-1.5 rounded-xl px-6 bg-brand-600 hover:bg-brand-700 text-white font-extrabold"
              >
                {lang === 'en' ? 'Next Step' : 'अगला चरण'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleSaveProfile}
              isLoading={loading}
              className="flex items-center gap-2 rounded-xl px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold shadow-lg"
            >
              <Save className="w-5 h-5" />
              {lang === 'en' ? 'Save Complete Profile' : 'संपूर्ण प्रोफ़ाइल सहेजें'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
