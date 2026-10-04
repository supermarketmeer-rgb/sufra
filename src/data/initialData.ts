import { User, Restaurant, Branch, DiningTable, Category, Product, Order, Reservation, Review, Plan, Coupon, ActivityLog } from '../types';

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 1,
    name_ar: 'مطعم السُفرة الأصيل',
    name_en: 'Sufrah Authentic Restaurant',
    slug: 'sufrah-restaurant',
    logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    cover_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    description_ar: 'أفخم المأكولات الشرقية والغربية بنكهة أصيلة وتجربة ضيافة فريدة',
    phone: '07701234567',
    email: 'contact@sufrah-restaurant.com',
    address: 'بغداد - المنصور - شارع 14 رمضان',
    currency: 'IQD',
    tax_percentage: 5,
    status: 'active',
    created_at: '2026-01-01',
    theme_primary_color: '#f59e0b',
    plan_name: 'الباقة الاحترافية (Pro)',
    delivery_fee_base: 3000,
    whatsapp_number: '07701234567'
  },
  {
    id: 2,
    name_ar: 'مطعم جوان',
    name_en: 'Jwan Restaurant',
    slug: 'jwan-restaurant',
    logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    cover_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    description_ar: 'أشهى المأكولات والمشروبات بنكهة استثنائية وضيافة راقية',
    phone: '07810909577',
    email: 'info@jwan-pohn.com',
    address: 'العراق - بغداد',
    currency: 'IQD',
    tax_percentage: 0,
    status: 'active',
    created_at: '2026-01-01',
    theme_primary_color: '#f59e0b',
    plan_name: 'الباقة المجانية (Starter)',
    delivery_fee_base: 3000,
    whatsapp_number: '07810909577'
  }
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 1,
    restaurant_id: 1,
    name_ar: 'الفرع الرئيسي - المنصور',
    name_en: 'Main Branch - Al Mansour',
    phone: '07701234567',
    address: 'بغداد - المنصور',
    latitude: 33.3152,
    longitude: 44.3661,
    opening_time: '11:00',
    closing_time: '01:00',
    manager_name: 'المدير العام',
    is_active: true
  },
  {
    id: 2,
    restaurant_id: 2,
    name_ar: 'الفرع الرئيسي',
    name_en: 'Main Branch',
    phone: '07810909577',
    address: 'بغداد',
    latitude: 33.3152,
    longitude: 44.3661,
    opening_time: '11:00',
    closing_time: '01:00',
    manager_name: 'مدير المطعم',
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

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, restaurant_id: 1, name_ar: 'مشاوي وشاورما', name_en: 'Grills & Shawarma', slug: 'grills', icon_name: 'Flame', sort_order: 1 },
  { id: 2, restaurant_id: 1, name_ar: 'برغر وساندويشات', name_en: 'Burgers & Sandwiches', slug: 'burgers', icon_name: 'Utensils', sort_order: 2 },
  { id: 3, restaurant_id: 1, name_ar: 'مقبلات وسلطات', name_en: 'Appetizers & Salads', slug: 'salads', icon_name: 'Salad', sort_order: 3 },
  { id: 4, restaurant_id: 1, name_ar: 'مشروبات وعصائر', name_en: 'Drinks & Juices', slug: 'drinks', icon_name: 'Coffee', sort_order: 4 },
  { id: 5, restaurant_id: 1, name_ar: 'حلويات فاخرة', name_en: 'Desserts', slug: 'desserts', icon_name: 'Cake', sort_order: 5 },
  // Restaurant 2 (Jwan)
  { id: 6, restaurant_id: 2, name_ar: 'مشاوي وشاورما', name_en: 'Grills & Shawarma', slug: 'grills-jwan', icon_name: 'Flame', sort_order: 1 },
  { id: 7, restaurant_id: 2, name_ar: 'برغر وساندويشات', name_en: 'Burgers & Sandwiches', slug: 'burgers-jwan', icon_name: 'Utensils', sort_order: 2 },
  { id: 8, restaurant_id: 2, name_ar: 'مقبلات وسلطات', name_en: 'Appetizers & Salads', slug: 'salads-jwan', icon_name: 'Salad', sort_order: 3 },
  { id: 9, restaurant_id: 2, name_ar: 'مشروبات وعصائر', name_en: 'Drinks & Juices', slug: 'drinks-jwan', icon_name: 'Coffee', sort_order: 4 },
  { id: 10, restaurant_id: 2, name_ar: 'حلويات فاخرة', name_en: 'Desserts', slug: 'desserts-jwan', icon_name: 'Cake', sort_order: 5 }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    restaurant_id: 1,
    category_id: 1,
    name_ar: 'كباب لحم عراقي مشوي',
    name_en: 'Iraqi Lamb Kebab',
    description_ar: 'أسياخ كباب لحم غنم طازج متبل بالخلطة البغدادية مع الخبز الحار والخضار المشوية والسماق',
    description_en: 'Fresh grilled lamb kebab with Iraqi spices, bread and grilled veggies',
    base_price: 14000,
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    calories: 680,
    prep_time_minutes: 20,
    is_available: true,
    is_featured: true,
    sizes: [],
    addons: []
  },
  {
    id: 2,
    restaurant_id: 1,
    category_id: 1,
    name_ar: 'شاورما لحم عربي صحن',
    name_en: 'Arabic Meat Shawarma Plate',
    description_ar: 'شرائح لحم بقري ممتازة مع الطحينية والمخللات والبطاطا المقرمشة وخبز الصاج',
    description_en: 'Prime beef shawarma slices with tahini, pickles and fries',
    base_price: 9000,
    image_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80',
    calories: 550,
    prep_time_minutes: 15,
    is_available: true,
    is_featured: true,
    sizes: [],
    addons: []
  },
  {
    id: 3,
    restaurant_id: 1,
    category_id: 2,
    name_ar: 'برغر سُفرة الملكي دبل لحم',
    name_en: 'Sufrah Royal Double Burger',
    description_ar: 'قطعتان من لحم الأنجوس مع جبنة الشيدر الذائبة، البصل المكرمل، وصوص السفرة السري الخاص',
    description_en: 'Double Angus beef patties with melted cheddar, caramelized onions and special sauce',
    base_price: 9500,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    calories: 780,
    prep_time_minutes: 15,
    is_available: true,
    is_featured: true,
    sizes: [],
    addons: []
  },
  {
    id: 4,
    restaurant_id: 1,
    category_id: 3,
    name_ar: 'حمص بيروتي باللحمة والصنوبر',
    name_en: 'Beiruti Hummus with Meat & Pine Nuts',
    description_ar: 'حمص ناعم بزيت الزيتون البكر مع لحم مفروم محموس وصنوبر محمص',
    description_en: 'Creamy hummus topped with sautéed minced meat and toasted pine nuts',
    base_price: 5500,
    image_url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80',
    calories: 380,
    prep_time_minutes: 8,
    is_available: true,
    is_featured: false,
    sizes: [],
    addons: []
  },
  {
    id: 5,
    restaurant_id: 1,
    category_id: 4,
    name_ar: 'عصير برتقال طبيعي طازج',
    name_en: 'Fresh Orange Juice',
    description_ar: 'عصير برتقال معصور طازج بدون سكر مضاف',
    description_en: 'Freshly squeezed 100% pure orange juice',
    base_price: 3500,
    image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
    calories: 120,
    prep_time_minutes: 5,
    is_available: true,
    is_featured: false,
    sizes: [],
    addons: []
  },
  // Products for Restaurant 2 (Jwan)
  {
    id: 6,
    restaurant_id: 2,
    category_id: 6,
    name_ar: 'كباب لحم عراقي مشوي',
    name_en: 'Iraqi Lamb Kebab',
    description_ar: 'أسياخ كباب لحم غنم طازج متبل بالخلطة البغدادية مع الخبز الحار والخضار المشوية والسماق',
    description_en: 'Fresh grilled lamb kebab with Iraqi spices, bread and grilled veggies',
    base_price: 14000,
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    calories: 680,
    prep_time_minutes: 20,
    is_available: true,
    is_featured: true,
    sizes: [],
    addons: []
  },
  {
    id: 7,
    restaurant_id: 2,
    category_id: 6,
    name_ar: 'شاورما لحم عربي صحن',
    name_en: 'Arabic Meat Shawarma Plate',
    description_ar: 'شرائح لحم بقري ممتازة مع الطحينية والمخللات والبطاطا المقرمشة وخبز الصاج',
    description_en: 'Prime beef shawarma slices with tahini, pickles and fries',
    base_price: 9000,
    image_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80',
    calories: 550,
    prep_time_minutes: 15,
    is_available: true,
    is_featured: true,
    sizes: [],
    addons: []
  },
  {
    id: 8,
    restaurant_id: 2,
    category_id: 7,
    name_ar: 'برغر جوان الملكي دبل لحم',
    name_en: 'Jwan Royal Double Burger',
    description_ar: 'قطعتان من لحم الأنجوس مع جبنة الشيدر الذائبة، البصل المكرمل، والصوص الخاص',
    description_en: 'Double Angus beef patties with melted cheddar and sauce',
    base_price: 9500,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    calories: 780,
    prep_time_minutes: 15,
    is_available: true,
    is_featured: true,
    sizes: [],
    addons: []
  },
  {
    id: 9,
    restaurant_id: 2,
    category_id: 8,
    name_ar: 'مقبلات حمص بيروتي باللحمة',
    name_en: 'Hummus with Meat',
    description_ar: 'حمص ناعم بزيت الزيتون البكر مع لحم مفروم محموس وصنوبر محمص',
    description_en: 'Creamy hummus topped with sautéed minced meat and pine nuts',
    base_price: 5500,
    image_url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80',
    calories: 380,
    prep_time_minutes: 8,
    is_available: true,
    is_featured: false,
    sizes: [],
    addons: []
  },
  {
    id: 10,
    restaurant_id: 2,
    category_id: 9,
    name_ar: 'عصير برتقال طبيعي طازج',
    name_en: 'Fresh Orange Juice',
    description_ar: 'عصير برتقال معصور طازج بدون سكر مضاف',
    description_en: 'Freshly squeezed orange juice',
    base_price: 3500,
    image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
    calories: 120,
    prep_time_minutes: 5,
    is_available: true,
    is_featured: false,
    sizes: [],
    addons: []
  }
];

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
    phone: '07700000000',
    is_active: true,
    created_at: '2026-01-01'
  },
  // Restaurant 1: مطعم السُفرة الأصيل
  {
    id: 2,
    restaurant_id: 1,
    role: 'restaurant_owner',
    name: 'أحمد السامرائي (مالك السُفرة)',
    username: 'owner_sufrah',
    email: 'owner@sufrah.com',
    password: 'owner123',
    pin_code: '1111',
    phone: '07701234567',
    is_active: true,
    created_at: '2026-01-01'
  },
  {
    id: 3,
    restaurant_id: 1,
    branch_id: 1,
    role: 'branch_manager',
    name: 'عمر القيسي (مدير المنصور)',
    username: 'manager_sufrah',
    email: 'manager@sufrah.com',
    password: 'manager123',
    pin_code: '2222',
    phone: '07701112222',
    is_active: true,
    created_at: '2026-01-01'
  },
  {
    id: 4,
    restaurant_id: 1,
    branch_id: 1,
    role: 'cashier',
    name: 'سامر العلي (كاشير المنصور)',
    username: 'cashier_sufrah',
    email: 'cashier@sufrah.com',
    password: 'cashier123',
    pin_code: '3333',
    phone: '07703334444',
    is_active: true,
    created_at: '2026-01-01'
  },
  {
    id: 5,
    restaurant_id: 1,
    branch_id: 1,
    role: 'kitchen',
    name: 'الشيف حسن (مطبخ المنصور)',
    username: 'chef_sufrah',
    email: 'chef@sufrah.com',
    password: 'chef123',
    pin_code: '4444',
    phone: '07705556666',
    is_active: true,
    created_at: '2026-01-01'
  },
  {
    id: 6,
    restaurant_id: 1,
    branch_id: 1,
    role: 'driver',
    name: 'علي الكرخي (دليفري المنصور)',
    username: 'driver_sufrah',
    email: 'driver@sufrah.com',
    password: 'driver123',
    pin_code: '5555',
    phone: '07707778888',
    is_active: true,
    created_at: '2026-01-01'
  },
  // Restaurant 2: مطعم جوان
  {
    id: 7,
    restaurant_id: 2,
    role: 'restaurant_owner',
    name: 'علي (مالك مطعم جوان)',
    username: 'owner_jwan',
    email: 'owner@jwan.com',
    password: '123456',
    pin_code: '2026',
    phone: '07810909577',
    is_active: true,
    created_at: '2026-01-01'
  },
  {
    id: 8,
    restaurant_id: 2,
    branch_id: 2,
    role: 'branch_manager',
    name: 'مدير فرع جوان',
    username: 'manager_jwan',
    email: 'manager@jwan.com',
    password: 'manager123',
    pin_code: '9999',
    phone: '07810909578',
    is_active: true,
    created_at: '2026-01-01'
  },
  {
    id: 9,
    restaurant_id: 2,
    branch_id: 2,
    role: 'cashier',
    name: 'كاشير مطعم جوان',
    username: 'cashier_jwan',
    email: 'cashier@jwan.com',
    password: 'cashier123',
    pin_code: '7777',
    phone: '07810909579',
    is_active: true,
    created_at: '2026-01-01'
  },
  {
    id: 10,
    restaurant_id: 2,
    branch_id: 2,
    role: 'kitchen',
    name: 'الشيف جوان (مطبخ جوان)',
    username: 'chef_jwan',
    email: 'chef@jwan.com',
    password: 'chef123',
    pin_code: '8888',
    phone: '07810909580',
    is_active: true,
    created_at: '2026-01-01'
  },
  {
    id: 11,
    restaurant_id: 2,
    branch_id: 2,
    role: 'driver',
    name: 'مندوب توصيل جوان',
    username: 'driver_jwan',
    email: 'driver@jwan.com',
    password: 'driver123',
    pin_code: '6666',
    phone: '07810909581',
    is_active: true,
    created_at: '2026-01-01'
  }
];
