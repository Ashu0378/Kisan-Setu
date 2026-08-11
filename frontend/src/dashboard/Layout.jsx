import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sprout, 
  BarChart3, 
  ThermometerSnowflake, 
  TrendingUp, 
  PiggyBank,
  Menu,
  X,
  Bell,
  UserCircle,
  HelpCircle,
  Settings,
  LogOut,
  MapPin,
  Leaf
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../contexts/LanguageContext';

const navigation = [
  { name: 'Dashboard', translationKey: 'dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Crop Planner', translationKey: 'cropPlanner', href: '/crop-planner', icon: Sprout },
  { name: 'Yield Predictor', translationKey: 'yieldPredictor', href: '/yield-predictor', icon: BarChart3 },
  { name: 'ColdGuard Risk', translationKey: 'coldGuard', href: '/coldguard', icon: ThermometerSnowflake },
  { name: 'Mandi Optimizer', translationKey: 'mandiOptimizer', href: '/mandi-optimizer', icon: TrendingUp },
  { name: 'Sell/Hold Advisor', translationKey: 'sellHold', href: '/sell-hold', icon: PiggyBank },
  { name: 'SchemeMatch AI', translationKey: 'schemeMatch', href: '/schemematch', icon: PiggyBank },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { lang, t, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-surface-50 to-brand-100 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-surface-900/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white/60 backdrop-blur-2xl border-r border-white/60 shadow-[4px_0_24px_rgba(34,197,94,0.05)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-surface-100">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-transparent group-hover:from-brand-600 group-hover:to-brand-400 transition-all duration-300">
              KisanSetu AI
            </span>
          </div>
          <button 
            className="ml-auto lg:hidden text-surface-500 hover:text-surface-900"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-300 hover:translate-x-1",
                isActive 
                  ? "bg-gradient-to-r from-brand-500 to-brand-400 text-white shadow-md shadow-brand-500/20" 
                  : "text-surface-600 hover:bg-white/60 hover:text-brand-700 hover:shadow-sm"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {t(item.translationKey)}
            </NavLink>
          ))}
        </nav>
        
        {/* Bottom Left Profile Section */}
        <div className="p-4 border-t border-surface-200">
          <Link 
            to="/profile" 
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/60 hover:shadow-sm transition-all duration-300 group"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center border-2 border-transparent group-hover:border-brand-300 transition-colors">
              <UserCircle className="w-6 h-6 text-brand-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-900 truncate">Ramesh Kumar</p>
              <p className="text-xs text-surface-500 truncate">{t('myProfile')}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white/60 backdrop-blur-2xl border-b border-white/60 flex items-center justify-between px-4 sm:px-6 z-10">
          <button 
            className="lg:hidden text-surface-500 hover:text-surface-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-3 sm:gap-4 relative">
            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="hidden sm:flex font-semibold">
              {lang === 'en' ? 'हिन्दी' : 'English'}
            </Button>
            
            {/* Notifications */}
            <div className="relative">
              <button 
                className="relative p-2 text-surface-500 hover:text-brand-600 transition-colors"
                onClick={() => { setShowNotifications(!showNotifications); setShowHelp(false); setShowProfile(false); }}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-surface-200 overflow-hidden z-50 animate-fade-in">
                  <div className="p-3 border-b border-surface-100 font-semibold bg-surface-50 text-surface-900">
                    {lang === 'en' ? 'Notifications' : 'सूचनाएं'}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-3 border-b border-surface-100 hover:bg-surface-50 cursor-pointer">
                      <p className="text-sm font-medium text-surface-900">{lang === 'en' ? 'Irrigation Due' : 'सिंचाई का समय'}</p>
                      <p className="text-xs text-surface-500 mt-0.5">{lang === 'en' ? 'Wheat field needs water today.' : 'गेहूं के खेत में आज पानी की आवश्यकता है।'}</p>
                    </div>
                    <div className="p-3 hover:bg-surface-50 cursor-pointer">
                      <p className="text-sm font-medium text-brand-700">{lang === 'en' ? 'Market Price Alert' : 'बाजार मूल्य अलर्ट'}</p>
                      <p className="text-xs text-surface-500 mt-0.5">{lang === 'en' ? 'Mustard prices rose by 5% in Karnal.' : 'करनाल में सरसों के दाम 5% बढ़े।'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Help Section */}
            <div className="relative hidden sm:block">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setShowHelp(!showHelp); setShowNotifications(false); setShowProfile(false); }}
                className="flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                {lang === 'en' ? 'Help' : 'मदद'}
              </Button>
              {showHelp && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-surface-200 overflow-hidden z-50 animate-fade-in">
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-brand-600 transition-colors">
                      {lang === 'en' ? 'Call Kisan Call Center' : 'किसान कॉल सेंटर'}
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-brand-600 transition-colors">
                      {lang === 'en' ? 'Video Tutorials' : 'वीडियो ट्यूटोरियल'}
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-brand-600 transition-colors">
                      {lang === 'en' ? 'Connect to Expert' : 'विशेषज्ञ से जुड़ें'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button 
                className="p-1 rounded-full border-2 border-surface-200 hover:border-brand-500 transition-colors text-surface-500 hover:text-brand-600"
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setShowHelp(false); }}
              >
                <UserCircle className="w-6 h-6" />
              </button>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-surface-200 overflow-hidden z-50 animate-fade-in">
                  <div className="p-3 border-b border-surface-100 bg-surface-50">
                    <p className="text-sm font-semibold text-surface-900">Ramesh Kumar</p>
                    <p className="text-xs text-surface-500">+91 98765 43210</p>
                  </div>
                  <div className="py-1">
                    <Link to="/profile" className="w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-brand-600 flex items-center gap-2" onClick={() => setShowProfile(false)}>
                      <MapPin className="w-4 h-4" /> {lang === 'en' ? 'Update Farm Details' : 'खेत का विवरण अपडेट करें'}
                    </Link>
                    <button className="w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-brand-600 flex items-center gap-2">
                      <Leaf className="w-4 h-4" /> {lang === 'en' ? 'Soil Health Card' : 'मृदा स्वास्थ्य कार्ड'}
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-brand-600 flex items-center gap-2">
                      <Settings className="w-4 h-4" /> {lang === 'en' ? 'App Settings' : 'ऐप सेटिंग्स'}
                    </button>
                    <div className="border-t border-surface-100 my-1"></div>
                    <Link to="/signin" className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2" onClick={() => setShowProfile(false)}>
                      <LogOut className="w-4 h-4" /> {lang === 'en' ? 'Sign Out' : 'लॉग आउट'}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
