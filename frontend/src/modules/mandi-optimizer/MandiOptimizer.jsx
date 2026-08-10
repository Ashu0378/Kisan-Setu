import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { MapPin, Truck, TrendingUp } from 'lucide-react';

export function MandiOptimizer() {
  const { lang } = useLanguage();

  const mandis = [
    { name: 'Karnal Anaj Mandi', distance: '12 km', listedPrice: '₹2,350', transportCost: '₹50', fees: '₹20', netReturn: '₹2,280', recommended: true },
    { name: 'Panipat Mandi', distance: '35 km', listedPrice: '₹2,400', transportCost: '₹140', fees: '₹20', netReturn: '₹2,240', recommended: false },
    { name: 'Kurukshetra Mandi', distance: '40 km', listedPrice: '₹2,380', transportCost: '₹160', fees: '₹25', netReturn: '₹2,195', recommended: false },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-100 rounded-xl">
          <TrendingUp className="w-6 h-6 text-purple-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{lang === 'en' ? 'Mandi & Logistics Optimizer' : 'मंडी और रसद अनुकूलक'}</h1>
          <p className="text-surface-500">{lang === 'en' ? 'Ranked by Net Realized Return (Listed Price - Logistics - Fees).' : 'शुद्ध प्राप्त रिटर्न के आधार पर रैंक किया गया (सूचीबद्ध मूल्य - रसद - शुल्क)।'}</p>
        </div>
      </div>

      <div className="space-y-4">
        {mandis.map((mandi, idx) => (
          <Card key={idx} className={`animate-slide-up ${mandi.recommended ? 'border-brand-400 shadow-hover-glow relative' : ''}`} style={{ animationDelay: `${(idx + 1) * 100}ms` }}>
            {mandi.recommended && (
               <div className="absolute top-0 right-6 transform -translate-y-1/2">
                 <Badge variant="brand" className="px-3 py-1 shadow-sm">{lang === 'en' ? 'Best Net Return' : 'सर्वोत्तम शुद्ध रिटर्न'}</Badge>
               </div>
            )}
            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-surface-400" />
                  <h3 className="text-xl font-bold text-surface-900">{mandi.name}</h3>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-surface-600 mt-3">
                  <span className="flex items-center gap-1 bg-surface-100 px-2 py-1 rounded"><Truck className="w-4 h-4"/> {mandi.distance}</span>
                  <span className="bg-surface-100 px-2 py-1 rounded">{lang === 'en' ? 'Listed:' : 'सूचीबद्ध:'} <span className="font-semibold">{mandi.listedPrice}</span></span>
                  <span className="bg-red-50 text-red-700 px-2 py-1 rounded">{lang === 'en' ? 'Logistics:' : 'परिवहन:'} -{mandi.transportCost}</span>
                  <span className="bg-red-50 text-red-700 px-2 py-1 rounded">{lang === 'en' ? 'Fees:' : 'शुल्क:'} -{mandi.fees}</span>
                </div>
              </div>
              <div className="text-left md:text-right md:pl-6 md:border-l border-surface-200">
                <p className="text-sm font-medium text-surface-500">{lang === 'en' ? 'Net Realized Return' : 'शुद्ध प्राप्त रिटर्न'}</p>
                <p className={`text-3xl font-bold mt-1 ${mandi.recommended ? 'text-brand-600' : 'text-surface-900'}`}>{mandi.netReturn}</p>
                <p className="text-xs text-surface-400 mt-1">per quintal</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
