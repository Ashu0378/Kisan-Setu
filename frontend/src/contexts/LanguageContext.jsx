import React, { createContext, useState, useContext } from 'react';

const translations = {
  en: {
    dashboard: "Dashboard",
    myProfile: "My Profile",
    cropPlanner: "Crop Planner",
    yieldPredictor: "Yield Predictor",
    coldGuard: "ColdGuard Risk",
    mandiOptimizer: "Mandi Optimizer",
    sellHold: "Sell/Hold Advisor",
    schemeMatch: "SchemeMatch AI",
    welcome: "Welcome back, Ramesh",
    subtitle: "Here is the latest actionable intelligence for your farm.",
    updateProfile: "Update Farm Profile",
    currentCrop: "Current Crop",
    weatherRisk: "Weather Risk",
    estYield: "Est. Yield",
    actionRequired: "Action Required",
    growing: "Growing",
    low: "Low",
    irrigationDue: "Irrigation Due",
    nextBestActions: "Next Best Actions",
    applyUrea: "Apply Urea Fertilizer",
    applyUreaDesc: "Based on Day 45 growth stage, recommend applying 45kg/acre.",
    checkRust: "Check for Rust Disease",
    checkRustDesc: "Nearby farms reported yellow rust. Inspect leaves today.",
    marketTrends: "Market Price Trends",
    viewDetails: "View Details"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    myProfile: 'मेरी प्रोफ़ाइल',
    cropPlanner: "फसल योजनाकार",
    yieldPredictor: "उपज भविष्यवक्ता",
    coldGuard: "कोल्डगार्ड जोखिम",
    mandiOptimizer: "मंडी अनुकूलक",
    sellHold: "बेचें/रखें सलाहकार",
    schemeMatch: "योजना मिलान AI",
    welcome: "वापसी पर स्वागत है, रमेश",
    subtitle: "यहाँ आपके खेत के लिए नवीनतम कार्रवाई योग्य जानकारी है।",
    updateProfile: "फार्म प्रोफाइल अपडेट करें",
    currentCrop: "वर्तमान फसल",
    weatherRisk: "मौसम जोखिम",
    estYield: "अनुमानित उपज",
    actionRequired: "कार्रवाई आवश्यक",
    growing: "बढ़ रहा है",
    low: "कम",
    irrigationDue: "सिंचाई बाकी",
    nextBestActions: "अगले सर्वोत्तम कदम",
    applyUrea: "यूरिया उर्वरक डालें",
    applyUreaDesc: "दिन 45 के विकास चरण के आधार पर, 45 किग्रा/एकड़ डालने की सलाह।",
    checkRust: "रस्ट रोग की जांच करें",
    checkRustDesc: "आसपास के खेतों में पीला रस्ट देखा गया है। आज पत्तियों का निरीक्षण करें।",
    marketTrends: "बाजार मूल्य प्रवृत्तियां",
    viewDetails: "विवरण देखें"
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const t = (key) => {
    return translations[lang][key] || key;
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'hi' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  return useContext(LanguageContext);
}
