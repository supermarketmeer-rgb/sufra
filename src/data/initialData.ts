import { Restaurant, Branch, DiningTable, Category, Product, Order, Reservation, Review, Plan, Coupon, ActivityLog } from '../types';

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 1,
    name_ar: 'مطعم ومقهى السفرة الملكية',
    name_en: 'Sufrah Royal Restaurant & Lounge',
    slug: 'sufrah-royal',
    custom_domain: 'menu.sufrahroyal.com',
    logo_url: '/src/assets/images/dish_specialty_coffee_1790265843929.jpg',
    cover_url: '/src/assets/images/dish_mixed_grills_1790265810518.jpg',
    description_ar: 'أرقى المأكولات الشرقية والمشويات على الفحم مع تشكيلة قهوة مختصة وحلويات فاخرة.',
    phone: '+964 770 123 4567',
    email: 'info@sufrahroyal.com',
    address: 'شارع الأميرات، المنصور، بغداد',
    currency: 'IQD',
    tax_percentage: 10,
    status: 'active',
    created_at: '2026-01-15',
    theme_primary_color: '#f59e0b',
    plan_name: 'الباقة المؤسسية (Enterprise)',
    delivery_fee_base: 4000,
    whatsapp_number: '+9647701234567'
  },
  {
    id: 2,
    name_ar: 'جورميه برغر هاوس',
    name_en: 'Gourmet Burger House',
    slug: 'gourmet-burger',
    custom_domain: 'order.burgerhouse.iq',
    logo_url: '/src/assets/images/dish_gourmet_burger_1790265822964.jpg',
    cover_url: '/src/assets/images/dish_gourmet_burger_1790265822964.jpg',
    description_ar: 'أشهى برغر مشوي باللحم الطازج مع بطاطس مقرمشة وخلطات صوص مبتكرة.',
    phone: '+964 780 987 6543',
    email: 'contact@burgerhouse.iq',
    address: 'حي الكرادة داخل، تقاطع المسبح، بغداد',
    currency: 'IQD',
    tax_percentage: 5,
    status: 'active',
    created_at: '2026-02-01',
    theme_primary_color: '#ef4444',
    plan_name: 'الباقة الاحترافية (Pro)',
    delivery_fee_base: 3000,
    whatsapp_number: '+9647809876543'
  },
  {
    id: 3,
    name_ar: 'بيتزا نابولي الإيطالية',
    name_en: 'Napoli Artisan Pizza',
    slug: 'napoli-pizza',
    logo_url: '/src/assets/images/dish_artisan_pizza_1790265834441.jpg',
    cover_url: '/src/assets/images/dish_artisan_pizza_1790265834441.jpg',
    description_ar: 'بيتزا إيطالية مخبوزة على الحطب بجبنة الموتزاريلا الطازجة وصلصة سان مارزانو.',
    phone: '+964 771 555 4321',
    email: 'orders@napolipizza.com',
    address: 'شارع 14 رمضان، اليرموك، بغداد',
    currency: 'IQD',
    tax_percentage: 8,
    status: 'active',
    created_at: '2026-03-10',
    theme_primary_color: '#10b981',
    plan_name: 'الباقة الاحترافية (Pro)',
    delivery_fee_base: 3500,
  }
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 1,
    restaurant_id: 1,
    name_ar: 'فرع المنصور (الرئيسي)',
    name_en: 'Al Mansour Main Branch',
    phone: '+964 770 123 4567',
    address: 'شارع الأميرات، قرب مول المنصور',
    latitude: 33.3152,
    longitude: 44.3548,
    opening_time: '11:00',
    closing_time: '01:00',
    manager_name: 'أحمد السامرائي',
    is_active: true
  },
  {
    id: 2,
    restaurant_id: 1,
    name_ar: 'فرع الجادرية',
    name_en: 'Al Jadriya Branch',
    phone: '+964 770 987 1122',
    address: 'مجمع الوزراء، قرب جامعة بغداد',
    latitude: 33.2789,
    longitude: 44.3821,
    opening_time: '12:00',
    closing_time: '02:00',
    manager_name: 'سامر خليل',
    is_active: true
  },
  {
    id: 3,
    restaurant_id: 2,
    name_ar: 'فرع الكرادة',
    name_en: 'Karrada Branch',
    phone: '+964 780 987 6543',
    address: 'شارع الكرادة داخل، محلة 903',
    latitude: 33.3082,
    longitude: 44.4211,
    opening_time: '13:00',
    closing_time: '03:00',
    manager_name: 'عمر التميمي',
    is_active: true
  }
];

