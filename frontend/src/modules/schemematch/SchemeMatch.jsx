import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { FileText, CheckCircle2 } from 'lucide-react';

export function SchemeMatch() {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(null);

  const handleMatch = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setMatches([
        { name: 'PM-KUSUM (Solar Pumps)', match: '95%', grant: 'Up to 60% subsidy', status: 'Eligible' },
        { name: 'PMFBY (Crop Insurance)', match: '100%', grant: 'Premium at 2%', status: 'Highly Recommended' }
      ]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-orange-100 rounded-xl">
          <FileText className="w-6 h-6 text-orange-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{lang === 'en' ? 'SchemeMatch AI' : 'योजना मिलान AI'}</h1>
          <p className="text-surface-500">{lang === 'en' ? 'Zero-hallucination government scheme eligibility checking.' : 'शून्य-भ्रम सरकारी योजना पात्रता जांच।'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="text-lg">{lang === 'en' ? 'Eligibility Criteria' : 'पात्रता मापदंड'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMatch} className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-surface-700">
                  <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500" defaultChecked />
                  {lang === 'en' ? 'Small/Marginal Farmer (< 5 Acres)' : 'छोटे/सीमांत किसान (< 5 एकड़)'}
                </label>
                <label className="flex items-center gap-2 text-sm text-surface-700">
                  <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500" defaultChecked />
                  {lang === 'en' ? 'Has Aadhaar Card linked to Bank' : 'बैंक से जुड़ा आधार कार्ड है'}
                </label>
                <label className="flex items-center gap-2 text-sm text-surface-700">
                  <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500" />
                  {lang === 'en' ? 'Belongs to SC/ST Category' : 'SC/ST श्रेणी से संबंधित है'}
                </label>
                <label className="flex items-center gap-2 text-sm text-surface-700">
                  <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500" defaultChecked />
                  {lang === 'en' ? 'Needs Irrigation/Solar Equipment' : 'सिंचाई/सौर उपकरण की आवश्यकता है'}
                </label>
              </div>
              <Button type="submit" className="w-full mt-4" isLoading={loading}>
                {lang === 'en' ? 'Check Eligibility' : 'पात्रता जांचें'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {matches ? (
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <h3 className="font-semibold text-lg text-surface-900">{lang === 'en' ? 'Matched Schemes' : 'मिलान की गई योजनाएं'}</h3>
              {matches.map((scheme, idx) => (
                <div key={idx} className="bg-white border border-surface-200 rounded-xl p-5 shadow-sm hover:shadow-hover-glow hover:border-brand-300 transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-lg text-surface-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      {scheme.name}
                    </h4>
                    <p className="text-sm text-surface-600 mt-1">{scheme.grant}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <Badge variant="success">{scheme.status}</Badge>
                    <p className="text-xs text-brand-700 bg-brand-50 px-2 py-1 rounded mt-2 inline-block font-semibold">Match Score: {scheme.match}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[300px] border-2 border-dashed border-surface-200 rounded-2xl flex flex-col items-center justify-center text-surface-400 bg-surface-50/50">
              <FileText className="w-12 h-12 mb-2 text-surface-300" />
              <p>{lang === 'en' ? 'Fill checklist to discover eligible schemes.' : 'पात्र योजनाओं की खोज के लिए चेकलिस्ट भरें।'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
