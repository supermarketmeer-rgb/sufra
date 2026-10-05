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
  Globe,
  Lock,
  User,
  Clock
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
  const [ownerName, setOwnerName] = useState('');
  const [password, setPassword] = useState('123456');
  const [city, setCity] = useState('بغداد');
  const [restaurantType, setRestaurantType] = useState('مطعم شرقي وغربي');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{ name: string; phone: string; slug: string; pass: string } | null>(null);

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

    const finalPass = password.trim() || '123456';

    createRestaurant({
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
      tax_percentage: 0,
      status: 'inactive', // غير مفعل حتى يتم التفعيل من قبل السوبر آدمن
      owner_name: ownerName.trim() || `مالك ${restaurantNameAr.trim()}`,
      owner_username: cleanSlug || phone.trim(),
      owner_phone: phone.trim(),
      owner_email: `info@${cleanSlug}.com`,
      owner_password: finalPass
    });

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    setIsSubmitting(false);
    setCreatedInfo({
      name: restaurantNameAr.trim(),
      phone: phone.trim(),
      slug: cleanSlug,
      pass: finalPass
    });
    setIsCreated(true);
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

        {isCreated && createdInfo ? (
          <div className="text-center space-y-5 py-4 animate-fade-in text-right" dir="rtl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-amber-500/10">
              <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>

            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                <span>الحالة: غير مفعل (بانتظار موافقة السوبر آدمن)</span>
              </div>
              <h2 className="text-2xl font-black text-white pt-1">
                تم تسجيل طلب المطعم بنجاح!
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                تم إنشاء حساب مطعم <strong className="text-amber-400">({createdInfo.name})</strong> بنجاح، وهو الآن قيد المراجعة وبانتظار التفعيل من قِبل إدارة المنصة (السوبر آدمن).
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-right space-y-2.5 text-xs">
              <div className="text-slate-400 font-bold border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>بيانات تسجيل الدخول الخاصة بك:</span>
                <span className="text-[10px] text-amber-400 font-mono">احفظ هذه البيانات</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">رقم الهاتف / الدخول:</span>
                <span className="text-white font-mono font-bold text-sm" dir="ltr">{createdInfo.phone}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">كلمة المرور:</span>
                <span className="text-amber-400 font-mono font-bold text-sm" dir="ltr">{createdInfo.pass}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">رابط المنيو الفرعي:</span>
                <span className="text-emerald-400 font-mono text-[11px]">{createdInfo.slug}.sufrah.menu</span>
              </div>
            </div>

            <div className="text-[11px] text-amber-300/90 bg-amber-500/10 rounded-xl p-3 border border-amber-500/20 text-right leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-300">ملاحظة أمنية:</strong> لا يمكن تسجيل الدخول أو تشغيل المنيو إلا بعد قيام السوبر آدمن بالضغط على زر "تفعيل المطعم" من لوحة التحكم العامة.
              </span>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onSuccess) onSuccess();
                  if (onClose) onClose();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                العودة للرئيسية / شاشة الدخول
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentRole('super_admin');
                  if (onClose) onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>الانتقال للوحة السوبر آدمن (لتفعيل المطعم الآن) ➔</span>
              </button>
            </div>
          </div>
        ) : (
          <>
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
                منيو إلكتروني QR تفاعلي جاهز لطاولاتك وتلقي الطلبات فور موافقة الإدارة.
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

              {/* Phone / WhatsApp & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    رقم هاتف المالك للدخول <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      placeholder="07XXXXXXXXX"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-left font-mono"
                    />
                    <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    كلمة المرور للحساب <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-left font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
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
                disabled={isSubmitting}
                className="w-full mt-4 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>جارٍ تسجيل المطعم وإنشاء الحساب...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>إرسال طلب التسجيل لحين التفعيل</span>
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-slate-500 pt-2">
                يتم مراجعة وتفعيل الحساب من قِبل إدارة المنصة (السوبر آدمن) للبدء في استقبال طلباتك.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
