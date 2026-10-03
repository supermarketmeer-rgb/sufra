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
  Sparkles,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Eye,
  KeyRound,
  ArrowLeft,
  User as UserIcon,
  Lock
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
    toggleTheme,
    activateRestaurantPlan,
    currentUser,
    updateUser
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showRestMenu, setShowRestMenu] = useState(false);
  const [showStaffMenu, setShowStaffMenu] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeCode, setUpgradeCode] = useState('');
  const [upgradeMsg, setUpgradeMsg] = useState<{ success: boolean; message: string } | null>(null);

  // Profile / Password edit state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [profilePin, setProfilePin] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ success: boolean; message: string } | null>(null);

  const handleOpenProfile = () => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfileUsername(currentUser.username);
      setProfilePassword(currentUser.password || '');
      setProfilePin(currentUser.pin_code || '');
      setProfilePhone(currentUser.phone || '');
    }
    setProfileMsg(null);
    setShowProfileModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!profileUsername.trim()) {
      setProfileMsg({ success: false, message: 'اسم المستخدم مطلوب' });
      return;
    }
    const res = updateUser(currentUser.id, {
      name: profileName.trim(),
      username: profileUsername.trim().toLowerCase(),
      password: profilePassword.trim(),
      pin_code: profilePin.trim(),
      phone: profilePhone.trim()
    });
    setProfileMsg(res);
    if (res.success) {
      setTimeout(() => {
        setShowProfileModal(false);
        setProfileMsg(null);
      }, 1200);
    }
  };

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

  const staffTerminals: { role: UserRole; titleAr: string; desc: string; icon: React.ReactNode }[] = [
    { role: 'cashier', titleAr: 'الكاشير ونقاط البيع (POS)', desc: 'إدخال الطلبات والفواتير', icon: <Receipt className="w-4 h-4 text-indigo-400" /> },
    { role: 'kitchen', titleAr: 'شاشة المطبخ الذكية (KDS)', desc: 'متابعة وتجهيز الوجبات', icon: <UtensilsCrossed className="w-4 h-4 text-rose-400" /> },
    { role: 'branch_manager', titleAr: 'مدير الفرع والصالة', desc: 'إدارة الطاولات والحجوزات', icon: <Building2 className="w-4 h-4 text-blue-400" /> },
    { role: 'driver', titleAr: 'مندوب التوصيل (GPS)', desc: 'استلام وتسليم الدليفري', icon: <Bike className="w-4 h-4 text-cyan-400" /> },
  ];

  const currentRoleInfo = roleDefinitions.find(r => r.role === currentRole) || roleDefinitions[0];

  const handleUpgradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upgradeCode.trim() || !activeRestaurant) return;
    const res = activateRestaurantPlan(upgradeCode, activeRestaurant.id);
    setUpgradeMsg({ success: res.success, message: res.message });
    if (res.success) {
      setTimeout(() => {
        setShowUpgradeModal(false);
        setUpgradeMsg(null);
        setUpgradeCode('');
      }, 1500);
    }
  };

  const isSuperAdmin = currentRole === 'super_admin';
  const isOwner = currentRole === 'restaurant_owner';

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 select-none">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          
          {/* ========================================================
              ZONE 1: Identity & Restaurant Context
             ======================================================== */}
          <div className="flex items-center gap-3">
            {isSuperAdmin ? (
              /* Super Admin Brand */
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
                  س
                </div>
                <div>
                  <div className="text-base font-bold text-white flex items-center gap-1.5 leading-tight">
                    سُفرة SaaS
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Super Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-none">إدارة المنصة والاشتراكات</p>
                </div>
              </div>
            ) : (
              /* Restaurant Context (for Owner and Staff) */
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                  {activeRestaurant?.logo_url ? (
                    <img src={activeRestaurant.logo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Store className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-white leading-tight truncate max-w-[160px] sm:max-w-xs">
                      {activeRestaurant?.name_ar || 'مطعمي'}
                    </h2>
                    
                    {/* Plan Badge (Owner view) */}
                    {isOwner && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        activeRestaurant?.plan_name?.includes('مجانية') || activeRestaurant?.plan_name?.includes('Starter')
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {activeRestaurant?.plan_name || 'الباقة المجانية'}
                      </span>
                    )}

                    {/* Terminal Badge (Staff view) */}
                    {!isOwner && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {currentRoleInfo.titleAr}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-none font-mono">
                    {activeRestaurant ? `${activeRestaurant.slug}.sufra.menu` : 'نظام سفرة السحابي'}
                  </p>
                </div>
              </div>
            )}

            {/* Restaurant Switcher (Super Admin only or multiple restaurants owner) */}
            {isSuperAdmin && (
              <div className="relative ml-2">
                <button
                  onClick={() => setShowRestMenu(!showRestMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-xs font-medium rounded-lg border border-slate-700/60 transition-colors"
                >
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate max-w-[130px] text-slate-200">
                    {activeRestaurant ? activeRestaurant.name_ar : 'اختر المطعم'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showRestMenu && (
                  <div className="absolute top-full mt-1.5 right-0 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                      اختر المطعم لإدارته
                    </div>
                    {restaurants.map(rest => (
                      <button
                        key={rest.id}
                        onClick={() => {
                          setActiveRestaurant(rest);
                          setShowRestMenu(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-right hover:bg-slate-800 transition-colors ${
                          rest.id === activeRestaurant?.id ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-slate-300'
                        }`}
                      >
                        <img src={rest.logo_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                        <div className="flex-1 truncate">
                          <div className="truncate">{rest.name_ar}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{rest.plan_name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ========================================================
              ZONE 2: Center Controls (Context-Aware)
             ======================================================== */}
          {isSuperAdmin ? (
            /* Super Admin Role Switcher Preview Bar */
            <nav className="hidden xl:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-500 px-2 font-semibold">أدوار المنصة:</span>
              {roleDefinitions.map(item => {
                const isActive = currentRole === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => setCurrentRole(item.role)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.titleAr.split(' ')[0]}</span>
                  </button>
                );
              })}
            </nav>
          ) : isOwner ? (
            /* Restaurant Owner Quick Nav */
            <div className="hidden md:flex items-center gap-2">
              {/* Preview Customer QR Menu */}
              <button
                onClick={() => setCurrentRole('customer')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700/60 transition-all hover:border-amber-500/40 cursor-pointer"
                title="معاينة شكل منيو الزبائن للطلب من الطاولة"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>معاينة منيو الزبائن (QR)</span>
              </button>

              {/* Staff Terminals Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStaffMenu(!showStaffMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700/60 transition-all cursor-pointer"
                >
                  <UtensilsCrossed className="w-3.5 h-3.5 text-blue-400" />
                  <span>شاشات العمل (Staff)</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showStaffMenu && (
                  <div className="absolute top-full mt-1.5 right-0 w-60 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 z-50">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                      الانتقال إلى شاشات طاقم المطعم
                    </div>
                    {staffTerminals.map(terminal => (
                      <button
                        key={terminal.role}
                        onClick={() => {
                          setCurrentRole(terminal.role);
                          setShowStaffMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-right hover:bg-slate-800 transition-colors text-xs text-slate-200"
                      >
                        {terminal.icon}
                        <div className="flex-1">
                          <div className="font-semibold text-slate-100">{terminal.titleAr}</div>
                          <div className="text-[10px] text-slate-400">{terminal.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Upgrade Plan Button if on Starter */}
              {(activeRestaurant?.plan_name?.includes('مجانية') || activeRestaurant?.plan_name?.includes('Starter')) && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#9a3412] hover:bg-[#852d0f] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>ترقية الباقة بكود</span>
                </button>
              )}
            </div>
          ) : (
            /* Staff Stations Indicator */
            <div className="hidden md:flex items-center gap-2">
              {currentRole === 'kitchen' && activeOrdersCount > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl animate-pulse">
                  <span>طلبات تحت التجهيز:</span>
                  <span className="font-mono text-sm">{activeOrdersCount}</span>
                </span>
              )}
            </div>
          )}

          {/* ========================================================
              ZONE 3: Actions, Theme & Logout
             ======================================================== */}
          <div className="flex items-center gap-2">
            
            {/* Super Admin Code Studio Trigger */}
            {isSuperAdmin && (
              <button
                onClick={onOpenExplorer}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
                title="استعراض كود PHP MVC والـ 28 جدول في MySQL"
              >
                <Code2 className="w-4 h-4" />
                <span>كود PHP MVC & SQL</span>
              </button>
            )}

            {/* User Profile & Password Change Button */}
            {currentUser && (
              <button
                onClick={handleOpenProfile}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 hover:text-amber-400 font-semibold text-xs rounded-lg border border-slate-700 hover:border-amber-500/40 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                title="تعديل اسم المستخدم وكلمة المرور والملف الشخصي"
              >
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name ? currentUser.name.slice(0, 1) : 'U'}
                </div>
                <span className="hidden sm:inline font-mono text-[11px] text-amber-300">
                  {currentUser.username}
                </span>
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer shadow-sm ${
                theme === 'dark'
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}
              title={theme === 'dark' ? 'تحويل إلى الثيم النهاري' : 'تحويل إلى الثيم الليلي'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">نهاري</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">ليلي</span>
                </>
              )}
            </button>

            {/* Logout / Exit to Welcome Portal */}
            {onOpenPortal && (
              <button
                onClick={onOpenPortal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 font-semibold text-xs rounded-lg border border-slate-700 hover:border-rose-500/40 transition-all cursor-pointer whitespace-nowrap"
                title="تسجيل الخروج والعودة لشاشة الدخول الرئيسية"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isSuperAdmin ? 'بوابة الدخول' : 'تسجيل الخروج'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Profile & Password Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-cairo" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">تغيير اسم المستخدم والباسوورد</h3>
                  <p className="text-[11px] text-slate-400">تحديث بيانات حسابك لتسجيل الدخول</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(false);
                  setProfileMsg(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {profileMsg && (
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                profileMsg.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}>
                <span>{profileMsg.success ? '✅' : '⚠️'}</span>
                <span>{profileMsg.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم المستخدم (Username) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileUsername}
                  onChange={e => setProfileUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-amber-300 font-mono outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  كلمة المرور الجديدة (Password) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profilePassword}
                  onChange={e => setProfilePassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white font-mono outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    رمز الـ PIN السريع
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={profilePin}
                    onChange={e => setProfilePin(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-amber-400 font-mono text-center tracking-widest outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    placeholder="07XXXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white font-mono outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    setProfileMsg(null);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Upgrade Modal for Restaurant Owner */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in font-cairo" dir="rtl">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#9a3412]" />
                <span>ترقية باقة {activeRestaurant?.name_ar}</span>
              </h3>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  setUpgradeMsg(null);
                }}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpgradeSubmit} className="space-y-3.5">
              <p className="text-xs text-stone-600 leading-relaxed">
                أدخل كود الاشتراك لتفعيل الباقة الاحترافية (Pro) أو المؤسسية فوراً لهذا المطعم:
              </p>

              <div>
                <input
                  type="text"
                  required
                  placeholder="SUFRA-PRO-2026"
                  value={upgradeCode}
                  onChange={e => setUpgradeCode(e.target.value.toUpperCase())}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-center font-mono font-bold text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9a3412] uppercase"
                />
                <p className="text-[10px] text-stone-500 mt-1 text-center font-mono">
                  أكواد جاهزة: SUFRA-PRO-2026 أو VIP-2026
                </p>
              </div>

              {upgradeMsg && (
                <div className={`p-2.5 rounded-xl text-xs ${
                  upgradeMsg.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {upgradeMsg.message}
                </div>
              )}

              <button
                type="submit"
                style={{ color: '#ffffff' }}
                className="w-full py-3.5 rounded-xl bg-[#9a3412] hover:bg-[#852d0f] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                تفعيل الترقية الآن
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
