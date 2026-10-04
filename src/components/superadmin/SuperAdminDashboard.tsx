import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Restaurant, UserRole } from '../../types';
import {
  Building2,
  DollarSign,
  TrendingUp,
  Users,
  Plus,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  CreditCard,
  Search,
  Globe,
  ArrowUpRight,
  Pause,
  Play,
  Trash2,
  AlertTriangle,
  KeyRound,
  Eye,
  EyeOff,
  User as UserIcon
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const {
    restaurants,
    createRestaurant,
    plans,
    orders,
    activityLogs,
    setActiveRestaurant,
    setCurrentRole,
    updatePlan,
    toggleRestaurantStatus,
    deleteRestaurant,
    users,
    updateUser,
    createUser,
    deleteUser,
    branches
  } = useApp();

  const [activeTab, setActiveTab] = useState<'restaurants' | 'plans' | 'billing' | 'users' | 'logs'>('restaurants');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // SuperAdmin User Management State
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilterRole, setUserFilterRole] = useState<string>('all');
  const [userFilterRestId, setUserFilterRestId] = useState<string>('all');
  const [showAdminPwMap, setShowAdminPwMap] = useState<Record<string, boolean>>({});

  // SuperAdmin User Add/Edit Modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [userDeleteNotice, setUserDeleteNotice] = useState<{ success: boolean; message: string } | null>(null);
  const [userModalName, setUserModalName] = useState('');
  const [userModalUsername, setUserModalUsername] = useState('');
  const [userModalPassword, setUserModalPassword] = useState('');
  const [userModalPin, setUserModalPin] = useState('');
  const [userModalRole, setUserModalRole] = useState<UserRole>('cashier');
  const [userModalRestId, setUserModalRestId] = useState<number>(0);
  const [userModalBranchId, setUserModalBranchId] = useState<number | undefined>(undefined);
  const [userModalPhone, setUserModalPhone] = useState('');
  const [userModalIsActive, setUserModalIsActive] = useState(true);
  const [userModalMsg, setUserModalMsg] = useState<{ success: boolean; message: string } | null>(null);

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserModalName('');
    setUserModalUsername('');
    setUserModalPassword('123456');
    setUserModalPin('1234');
    setUserModalRole('cashier');
    setUserModalRestId(restaurants[0]?.id || 1);
    setUserModalBranchId(undefined);
    setUserModalPhone('');
    setUserModalIsActive(true);
    setUserModalMsg(null);
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user: any) => {
    setEditingUser(user);
    setUserModalName(user.name);
    setUserModalUsername(user.username);
    setUserModalPassword(user.password || '');
    setUserModalPin(user.pin_code || '');
    setUserModalRole(user.role);
    setUserModalRestId(user.restaurant_id || 0);
    setUserModalBranchId(user.branch_id);
    setUserModalPhone(user.phone || '');
    setUserModalIsActive(user.is_active);
    setUserModalMsg(null);
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userModalUsername.trim() || !userModalName.trim()) {
      setUserModalMsg({ success: false, message: 'يرجى إدخال الاسم واسم المستخدم' });
      return;
    }

    if (editingUser) {
      const res = updateUser(editingUser.id, {
        name: userModalName.trim(),
        username: userModalUsername.trim().toLowerCase(),
        password: userModalPassword.trim(),
        pin_code: userModalPin.trim(),
        role: userModalRole,
        restaurant_id: userModalRestId || undefined,
        branch_id: userModalBranchId || undefined,
        phone: userModalPhone.trim(),
        is_active: userModalIsActive
      });
      setUserModalMsg(res);
      if (res.success) {
        setTimeout(() => setShowUserModal(false), 1200);
      }
    } else {
      const res = createUser({
        name: userModalName.trim(),
        username: userModalUsername.trim().toLowerCase(),
        email: `${userModalUsername.trim().toLowerCase()}@sufra.menu`,
        password: userModalPassword.trim() || '123456',
        pin_code: userModalPin.trim() || '1234',
        role: userModalRole,
        restaurant_id: userModalRestId || undefined,
        branch_id: userModalBranchId || undefined,
        phone: userModalPhone.trim(),
        is_active: userModalIsActive
      });
      setUserModalMsg(res);
      if (res.success) {
        setTimeout(() => setShowUserModal(false), 1200);
      }
    }
  };

  const handleDeleteUser = (user: any) => {
    setUserToDelete(user);
    setUserDeleteNotice(null);
  };

  // Form state
  const [newRestNameAr, setNewRestNameAr] = useState('');
  const [newRestNameEn, setNewRestNameEn] = useState('');
  const [newRestSlug, setNewRestSlug] = useState('');
  const [newRestDomain, setNewRestDomain] = useState('');
  const [newRestPhone, setNewRestPhone] = useState('');
  const [newRestEmail, setNewRestEmail] = useState('');
  const [newRestPlan, setNewRestPlan] = useState('الباقة الاحترافية (Pro)');

  // Plan editing state
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planPriceMonthly, setPlanPriceMonthly] = useState<number>(0);
  const [planPriceYearly, setPlanPriceYearly] = useState<number>(0);
  const [planMaxBranches, setPlanMaxBranches] = useState<number>(1);
  const [planMaxTables, setPlanMaxTables] = useState<number>(10);
  const [planMaxProducts, setPlanMaxProducts] = useState<number>(50);
  const [planHasPos, setPlanHasPos] = useState<boolean>(true);
  const [planHasKds, setPlanHasKds] = useState<boolean>(true);
  const [planHasDeliveryGps, setPlanHasDeliveryGps] = useState<boolean>(false);
  const [planHasAiAnalytics, setPlanHasAiAnalytics] = useState<boolean>(false);
  const [planTrialDays, setPlanTrialDays] = useState<number>(14);

  const handleOpenEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setPlanPriceMonthly(plan.price_monthly);
    setPlanPriceYearly(plan.price_yearly);
    setPlanMaxBranches(plan.max_branches);
    setPlanMaxTables(plan.max_tables);
    setPlanMaxProducts(plan.max_products);
    setPlanHasPos(plan.has_pos ?? (plan.slug === 'free' ? true : false));
    setPlanHasKds(plan.has_kds ?? (plan.slug === 'free' ? true : false));
    setPlanHasDeliveryGps(plan.has_delivery_gps ?? false);
    setPlanHasAiAnalytics(plan.has_ai_analytics ?? false);
    setPlanTrialDays(plan.trial_days ?? (plan.price_monthly === 0 ? 14 : 0));
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    updatePlan(editingPlan.id, {
      price_monthly: planPriceMonthly,
      price_yearly: planPriceYearly,
      max_branches: planMaxBranches,
      max_tables: planMaxTables,
      max_products: planMaxProducts,
      has_pos: planHasPos,
      has_kds: planHasKds,
      has_delivery_gps: planHasDeliveryGps,
      has_ai_analytics: planHasAiAnalytics,
      trial_days: planTrialDays > 0 ? planTrialDays : undefined
    });
    setEditingPlan(null);
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalMRR = restaurants.reduce((sum, r) => {
    const plan = plans.find(p => p.name_ar === r.plan_name || p.slug === r.plan_name);
    return sum + (plan ? plan.price_monthly : 0);
  }, 0);

  const filteredRestaurants = restaurants.filter(
    r => r.name_ar.includes(searchTerm) || r.name_en.toLowerCase().includes(searchTerm.toLowerCase()) || r.slug.includes(searchTerm)
  );

  const handleCreateRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestNameAr || !newRestSlug) return;

    createRestaurant({
      name_ar: newRestNameAr,
      name_en: newRestNameEn || newRestNameAr,
      slug: newRestSlug.toLowerCase().trim().replace(/[\s_]+/g, '-'),
      custom_domain: newRestDomain ? newRestDomain.trim() : undefined,
      phone: newRestPhone,
      email: newRestEmail,
      plan_name: newRestPlan,
      theme_primary_color: '#f59e0b'
    });

    setNewRestNameAr('');
    setNewRestNameEn('');
    setNewRestSlug('');
    setNewRestDomain('');
    setNewRestPhone('');
    setNewRestEmail('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / SaaS KPI Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">إجمالي المطاعم النشطة</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-numbers text-white">{restaurants.length}</span>
            <span className="text-xs text-emerald-400 font-medium">جاهز للإضافة</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">مطاعم ومقاهي مشتركة بالمنصة</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">الإيراد الشهري المتكرر (MRR)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-numbers text-white">{totalMRR.toLocaleString()}</span>
            <span className="text-xs text-slate-400">د.ع</span>
            <span className="text-xs text-emerald-400 font-medium mr-1">نشط</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">اشتراكات SaaS المستحقة شهرياً</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">إجمالي الطلبات المعالجة</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-numbers text-white">{orders.length.toLocaleString()}</span>
            <span className="text-xs text-blue-400 font-medium">مباشر</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">طلب رقمي عبر QR والمنصة</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">إجمالي قيمة المبيعات</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-numbers text-white">{totalRevenue.toLocaleString()}</span>
            <span className="text-xs text-slate-400">د.ع</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">ZainCash, AsiaHawala, QiCard, كاش</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'restaurants' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            المطاعم المشتركة ({restaurants.length})
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'plans' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            باقات الاشتراكات ({plans.length})
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'billing' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            سجل الفواتير والمدفوعات
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'users' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            المستخدمون وكلمات المرور ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'logs' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            سجل التدقيق والأمان
          </button>
        </div>

        {activeTab === 'restaurants' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مطعم جديد للمنصة</span>
          </button>
        )}
      </div>

      {/* Tab 1: Restaurants Directory */}
      {activeTab === 'restaurants' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="البحث باسم المطعم، الرابط، أو النطاق..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="text-xs text-slate-400">
              عرض {filteredRestaurants.length} من {restaurants.length} مطعم
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">المطعم والهوية</th>
                    <th className="py-3.5 px-4">الرابط الفرعي والنطاق</th>
                    <th className="py-3.5 px-4">الباقة الحالية</th>
                    <th className="py-3.5 px-4">بيانات التواصل</th>
                    <th className="py-3.5 px-4">الحالة</th>
                    <th className="py-3.5 px-4 text-left">إجراءات الإدارة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRestaurants.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-amber-400">
                            <Building2 className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-semibold text-slate-200">لا توجد مطاعم مسجلة حتى الآن</p>
                          <p className="text-xs text-slate-500 max-w-sm">
                            المنصة جاهزة تماماً ومفرغة من البيانات الوهمية. ابدأ بتسجيل أول مطعم لإنشاء المنيو الإلكتروني والفرع الرئيسي تلقائياً.
                          </p>
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>إضافة المطعم الأول الآن</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredRestaurants.map(rest => (
                    <tr key={rest.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={rest.logo_url}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                          />
                          <div>
                            <div className="font-bold text-white text-sm">{rest.name_ar}</div>
                            <div className="text-[11px] text-slate-400">{rest.name_en}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-amber-400 flex items-center gap-1">
                          <span>{rest.slug}.sufrah.menu</span>
                        </div>
                        {rest.custom_domain && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Globe className="w-3 h-3 text-emerald-400" />
                            <span>{rest.custom_domain}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-200 border border-slate-700">
                          {rest.plan_name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <div>{rest.phone}</div>
                        <div className="text-[11px] text-slate-400">{rest.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {rest.status === 'suspended' || rest.status === 'inactive' ? (
                          <span className="inline-flex items-center gap-1.5 text-rose-400 font-semibold px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            موقوف مؤقتاً
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            نشط وفعال
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* زر إيقاف / تفعيل المطعم */}
                          <button
                            onClick={() => toggleRestaurantStatus(rest.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
                              rest.status === 'suspended' || rest.status === 'inactive'
                                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border-amber-500/30'
                            }`}
                            title={rest.status === 'suspended' || rest.status === 'inactive' ? 'تفعيل المطعم واستئناف العمل' : 'إيقاف نشاط المطعم مؤقتاً'}
                          >
                            {rest.status === 'suspended' || rest.status === 'inactive' ? (
                              <>
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>تفعيل</span>
                              </>
                            ) : (
                              <>
                                <Pause className="w-3.5 h-3.5 fill-current" />
                                <span>إيقاف</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setActiveRestaurant(rest);
                              setCurrentRole('restaurant_owner');
                            }}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                          >
                            دخول كمالك
                          </button>
                          <button
                            onClick={() => {
                              setActiveRestaurant(rest);
                              setCurrentRole('customer');
                            }}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="hidden xl:inline">عرض المنيو</span>
                          </button>

                          {/* آيقونة حذف المطعم */}
                          <button
                            onClick={() => setRestaurantToDelete(rest)}
                            className="p-1.5 sm:p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg border border-rose-500/30 transition-colors cursor-pointer"
                            title={`حذف مطعم ${rest.name_ar} نهائياً`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SaaS Plans */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                plan.slug === 'enterprise'
                  ? 'border-amber-500/50 shadow-xl shadow-amber-500/5 ring-1 ring-amber-500/30'
                  : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">{plan.name_ar}</h3>
                  {plan.slug === 'enterprise' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                      الأكثر طلباً
                    </span>
                  )}
                  {(plan.trial_days || plan.slug === 'free') && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      تجربة {plan.trial_days || 14} يوم
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{plan.name_en}</p>

                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-2xl font-black font-mono-numbers text-white">
                    {plan.price_monthly === 0 ? 'مجاناً' : `${plan.price_monthly.toLocaleString()} د.ع`}
                  </span>
                  {plan.price_monthly === 0 && (
                    <span className="text-xs text-emerald-400 font-semibold mr-1">
                      (فترة تجريبية {plan.trial_days || 14} يوم)
                    </span>
                  )}
                  {plan.price_monthly > 0 && (
                    <span className="text-xs text-slate-400">
                      / شهرياً ({plan.price_yearly.toLocaleString()} د.ع سنوياً)
                    </span>
                  )}
                </div>

                <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">عدد الفروع المسموحة:</span>
                    <span className="font-semibold text-white">{plan.max_branches} فرع</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">عدد الطاولات:</span>
                    <span className="font-semibold text-white">{plan.max_tables} طاولة</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">عدد الأصناف:</span>
                    <span className="font-semibold text-white">{plan.max_products} صنف</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">نظام الكاشير (POS):</span>
                    <span className={plan.has_pos ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {plan.has_pos ? 'مشمول' : 'غير مشمول'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">شاشة المطبخ (KDS):</span>
                    <span className={plan.has_kds ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {plan.has_kds ? 'مشمول' : 'غير مشمول'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">تتبع السائقين GPS:</span>
                    <span className={plan.has_delivery_gps ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {plan.has_delivery_gps ? 'مشمول' : 'غير مشمول'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">تحليلات الذكاء الاصطناعي:</span>
                    <span className={plan.has_ai_analytics ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {plan.has_ai_analytics ? 'مشمول' : 'غير مشمول'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-1.5 pt-4 border-t border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">المميزات الرئيسية:</div>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleOpenEditPlan(plan)}
                className="mt-6 w-full py-2.5 bg-slate-800 hover:bg-slate-700 hover:text-amber-400 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer border border-slate-700/60"
              >
                تعديل أسعار وخصائص الباقة
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Billing & Payments */}
      {activeTab === 'billing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">سجل العمليات المالية والاشتراكات السحابية</h3>
            <span className="text-xs text-slate-400">بوابات الدفع: ZainCash / Stripe / QiCard</span>
          </div>

          <div className="overflow-x-auto">
            {restaurants.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                لا توجد فواتير اشتراكات مسجلة حالياً. ستظهر الفواتير تلقائياً عند تسجيل المطاعم الجديدة.
              </div>
            ) : (
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">رقم الفاتورة</th>
                    <th className="py-3 px-4">المطعم</th>
                    <th className="py-3 px-4">الباقة المشتركة</th>
                    <th className="py-3 px-4">المبلغ</th>
                    <th className="py-3 px-4">طريقة الدفع</th>
                    <th className="py-3 px-4">التاريخ</th>
                    <th className="py-3 px-4">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {restaurants.map((rest, idx) => {
                    const plan = plans.find(p => p.name_ar === rest.plan_name || p.slug === rest.plan_name) || plans[0];
                    return (
                      <tr key={rest.id} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-mono text-amber-400">INV-2026-{100 + idx}</td>
                        <td className="py-3 px-4 font-bold text-white">{rest.name_ar}</td>
                        <td className="py-3 px-4">{rest.plan_name}</td>
                        <td className="py-3 px-4 font-bold font-mono">{plan.price_monthly.toLocaleString()} د.ع (شهري)</td>
                        <td className="py-3 px-4">ZainCash / QiCard</td>
                        <td className="py-3 px-4 text-slate-400">{rest.created_at}</td>
                        <td className="py-3 px-4 text-emerald-400 font-semibold">مكتمل ومفعل</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">سجل أنشطة النظام والتدقيق الأمني (Audit Trail)</h3>
            <span className="text-xs text-slate-400">حماية من التلاعب مع عناوين IP والمستخدمين</span>
          </div>

          <div className="divide-y divide-slate-800">
            {activityLogs.map(log => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <span>{log.user_name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {log.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{log.description}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 whitespace-nowrap font-mono">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Users & Credentials Management (SuperAdmin) */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو اسم المستخدم..."
                  value={userSearchTerm}
                  onChange={e => setUserSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Filter by Restaurant */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">المطعم:</span>
                <select
                  value={userFilterRestId}
                  onChange={e => setUserFilterRestId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">كافة المطاعم</option>
                  {restaurants.map(r => (
                    <option key={r.id} value={r.id}>{r.name_ar}</option>
                  ))}
                </select>
              </div>

              {/* Filter by Role */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-semibold whitespace-nowrap">الدور:</span>
                <select
                  value={userFilterRole}
                  onChange={e => setUserFilterRole(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="all">كافة الأدوار</option>
                  <option value="super_admin">سوبر أدمن المنصة</option>
                  <option value="restaurant_owner">مالك مطعم (Owner)</option>
                  <option value="branch_manager">مدير فرع</option>
                  <option value="cashier">كاشير (POS)</option>
                  <option value="kitchen">طاهي المطبخ (KDS)</option>
                  <option value="driver">مندوب التوصيل</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleOpenAddUser}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة حساب مستخدم جديد</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">المستخدم</th>
                    <th className="py-3 px-4">الدور الوظيفي</th>
                    <th className="py-3 px-4">المطعم والفرع</th>
                    <th className="py-3 px-4">اسم المستخدم (Username)</th>
                    <th className="py-3 px-4">كلمة المرور (Password)</th>
                    <th className="py-3 px-4">رمز الـ PIN</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users
                    .filter(u => {
                      const matchSearch = u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                        u.username.toLowerCase().includes(userSearchTerm.toLowerCase());
                      const matchRest = userFilterRestId === 'all' || String(u.restaurant_id) === userFilterRestId;
                      const matchRole = userFilterRole === 'all' || u.role === userFilterRole;
                      return matchSearch && matchRest && matchRole;
                    })
                    .map(u => {
                      const restObj = restaurants.find(r => r.id === u.restaurant_id);
                      const branchObj = branches.find(b => b.id === u.branch_id);
                      const isPwVisible = showAdminPwMap[u.id];

                      const roleBadge = (() => {
                        switch (u.role) {
                          case 'super_admin':
                            return { label: 'سوبر أدمن', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
                          case 'restaurant_owner':
                            return { label: 'مالك المطعم', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
                          case 'branch_manager':
                            return { label: 'مدير فرع', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
                          case 'cashier':
                            return { label: 'كاشير POS', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' };
                          case 'kitchen':
                            return { label: 'شيف KDS', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' };
                          case 'driver':
                            return { label: 'دليفري GPS', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' };
                          default:
                            return { label: 'مستخدم', color: 'bg-slate-800 text-slate-300 border-slate-700' };
                        }
                      })();

                      return (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                                {u.name.slice(0, 1)}
                              </div>
                              <div>
                                <div className="font-bold text-white text-xs">{u.name}</div>
                                {u.phone && <div className="text-[10px] text-slate-400 font-mono">{u.phone}</div>}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold ${roleBadge.color}`}>
                              {roleBadge.label}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {restObj ? (
                              <div>
                                <div className="font-bold text-slate-200">{restObj.name_ar}</div>
                                <div className="text-[10px] text-slate-400">
                                  {branchObj ? `فرع: ${branchObj.name_ar}` : 'كافة الفروع'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-amber-400 font-mono text-[11px]">نظام المنصة العام</span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-amber-300">
                            {u.username}
                          </td>

                          <td className="py-3 px-4 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white">
                                {isPwVisible ? (u.password || 'لا توجد') : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowAdminPwMap(prev => ({ ...prev, [u.id]: !prev[u.id] }))}
                                className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                                title={isPwVisible ? 'إخفاء' : 'عرض'}
                              >
                                {isPwVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-amber-400">
                            {u.pin_code || '1234'}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              u.is_active
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              {u.is_active ? 'نشط 🟢' : 'معطل 🔴'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditUser(u)}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                                title="تعديل اسم المستخدم وكلمة المرور"
                              >
                                <KeyRound className="w-3 h-3" />
                                <span>تعديل</span>
                              </button>

                              {u.role !== 'super_admin' && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  className="p-1 text-slate-400 hover:text-rose-400 bg-slate-950 hover:bg-rose-950/40 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                                  title="حذف الحساب"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Restaurant */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">إنشاء وتسجيل مطعم جديد في المنصة</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">اسم المطعم (بالعربية) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مطعم شاورما الريان"
                    value={newRestNameAr}
                    onChange={e => setNewRestNameAr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">اسم المطعم (بالإنجليزية)</label>
                  <input
                    type="text"
                    placeholder="Al Rayan Shawarma"
                    value={newRestNameEn}
                    onChange={e => setNewRestNameEn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">معرف الرابط الفرعي (Subdomain Slug) *</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="al-rayan"
                    value={newRestSlug}
                    onChange={e => setNewRestSlug(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-r-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="bg-slate-800 text-slate-400 px-3 py-2.5 rounded-l-lg border-y border-l border-slate-800 font-mono text-[11px]">
                    .sufrah.menu
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">النطاق الخاص (اختياري Custom Domain)</label>
                <input
                  type="text"
                  placeholder="menu.alrayan-restaurant.com"
                  value={newRestDomain}
                  onChange={e => setNewRestDomain(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">رقم الهاتف (بدون كود الدولة)</label>
                  <input
                    type="text"
                    placeholder="07XXXXXXXXX (مثال: 07701234567)"
                    value={newRestPhone}
                    onChange={e => setNewRestPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    placeholder="info@restaurant.com"
                    value={newRestEmail}
                    onChange={e => setNewRestEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">باقة الاشتراك</label>
                <select
                  value={newRestPlan}
                  onChange={e => setNewRestPlan(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="الباقة المجانية (Starter)">الباقة المجانية (Starter)</option>
                  <option value="الباقة الاحترافية (Pro)">الباقة الاحترافية (Pro)</option>
                  <option value="الباقة المؤسسية (Enterprise)">الباقة المؤسسية (Enterprise)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
                >
                  إنشاء المطعم وتوليد الروابط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit SaaS Plan */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">تعديل {editingPlan.name_ar}</h3>
                <p className="text-xs text-slate-400 mt-0.5">تحديث أسعار الاشتراك والحدود التشغيلية</p>
              </div>
              <button
                onClick={() => setEditingPlan(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">السعر الشهري (د.ع):</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={planPriceMonthly}
                    onChange={e => setPlanPriceMonthly(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">السعر السنوي (د.ع):</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={planPriceYearly}
                    onChange={e => setPlanPriceYearly(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">أقصى فروع:</label>
                  <input
                    type="number"
                    min="1"
                    value={planMaxBranches}
                    onChange={e => setPlanMaxBranches(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">أقصى طاولات:</label>
                  <input
                    type="number"
                    min="1"
                    value={planMaxTables}
                    onChange={e => setPlanMaxTables(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">أقصى أصناف:</label>
                  <input
                    type="number"
                    min="1"
                    value={planMaxProducts}
                    onChange={e => setPlanMaxProducts(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-2">
                <label className="block text-slate-400 font-semibold mb-1">الأنظمة والخصائص المشمولة:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-amber-500/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={planHasPos}
                      onChange={e => setPlanHasPos(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-0"
                    />
                    <span className="text-slate-200 font-semibold">نظام الكاشير (POS)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-amber-500/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={planHasKds}
                      onChange={e => setPlanHasKds(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-0"
                    />
                    <span className="text-slate-200 font-semibold">شاشة المطبخ (KDS)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-amber-500/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={planHasDeliveryGps}
                      onChange={e => setPlanHasDeliveryGps(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-0"
                    />
                    <span className="text-slate-200 font-semibold">تتبع السائقين GPS</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-amber-500/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={planHasAiAnalytics}
                      onChange={e => setPlanHasAiAnalytics(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-0"
                    />
                    <span className="text-slate-200 font-semibold">تحليلات الذكاء الاصطناعي</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">مدة الفترة التجريبية (بالأيام - 0 إن لم تكن تجريبية):</label>
                <input
                  type="number"
                  min="0"
                  value={planTrialDays}
                  onChange={e => setPlanTrialDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition-colors"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Restaurant Confirmation Modal */}
      {restaurantToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">تأكيد حذف المطعم نهائياً</h3>
                <p className="text-xs text-slate-400">إجراء حساس لا يمكن التراجع عنه</p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>{restaurantToDelete.name_ar}</span>
                <span className="text-xs text-slate-400 font-mono">({restaurantToDelete.slug})</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف هذا المطعم؟ سيتم حذف كافة الفروع، الطاولات، التصنيفات، قوائم الطعام، والطلبات المرتبطة به نهائياً من قاعدة البيانات السحابية.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setRestaurantToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    deleteRestaurant(restaurantToDelete.id);
                    setRestaurantToDelete(null);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'جاري الحذف...' : 'نعم، حذف المطعم نهائياً'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SuperAdmin User Add/Edit Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md font-cairo" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {editingUser ? 'تعديل بيانات المستخدم وكلمة المرور' : 'إضافة مستخدم جديد للنظام'}
                  </h3>
                  <p className="text-xs text-slate-400">إدارة حسابات الدخول وصلاحيات المنصة والمطاعم</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {userModalMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                userModalMsg.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}>
                <span>{userModalMsg.success ? '✅' : '⚠️'}</span>
                <span>{userModalMsg.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  الاسم الكامل <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: علي الكاشير"
                  value={userModalName}
                  onChange={e => setUserModalName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    الدور والصلاحية <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={userModalRole}
                    onChange={e => setUserModalRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-sm text-white outline-none cursor-pointer"
                  >
                    <option value="super_admin">سوبر أدمن (إدارة النظام)</option>
                    <option value="restaurant_owner">مالك مطعم (Owner)</option>
                    <option value="branch_manager">مدير فرع</option>
                    <option value="cashier">كاشير المحاسبة (POS)</option>
                    <option value="kitchen">شيف المطبخ (KDS)</option>
                    <option value="driver">مندوب التوصيل (Driver)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    المطعم التابع له
                  </label>
                  <select
                    value={userModalRestId}
                    onChange={e => setUserModalRestId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-sm text-white outline-none cursor-pointer"
                  >
                    <option value={0}>بدون ارتباط بمطعم (منصة عامة)</option>
                    {restaurants.map(r => (
                      <option key={r.id} value={r.id}>{r.name_ar}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>بيانات تسجيل الدخول وتغيير الباسوورد:</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    اسم المستخدم (Username) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: cashier_1"
                    value={userModalUsername}
                    onChange={e => setUserModalUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-sm text-amber-300 font-mono outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      كلمة المرور الجديدة (Password) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="كلمة المرور"
                      value={userModalPassword}
                      onChange={e => setUserModalPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-sm text-white font-mono outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      رمز الـ PIN السريع <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="1234"
                      value={userModalPin}
                      onChange={e => setUserModalPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-sm text-amber-400 font-mono tracking-widest text-center outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    رقم الهاتف (اختياري)
                  </label>
                  <input
                    type="tel"
                    placeholder="07XXXXXXXXX"
                    value={userModalPhone}
                    onChange={e => setUserModalPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-sm text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="userActiveCheck"
                  checked={userModalIsActive}
                  onChange={e => setUserModalIsActive(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                />
                <label htmlFor="userActiveCheck" className="text-xs text-slate-300 cursor-pointer">
                  حساب نشط ومفعّل (يمكن لصاحبه تسجيل الدخول)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{editingUser ? 'حفظ التعديلات' : 'إنشاء المستخدم'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SuperAdmin Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-cairo" dir="rtl">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">تأكيد حذف حساب المستخدم</h3>
                <p className="text-xs text-slate-400">إجراء حساس لا يمكن التراجع عنه</p>
              </div>
            </div>

            {userDeleteNotice && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                userDeleteNotice.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}>
                <span>{userDeleteNotice.success ? '✅' : '⚠️'}</span>
                <span>{userDeleteNotice.message}</span>
              </div>
            )}

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">الاسم الكامل:</span>
                <span className="font-bold text-white text-xs">{userToDelete.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">اسم المستخدم:</span>
                <span className="font-mono font-bold text-amber-400 text-xs">{userToDelete.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">الدور:</span>
                <span className="text-xs font-semibold text-slate-300">{userToDelete.role}</span>
              </div>
              <p className="text-xs text-rose-300/80 pt-2 border-t border-slate-800/80 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف هذا الحساب نهائياً من المنصة؟
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isDeletingUser}
                onClick={() => {
                  setIsDeletingUser(true);
                  const res = deleteUser(userToDelete.id);
                  setIsDeletingUser(false);
                  if (res.success) {
                    setUserToDelete(null);
                  } else {
                    setUserDeleteNotice(res);
                  }
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingUser ? 'جاري الحذف...' : 'نعم، حذف الحساب نهائياً'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
