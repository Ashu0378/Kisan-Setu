import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CloudRain, Sprout, TrendingUp, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function Dashboard() {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="animate-slide-up">
          <h1 className="text-2xl font-bold text-surface-900">{t('welcome')}</h1>
          <p className="text-surface-500 mt-1">{t('subtitle')}</p>
        </div>
        <Button className="animate-slide-up" style={{ animationDelay: '100ms' }}>{t('updateProfile')}</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-surface-500">{t('currentCrop')}</p>
                <p className="text-2xl font-bold text-surface-900">Wheat (HD-2967)</p>
              </div>
              <div className="p-2 bg-brand-100 rounded-lg">
                <Sprout className="w-5 h-5 text-brand-700" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="success">{t('growing')}</Badge>
              <span className="text-sm text-surface-500">Day 45 of 120</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-surface-500">{t('weatherRisk')}</p>
                <p className="text-2xl font-bold text-surface-900">{t('low')}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CloudRain className="w-5 h-5 text-blue-700" />
              </div>
            </div>
            <div className="mt-4 text-sm text-surface-600">
              Clear skies expected for the next 5 days.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-surface-500">{t('estYield')}</p>
                <p className="text-2xl font-bold text-surface-900">42 Quintals</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-700" />
              </div>
            </div>
            <div className="mt-4 text-sm text-green-600 font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" /> +5% vs avg
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-surface-500">{t('actionRequired')}</p>
                <p className="text-xl font-bold text-surface-900">{t('irrigationDue')}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg animate-pulse-slow shadow-sm">
                <AlertTriangle className="w-5 h-5 text-red-700" />
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">{t('viewDetails')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="col-span-1" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle>{t('nextBestActions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-xl border border-surface-200 bg-surface-50 hover:bg-brand-50 hover:border-brand-200 transition-colors duration-300 cursor-pointer group">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-surface-100 group-hover:scale-110 transition-transform duration-300">
                  <Sprout className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-surface-900 group-hover:text-brand-700 transition-colors">{t('applyUrea')}</h4>
                  <p className="text-sm text-surface-600 mt-1">{t('applyUreaDesc')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl border border-surface-200 bg-surface-50 hover:bg-yellow-50 hover:border-yellow-200 transition-colors duration-300 cursor-pointer group">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-surface-100 group-hover:scale-110 transition-transform duration-300">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-surface-900 group-hover:text-yellow-700 transition-colors">{t('checkRust')}</h4>
                  <p className="text-sm text-surface-600 mt-1">{t('checkRustDesc')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle>{t('marketTrends')}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center min-h-[200px] border-2 border-dashed border-surface-200 rounded-xl bg-surface-50 mx-6 mb-6">
             <p className="text-surface-500 text-sm">Chart Placeholder</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
