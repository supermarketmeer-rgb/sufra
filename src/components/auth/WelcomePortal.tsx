import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import {
  Globe,
  Store,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Receipt,
  UtensilsCrossed,
  Bike,
  Building2,
  ArrowLeft,
  Sparkles,
  Phone,
  Lock,
  User,
  Mail,
  LogIn,
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface WelcomePortalProps {
  onClose?: () => void;
}

export const WelcomePortal: React.FC<WelcomePortalProps> = ({ onClose }) => {
  const {
    setCurrentRole,
    restaurants,
    activeRestaurant,
    setActiveRestaurant,
    activateRestaurantPlan,
    createRestaurant,
    loginUser,
    users,
    branches
  } = useApp();

  const [viewMode, setViewMode] = useState<'main' | 'manager_login' | 'staff' | 'choose_signup' | 'signup_form' | 'activate' | 'registered_pending'>('main');

  // Registered pending activation state
  const [registeredPendingInfo, setRegisteredPendingInfo] = useState<{
    name: string;
    identifier: string;
    phone: string;
    pass: string;
  } | null>(null);

  // Manager login form state
  const [managerUsername, setManagerUsername] = useState('');
  const [managerPassword, setManagerPassword] = useState('');
  const [managerLoginError, setManagerLoginError] = useState<string | null>(null);

  // Direct Unified Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMsg, setLoginMsg] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Staff login state
  const [staffUsernameInput, setStaffUsernameInput] = useState('');
  const [staffPasswordInput, setStaffPasswordInput] = useState('');
  const [staffLoginError, setStaffLoginError] = useState<string | null>(null);
  const [selectedStaffRestId, setSelectedStaffRestId] = useState<number>(restaurants[0]?.id || 1);

  // Signup method state
  const [signupMethod, setSignupMethod] = useState<'email' | 'username'>('email');

  // New restaurant registration state
  const [restNameAr, setRestNameAr] = useState('');
  const [userIdentifier, setUserIdentifier] = useState(''); // email or username
  const [userPassword, setUserPassword] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [city, setCity] = useState('بغداد');
  const [isRegistering, setIsRegistering] = useState(false);

  // Activation modal state
  const [activationCode, setActivationCode] = useState('');
  const [selectedRestId, setSelectedRestId] = useState<number>(
    activeRestaurant ? activeRestaurant.id : (restaurants[0]?.id || 0)
  );
  const [activationResult, setActivationResult] = useState<{ success: boolean; message: string } | null>(null);

  // Handle Direct Unified Login
  const handleDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMsg(null);

    const u = loginUsername.trim();
    const p = loginPassword.trim();

    if (!u) {
      setLoginMsg({ success: false, message: 'يرجى إدخال اسم المستخدم، رقم الهاتف أو اسم المطعم' });
      return;
    }

    setIsSubmitting(true);
    const res = loginUser(u, p || '123456');
    setLoginMsg(res);
    setIsSubmitting(false);

    if (res.success) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      setTimeout(() => {
        if (onClose) onClose();
      }, 800);
    }
  };

  // Handle Manager Login
  const handleManagerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManagerLoginError(null);
    const u = managerUsername.trim().toLowerCase();
    const p = managerPassword.trim();

    if (!u) {
      setManagerLoginError('يرجى إدخال اسم المستخدم أو البريد');
      return;
    }

    const res = loginUser(u, p);
    if (res.success) {
      if (onClose) onClose();
      return;
    }

    // Direct super admin access if credentials indicate admin
    if (u === 'superadmin' || u === 'admin' || u.includes('super')) {
      setCurrentRole('super_admin');
      if (onClose) onClose();
      return;
    }

    setManagerLoginError(res.message);
  };

  const handleStaffLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStaffLoginError(null);
    if (!staffUsernameInput.trim() || !staffPasswordInput.trim()) {
      setStaffLoginError('يرجى إدخال اسم المستخدم وكلمة المرور أو رمز الـ PIN');
      return;
    }

    const res = loginUser(staffUsernameInput.trim(), staffPasswordInput.trim());
    if (res.success) {
      if (onClose) onClose();
    } else {
      setStaffLoginError(res.message);
    }
  };

  const handleQuickStaffLogin = (user: any) => {
    setStaffLoginError(null);
    const res = loginUser(user.username, user.password || user.pin_code || '1234');
    if (res.success) {
      if (onClose) onClose();
    } else {
      setStaffLoginError(res.message);
    }
  };

  const handleGoogleLogin = () => {
    if (restaurants.length > 0) {
      if (!activeRestaurant) {
        setActiveRestaurant(restaurants[0]);
      }
      setCurrentRole('restaurant_owner');
      if (onClose) onClose();
    } else {
      setViewMode('choose_signup');
    }
  };

  // Handle Activation Code Submit
  const handleActivateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCode.trim()) return;

    const res = activateRestaurantPlan(activationCode, selectedRestId || undefined);
    setActivationResult({
      success: res.success,
      message: res.message
    });

    if (res.success) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}

      setTimeout(() => {
        setCurrentRole('restaurant_owner');
        if (onClose) onClose();
      }, 1500);
    }
  };

  // Handle Restaurant Registration Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restNameAr.trim()) {
      alert('يرجى كتابة اسم المطعم أو المقهى');
      return;
    }
    if (!userPhone.trim()) {
      alert('يرجى إدخال رقم الهاتف أو الواتساب');
      return;
    }

    setIsRegistering(true);

    const cleanSlug = restNameAr
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-zA-Z0-9\u0621-\u064A-]/g, '')
      .slice(0, 20) || `rest-${Date.now().toString().slice(-4)}`;

    const finalPass = userPassword.trim() || '123456';
    const finalIdentifier = userIdentifier.trim() || userPhone.trim();

    createRestaurant({
      name_ar: restNameAr.trim(),
      name_en: restNameAr.trim(),
      slug: cleanSlug,
      phone: userPhone.trim(),
      whatsapp_number: userPhone.trim(),
      address: `${city}، العراق`,
      plan_name: 'الباقة المجانية (Starter)',
      description_ar: 'أشهى المأكولات والمشروبات بنظام سفرة الذكي',
      theme_primary_color: '#9a3412',
      delivery_fee_base: 3000,
      tax_percentage: 0,
      status: 'inactive', // غير مفعل حتى يتم التفعيل من قبل السوبر آدمن
      owner_name: `مالك ${restNameAr.trim()}`,
      owner_username: finalIdentifier,
      owner_phone: userPhone.trim(),
      owner_email: finalIdentifier.includes('@') ? finalIdentifier : `info@${cleanSlug}.com`,
      owner_password: finalPass
    });

    try {
      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch {}

    setIsRegistering(false);
    setRegisteredPendingInfo({
      name: restNameAr.trim(),
      identifier: finalIdentifier,
      phone: userPhone.trim(),
      pass: finalPass
    });
    setManagerUsername(finalIdentifier);
    setManagerPassword(finalPass);
    setViewMode('registered_pending');
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-[#fbf9f4] text-stone-800 font-cairo select-none" dir="rtl">

      {/* SCREEN 1: Manager Login (لوحة المدير) - Matches Attachment 1 */}
      {viewMode === 'manager_login' && (
        <div className="w-full max-w-sm sm:max-w-md text-center animate-fade-in space-y-4">
          <div className="space-y-1 mb-2">
            <div className="text-3xl font-black text-stone-900 leading-none">
              <span>سُفرة</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900 pt-1">
              لوحة المدير
            </h1>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#e8e2d5] text-right">
            <form onSubmit={handleManagerLoginSubmit} className="space-y-4">
              {managerLoginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{managerLoginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  اسم المستخدم أو البريد الإلكترونيّ
                </label>
                <input
                  type="text"
                  required
                  value={managerUsername}
                  onChange={e => {
                    setManagerUsername(e.target.value);
                    setManagerLoginError(null);
                  }}
                  placeholder="admin أو owner_sufrah"
                  className="w-full bg-white border border-[#c8c1b4] rounded-2xl px-4 py-3.5 text-sm text-stone-900 focus:outline-none focus:border-[#9a3412] transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  كلمة السر
                </label>
                <input
                  type="password"
                  required
                  value={managerPassword}
                  onChange={e => {
                    setManagerPassword(e.target.value);
                    setManagerLoginError(null);
                  }}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#c8c1b4] rounded-2xl px-4 py-3.5 text-sm text-stone-900 focus:outline-none focus:border-[#9a3412] transition-colors font-mono"
                />
              </div>

              <button
                type="submit"
                style={{ color: '#ffffff' }}
                className="w-full py-4 px-6 rounded-2xl bg-[#9a3412] hover:bg-[#852d0f] text-white font-bold text-lg shadow-sm transition-all active:scale-[0.98] cursor-pointer mt-2"
              >
                دخول
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => alert('لإعادة تعيين كلمة السر، يرجى التواصل مع إدارة المنصة.')}
                  className="text-stone-500 hover:text-stone-800 text-xs underline cursor-pointer"
                >
                  نسيت كلمة السر؟
                </button>
              </div>

              {/* Or Divider */}
              <div className="relative flex items-center justify-center my-2">
                <hr className="w-full border-stone-200" />
                <span className="absolute bg-white px-3 text-xs text-stone-400">أو</span>
              </div>

              {/* Google Login Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                style={{ color: '#2c241e' }}
                className="w-full py-3.5 px-6 rounded-2xl bg-white border border-[#c8c1b4] hover:border-stone-800 text-[#2c241e] font-bold text-sm sm:text-base transition-all shadow-sm active:scale-[0.99] cursor-pointer"
              >
                الدخول بحساب Google
              </button>
            </form>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setViewMode('main')}
              className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 text-sm font-semibold cursor-pointer"
            >
              <span>العودة إلى بوابة سُفرة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 2: Staff Login (دخول الطاقم مع عزل المطاعم والفروع) */}
      {viewMode === 'staff' && (
        <div className="w-full max-w-md sm:max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#e8e2d5] text-center animate-fade-in relative max-h-[92vh] overflow-y-auto">
          {/* Logo */}
          <div className="space-y-1 mb-4">
            <div className="text-3xl sm:text-4xl font-black text-stone-950 leading-none">
              <span>سُفرة</span>
            </div>
            <p className="text-stone-500 text-xs sm:text-sm font-medium">تسجيل دخول طاقم العمل والمحطات</p>
          </div>

          {/* Role Selection Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-4 text-right">
            <h3 className="font-bold text-stone-900 text-sm">تسجيل الدخول باسم المستخدم أو الـ PIN:</h3>
            <button
              onClick={() => setViewMode('main')}
              className="text-stone-400 hover:text-stone-600 text-xs font-semibold cursor-pointer"
            >
              رجوع
            </button>
          </div>

          {staffLoginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-right">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{staffLoginError}</span>
            </div>
          )}

          {/* Secure Login Form */}
          <form onSubmit={handleStaffLoginSubmit} className="space-y-3 text-right bg-stone-50 p-4 rounded-2xl border border-stone-200 mb-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                اسم المستخدم للموظف (Username)
              </label>
              <input
                type="text"
                required
                value={staffUsernameInput}
                onChange={e => {
                  setStaffUsernameInput(e.target.value);
                  setStaffLoginError(null);
                }}
                placeholder="مثال: cashier_sufrah أو chef_jwan"
                className="w-full bg-white border border-[#c8c1b4] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9a3412] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                كلمة المرور أو رمز الـ PIN السريع
              </label>
              <input
                type="password"
                required
                value={staffPasswordInput}
                onChange={e => {
                  setStaffPasswordInput(e.target.value);
                  setStaffLoginError(null);
                }}
                placeholder="رمز PIN من 4 أرقام أو كلمة المرور"
                className="w-full bg-white border border-[#c8c1b4] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-[#9a3412] font-mono"
              />
            </div>

            <button
              type="submit"
              style={{ color: '#ffffff' }}
              className="w-full py-3 rounded-xl bg-[#9a3412] hover:bg-[#852d0f] text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Lock className="w-4 h-4" />
              <span>دخول إلى محطة العمل المخصصة</span>
            </button>
          </form>

          {/* Restaurant Quick Account Switcher (للتجربة السريعة والتمييز بين المطاعم) */}
          <div className="space-y-3 text-right">
            <div className="flex items-center justify-between border-t border-stone-200 pt-3">
              <span className="text-xs font-bold text-stone-700">حسابات الطاقم المتاحة حسب المطعم:</span>
              <span className="text-[10px] text-stone-500">اختر للتسجيل الفوري</span>
            </div>

            {/* Restaurant Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl">
              {restaurants.map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedStaffRestId(r.id)}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all truncate cursor-pointer ${
                    selectedStaffRestId === r.id
                      ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {r.name_ar}
                </button>
              ))}
            </div>

            {/* Staff Cards of Selected Restaurant */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
              {users
                .filter(u => u.restaurant_id === selectedStaffRestId && u.role !== 'super_admin')
                .map(u => {
                  const roleConfig = (() => {
                    switch (u.role) {
                      case 'restaurant_owner':
                        return { icon: <Store className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', title: '👑 مالك / مدير المطعم' };
                      case 'branch_manager':
                        return { icon: <Building2 className="w-4 h-4" />, color: 'bg-indigo-50 text-indigo-700 border-indigo-200', title: 'مدير الفرع والصالة' };
                      case 'cashier':
                        return { icon: <Receipt className="w-4 h-4" />, color: 'bg-blue-50 text-blue-700 border-blue-200', title: 'كاشير POS' };
                      case 'kitchen':
                        return { icon: <UtensilsCrossed className="w-4 h-4" />, color: 'bg-rose-50 text-rose-700 border-rose-200', title: 'شاشة المطبخ KDS' };
                      case 'driver':
                        return { icon: <Bike className="w-4 h-4" />, color: 'bg-cyan-50 text-cyan-700 border-cyan-200', title: 'دليفري GPS' };
                      default:
                        return { icon: <User className="w-4 h-4" />, color: 'bg-stone-50 text-stone-700 border-stone-200', title: 'موظف' };
                    }
                  })();

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickStaffLogin(u)}
                      className="p-2.5 rounded-xl border border-stone-200 hover:border-[#9a3412] hover:bg-stone-50/50 bg-white transition-all text-right shadow-xs cursor-pointer flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${roleConfig.color}`}>
                          {roleConfig.icon}
                          <span>{roleConfig.title}</span>
                        </span>
                        <span className="text-[10px] font-mono text-stone-400 font-bold">
                          PIN: {u.pin_code}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-stone-900 truncate">{u.name}</div>
                      <div className="text-[11px] font-mono text-stone-500 mt-0.5">{u.username}</div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 3: Choose Signup Method (أنشئ مطعمك مجّاناً) - Matches Attachment 3 */}
      {viewMode === 'choose_signup' && (
        <div className="w-full max-w-sm sm:max-w-md text-center animate-fade-in space-y-5">
          <div className="space-y-1 mb-2">
            <h1 className="text-3xl sm:text-4xl font-black text-stone-900">
              أنشئ مطعمك مجّاناً
            </h1>
            <p className="text-stone-500 text-sm font-medium mt-1">اختر طريقة إنشاء الحساب</p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#e8e2d5] space-y-4">
            {/* Option 1: Email (Selected / Recommended) */}
            <div
              onClick={() => {
                setSignupMethod('email');
                setViewMode('signup_form');
              }}
              className="p-5 rounded-2xl border-2 border-[#9a3412] bg-[#fdf7f3] text-right cursor-pointer transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  style={{ color: '#ffffff' }}
                  className="bg-stone-800 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                >
                  مُوصى به
                </span>
                <span className="font-bold text-base text-stone-900">بالبريد الإلكترونيّ</span>
              </div>
              <p className="text-stone-600 text-xs leading-relaxed pt-1">
                بالبريد أو بحساب Google — يولّد اسم مستخدم ويسرّع الاشتراك.
              </p>
            </div>

            {/* Option 2: Username only */}
            <div
              onClick={() => {
                setSignupMethod('username');
                setViewMode('signup_form');
              }}
              className="p-5 rounded-2xl border border-stone-300 hover:border-stone-500 bg-white text-right cursor-pointer transition-all hover:shadow-sm"
            >
              <div className="flex items-center justify-end mb-1">
                <span className="font-bold text-base text-stone-900">باسم مستخدم فقط</span>
              </div>
              <p className="text-stone-500 text-xs leading-relaxed pt-1">
                بلا بريد — تربطه عند الحاجة للاشتراك.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setViewMode('main')}
              className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 text-sm font-semibold cursor-pointer"
            >
              <span>العودة إلى بوابة سُفرة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3-B: Actual Registration Form based on selected method */}
      {viewMode === 'signup_form' && (
        <div className="w-full max-w-sm sm:max-w-md text-center animate-fade-in space-y-4">
          <div className="space-y-1 mb-2">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">
              {signupMethod === 'email' ? 'إنشاء الحساب بالبريد الإلكتروني' : 'إنشاء الحساب باسم مستخدم'}
            </h1>
            <p className="text-stone-500 text-xs">
              {signupMethod === 'email' ? 'سجل عبر بريدك وابدأ فوراً بالباقة المجانية' : 'ابدأ فوراً باسم مستخدم دون الحاجة لبريد'}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#e8e2d5] text-right">
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  اسم المطعم أو المقهى <span className="text-[#9a3412]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={restNameAr}
                    onChange={e => setRestNameAr(e.target.value)}
                    placeholder="مثال: شاورما السلطان"
                    className="w-full bg-white border border-[#c8c1b4] rounded-2xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-[#9a3412]"
                  />
                  <Store className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {signupMethod === 'email' ? 'البريد الإلكتروني' : 'اسم المستخدم'} <span className="text-[#9a3412]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={signupMethod === 'email' ? 'email' : 'text'}
                    required
                    value={userIdentifier}
                    onChange={e => setUserIdentifier(e.target.value)}
                    placeholder={signupMethod === 'email' ? 'owner@restaurant.com' : 'chef_ali'}
                    className="w-full bg-white border border-[#c8c1b4] rounded-2xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-[#9a3412]"
                  />
                  {signupMethod === 'email' ? (
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                  ) : (
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  كلمة المرور <span className="text-[#9a3412]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={userPassword}
                    onChange={e => setUserPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-[#c8c1b4] rounded-2xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-[#9a3412] font-mono"
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  رقم الواتساب / الهاتف <span className="text-[#9a3412]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={userPhone}
                    onChange={e => setUserPhone(e.target.value)}
                    placeholder="07700000000"
                    dir="ltr"
                    className="w-full bg-white border border-[#c8c1b4] rounded-2xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-[#9a3412] text-right"
                  />
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">المدينة</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-white border border-[#c8c1b4] rounded-2xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-[#9a3412]"
                >
                  <option value="بغداد">بغداد</option>
                  <option value="أربيل">أربيل</option>
                  <option value="البصرة">البصرة</option>
                  <option value="النجف">النجف</option>
                  <option value="كربلاء">كربلاء</option>
                  <option value="السليمانية">السليمانية</option>
                  <option value="الموصل">الموصل</option>
                  <option value="الحلة">الحلة</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                style={{ color: '#ffffff' }}
                className="w-full py-4 px-6 rounded-2xl bg-[#9a3412] hover:bg-[#852d0f] text-white font-bold text-base shadow-sm transition-all active:scale-[0.98] cursor-pointer mt-3 disabled:opacity-50"
              >
                {isRegistering ? 'جاري إنشاء مطعمك...' : 'إنشاء المطعم وتفعيل الخطة المجانية فوراً'}
              </button>
            </form>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setViewMode('choose_signup')}
              className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 text-sm font-semibold cursor-pointer"
            >
              <span>العودة لاختيار طريقة التسجيل</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN: Registered Pending Activation */}
      {viewMode === 'registered_pending' && registeredPendingInfo && (
        <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#e8e2d5] text-center animate-fade-in space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center text-3xl shadow-sm">
            ⏳
          </div>

          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold">
              • الحالة: غير مفعل (بانتظار موافقة السوبر آدمن)
            </span>
            <h2 className="text-2xl font-black text-stone-900 pt-1">
              تم استلام طلب التسجيل بنجاح!
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
              تم إنشاء حساب مطعم <strong className="text-stone-800">({registeredPendingInfo.name})</strong>، وهو الآن قيد المراجعة وبانتظار اعتماد التفعيل من قِبل إدارة المنصة.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-right space-y-2 text-xs">
            <div className="font-bold text-stone-700 border-b border-stone-200 pb-1.5 flex justify-between">
              <span>بيانات الدخول المسجلة:</span>
              <span className="text-[10px] text-amber-700 font-mono">احفظ هذه البيانات</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500">اسم المستخدم / الهاتف:</span>
              <span className="font-mono font-bold text-stone-800" dir="ltr">{registeredPendingInfo.identifier}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-200/60">
              <span className="text-stone-500">كلمة المرور:</span>
              <span className="font-mono font-bold text-stone-800" dir="ltr">{registeredPendingInfo.pass}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-stone-500">رابط منيو المطعم:</span>
              <span className="font-mono font-bold text-[#9a3412] text-[11px]" dir="ltr">
                {window.location.origin}/?restaurant={encodeURIComponent(registeredPendingInfo.name)}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-amber-800 bg-amber-50 rounded-xl p-3 border border-amber-200 text-right leading-relaxed">
            🛡️ <span className="font-semibold">ملاحظة:</span> لا يمكنك تسجيل الدخول كمالك مطعم إلا بعد أن يقوم السوبر آدمن بتفعيل المطعم من لوحة الإدارة.
          </p>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => setViewMode('manager_login')}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#9a3412] hover:bg-[#852d0f] text-white font-bold text-sm transition-all shadow-sm cursor-pointer"
            >
              الانتقال لشاشة تسجيل الدخول
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentRole('super_admin');
                if (onClose) onClose();
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition-all cursor-pointer"
            >
              دخول كمدير عام (Super Admin) لتفعيل المطعم الآن ➔
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 4: Activate Code (تفعيل كود الاشتراك) - Matches Attachment 4 */}
      {viewMode === 'activate' && (
        <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#e8e2d5] text-center animate-fade-in relative">
          {/* Top Globe Button */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              className="w-10 h-10 rounded-full border border-stone-300 text-stone-600 flex items-center justify-center hover:bg-stone-50 transition-colors shadow-sm cursor-pointer"
            >
              <Globe className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Logo */}
          <div className="space-y-1 mb-6">
            <div className="text-4xl sm:text-5xl font-black text-stone-950 leading-none">
              <span>سُفرة</span>
            </div>
            <p className="text-stone-500 text-sm font-medium mt-1">نظام الطلب من الطاولة</p>
          </div>

          <form onSubmit={handleActivateSubmit} className="space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-1">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#9a3412]" />
                <span>تفعيل كود الاشتراك والترقية:</span>
              </h3>
              <button
                type="button"
                onClick={() => setViewMode('main')}
                className="text-stone-400 hover:text-stone-600 text-xs font-semibold cursor-pointer"
              >
                رجوع
              </button>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed text-center">
              أدخل رمز التفعيل الذي استلمته من إدارة المنصة لترقية حساب مطعمك فوراً للباقة الاحترافية (Pro).
            </p>

            {/* Restaurant Selector if multiple exist */}
            {restaurants.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">المطعم المراد ترقيته:</label>
                <select
                  value={selectedRestId}
                  onChange={e => setSelectedRestId(Number(e.target.value))}
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#9a3412]"
                >
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name_ar} (الحالية: {r.plan_name})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">رمز التفعيل أو كود الاشتراك:</label>
              <input
                type="text"
                required
                placeholder="مثال: SUFRA-PRO-2026 أو VIP-2026"
                value={activationCode}
                onChange={e => setActivationCode(e.target.value.toUpperCase())}
                className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-3.5 text-sm font-mono tracking-wider text-center text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9a3412] uppercase shadow-sm"
              />
              <p className="text-[10px] text-stone-500 mt-1.5 text-center">
                أكواد تجريبية جاهزة: <span className="font-mono font-bold text-stone-700">SUFRA-PRO-2026</span> أو <span className="font-mono font-bold text-stone-700">VIP-2026</span>
              </p>
            </div>

            {activationResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  activationResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {activationResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{activationResult.message}</span>
              </div>
            )}

            <button
              type="submit"
              style={{ color: '#ffffff' }}
              className="w-full py-4 px-6 rounded-2xl bg-[#9a3412] hover:bg-[#852d0f] text-white font-bold text-base shadow-sm transition-all active:scale-[0.98] cursor-pointer mt-1"
            >
              تفعيل الترقية الآن
            </button>
          </form>
        </div>
      )}

      {/* ROOT MAIN SCREEN: Direct Unified Login with Username, Password, and Restaurant Selection */}
      {viewMode === 'main' && (
        <div className="w-full max-w-md sm:max-w-lg animate-fade-in relative flex flex-col items-center">
          
          {/* Header & Logo */}
          <div className="text-center space-y-2 mb-6">
            <div className="hidden items-center justify-center gap-2 px-3 py-1 rounded-full bg-[#9a3412]/10 border border-[#9a3412]/20 text-[#9a3412] text-xs font-bold mb-1">
              <Store className="w-3.5 h-3.5" />
              <span>بوابة الدخول الموحدة للمطاعم</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-stone-950 tracking-tight">
              سُفرة
            </h1>
            <p className="text-stone-500 text-xs sm:text-sm font-medium">
              نظام إدارة المطاعم والطلبات وقوائم الطعام الذكية
            </p>
          </div>

          {/* Login Card */}
          <div className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#e8e2d5] text-right space-y-5">
            <div className="hidden border-b border-stone-100 pb-3">
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <LogIn className="w-5 h-5 text-[#9a3412]" />
                <span>تسجيل الدخول إلى حسابك</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                أدخل اسم المستخدم وكلمة المرور للوصول إلى لوحة التحكم بصلاحيتك المعتمدة
              </p>
            </div>

            {loginMsg && (
              <div
                className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 transition-all ${
                  loginMsg.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {loginMsg.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-semibold">{loginMsg.message}</span>
              </div>
            )}

            <form onSubmit={handleDirectLogin} className="space-y-4">
              
              {/* 1. Username / Phone / Email Input */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#9a3412]" />
                  <span>اسم المستخدم، رقم الهاتف أو البريد <span className="text-[#9a3412]">*</span></span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete="username"
                    value={loginUsername}
                    onChange={e => {
                      setLoginUsername(e.target.value);
                      setLoginMsg(null);
                    }}
                    placeholder="مثال: owner_jwan أو 07810909577 أو admin"
                    className="w-full bg-white border border-[#c8c1b4] rounded-2xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-[#9a3412] transition-colors font-mono"
                  />
                </div>
              </div>

              {/* 2. Password / PIN Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#9a3412]" />
                    <span>كلمة المرور أو رمز الـ PIN <span className="text-[#9a3412]">*</span></span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={e => {
                      setLoginPassword(e.target.value);
                      setLoginMsg(null);
                    }}
                    placeholder="•••••••• أو PIN من 4 أرقام"
                    className="w-full bg-white border border-[#c8c1b4] rounded-2xl pr-4 pl-11 py-3 text-sm text-stone-900 focus:outline-none focus:border-[#9a3412] transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3 text-stone-400 hover:text-stone-700 p-1 cursor-pointer transition-colors"
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ color: '#ffffff' }}
                className="w-full py-4 px-6 rounded-2xl bg-[#9a3412] hover:bg-[#852d0f] text-white font-bold text-base shadow-lg shadow-[#9a3412]/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                <LogIn className="w-5 h-5" />
                <span>{isSubmitting ? 'جاري التحقق والدخول...' : 'تسجيل الدخول'}</span>
              </button>
            </form>

            {/* Quick direct access buttons for restaurants (hidden, not removed) */}
            {false && restaurants.length > 0 && (
              <div className="pt-2 border-t border-stone-100">
                <span className="text-[11px] font-bold text-stone-600 block mb-2">⚡ أو دخول مباشر سريع إلى أحد المطاعم:</span>
                <div className="grid grid-cols-2 gap-2">
                  {restaurants.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        const owner = users.find(u => u.restaurant_id === r.id && u.role === 'restaurant_owner');
                        if (owner) {
                          loginUser(owner.username, owner.password || '123456');
                        } else {
                          setActiveRestaurant(r);
                          setCurrentRole('restaurant_owner');
                        }
                        if (onClose) onClose();
                      }}
                      className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/80 text-right transition-all cursor-pointer flex flex-col justify-center active:scale-[0.98]"
                    >
                      <span className="text-xs font-bold text-stone-900 line-clamp-1">{r.name_ar}</span>
                      <span className="text-[10px] text-[#9a3412] font-semibold mt-0.5">دخول فوري ➔</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions: New Restaurant & Code Activation */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setViewMode('choose_signup')}
                className="text-[#9a3412] hover:text-[#852d0f] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>مطعم جديد؟ سجّل الآن</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('activate')}
                className="text-stone-600 hover:text-stone-900 font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>تفعيل كود ترقية</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
