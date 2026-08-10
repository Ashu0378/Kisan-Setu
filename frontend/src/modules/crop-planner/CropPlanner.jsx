import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { Sprout, Droplets, Banknote, ArrowRight, ShieldCheck } from 'lucide-react';

export function CropPlanner() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleAnalyze = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResults([
        { crop: 'Mustard (Pusa Double Zero 31)', roi: '185%', risk: 'Low', water: 'Low', profit: '₹45,000/acre' },
        { crop: 'Wheat (HD-2967)', roi: '140%', risk: 'Medium', water: 'High', profit: '₹35,000/acre' },
        { crop: 'Chickpea (Kabuli)', roi: '160%', risk: 'High', water: 'Medium', profit: '₹40,000/acre' }
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-brand-100 rounded-xl">
          <Sprout className="w-6 h-6 text-brand-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{lang === 'en' ? 'AI Crop Planner' : 'AI फसल योजनाकार'}</h1>
          <p className="text-surface-500">{lang === 'en' ? 'Find the most profitable, risk-adjusted crop for your specific farm.' : 'अपने खेत के लिए सबसे लाभदायक, जोखिम-समायोजित फसल खोजें।'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">{lang === 'en' ? 'Farm Parameters' : 'खेत के पैरामीटर'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">{lang === 'en' ? 'Soil Nitrogen Level' : 'मिट्टी में नाइट्रोजन का स्तर'}</label>
                <select className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-surface-50 focus:ring-2 focus:ring-brand-500 outline-none">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">{lang === 'en' ? 'Available Water Source' : 'उपलब्ध जल स्रोत'}</label>
                <select className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-surface-50 focus:ring-2 focus:ring-brand-500 outline-none">
                  <option>Canal (नहर)</option>
                  <option>Tube Well (ट्यूबवेल)</option>
                  <option>Rain-fed (वर्षा आधारित)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">{lang === 'en' ? 'Investment Budget (₹)' : 'निवेश बजट (₹)'}</label>
                <input type="number" defaultValue={20000} className="w-full px-3 py-2 rounded-lg border border-surface-200 bg-surface-50 focus:ring-2 focus:ring-brand-500 outline-none" />
              </div>
              <Button type="submit" className="w-full mt-4" isLoading={loading}>
                {lang === 'en' ? 'Run AI Analysis' : 'AI विश्लेषण चलाएं'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {results ? (
            <div className="space-y-4 animate-slide-up">
              <h3 className="font-semibold text-lg text-surface-900">{lang === 'en' ? 'Top Recommendations' : 'शीर्ष सिफारिशें'}</h3>
              {results.map((res, idx) => (
                <div key={idx} className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm hover:shadow-hover-glow hover:border-brand-300 transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg text-surface-900">{res.crop}</h4>
                      {idx === 0 && <Badge variant="brand">{lang === 'en' ? 'Best Fit' : 'सबसे उपयुक्त'}</Badge>}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-surface-600">
                      <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-green-600"/> Risk: {res.risk}</span>
                      <span className="flex items-center gap-1"><Droplets className="w-4 h-4 text-blue-500"/> Water: {res.water}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-medium text-surface-500">{lang === 'en' ? 'Est. Profit' : 'अनुमानित लाभ'}</p>
                    <p className="text-xl font-bold text-green-600">{res.profit}</p>
                    <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded mt-1 inline-block">ROI: {res.roi}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-surface-200 rounded-2xl flex flex-col items-center justify-center text-surface-400 bg-surface-50/50">
              <Sprout className="w-12 h-12 mb-2 text-surface-300" />
              <p>{lang === 'en' ? 'Enter parameters and run analysis to see crop recommendations.' : 'पैरामीटर दर्ज करें और फसल की सिफारिशें देखने के लिए विश्लेषण चलाएं।'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
