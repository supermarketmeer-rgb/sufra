import { User, Restaurant, Branch, DiningTable, Category, Product, Order, Reservation, Review, Plan, Coupon, ActivityLog } from '../types';

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 10,
    name_ar: 'مطعم جوان',
    name_en: 'مطعم جوان',
    slug: 'مطعم-جوان',
    logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    cover_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80',
    description_ar: 'أشهى المأكولات والمشروبات بنظام سفرة الذكي',
    phone: '07760009061',
    email: 'info@مطعم-جوان.com',
    address: 'الحلة، العراق',
    currency: 'IQD',
    tax_percentage: 0,
    status: 'active',
    created_at: '2026-10-05',
    theme_primary_color: '#f59e0b',
    plan_name: 'الباقة الاحترافية (Pro)',
    delivery_fee_base: 0,
    whatsapp_number: '07760009061'
  }
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 9,
    restaurant_id: 10,
    name_ar: 'الفرع الرئيسي',
    name_en: 'Main Branch',
    phone: '07760009061',
    address: 'الحلة، العراق',
    latitude: 33.315,
    longitude: 44.354,
    opening_time: '08:00:00',
    closing_time: '01:00:00',
    manager_name: 'مدير الفرع',
    is_active: true
  }
];

export const INITIAL_TABLES: DiningTable[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  branch_id: 1,
  table_number: `طاولة ${i + 1}`,
  capacity: i < 4 ? 4 : (i < 8 ? 6 : 8),
  status: 'available' as const,
  qr_token: `TBL-MAN-${i + 1}`
})).concat(
  Array.from({ length: 5 }, (_, i) => ({
    id: 10 + i + 1,
    branch_id: 2,
    table_number: `طاولة ${i + 1}`,
    capacity: 4,
    status: 'available' as const,
    qr_token: `TBL-JWAN-${i + 1}`
  }))
);

export const INITIAL_CATEGORIES: Category[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_RESERVATIONS: Reservation[] = [];
export const INITIAL_REVIEWS: Review[] = [];
export const INITIAL_COUPONS: Coupon[] = [];

export const SAAS_PLANS: Plan[] = [
  {
    id: 1,
    name_ar: 'الباقة المجانية (تجريبية 14 يوم)',
    name_en: 'Free 14-Day Trial',
    slug: 'free',
    price_monthly: 0,
    price_yearly: 0,
    currency: 'IQD',
    max_branches: 1,
    max_tables: 10,
    max_products: 50,
    has_pos: true,
    has_kds: true,
    has_delivery_gps: false,
    has_ai_analytics: false,
    has_custom_domain: false,
    trial_days: 14,
    features: [
      'فترة تجريبية مجانية لمدة 14 يوم',
      'منيو إلكتروني QR تفاعلي',
      'نظام الكاشير وتسجيل الطلبات (POS)',
      'شاشة المطبخ KDS مع التنبيهات',
      'إدارة الأصناف والصور',
      'دعم فني مباشر'
    ]
  },
  {
    id: 2,
    name_ar: 'الباقة الاحترافية (Pro)',
    name_en: 'Professional Growth',
    slug: 'pro',
    price_monthly: 65000,
    price_yearly: 650000,
    currency: 'IQD',
    max_branches: 3,
    max_tables: 60,
    max_products: 350,
    has_pos: true,
    has_kds: true,
    has_delivery_gps: false,
    has_ai_analytics: true,
    has_custom_domain: false,
    features: ['نظام الطلبات المباشر أونلاين', 'شاشة الكاشير POS السريعة', 'شاشة المطبخ KDS مع التنبيهات', 'تقارير مالية وتصدير Excel', 'نظام الكوبونات والعروض']
  },
  {
    id: 3,
    name_ar: 'الباقة المؤسسية (Enterprise)',
    name_en: 'Enterprise Multi-Branch',
    slug: 'enterprise',
    price_monthly: 150000,
    price_yearly: 1500000,
    currency: 'IQD',
    max_branches: 99,
    max_tables: 1000,
    max_products: 5000,
    has_pos: true,
    has_kds: true,
    has_delivery_gps: true,
    has_ai_analytics: true,
    has_custom_domain: true,
    features: ['نظام متكامل لعدة فروع ومستودعات', 'دعم دومين ونطاق خاص', 'تحليلات AI ذكية وتنبؤ بالمبيعات', 'شاشات لا محدودة ومدير حساب مخصص', 'ربط مع بوابات الدفع الإلكتروني']
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 1,
    user_name: 'مدير المنصة العام',
    role: 'super_admin',
    action: 'System Initialized',
    description: 'تم تجهيز منصة سُفرة السحابية بنجاح وربط قاعدة البيانات',
    timestamp: 'الآن'
  }
];

export const INITIAL_USERS: User[] = [
  // Super Admin
  {
    id: 1,
    role: 'super_admin',
    name: 'المدير العام للمنصة',
    username: 'admin',
    email: 'admin@sufrah.com',
    password: 'admin123',
    pin_code: '1234',
    phone: '+9647700000000',
    is_active: true,
    created_at: '2026-01-01'
  },
  // Restaurant 10: مطعم جوان
  {
    id: 16,
    restaurant_id: 10,
    branch_id: 9,
    role: 'restaurant_owner',
    name: 'مالك مطعم جوان',
    username: 'علي',
    email: 'info@مطعم-جوان.com',
    password: 'Aa624426',
    pin_code: '5777',
    phone: '07760009061',
    is_active: true,
    created_at: '2026-10-05'
  },
  {
    id: 7,
    restaurant_id: 10,
    branch_id: 9,
    role: 'restaurant_owner',
    name: 'علي (مالك مطعم جوان)',
    username: 'owner_jwan',
    email: 'owner@jwan.com',
    password: '123456',
    pin_code: '2026',
    phone: '07760009061',
    is_active: true,
    created_at: '2026-10-05'
  },
  {
    id: 8,
    restaurant_id: 10,
    branch_id: 9,
    role: 'branch_manager',
    name: 'مدير فرع جوان',
    username: 'manager_jwan',
    email: 'manager@jwan.com',
    password: 'manager123',
    pin_code: '9999',
    phone: '07760009061',
    is_active: true,
    created_at: '2026-10-05'
  },
  {
    id: 9,
    restaurant_id: 10,
    branch_id: 9,
    role: 'cashier',
    name: 'كاشير مطعم جوان',
    username: 'cashier_jwan',
    email: 'cashier@jwan.com',
    password: 'cashier123',
    pin_code: '7777',
    phone: '07760009061',
    is_active: true,
    created_at: '2026-10-05'
  },
  {
    id: 10,
    restaurant_id: 10,
    branch_id: 9,
    role: 'kitchen',
    name: 'الشيف جوان (مطبخ جوان)',
    username: 'chef_jwan',
    email: 'chef@jwan.com',
    password: 'chef123',
    pin_code: '8888',
    phone: '07760009061',
    is_active: true,
    created_at: '2026-10-05'
  },
  {
    id: 11,
    restaurant_id: 10,
    branch_id: 9,
    role: 'driver',
    name: 'مندوب توصيل جوان',
    username: 'driver_jwan',
    email: 'driver@jwan.com',
    password: 'driver123',
    pin_code: '6666',
    phone: '07760009061',
    is_active: true,
    created_at: '2026-10-05'
  }
];
