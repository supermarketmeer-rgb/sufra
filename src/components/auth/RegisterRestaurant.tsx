import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import {
  Store,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Phone,
  MapPin,
  Utensils,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

interface RegisterRestaurantProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export const RegisterRestaurant: React.FC<RegisterRestaurantProps> = ({ onClose, onSuccess }) => {
  const { createRestaurant, setCurrentRole } = useApp();

  const [restaurantNameAr, setRestaurantNameAr] = useState('');
  const [restaurantNameEn, setRestaurantNameEn] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('بغداد');
  const [restaurantType, setRestaurantType] = useState('مطعم شرقي وغربي');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  // Auto-generate slug when Arabic name changes if slug is empty or matches previous auto-slug
  const handleNameArChange = (val: string) => {
    setRestaurantNameAr(val);
    if (!slug || slug.startsWith('rest-')) {
      const generated = val
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-zA-Z0-9\u0621-\u064A-]/g, '')
        .slice(0, 20);
      // Fallback to random if non-latin
      setSlug(generated || `restaurant-${Math.floor(100 + Math.random() * 900)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantNameAr.trim()) {
      alert('يرجى كتابة اسم المطعم أو المقهى');
      return;
    }
    if (!phone.trim()) {
      alert('يرجى إدخال رقم الهاتف للتواصل');
      return;
    }

    setIsSubmitting(true);

    const cleanSlug = (slug || restaurantNameEn || `rest-${Date.now().toString().slice(-4)}`)
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const newRest = createRestaurant({
      name_ar: restaurantNameAr.trim(),
      name_en: restaurantNameEn.trim() || restaurantNameAr.trim(),
      slug: cleanSlug,
      phone: phone.trim(),
      whatsapp_number: phone.trim(),
      address: `${city}، العراق`,
      plan_name: 'الباقة المجانية (Starter)',
      description_ar: `${restaurantType} - أشهى المأكولات والمشروبات`,
      theme_primary_color: '#f59e0b',
      delivery_fee_base: 3000,
      tax_percentage: 0
    });

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    setIsSubmitting(false);
    setIsCreated(true);

    setTimeout(() => {
      setCurrentRole('restaurant_owner');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
      // Remove query param from URL if present
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }, 1200);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 left-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6 relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20 mb-1">
            س
          </div>
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            ✨ الباقة المجانية للأبد (0 د.ع بدون بطاقة بنكية)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            أنشئ مطعمك وابدأ مجاناً
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            منيو إلكتروني QR تفاعلي جاهز خلال ثوانٍ لطاولاتك وتلقي الطلبات مباشرة.
          </p>
        </div>

        {/* Free Plan Feature Highlights */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 mb-6 grid grid-cols-2 gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>منيو QR إلكتروني فوري</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>إضافة وتعديل الأصناف والصور</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>توليد باركود للطاولات والصالة</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>استقبال الطلبات عبر واتساب</span>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          {/* Restaurant Name (Arabic) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              اسم المطعم أو الكافيه <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="مثال: مطعم ليالي بغداد، كافيه السعادة..."
                value={restaurantNameAr}
                onChange={e => handleNameArChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
              <Store className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Restaurant Name (English) & Subdomain */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                الاسم بالإنجليزية (اختياري)
              </label>
              <input
                type="text"
                placeholder="e.g. Baghdad Nights"
                value={restaurantNameEn}
                onChange={e => setRestaurantNameEn(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                رابط المنيو الفرعي (Slug)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="baghdad-nights"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-amber-400 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">
                  .sufrah.menu
                </span>
              </div>
            </div>
          </div>

          {/* Phone / WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              رقم هاتف المالك / الواتساب <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                dir="ltr"
                placeholder="+964 770 123 4567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-left font-mono"
              />
              <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              يُستخدم لاستقبال طلبات الزبائن وتأكيد الحساب.
            </p>
          </div>

          {/* City & Cuisine Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">المدينة</label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="بغداد">بغداد</option>
                <option value="أربيل">أربيل</option>
                <option value="البصرة">البصرة</option>
                <option value="النجف">النجف</option>
                <option value="كربلاء">كربلاء</option>
                <option value="السليمانية">السليمانية</option>
                <option value="الموصل">الموصل</option>
                <option value="بابل">بابل</option>
                <option value="كركوك">كركوك</option>
                <option value="مدينة أخرى">مدينة أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">نوع النشاط</label>
              <select
                value={restaurantType}
                onChange={e => setRestaurantType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="مطعم ومأكولات شرقية">مطعم شرقي / مشاوي</option>
                <option value="برغر ووجبات سريعة">برغر ووجبات سريعة</option>
                <option value="بيتزا وباستا إيطالية">بيتزا ومأكولات غربية</option>
                <option value="مقهى وكوفي شوب">مقهى وكوفي شوب</option>
                <option value="حلويات ومخبوزات">حلويات ومخبوزات</option>
                <option value="مأكولات بحرية">مأكولات بحرية</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isCreated}
            className={`w-full mt-4 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
              isCreated
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/20 active:scale-[0.98]'
            }`}
          >
            {isCreated ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>تم إنشاء مطعمك بنجاح! جارٍ التحويل للوحة التحكم...</span>
              </>
            ) : isSubmitting ? (
              <span>جارٍ إنشاء المطعم والمنيو...</span>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>إنشاء مطعمي مجاناً والدخول للوحة التحكم</span>
              </>
            )}
          </button>

          <p className="text-center text-[11px] text-slate-500 pt-2">
            بالتسجيل، ستحصل فوراً على حساب في الباقة المجانية مع إمكانية الترقية للكاشير والمطبخ لاحقاً.
          </p>
        </form>
      </div>
    </div>
  );
};
