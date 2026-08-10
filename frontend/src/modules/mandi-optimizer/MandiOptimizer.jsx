import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

import { useLanguage } from '../../contexts/LanguageContext';
import { MapPin, Truck, TrendingUp, Search, Loader2 } from 'lucide-react';
import { fetchMandiPrices } from '../../services/mandiService';

export function MandiOptimizer() {
  const { lang } = useLanguage();

  const [mandis, setMandis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchMandiPrices({ commodity: searchQuery || 'All' });
        // Process data to calculate Net Return (simulating the AI optimizer logic)
        const processed = data.map(item => {
          const listedPrice = item.modal_price;
          // Simulate distance 10 to 60 km
          const distance = Math.floor(Math.random() * 50) + 10; 
          // Simulate transport cost: ₹4 per km per quintal
          const transportCost = distance * 4; 
          // Simulate Mandi tax/fees 1% of listed
          const fees = Math.floor(listedPrice * 0.01); 
          const netReturn = listedPrice - transportCost - fees;
          return {
            ...item,
            distance: `${distance} km`,
            listedPrice: `₹${listedPrice.toLocaleString('en-IN')}`,
            transportCost: `₹${transportCost.toLocaleString('en-IN')}`,
            fees: `₹${fees.toLocaleString('en-IN')}`,
            netReturnVal: netReturn,
            netReturn: `₹${netReturn.toLocaleString('en-IN')}`
          };
        });
        
        // Sort by highest net return
        processed.sort((a, b) => b.netReturnVal - a.netReturnVal);
        
        // Mark the top one as recommended
        if (processed.length > 0) {
          processed[0].recommended = true;
        }

        setMandis(processed);
      } catch (error) {
        console.error("Failed to fetch mandi prices:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search slightly
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

      <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-sm flex items-center gap-4 animate-slide-up">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder={lang === 'en' ? "Search commodity (e.g., Wheat, Mustard)..." : "फसल खोजें (जैसे, गेहूं, सरसों)..."}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
            <p className="text-surface-500">{lang === 'en' ? 'Fetching live API data...' : 'लाइव डेटा प्राप्त किया जा रहा है...'}</p>
          </div>
        ) : mandis.length === 0 ? (
          <div className="text-center py-12 text-surface-500">
            {lang === 'en' ? 'No mandi data found for this commodity.' : 'इस फसल के लिए कोई मंडी डेटा नहीं मिला।'}
          </div>
        ) : (
          mandis.map((mandi, idx) => (
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
                  <h3 className="text-xl font-bold text-surface-900">{mandi.market} Mandi</h3>
                  <Badge variant="outline" className="ml-2">{mandi.commodity}</Badge>
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
          ))
        )}
      </div>
    </div>
  );
}
