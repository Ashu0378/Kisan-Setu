import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useLanguage } from '../../contexts/LanguageContext';
import { PiggyBank, Calendar, Info } from 'lucide-react';

export function SellHoldAdvisor() {
  const { lang } = useLanguage();
  const [days, setDays] = useState(30);
  
  const currentPrice = 2100; // per quintal
  const expectedAppreciationPerDay = 12; 
  const storageCostPerDay = 1.5;
  
  const expectedPrice = currentPrice + (expectedAppreciationPerDay * days);
  const totalStorageCost = storageCostPerDay * days;
  const netReturn = expectedPrice - totalStorageCost;
  const profitDifference = netReturn - currentPrice;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 rounded-xl">
          <PiggyBank className="w-6 h-6 text-green-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{lang === 'en' ? 'Sell/Hold Advisor & Simulator' : 'बेचें/रखें सलाहकार और सिम्युलेटर'}</h1>
          <p className="text-surface-500">{lang === 'en' ? 'Simulate market scenarios to find the optimal selling window.' : 'इष्टतम बिक्री विंडो खोजने के लिए बाजार परिदृश्यों का अनुकरण करें।'}</p>
        </div>
      </div>

      <Card className="animate-slide-up">
        <CardContent className="p-8">
          <div className="mb-8">
            <label className="flex items-center justify-between text-sm font-medium text-surface-700 mb-4">
              <span>{lang === 'en' ? 'Days to Hold in Storage' : 'स्टोरेज में रखने के दिन'}</span>
              <span className="text-lg font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-lg">{days} {lang === 'en' ? 'Days' : 'दिन'}</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="90" 
              value={days} 
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-xs text-surface-400 mt-2">
              <span>0 (Sell Today)</span>
              <span>90 Days</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-surface-100">
            <div>
              <p className="text-sm text-surface-500 mb-1">{lang === 'en' ? 'Expected Market Price' : 'अपेक्षित बाजार मूल्य'}</p>
              <p className="text-2xl font-bold text-surface-900">₹{expectedPrice}</p>
            </div>
            <div>
              <p className="text-sm text-surface-500 mb-1">{lang === 'en' ? 'Total Storage Cost' : 'कुल भंडारण लागत'}</p>
              <p className="text-2xl font-bold text-red-500">-₹{totalStorageCost.toFixed(0)}</p>
            </div>
            <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
              <p className="text-sm font-semibold text-surface-700 mb-1">{lang === 'en' ? 'Net Simulated Return' : 'शुद्ध सिम्युलेटेड रिटर्न'}</p>
              <p className="text-3xl font-bold text-brand-600">₹{netReturn.toFixed(0)}</p>
            </div>
          </div>

          {days > 0 && (
            <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${profitDifference > 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${profitDifference > 0 ? 'text-green-600' : 'text-yellow-600'}`} />
              <div>
                <h4 className={`font-semibold ${profitDifference > 0 ? 'text-green-800' : 'text-yellow-800'}`}>
                  {profitDifference > 0 
                    ? (lang === 'en' ? 'Profitable Strategy' : 'लाभदायक रणनीति') 
                    : (lang === 'en' ? 'Suboptimal Strategy' : 'इष्टतम रणनीति नहीं')}
                </h4>
                <p className={`text-sm mt-1 ${profitDifference > 0 ? 'text-green-700' : 'text-yellow-700'}`}>
                  {lang === 'en' ? 'Holding for' : 'रखने पर'} {days} {lang === 'en' ? 'days yields a net difference of' : 'दिनों से शुद्ध अंतर'} 
                  <span className="font-bold"> {profitDifference > 0 ? '+' : ''}₹{profitDifference.toFixed(0)} </span>
                  {lang === 'en' ? 'per quintal compared to selling today.' : 'प्रति क्विंटल आज बेचने की तुलना में।'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
