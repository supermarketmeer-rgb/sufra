import { Restaurant, Branch, DiningTable, Category, Product, Order, Reservation, Review, Plan, Coupon, ActivityLog } from '../types';

export const INITIAL_RESTAURANTS: Restaurant[] = [];
export const INITIAL_BRANCHES: Branch[] = [];
export const INITIAL_TABLES: DiningTable[] = [];
export const INITIAL_CATEGORIES: Category[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_ORDERS: Order[] = [];
export const INITIAL_RESERVATIONS: Reservation[] = [];
export const INITIAL_REVIEWS: Review[] = [];
export const INITIAL_COUPONS: Coupon[] = [];

export const SAAS_PLANS: Plan[] = [
  {
    id: 1,
    name_ar: 'الباقة المجانية (Starter)',
    name_en: 'Free Starter Plan',
    slug: 'free',
    price_monthly: 0,
    price_yearly: 0,
    currency: 'IQD',
    max_branches: 1,
    max_tables: 10,
    max_products: 40,
    has_pos: false,
    has_kds: false,
    has_delivery_gps: false,
    has_ai_analytics: false,
    has_custom_domain: false,
    features: ['منيو إلكتروني QR تفاعلي', 'رمز QR رئيسي واحد', 'إدارة الأصناف والصور', 'دعم فني عبر البريد']
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
    features: ['عدد غير محدود من الفروع', 'تتبع السائقين GPS المباشر', 'ربط نطاق خاص Custom Domain', 'ذكاء اصطناعي لتوقع المبيعات', 'برنامج ولاء ونقاط الزبائن', 'تكامل بوابات الدفع الإلكتروني']
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 1,
    user_name: 'مدير المنصة',
    role: 'super_admin',
    action: 'System Ready',
    description: 'تمت تهيئة منصة سُفرة السحابية بنجاح وهي مهيأة وجاهزة لتسجيل أول مطعم.',
    timestamp: 'الآن'
  }
];
