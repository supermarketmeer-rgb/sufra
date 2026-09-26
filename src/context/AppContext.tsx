import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Restaurant,
  Branch,
  DiningTable,
  Category,
  Product,
  Order,
  OrderStatus,
  Reservation,
  Review,
  Plan,
  Coupon,
  ActivityLog,
  OrderItem,
  OrderType
} from '../types';
import {
  INITIAL_RESTAURANTS,
  INITIAL_BRANCHES,
  INITIAL_TABLES,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_RESERVATIONS,
  INITIAL_REVIEWS,
  SAAS_PLANS,
  INITIAL_COUPONS,
  INITIAL_ACTIVITY_LOGS
} from '../data/initialData';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeRestaurant: Restaurant;
  setActiveRestaurant: (restaurant: Restaurant) => void;
  activeBranch: Branch;
  setActiveBranch: (branch: Branch) => void;
  restaurants: Restaurant[];
  branches: Branch[];
  tables: DiningTable[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  reservations: Reservation[];
  reviews: Review[];
  plans: Plan[];
  coupons: Coupon[];
  activityLogs: ActivityLog[];
  
  // Actions
  createOrder: (orderData: Partial<Order> & { items: OrderItem[] }) => Order;
  updateOrderStatus: (orderId: number, newStatus: OrderStatus) => void;
  updateTableStatus: (tableId: number, status: 'available' | 'occupied' | 'reserved') => void;
  addProduct: (productData: Partial<Product>) => void;
  updateProduct: (productId: number, updates: Partial<Product>) => void;
  deleteProduct: (productId: number) => void;
  addCategory: (categoryData: Partial<Category>) => void;
  updateCategory: (categoryId: number, updates: Partial<Category>) => void;
  deleteCategory: (categoryId: number) => void;
  addBranch: (branchData: Partial<Branch>) => void;
  addReservation: (res: Partial<Reservation>) => void;
  updateReservationStatus: (resId: number, status: 'pending' | 'confirmed' | 'cancelled') => void;
  addReview: (review: Partial<Review>) => void;
  createRestaurant: (data: Partial<Restaurant>) => Restaurant;
  applyCoupon: (code: string, currentTotal: number) => { success: boolean; discount: number; message: string };
  playNotificationSound: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  updateRestaurantWhatsApp: (whatsapp: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role')?.toLowerCase();
      if (roleParam === 'super_admin' || roleParam === 'admin' || roleParam === 'superadmin') return 'super_admin';
      if (roleParam === 'owner' || roleParam === 'restaurant_owner') return 'restaurant_owner';
      if (roleParam === 'branch_manager' || roleParam === 'manager') return 'branch_manager';
      if (roleParam === 'cashier' || roleParam === 'pos') return 'cashier';
      if (roleParam === 'kitchen' || roleParam === 'kds') return 'kitchen';
      if (roleParam === 'driver') return 'driver';
      if (roleParam === 'customer') return 'customer';
    }
    return 'customer';
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('sufrah_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    localStorage.setItem('sufrah_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant>(INITIAL_RESTAURANTS[0]);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activeBranch, setActiveBranch] = useState<Branch>(INITIAL_BRANCHES[0]);
  const [tables, setTables] = useState<DiningTable[]>(INITIAL_TABLES);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [plans] = useState<Plan[]>(SAAS_PLANS);
  const [coupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  // Synthesize notification chime using Web Audio API (completely hermetic, no network dependency)
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext might be blocked until user gesture, safely ignore
    }
  };

  const createOrder = (orderData: Partial<Order> & { items: OrderItem[] }): Order => {
    const nextId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
    const orderNum = `ORD-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const subtotal = orderData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxRate = activeRestaurant.tax_percentage || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const deliveryFee = orderData.order_type === 'delivery' ? (orderData.delivery_fee || activeRestaurant.delivery_fee_base) : 0;
    const discountAmount = orderData.discount_amount || 0;
    const totalAmount = Math.max(0, subtotal + taxAmount + deliveryFee - discountAmount);

    const newOrder: Order = {
      id: nextId,
      order_number: orderNum,
      restaurant_id: activeRestaurant.id,
      branch_id: activeBranch.id,
      branch_name: activeBranch.name_ar,
      table_id: orderData.table_id,
      table_number: orderData.table_number,
      order_type: orderData.order_type || 'dine_in',
      status: 'new',
      subtotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      customer_name: orderData.customer_name || 'زبون زائر',
      customer_phone: orderData.customer_phone || '',
      delivery_address: orderData.delivery_address,
      delivery_coords: orderData.delivery_coords || { lat: 33.315 + (Math.random() - 0.5) * 0.02, lng: 44.354 + (Math.random() - 0.5) * 0.02 },
      notes: orderData.notes,
      payment_method: orderData.payment_method || 'cash',
      payment_status: orderData.payment_status || 'completed',
      created_at: new Date().toISOString(),
      items: orderData.items
    };

    setOrders(prev => [newOrder, ...prev]);

    // If dine-in and table specified, mark table occupied
    if (orderData.table_id) {
      updateTableStatus(orderData.table_id, 'occupied');
    }

    // Add activity log
    const log: ActivityLog = {
      id: Date.now(),
      user_name: orderData.customer_name || 'Customer',
      role: currentRole,
      action: 'New Order Placed',
      description: `طلب جديد رقم #${orderNum} بقيمة ${totalAmount.toLocaleString()} د.ع`,
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);

    playNotificationSound();
    return newOrder;
  };

  const updateOrderStatus = (orderId: number, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder && targetOrder.table_id && (newStatus === 'completed' || newStatus === 'cancelled')) {
      updateTableStatus(targetOrder.table_id, 'available');
    }

    const log: ActivityLog = {
      id: Date.now(),
      user_name: 'نظام المطبخ والخدمة',
      role: currentRole,
      action: `Status: ${newStatus}`,
      description: `تحديث حالة طلب #${orderId} إلى: ${newStatus}`,
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);
  };

  const updateTableStatus = (tableId: number, status: 'available' | 'occupied' | 'reserved') => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
  };

  const addProduct = (productData: Partial<Product>) => {
    const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProd: Product = {
      id: nextId,
      restaurant_id: activeRestaurant.id,
      category_id: productData.category_id || categories[0].id,
      name_ar: productData.name_ar || 'صنف جديد',
      name_en: productData.name_en || 'New Dish',
      description_ar: productData.description_ar || '',
      description_en: productData.description_en || '',
      base_price: productData.base_price || 10000,
      discount_price: productData.discount_price,
      image_url: productData.image_url || '/src/assets/images/dish_gourmet_burger_1790265822964.jpg',
      calories: productData.calories || 450,
      prep_time_minutes: productData.prep_time_minutes || 15,
      ingredients_ar: productData.ingredients_ar || '',
      is_available: true,
      is_featured: false,
      sizes: productData.sizes || [],
      addons: productData.addons || []
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = (productId: number, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
  };

  const deleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const addCategory = (categoryData: Partial<Category>) => {
    const nextId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    const newCat: Category = {
      id: nextId,
      restaurant_id: activeRestaurant.id,
      name_ar: categoryData.name_ar || 'قسم جديد',
      name_en: categoryData.name_en || 'New Category',
      slug: (categoryData.slug || categoryData.name_ar || 'category').toLowerCase().trim().replace(/[\s_]+/g, '-'),
      icon_name: categoryData.icon_name || 'utensils',
      sort_order: categories.length + 1
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (categoryId: number, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, ...updates } : c));
  };

  const deleteCategory = (categoryId: number) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
  };

  const addBranch = (branchData: Partial<Branch>) => {
    const nextId = branches.length > 0 ? Math.max(...branches.map(b => b.id)) + 1 : 1;
    const newBranch: Branch = {
      id: nextId,
      restaurant_id: activeRestaurant.id,
      name_ar: branchData.name_ar || 'فرع جديد',
      name_en: branchData.name_en || 'New Branch',
      phone: branchData.phone || '+964 770 000 0000',
      address: branchData.address || 'العنوان',
      latitude: branchData.latitude || 33.315,
      longitude: branchData.longitude || 44.354,
      opening_time: branchData.opening_time || '10:00',
      closing_time: branchData.closing_time || '00:00',
      manager_name: branchData.manager_name || 'مدير الفرع',
      is_active: true
    };
    setBranches(prev => [...prev, newBranch]);
  };

  const addReservation = (res: Partial<Reservation>) => {
    const nextId = reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1;
    const newRes: Reservation = {
      id: nextId,
      restaurant_id: activeRestaurant.id,
      branch_id: activeBranch.id,
      branch_name: activeBranch.name_ar,
      customer_name: res.customer_name || 'ضيف جديد',
      customer_phone: res.customer_phone || '',
      guest_count: res.guest_count || 2,
      reservation_date: res.reservation_date || new Date().toISOString().slice(0, 10),
      reservation_time: res.reservation_time || '20:00',
      special_requests: res.special_requests,
      status: 'pending',
      created_at: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    setReservations(prev => [newRes, ...prev]);
    playNotificationSound();
  };

  const updateReservationStatus = (resId: number, status: 'pending' | 'confirmed' | 'cancelled') => {
    setReservations(prev => prev.map(r => r.id === resId ? { ...r, status } : r));
  };

  const addReview = (review: Partial<Review>) => {
    const nextId = reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1;
    const newRev: Review = {
      id: nextId,
      restaurant_id: activeRestaurant.id,
      customer_name: review.customer_name || 'زبون السفرة',
      rating: review.rating || 5,
      comment: review.comment || 'طعام لذيذ وخدمة ممتازة',
      created_at: new Date().toISOString().slice(0, 10),
      is_approved: true
    };
    setReviews(prev => [newRev, ...prev]);
  };

  const createRestaurant = (data: Partial<Restaurant>): Restaurant => {
    const nextId = restaurants.length > 0 ? Math.max(...restaurants.map(r => r.id)) + 1 : 1;
    const slug = data.slug || `restaurant-${nextId}`;
    const newRest: Restaurant = {
      id: nextId,
      name_ar: data.name_ar || 'مطعم جديد',
      name_en: data.name_en || 'New Restaurant',
      slug,
      custom_domain: data.custom_domain,
      logo_url: data.logo_url || '/src/assets/images/dish_mixed_grills_1790265810518.jpg',
      cover_url: data.cover_url || '/src/assets/images/dish_gourmet_burger_1790265822964.jpg',
      description_ar: data.description_ar || 'مطعم ومقهى عصري',
      phone: data.phone || '+964 770 000 0000',
      email: data.email || `info@${slug}.com`,
      address: data.address || 'بغداد، العراق',
      currency: data.currency || 'IQD',
      tax_percentage: data.tax_percentage || 10,
      status: 'active',
      created_at: new Date().toISOString().slice(0, 10),
      theme_primary_color: data.theme_primary_color || '#f59e0b',
      plan_name: data.plan_name || 'الباقة الاحترافية (Pro)',
      delivery_fee_base: data.delivery_fee_base || 3000,
      whatsapp_number: data.whatsapp_number
    };

    setRestaurants(prev => [...prev, newRest]);
    setActiveRestaurant(newRest);
    return newRest;
  };

  const applyCoupon = (code: string, currentTotal: number) => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase() && c.is_active);
    if (!coupon) {
      return { success: false, discount: 0, message: 'كود الخصم غير صالح أو منتهي الصلاحية' };
    }
    if (currentTotal < coupon.min_order_amount) {
      return {
        success: false,
        discount: 0,
        message: `الحد الأدنى لتطبيق هذا الكوبون هو ${coupon.min_order_amount.toLocaleString()} د.ع`
      };
    }

    const discount = coupon.discount_type === 'percentage'
      ? (currentTotal * coupon.discount_value) / 100
      : coupon.discount_value;

    return {
      success: true,
      discount,
      message: `تم تطبيق خصم بقيمة ${discount.toLocaleString()} د.ع بنجاح!`
    };
  };

  const updateRestaurantWhatsApp = (whatsapp: string) => {
    setActiveRestaurant(prev => ({
      ...prev,
      whatsapp_number: whatsapp
    }));
    setRestaurants(prev => prev.map(r => r.id === activeRestaurant.id ? { ...r, whatsapp_number: whatsapp } : r));
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeRestaurant,
        setActiveRestaurant,
        activeBranch,
        setActiveBranch,
        restaurants,
        branches,
        tables,
        categories,
        products,
        orders,
        reservations,
        reviews,
        plans,
        coupons,
        activityLogs,
        createOrder,
        updateOrderStatus,
        updateTableStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addBranch,
        addReservation,
        updateReservationStatus,
        addReview,
        createRestaurant,
        applyCoupon,
        playNotificationSound,
        theme,
        toggleTheme,
        updateRestaurantWhatsApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