export const INITIAL_TABLES: DiningTable[] = [
  { id: 1, branch_id: 1, table_number: 'T-01', capacity: 2, status: 'available', qr_token: 'QR_TBL_MNS_01' },
  { id: 2, branch_id: 1, table_number: 'T-02', capacity: 4, status: 'occupied', qr_token: 'QR_TBL_MNS_02' },
  { id: 3, branch_id: 1, table_number: 'T-03', capacity: 4, status: 'available', qr_token: 'QR_TBL_MNS_03' },
  { id: 4, branch_id: 1, table_number: 'T-04', capacity: 6, status: 'reserved', qr_token: 'QR_TBL_MNS_04' },
  { id: 5, branch_id: 1, table_number: 'T-05', capacity: 8, status: 'available', qr_token: 'QR_TBL_MNS_05' },
  { id: 6, branch_id: 1, table_number: 'T-06 (VIP)', capacity: 6, status: 'occupied', qr_token: 'QR_TBL_MNS_06' },
  { id: 7, branch_id: 2, table_number: 'J-01', capacity: 4, status: 'available', qr_token: 'QR_TBL_JAD_01' },
  { id: 8, branch_id: 2, table_number: 'J-02', capacity: 4, status: 'available', qr_token: 'QR_TBL_JAD_02' },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, restaurant_id: 1, name_ar: 'مشويات وفاخر', name_en: 'Grills & Charcoal', slug: 'grills', icon_name: 'flame', sort_order: 1 },
  { id: 2, restaurant_id: 1, name_ar: 'وجبات رئيسية', name_en: 'Main Courses', slug: 'main-dishes', icon_name: 'utensils', sort_order: 2 },
  { id: 3, restaurant_id: 1, name_ar: 'مقبلات وسلطات', name_en: 'Appetizers & Salads', slug: 'appetizers', icon_name: 'salad', sort_order: 3 },
  { id: 4, restaurant_id: 1, name_ar: 'بيتزا وفطائر', name_en: 'Pizza & Pies', slug: 'pizza', icon_name: 'pizza', sort_order: 4 },
  { id: 5, restaurant_id: 1, name_ar: 'حلويات شرقية وغربية', name_en: 'Desserts & Sweets', slug: 'desserts', icon_name: 'cake', sort_order: 5 },
  { id: 6, restaurant_id: 1, name_ar: 'قهوة مختصة وشاي', name_en: 'Specialty Coffee & Tea', slug: 'coffee', icon_name: 'coffee', sort_order: 6 },
  { id: 7, restaurant_id: 1, name_ar: 'عصائر طازجة وكوكتيل', name_en: 'Fresh Juices & Cocktails', slug: 'juices', icon_name: 'glass-water', sort_order: 7 },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    restaurant_id: 1,
    category_id: 1,
    name_ar: 'صينية مشاوي مشكل فاخرة (سفرة VIP)',
    name_en: 'Royal Mixed Grills Feast Platter',
    description_ar: 'تشكيلة ملكية من كباب اللحم العراقي، كباب دجاج، شيش طاووق متبل، ريش لحم ضأن، مع طماطم وبصل مشوي وخبز صاج حار وصلصة الثومية.',
    description_en: 'Assortment of lamb kebab, chicken tikka, shish tawook, lamb chops with grilled vegetables, fresh flatbread and garlic sauce.',
    base_price: 28000,
    discount_price: 24500,
    image_url: '/src/assets/images/dish_mixed_grills_1790265810518.jpg',
    calories: 950,
    prep_time_minutes: 20,
    ingredients_ar: 'لحم غنم بلدي، دجاج طازج، بهارات السفرة الخاصة، صنوبر، بقدونس، خبز تنور',
    is_available: true,
    is_featured: true,
    sizes: [
      { id: 101, product_id: 1, name_ar: 'شخصين (نصف كغم)', name_en: 'For 2 (500g)', extra_price: 0, is_default: true },
      { id: 102, product_id: 1, name_ar: 'عائلي (1 كغم كامل)', name_en: 'Family (1kg)', extra_price: 22000 },
      { id: 103, product_id: 1, name_ar: 'وليمة ديوان (1.5 كغم)', name_en: 'Royal Feast (1.5kg)', extra_price: 42000 },
    ],
    addons: [
      { id: 201, product_id: 1, name_ar: 'صحن حمص بيروتي بالطحينة', name_en: 'Hummus Beirut Style', price: 4000 },
      { id: 202, product_id: 1, name_ar: 'سلطة فتوش بدبس الرمان', name_en: 'Fattoush with Pomegranate', price: 4500 },
      { id: 203, product_id: 1, name_ar: 'سيرفيس خبز حار إضافي', name_en: 'Extra Fresh Bread', price: 0, is_free: true },
    ]
  },
  {
    id: 2,
    restaurant_id: 1,
    category_id: 2,
    name_ar: 'برغر سماش مزدوج بالجبن الذائب',
    name_en: 'Double Smash Cheeseburger Deluxe',
    description_ar: 'شريحتان من لحم الأنجوس الطازج المضغوط على الصاج الساخن مع طبقات جبنة شيدر أمريكية ذائبة، بصل مكرمل وصوص السفرة السري في خبز بريوش طري.',
    description_en: 'Double Angus beef patties, melted sharp cheddar, caramelized onions, crisp pickles and secret house glaze on toasted brioche.',
    base_price: 14000,
    image_url: '/src/assets/images/dish_gourmet_burger_1790265822964.jpg',
    calories: 820,
    prep_time_minutes: 12,
    ingredients_ar: 'لحم بقري أنجوس 100%، جبنة شيدر معتقة، بصل مكرمل، خبز بريوش بالزبدة، خس، صوص خاص',
    is_available: true,
    is_featured: true,
    sizes: [
      { id: 104, product_id: 2, name_ar: 'شريحة واحدة (Single)', name_en: 'Single 150g', extra_price: -3000 },
      { id: 105, product_id: 2, name_ar: 'شريحتان (Double)', name_en: 'Double 300g', extra_price: 0, is_default: true },
      { id: 106, product_id: 2, name_ar: 'ثلاث شرائح (Triple)', name_en: 'Triple 450g', extra_price: 4500 },
    ],
    addons: [
      { id: 204, product_id: 2, name_ar: 'جبنة شيدر إضافية ذائبة', name_en: 'Extra Melted Cheddar', price: 2000 },
      { id: 205, product_id: 2, name_ar: 'بطاطا ودجز مقرمشة مبهرة', name_en: 'Seasoned Potato Wedges', price: 3000 },
      { id: 206, product_id: 2, name_ar: 'هالبينو وصوص حار', name_en: 'Jalapeno & Spicy Glaze', price: 1500 },
    ]
  },
  {
    id: 3,
    restaurant_id: 1,
    category_id: 4,
    name_ar: 'بيتزا مارغريتا نابولي الحطبية',
    name_en: 'Authentic Neapolitan Margherita Pizza',
    description_ar: 'عجينة مخمرة 48 ساعة ومخبوزة بفرن الحطب بدرجة حرارة 450، مغطاة بجبنة الموزاريلا الطازجة وريحان إيطالي مع زيت زيتون بكر ممتاز.',
    description_en: '48-hour fermented dough, San Marzano tomato sauce, fresh buffalo mozzarella, fragrant basil leaves and extra virgin olive oil.',
    base_price: 16000,
    image_url: '/src/assets/images/dish_artisan_pizza_1790265834441.jpg',
    calories: 710,
    prep_time_minutes: 10,
    ingredients_ar: 'طحين إيطالي كابوتو، طماطم سان مارزانو، جبنة موزاريلا طازجة، ريحان، زيت زيتون',
    is_available: true,
    is_featured: true,
    sizes: [
      { id: 107, product_id: 3, name_ar: 'متوسطة (10 إنش)', name_en: 'Medium (10")', extra_price: 0, is_default: true },
      { id: 108, product_id: 3, name_ar: 'كبيرة (14 إنش)', name_en: 'Large (14")', extra_price: 5000 },
    ],
    addons: [
      { id: 207, product_id: 3, name_ar: 'بيبروني إيطالي فاخر', name_en: 'Italian Beef Pepperoni', price: 3500 },
      { id: 208, product_id: 3, name_ar: 'مشروم طازج وزيتون كالاماتا', name_en: 'Fresh Mushroom & Olives', price: 2500 },
    ]
  },
  {
    id: 4,
    restaurant_id: 1,
    category_id: 6,
    name_ar: 'كابتشينو إيطالي بقهوة إثيوبية مختصة',
    name_en: 'Specialty Ethiopian Cappuccino',
    description_ar: 'إسبريسو غني مستخلص من حبوب إثيوبيا يرغاتشيفي مع حليب مبخر مخملي ورسمة لاتي آرت أنيقة.',
    description_en: 'Rich double espresso from Ethiopian single origin beans, velvety microfoam and artisanal rosetta art.',
    base_price: 6000,
    image_url: '/src/assets/images/dish_specialty_coffee_1790265843929.jpg',
    calories: 140,
    prep_time_minutes: 5,
    ingredients_ar: 'بن إثيوبي مختص 100% أرابيكا، حليب طازج كامل الدسم',
    is_available: true,
    is_featured: false,
    sizes: [
      { id: 109, product_id: 4, name_ar: 'عادي (Regular 8oz)', name_en: 'Regular (8oz)', extra_price: 0, is_default: true },
      { id: 110, product_id: 4, name_ar: 'كبير (Large 12oz)', name_en: 'Large (12oz)', extra_price: 1500 },
    ],
    addons: [
      { id: 209, product_id: 4, name_ar: 'حليب شوفان عضوي (Oat Milk)', name_en: 'Oat Milk Alternative', price: 1500 },
      { id: 210, product_id: 4, name_ar: 'سيروب فانيلا أو كراميل مملح', name_en: 'Vanilla / Salted Caramel', price: 1000 },
    ]
  },
  {
    id: 5,
    restaurant_id: 1,
    category_id: 3,
    name_ar: 'مقبلات مشكلة (حمص ومتبل وبابا غنوج)',
    name_en: 'Trio Mezze Platter',
    description_ar: 'ثلاثية من الحمص الناعم مع حبوب الصنوبر، ومتبل الباذنجان المدخن، وبابا غنوج مع زيت الزيتون وخبز الصاج.',
    description_en: 'Silky smooth hummus with pine nuts, smoked mutabbal, and baba ghanoush drizzled with cold pressed olive oil.',
    base_price: 9000,
    image_url: '/src/assets/images/dish_mixed_grills_1790265810518.jpg',
    calories: 380,
    prep_time_minutes: 8,
    is_available: true,
    is_featured: false,
    sizes: [],
    addons: []
  },
  {
    id: 6,
    restaurant_id: 1,
    category_id: 7,
    name_ar: 'عصير برتقال وجزر طازج معصور',
    name_en: 'Fresh Cold Pressed Orange & Carrot',
    description_ar: 'عصير نقي 100% بدون أي إضافات سكر، معصور بارد للمحافظة على الفيتامينات والانتعاش.',
    description_en: '100% freshly pressed Valencia oranges and organic sweet carrots, chilled to perfection.',
    base_price: 5000,
    image_url: '/src/assets/images/dish_specialty_coffee_1790265843929.jpg',
    calories: 120,
    prep_time_minutes: 4,
    is_available: true,
    is_featured: false,
    sizes: [],
    addons: []
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 1,
    order_number: 'ORD-2609-801',
    restaurant_id: 1,
    branch_id: 1,
    branch_name: 'فرع المنصور (الرئيسي)',
    table_id: 2,
    table_number: 'T-02',
    order_type: 'dine_in',
    status: 'preparing',
    subtotal: 38500,
    tax_amount: 3850,
    discount_amount: 0,
    delivery_fee: 0,
    total_amount: 42350,
    customer_name: 'زيد الجبوري',
    customer_phone: '+964 770 443 2110',
    notes: 'اللحم نضج متوسط مع خبز ساخن جداً',
    payment_method: 'zaincash',
    payment_status: 'completed',
    created_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-1',
        product_id: 1,
        product_name: 'صينية مشاوي مشكل فاخرة (سفرة VIP)',
        unit_price: 24500,
        quantity: 1,
        subtotal: 24500,
        selected_size: { id: 101, product_id: 1, name_ar: 'شخصين', name_en: 'For 2', extra_price: 0 },
        selected_addons: [{ id: 201, product_id: 1, name_ar: 'صحن حمص بيروتي بالطحينة', name_en: 'Hummus', price: 4000 }]
      },
      {
        id: 'item-2',
        product_id: 2,
        product_name: 'برغر سماش مزدوج بالجبن الذائب',
        unit_price: 14000,
        quantity: 1,
        subtotal: 14000
      }
    ]
  },
  {
    id: 2,
    order_number: 'ORD-2609-802',
    restaurant_id: 1,
    branch_id: 1,
    branch_name: 'فرع المنصور (الرئيسي)',
    order_type: 'delivery',
    status: 'out_for_delivery',
    subtotal: 32000,
    tax_amount: 3200,
    discount_amount: 3000,
    delivery_fee: 4000,
    total_amount: 36200,
    customer_name: 'ميس الهاشمي',
    customer_phone: '+964 781 223 9988',
    delivery_address: 'حي الجامعة، زقاق 24، دار 18، بغداد',
    delivery_coords: { lat: 33.328, lng: 44.332 },
    payment_method: 'qicard',
    payment_status: 'completed',
    created_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-3',
        product_id: 3,
        product_name: 'بيتزا مارغريتا نابولي الحطبية',
        unit_price: 21000,
        quantity: 1,
        subtotal: 21000,
        selected_size: { id: 108, product_id: 3, name_ar: 'كبيرة (14 إنش)', name_en: 'Large', extra_price: 5000 }
      },
      {
        id: 'item-4',
        product_id: 6,
        product_name: 'عصير برتقال وجزر طازج معصور',
        unit_price: 5000,
        quantity: 2,
        subtotal: 10000
      }
    ]
  },
  {
    id: 3,
    order_number: 'ORD-2609-803',
    restaurant_id: 1,
    branch_id: 1,
    branch_name: 'فرع المنصور (الرئيسي)',
    table_id: 6,
    table_number: 'T-06 (VIP)',
    order_type: 'dine_in',
    status: 'new',
    subtotal: 54000,
    tax_amount: 5400,
    discount_amount: 0,
    delivery_fee: 0,
    total_amount: 59400,
    customer_name: 'د. خالد المعموري',
    customer_phone: '+964 771 990 1200',
    notes: 'طلب ضيافة VIP',
    payment_method: 'cash',
    payment_status: 'pending',
    created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'item-5',
        product_id: 1,
        product_name: 'صينية مشاوي مشكل فاخرة (سفرة VIP)',
        unit_price: 46500,
        quantity: 1,
        subtotal: 46500,
        selected_size: { id: 102, product_id: 1, name_ar: 'عائلي (1 كغم كامل)', name_en: 'Family 1kg', extra_price: 22000 }
      },
      {
        id: 'item-6',
        product_id: 4,
        product_name: 'كابتشينو إيطالي بقهوة إثيوبية مختصة',
        unit_price: 6000,
        quantity: 2,
        subtotal: 12000
      }
    ]
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 1,
    restaurant_id: 1,
    branch_id: 1,
    branch_name: 'فرع المنصور (الرئيسي)',
    customer_name: 'المهندس مصطفى البياتي',
    customer_phone: '+964 772 334 1122',
    guest_count: 5,
    reservation_date: '2026-09-25',
    reservation_time: '20:30',
    special_requests: 'طاولة هادئة عائلية للاحتفال بيوم ميلاد',
    status: 'confirmed',
    created_at: '2026-09-24 10:15'
  },
  {
    id: 2,
    restaurant_id: 1,
    branch_id: 1,
    branch_name: 'فرع المنصور (الرئيسي)',
    customer_name: 'سارة الكرخي',
    customer_phone: '+964 780 445 9911',
    guest_count: 2,
    reservation_date: '2026-09-25',
    reservation_time: '19:00',
    special_requests: 'قرب النافذة المطلة',
    status: 'pending',
    created_at: '2026-09-24 11:40'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 1,
    restaurant_id: 1,
    customer_name: 'حيدر الزيدي',
    rating: 5,
    comment: 'المشاوي رائعة جداً والخدمة سريعة بالرغم من الزحام. مسح الكود والطلب من الطاولة وفر علينا وقت كبير!',
    created_at: '2026-09-23',
    is_approved: true
  },
  {
    id: 2,
    restaurant_id: 1,
    customer_name: 'نور الدين قاسم',
    rating: 5,
    comment: 'البرغر خيالي والخبز بريوش طري. تجربة رقمية استثنائية ونظام الدفع بـ زين كاش فوري وسلس.',
    created_at: '2026-09-22',
    is_approved: true
  },
  {
    id: 3,
    restaurant_id: 1,
    customer_name: 'فاطمة العزاوي',
    rating: 4,
    comment: 'القهوة المختصة ممتازة جداً وتنسيق المنيو الإلكتروني في الهاتف مريح وواضح.',
    created_at: '2026-09-20',
    is_approved: true
  }
];

