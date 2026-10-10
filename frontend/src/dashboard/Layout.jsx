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
  Leaf,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', translationKey: 'dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Crop Planner', translationKey: 'cropPlanner', href: '/crop-planner', icon: Sprout },
  { name: 'Yield Predictor', translationKey: 'yieldPredictor', href: '/yield-predictor', icon: BarChart3 },
  { name: 'ColdGuard Risk', translationKey: 'coldGuard', href: '/coldguard', icon: ThermometerSnowflake },
  { name: 'Mandi Optimizer', translationKey: 'mandiOptimizer', href: '/mandi-optimizer', icon: TrendingUp },
  { name: 'Sell/Hold Advisor', translationKey: 'sellHold', href: '/sell-hold', icon: PiggyBank },
  { name: 'SchemeMatch AI', translationKey: 'schemeMatch', href: '/schemematch', icon: ShieldCheck },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { lang, t, toggleLanguage } = useLanguage();
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    setShowProfile(false);
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/70 via-amber-50/30 to-lime-50/40 flex text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-2xl border-r border-emerald-100/80 shadow-[6px_0_30px_rgba(16,185,129,0.06)] transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:w-64 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-emerald-100/60">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-600/25 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-600 bg-clip-text text-transparent group-hover:from-emerald-600 group-hover:to-green-500 transition-all duration-300 tracking-tight">
                KisanSetu AI
              </span>
              <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest -mt-0.5">Agri Intelligence</p>
            </div>
          </Link>
          <button 
            className="ml-auto lg:hidden text-slate-400 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-3.5 space-y-1.5">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 hover:translate-x-1 group relative",
                isActive 
                  ? "bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 font-bold" 
                  : "text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-800"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
              <span>{t(item.translationKey)}</span>
            </NavLink>
          ))}
        </nav>
        
        {/* Profile Card Footer */}
        <div className="p-4 border-t border-emerald-100/60 bg-gradient-to-b from-transparent to-emerald-50/40">
          <Link 
            to="/profile" 
            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/70 hover:bg-white border border-emerald-100 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-300 group"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-300/60 group-hover:border-emerald-500 transition-colors shadow-inner">
              <UserCircle className="w-6 h-6 text-emerald-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.name || (lang === 'en' ? 'Farmer Profile' : 'किसान प्रोफ़ाइल')}
              </p>
              <p className="text-[11px] font-medium text-emerald-700 truncate">{user?.phone ? `+91 ${user.phone}` : t('myProfile')}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 lg:pb-0">
        <header className="h-20 bg-white/75 backdrop-blur-2xl border-b border-emerald-100/60 flex items-center justify-between px-4 sm:px-8 z-10 shadow-sm">
          <button 
            className="lg:hidden text-slate-600 hover:text-emerald-700 p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-3 sm:gap-4 relative">
            {/* Language Toggle Pill */}
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-100/70 hover:bg-emerald-200/80 text-emerald-900 border border-emerald-300/50 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <span>🌐</span>
              <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>
            
            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                className="relative p-2.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all"
                onClick={() => { setShowNotifications(!showNotifications); setShowHelp(false); setShowProfile(false); }}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white animate-pulse" />
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-100 overflow-hidden z-50 animate-slide-down">
                  <div className="p-4 border-b border-slate-100 font-bold text-sm bg-gradient-to-r from-emerald-50 to-lime-50 text-slate-900 flex justify-between items-center">
                    <span>{lang === 'en' ? 'Agri Alerts & Notifications' : 'सूचनाएं व अलर्ट'}</span>
                    <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold">2 New</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    <div className="p-3.5 hover:bg-emerald-50/50 transition-colors cursor-pointer">
                      <p className="text-xs font-bold text-slate-900">{lang === 'en' ? 'Irrigation Alert' : 'सिंचाई चेतावनी'}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{lang === 'en' ? 'Optimal humidity condition for Kharif watering.' : 'खरीफ फसल के लिए अनुकूल नमी स्थिति।'}</p>
                    </div>
                    <div className="p-3.5 hover:bg-emerald-50/50 transition-colors cursor-pointer">
                      <p className="text-xs font-bold text-emerald-700">{lang === 'en' ? 'Mandi Price Spike' : 'मंडी भाव वृद्धि'}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{lang === 'en' ? 'Mustard MSP prices up by 4.5% in Karnal Mandi.' : 'करनाल मंडी में सरसों के दाम 4.5% बढ़े।'}</p>
                    </div>
                  </div>
                  <div className="p-2.5 border-t border-slate-100 bg-slate-50/80 text-center">
                    <button className="text-xs font-bold text-emerald-700 hover:text-emerald-800">{lang === 'en' ? 'Mark all read' : 'पढ़ा हुआ मानें'}</button>
                  </div>
                </div>
              )}
            </div>

            {/* Help Dropdown */}
            <div className="relative hidden sm:block">
              <button 
                onClick={() => { setShowHelp(!showHelp); setShowNotifications(false); setShowProfile(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200/80 transition-all"
              >
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'en' ? 'Help' : 'मदद'}</span>
              </button>
              {showHelp && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-100 overflow-hidden z-50 animate-slide-down">
                  <div className="p-3.5 border-b border-slate-100 font-bold text-xs bg-emerald-50 text-emerald-950">
                    {lang === 'en' ? 'Help & Advisory Support' : 'सहायता व समर्थन'}
                  </div>
                  <div className="py-1 text-xs">
                    <a href="https://soilhealth.dac.gov.in/" target="_blank" rel="noreferrer" className="w-full text-left px-4 py-2.5 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2">
                      🌱 {lang === 'en' ? 'Soil Testing Helpline' : 'मृदा जांच हेल्पलाइन'}
                    </a>
                    <button className="w-full text-left px-4 py-2.5 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2">
                      📞 {lang === 'en' ? 'Contact KVK Agronomist' : 'KVK कृषि विशेषज्ञ से बात करें'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Avatar */}
            <div className="relative">
              <button 
                className="p-1 rounded-full border-2 border-emerald-300 hover:border-emerald-500 transition-all text-slate-600 hover:text-emerald-700 shadow-sm active:scale-95"
                onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); setShowHelp(false); }}
              >
                <UserCircle className="w-7 h-7 text-emerald-700" />
              </button>
              {showProfile && (
                <div className="absolute right-0 mt-3 w-60 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-100 overflow-hidden z-50 animate-slide-down">
                  <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <p className="text-xs font-bold text-slate-900">{user?.name || (lang === 'en' ? 'Farmer Account' : 'किसान खाता')}</p>
                    <p className="text-[11px] font-medium text-emerald-700">{user?.phone ? `+91 ${user.phone}` : ''}</p>
                  </div>
                  <div className="py-1 text-xs font-semibold">
                    <Link to="/profile" className="w-full text-left px-4 py-2.5 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2" onClick={() => setShowProfile(false)}>
                      <MapPin className="w-4 h-4 text-emerald-600" /> {lang === 'en' ? 'Farm & Soil Settings' : 'खेत व मिट्टी सेटिंग्स'}
                    </Link>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 flex items-center gap-2 font-bold">
                      <LogOut className="w-4 h-4" /> {lang === 'en' ? 'Sign Out' : 'लॉग आउट'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-emerald-100 shadow-[0_-4px_24px_rgba(16,185,129,0.1)] z-50 px-6 py-3 flex justify-between items-center">
        <NavLink to="/" end className={({ isActive }) => cn("flex flex-col items-center gap-1 transition-all", isActive ? "text-emerald-700 font-bold scale-110" : "text-slate-400 hover:text-slate-600")}>
          <LayoutDashboard className="w-6 h-6" />
        </NavLink>
        <NavLink to="/crop-planner" className={({ isActive }) => cn("flex flex-col items-center gap-1 transition-all", isActive ? "text-emerald-700 font-bold scale-110" : "text-slate-400 hover:text-slate-600")}>
          <Sprout className="w-6 h-6" />
        </NavLink>
        <NavLink to="/mandi-optimizer" className={({ isActive }) => cn("flex flex-col items-center gap-1 transition-all", isActive ? "text-emerald-700 font-bold scale-110" : "text-slate-400 hover:text-slate-600")}>
          <TrendingUp className="w-6 h-6" />
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => cn("flex flex-col items-center gap-1 transition-all", isActive ? "text-emerald-700 font-bold scale-110" : "text-slate-400 hover:text-slate-600")}>
          <UserCircle className="w-6 h-6" />
        </NavLink>
      </div>
    </div>
  );
}
