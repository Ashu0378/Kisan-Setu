import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';

export function YieldPredictor() {
  const { lang } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-100 rounded-xl">
          <BarChart3 className="w-6 h-6 text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{lang === 'en' ? 'Yield & Profit Predictor' : 'उपज और लाभ भविष्यवक्ता'}</h1>
          <p className="text-surface-500">{lang === 'en' ? 'Pre-harvest estimates of total output and expected revenue.' : 'कुल उत्पादन और अपेक्षित राजस्व का पूर्व-फसल अनुमान।'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-surface-500">{lang === 'en' ? 'Estimated Total Yield' : 'अनुमानित कुल उपज'}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-surface-900">42</span>
              <span className="text-surface-500">Quintals</span>
            </div>
            <div className="mt-4 text-sm text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded inline-flex">
              <TrendingUp className="w-4 h-4" /> +5% {lang === 'en' ? 'vs historical avg' : 'ऐतिहासिक औसत की तुलना में'}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-surface-500">{lang === 'en' ? 'Expected Revenue' : 'अपेक्षित राजस्व'}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-surface-900">₹1,15,000</span>
            </div>
            <p className="mt-4 text-sm text-surface-500">
              {lang === 'en' ? 'Based on current MSP and mandi trends.' : 'वर्तमान MSP और मंडी प्रवृत्तियों के आधार पर।'}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-surface-500">{lang === 'en' ? 'Confidence Interval' : 'विश्वास अंतराल (Confidence)'}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-brand-600">88%</span>
            </div>
            <div className="mt-4 text-sm text-yellow-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {lang === 'en' ? 'Slight weather risk next week' : 'अगले सप्ताह थोड़ा मौसम जोखिम'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <CardHeader>
          <CardTitle>{lang === 'en' ? 'Yield Trajectory (Machine Learning Forecast)' : 'उपज प्रक्षेपवक्र (मशीन लर्निंग पूर्वानुमान)'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full bg-surface-50 border-2 border-dashed border-surface-200 rounded-xl flex flex-col items-center justify-center text-surface-400">
            <BarChart3 className="w-12 h-12 mb-3 text-surface-300" />
            <p>{lang === 'en' ? '[XGBoost / Prophet Chart Visualization Placeholder]' : '[XGBoost / Prophet चार्ट विज़ुअलाइज़ेशन प्लेसहोल्डर]'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
