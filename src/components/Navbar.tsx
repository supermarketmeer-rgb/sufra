import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  ShieldCheck,
  Store,
  Building2,
  Receipt,
  UtensilsCrossed,
  Bike,
  Smartphone,
  Code2,
  ChevronDown,
  Bell,
  Sparkles,
  ExternalLink,
  Sun,
  Moon,
  LogIn
} from 'lucide-react';

interface NavbarProps {
  onOpenExplorer: () => void;
  onOpenRegister?: () => void;
  onOpenPortal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenExplorer, onOpenRegister, onOpenPortal }) => {
  const {
    currentRole,
    setCurrentRole,
    activeRestaurant,
    setActiveRestaurant,
    restaurants,
    orders,
    theme,
    toggleTheme
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showRestMenu, setShowRestMenu] = useState(false);

  const activeOrdersCount = orders.filter(o => o.status === 'new' || o.status === 'preparing').length;

  const roleDefinitions: { role: UserRole; titleAr: string; icon: React.ReactNode; color: string }[] = [
    { role: 'super_admin', titleAr: 'Super Admin (المنصة)', icon: <ShieldCheck className="w-4 h-4" />, color: 'text-amber-400' },
    { role: 'restaurant_owner', titleAr: 'مالك المطعم (Owner)', icon: <Store className="w-4 h-4" />, color: 'text-emerald-400' },
    { role: 'branch_manager', titleAr: 'مدير الفرع (Manager)', icon: <Building2 className="w-4 h-4" />, color: 'text-blue-400' },
    { role: 'cashier', titleAr: 'الكاشير (POS)', icon: <Receipt className="w-4 h-4" />, color: 'text-indigo-400' },
    { role: 'kitchen', titleAr: 'شاشة المطبخ (KDS)', icon: <UtensilsCrossed className="w-4 h-4" />, color: 'text-rose-400' },
    { role: 'driver', titleAr: 'مندوب التوصيل (GPS)', icon: <Bike className="w-4 h-4" />, color: 'text-cyan-400' },
    { role: 'customer', titleAr: 'واجهة العميل (QR Menu)', icon: <Smartphone className="w-4 h-4" />, color: 'text-amber-400' },
  ];

  const currentRoleInfo = roleDefinitions.find(r => r.role === currentRole) || roleDefinitions[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 select-none">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentRole('customer')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              س
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-1.5 leading-tight">
                سُفرة SaaS
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Cloud Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">إدارة المنيو والطلبات للمطاعم</p>
            </div>
          </div>

          {/* Restaurant Switcher */}
          {currentRole !== 'super_admin' && (
            <div className="relative ml-2">
              {activeRestaurant ? (
                <button
                  onClick={() => setShowRestMenu(!showRestMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-xs font-medium rounded-lg border border-slate-700/60 transition-colors"
                >
                  <img
                    src={activeRestaurant.logo_url}
                    alt={activeRestaurant.name_ar}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span className="truncate max-w-[130px] text-slate-200">{activeRestaurant.name_ar}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              ) : (
                <button
                  onClick={() => setCurrentRole('super_admin')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg border border-amber-500/30 transition-colors"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>+ تسجيل مطعم</span>
                </button>
              )}

              {showRestMenu && activeRestaurant && (
                <div className="absolute top-full mt-1.5 right-0 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>اختر المطعم للتحكم</span>
                    <button
                      onClick={() => {
                        setShowRestMenu(false);
                        setCurrentRole('super_admin');
                      }}
                      className="text-amber-400 hover:underline text-[10px]"
                    >
                      + مطعم جديد
                    </button>
                  </div>
                  {restaurants.map(rest => (
                    <button
                      key={rest.id}
                      onClick={() => {
                        setActiveRestaurant(rest);
                        setShowRestMenu(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-right hover:bg-slate-800 transition-colors ${
                        rest.id === activeRestaurant.id ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-slate-300'
                      }`}
                    >
                      <img src={rest.logo_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                      <div className="flex-1 truncate">
                        <div className="truncate">{rest.name_ar}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{rest.slug}.sufrah.menu</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Zone 2: Fast Role Selector Bar */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          {roleDefinitions.map(item => {
            const isActive = currentRole === item.role;
            return (
              <button
                key={item.role}
                onClick={() => setCurrentRole(item.role)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.icon}
                <span>{item.titleAr}</span>
                {item.role === 'kitchen' && activeOrdersCount > 0 && (
                  <span className={`w-4 h-4 flex items-center justify-center text-[10px] rounded-full font-mono ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-rose-500 text-white'
                  }`}>
                    {activeOrdersCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Code Studio */}
        <div className="flex items-center gap-2">
          {/* Mobile Role Switcher */}
          <div className="relative lg:hidden">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 text-xs font-semibold rounded-lg border border-slate-700 text-slate-200"
            >
              {currentRoleInfo.icon}
              <span className="truncate max-w-[90px]">{currentRoleInfo.titleAr}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {showRoleMenu && (
              <div className="absolute top-full mt-1.5 left-0 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                  التبديل بين أدوار النظام
                </div>
                {roleDefinitions.map(item => (
                  <button
                    key={item.role}
                    onClick={() => {
                      setCurrentRole(item.role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-right hover:bg-slate-800 transition-colors ${
                      currentRole === item.role ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-slate-300'
                    }`}
                  >
                    {item.icon}
                    <span>{item.titleAr}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Welcome Portal Button (Matching user screenshot) */}
          {onOpenPortal && (
            <button
              onClick={onOpenPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
              title="فتح شاشة الدخول وبوابة المنصة"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>شاشة الدخول</span>
            </button>
          )}

          {/* Create Free Restaurant Button */}
          {onOpenRegister && (
            <button
              onClick={onOpenRegister}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              <span>أنشئ مطعمك مجاناً</span>
            </button>
          )}

          {/* Theme Toggle Button (Light/Day vs Dark/Night) */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer shadow-sm ${
              theme === 'dark'
                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
            title={theme === 'dark' ? 'تحويل إلى الثيم النهاري (Light Mode)' : 'تحويل إلى الثيم الليلي (Dark Mode)'}
            aria-label="تبديل الثيم"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span className="hidden sm:inline">ثيم نهاري</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">ثيم ليلي</span>
              </>
            )}
          </button>

          {/* PHP MVC & SQL Code Studio Trigger */}
          <button
            onClick={onOpenExplorer}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-colors whitespace-nowrap shadow-sm"
            title="استعراض كود PHP MVC والـ 28 جدول في MySQL"
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">كود PHP MVC & SQL</span>
          </button>
        </div>
      </div>
    </header>
  );
};
