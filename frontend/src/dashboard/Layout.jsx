import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
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
  UserCircle
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
  const { lang, t, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-surface-900/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-surface-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 flex flex-col",
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
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-300 hover:translate-x-1",
                isActive 
                  ? "bg-brand-100 text-brand-800 shadow-sm" 
                  : "text-surface-600 hover:bg-surface-100 hover:text-surface-900"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {t(item.translationKey)}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-surface-100">
          <div className="glass-panel p-4 flex items-center gap-3 hover:shadow-hover-glow transition-all duration-300 cursor-pointer hover:-translate-y-0.5">
            <UserCircle className="w-10 h-10 text-brand-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate">Ramesh Kumar</p>
              <p className="text-xs text-surface-500 truncate">Profile: 85% Complete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-surface-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <button 
            className="lg:hidden text-surface-500 hover:text-surface-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="hidden sm:flex font-semibold">
              {lang === 'en' ? 'हिन्दी' : 'English'}
            </Button>
            <button className="relative p-2 text-surface-500 hover:text-brand-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              Need Help?
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