export const SAAS_PLANS: Plan[] = [
  {
    id: 1,
    name_ar: 'الباقة المجانية (Starter)',
    name_en: 'Free Starter Plan',
    slug: 'free',
    price_monthly: 0,
    price_yearly: 0,
    currency: 'USD',
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
    price_monthly: 49,
    price_yearly: 490,
    currency: 'USD',
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
    price_monthly: 119,
    price_yearly: 1190,
    currency: 'USD',
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

export const INITIAL_COUPONS: Coupon[] = [
  { id: 1, code: 'SUFRAH10', discount_type: 'percentage', discount_value: 10, min_order_amount: 15000, is_active: true },
  { id: 2, code: 'WELCOME5K', discount_type: 'fixed', discount_value: 5000, min_order_amount: 25000, is_active: true },
  { id: 3, code: 'VIP2026', discount_type: 'percentage', discount_value: 15, min_order_amount: 30000, is_active: true }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  { id: 1, user_name: 'أحمد السامرائي (Manager)', role: 'branch_manager', action: 'Update Table Status', description: 'تغيير حالة طاولة T-02 إلى مشغولة وتأكيد طلب #801', timestamp: 'منذ 14 دقيقة' },
  { id: 2, user_name: 'الكاشير علاء', role: 'cashier', action: 'POS Sale Completed', description: 'إصدار فاتورة نقدية رقم ORD-2609-803 بقيمة 59,400 د.ع', timestamp: 'منذ 3 دقائق' },
  { id: 3, user_name: 'الشيف كريم (Kitchen)', role: 'kitchen', action: 'Ticket Bumped', description: 'تجهيز صينية المشاوي لطلب رقم #801 ونقل الحالة إلى جاهز', timestamp: 'منذ دقيقة واحدة' },
  { id: 4, user_name: 'المندوب عادل (Driver)', role: 'driver', action: 'GPS Location Update', description: 'انطلاق نحو زبون حي الجامعة لتوصيل طلب #802', timestamp: 'الآن' },
];
