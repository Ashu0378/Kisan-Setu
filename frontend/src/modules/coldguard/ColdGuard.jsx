import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { ThermometerSnowflake, TrendingDown, Snowflake, ArrowRight } from 'lucide-react';

export function ColdGuard() {
  const { lang } = useLanguage();

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-cyan-100 rounded-xl">
          <ThermometerSnowflake className="w-6 h-6 text-cyan-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{lang === 'en' ? 'Post-Harvest Risk Engine (ColdGuard)' : 'कोल्डगार्ड: कटाई के बाद जोखिम इंजन'}</h1>
          <p className="text-surface-500">{lang === 'en' ? 'Decide whether to sell now or store by weighing fees and spoilage risks.' : 'फीस और खराब होने के जोखिमों को तौल कर तय करें कि अभी बेचना है या स्टोर करना है।'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Scenario 1: Sell Today */}
        <Card className="animate-slide-up border-red-200" style={{ animationDelay: '100ms' }}>
          <div className="h-2 w-full bg-red-400 rounded-t-2xl" />
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{lang === 'en' ? 'Scenario A: Sell Today' : 'परिदृश्य A: आज ही बेचें'}</span>
              <Badge variant="danger">{lang === 'en' ? 'Low Profit' : 'कम लाभ'}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-surface-100">
              <span className="text-surface-600">{lang === 'en' ? 'Current Market Price' : 'वर्तमान बाजार मूल्य'}</span>
              <span className="font-semibold">₹2,100 / Qtl</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-surface-100">
              <span className="text-surface-600">{lang === 'en' ? 'Spoilage Loss' : 'खराबी से नुकसान'}</span>
              <span className="font-semibold text-green-600">0%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-surface-100">
              <span className="text-surface-600">{lang === 'en' ? 'Storage Fees' : 'भंडारण शुल्क'}</span>
              <span className="font-semibold text-green-600">₹0</span>
            </div>
            <div className="pt-4">
              <p className="text-sm text-surface-500">{lang === 'en' ? 'Net Realized Return' : 'शुद्ध प्राप्त रिटर्न'}</p>
              <p className="text-3xl font-bold text-surface-900 mt-1">₹88,200</p>
            </div>
          </CardContent>
        </Card>

        {/* Scenario 2: Store in Cold Storage */}
        <Card className="animate-slide-up border-brand-300 shadow-hover-glow relative" style={{ animationDelay: '200ms' }}>
          <div className="absolute -top-3 -right-3 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse-slow">
            {lang === 'en' ? 'AI Recommended' : 'AI द्वारा अनुशंसित'}
          </div>
          <div className="h-2 w-full bg-brand-500 rounded-t-2xl" />
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{lang === 'en' ? 'Scenario B: Store 30 Days' : 'परिदृश्य B: 30 दिन स्टोर करें'}</span>
              <Badge variant="brand"><Snowflake className="w-3 h-3 mr-1 inline"/> {lang === 'en' ? 'Cold Storage' : 'कोल्ड स्टोरेज'}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-surface-100">
              <span className="text-surface-600">{lang === 'en' ? 'Expected Future Price' : 'अपेक्षित भविष्य मूल्य'}</span>
              <span className="font-semibold text-green-600">₹2,450 / Qtl <TrendingDown className="w-4 h-4 inline rotate-180" /></span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-surface-100">
              <span className="text-surface-600">{lang === 'en' ? 'Est. Spoilage Loss' : 'अनुमानित खराबी नुकसान'}</span>
              <span className="font-semibold text-red-500">-2% (₹1,950)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-surface-100">
              <span className="text-surface-600">{lang === 'en' ? 'Storage Fees' : 'भंडारण शुल्क'}</span>
              <span className="font-semibold text-red-500">-₹4,500</span>
            </div>
            <div className="pt-4 flex justify-between items-end">
              <div>
                <p className="text-sm text-surface-500">{lang === 'en' ? 'Net Realized Return' : 'शुद्ध प्राप्त रिटर्न'}</p>
                <p className="text-3xl font-bold text-brand-700 mt-1">₹96,450</p>
              </div>
              <p className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                +₹8,250 {lang === 'en' ? 'Profit' : 'लाभ'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <Button size="lg" className="px-8 shadow-md">
          {lang === 'en' ? 'Book Cold Storage Unit nearby' : 'पास में कोल्ड स्टोरेज यूनिट बुक करें'} <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
