import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { RegisterRestaurant } from './RegisterRestaurant';
import {
  Globe,
  Store,
  Users,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Receipt,
  UtensilsCrossed,
  Bike,
  Building2,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface WelcomePortalProps {
  onClose?: () => void;
}

export const WelcomePortal: React.FC<WelcomePortalProps> = ({ onClose }) => {
  const {
    currentRole,
    setCurrentRole,
    restaurants,
    activeRestaurant,
    setActiveRestaurant,
    activateRestaurantPlan
  } = useApp();

  const [viewMode, setViewMode] = useState<'main' | 'signup' | 'staff' | 'activate'>('main');

  // Activation modal state
  const [activationCode, setActivationCode] = useState('');
  const [selectedRestId, setSelectedRestId] = useState<number>(
    activeRestaurant ? activeRestaurant.id : (restaurants[0]?.id || 0)
  );
  const [activationResult, setActivationResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleManagerLogin = () => {
    if (restaurants.length > 0) {
      if (!activeRestaurant) {
        setActiveRestaurant(restaurants[0]);
      }
      setCurrentRole('restaurant_owner');
      if (onClose) onClose();
    } else {
      // If no restaurants exist yet, direct to free signup
      setViewMode('signup');
    }
  };

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

  // If in signup mode, render the full free restaurant registration form
  if (viewMode === 'signup') {
    return (
      <RegisterRestaurant
        onClose={() => setViewMode('main')}
        onSuccess={() => {
          if (onClose) onClose();
        }}
      />
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-[#f8f6f0] text-slate-800 font-cairo">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#ece7df] text-center relative animate-fade-in">
        
        {/* Top Globe Button (as in screenshot) */}
        <div className="flex justify-start mb-6">
          <button
            type="button"
            className="w-10 h-10 rounded-full border border-stone-300 text-stone-600 flex items-center justify-center hover:bg-stone-50 transition-colors cursor-pointer shadow-sm"
            title="اللغة / الخيارات"
            onClick={() => {}}
          >
            <Globe className="w-5 h-5" />
          </button>
        </div>

        {/* Brand Logo & Subtitle */}
        <div className="space-y-1 mb-8">
          <div className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight flex items-center justify-center">
            <span>سُفرة</span>
          </div>
          <p className="text-stone-500 text-sm font-medium">نظام الطلب من الطاولة</p>
        </div>

        {/* View Mode: Main Screen (Matching Screenshot) */}
        {viewMode === 'main' && (
          <div className="space-y-4">
            {/* Button 1: Manager Dashboard (لوحة المدير) */}
            <button
              onClick={handleManagerLogin}
              className="w-full py-4 px-6 rounded-2xl bg-white border border-stone-400/80 hover:border-stone-800 text-stone-800 font-bold text-base sm:text-lg transition-all shadow-sm active:scale-[0.99] cursor-pointer"
            >
              لوحة المدير
            </button>

            {/* Button 2: Staff Login (دخول الطاقم) */}
            <button
              onClick={() => setViewMode('staff')}
              className="w-full py-4 px-6 rounded-2xl bg-white border border-stone-400/80 hover:border-stone-800 text-stone-800 font-bold text-base sm:text-lg transition-all shadow-sm active:scale-[0.99] cursor-pointer"
            >
              دخول الطاقم
            </button>

            {/* Divider */}
            <div className="pt-2 pb-1">
              <hr className="border-stone-200" />
            </div>

            {/* Subtext: New Restaurant? */}
            <p className="text-stone-500 text-xs font-semibold">مطعم جديد؟</p>

            {/* Button 3: Create Free Restaurant (أنشئ مطعمك مجّاناً) */}
            <button
              onClick={() => setViewMode('signup')}
              className="w-full py-4 px-6 rounded-2xl bg-[#9a3412] hover:bg-[#831843]/90 text-white font-black text-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              أنشئ مطعمك مجّاناً
            </button>

            {/* Footer Link: Have activation code? Activate restaurant */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setViewMode('activate')}
                className="text-stone-600 hover:text-stone-900 text-xs font-medium cursor-pointer"
              >
                عندك رمز تفعيل؟ <span className="underline font-bold text-[#9a3412]">فعّل مطعمك</span>
              </button>
            </div>
          </div>
        )}

        {/* View Mode: Staff Roles Selection */}
        {viewMode === 'staff' && (
          <div className="space-y-3 text-right">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
              <h3 className="font-bold text-stone-900 text-sm">اختر دورك في طاقم العمل:</h3>
              <button
                onClick={() => setViewMode('main')}
                className="text-stone-400 hover:text-stone-600 text-xs font-semibold"
              >
                رجوع
              </button>
            </div>

            <button
              onClick={() => {
                setCurrentRole('cashier');
                if (onClose) onClose();
              }}
              className="w-full p-3.5 rounded-xl border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-stone-800">الكاشير ونقاط البيع (POS)</div>
                  <div className="text-[10px] text-stone-500">إدخال الطلبات وإصدار الفواتير</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 rotate-180" />
            </button>

            <button
              onClick={() => {
                setCurrentRole('kitchen');
                if (onClose) onClose();
              }}
              className="w-full p-3.5 rounded-xl border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-stone-800">شاشة المطبخ الذكية (KDS)</div>
                  <div className="text-[10px] text-stone-500">متابعة تحضير الوجبات المباشرة</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 rotate-180" />
            </button>

            <button
              onClick={() => {
                setCurrentRole('branch_manager');
                if (onClose) onClose();
              }}
              className="w-full p-3.5 rounded-xl border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-stone-800">مدير الفرع والصالة</div>
                  <div className="text-[10px] text-stone-500">إدارة الطاولات والحجوزات</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 rotate-180" />
            </button>

            <button
              onClick={() => {
                setCurrentRole('driver');
                if (onClose) onClose();
              }}
              className="w-full p-3.5 rounded-xl border border-stone-200 hover:border-stone-400 bg-stone-50 hover:bg-white flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                  <Bike className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-stone-800">مندوب التوصيل الميداني (GPS)</div>
                  <div className="text-[10px] text-stone-500">استلام وتسليم طلبات الدليفري</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 rotate-180" />
            </button>
          </div>
        )}

        {/* View Mode: Activate Subscription Code Modal */}
        {viewMode === 'activate' && (
          <form onSubmit={handleActivateSubmit} className="space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-2">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#9a3412]" />
                <span>تفعيل كود الاشتراك والترقية:</span>
              </h3>
              <button
                type="button"
                onClick={() => setViewMode('main')}
                className="text-stone-400 hover:text-stone-600 text-xs font-semibold"
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
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#9a3412]"
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
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-center text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#9a3412] uppercase"
              />
              <p className="text-[10px] text-stone-400 mt-1 text-center">
                أكواد تجريبية جاهزة: <span className="font-mono font-bold text-stone-600">SUFRA-PRO-2026</span> أو <span className="font-mono font-bold text-stone-600">VIP-2026</span>
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
              className="w-full py-3.5 px-4 rounded-xl bg-[#9a3412] hover:bg-[#831843] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              تفعيل الترقية الآن
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
