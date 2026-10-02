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
  OrderItem
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
import { api } from '../services/api';

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage`, e);
  }
  return fallback;
};

const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
};

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeRestaurant: Restaurant | null;
  setActiveRestaurant: (restaurant: Restaurant | null) => void;
  activeBranch: Branch | null;
  setActiveBranch: (branch: Branch | null) => void;
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
  addTable: (tableData: Partial<DiningTable>) => { success: boolean; message: string; table?: DiningTable };
  updateTable: (tableId: number, updates: Partial<DiningTable>) => void;
  deleteTable: (tableId: number) => { success: boolean; message: string };
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
  updatePlan: (planId: number, updates: Partial<Plan>) => void;
  activateRestaurantPlan: (code: string, restaurantId?: number) => { success: boolean; message: string; planName?: string };
  updateRestaurantBranding: (restaurantId: number, updates: Partial<Restaurant>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() =>
    loadFromStorage('sufrah_v2_restaurants', INITIAL_RESTAURANTS)
  );

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
      if (roleParam === 'customer' || params.has('table') || params.has('restaurant')) return 'customer';
    }
    const initialRests = loadFromStorage<Restaurant[]>('sufrah_v2_restaurants', INITIAL_RESTAURANTS);
    return initialRests.length === 0 ? 'super_admin' : 'customer';
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

  const [branches, setBranches] = useState<Branch[]>(() =>
    loadFromStorage('sufrah_v2_branches', INITIAL_BRANCHES)
  );

  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(() => {
    const list = loadFromStorage<Restaurant[]>('sufrah_v2_restaurants', INITIAL_RESTAURANTS);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const restParam = params.get('restaurant');
      if (restParam && list.length > 0) {
        const found = list.find(r => String(r.id) === restParam || r.slug === restParam.toLowerCase());
        if (found) return found;
      }
      const savedActiveId = localStorage.getItem('sufrah_v2_active_restaurant_id');
      if (savedActiveId && list.length > 0) {
        const found = list.find(r => r.id === Number(savedActiveId));
        if (found) return found;
      }
    }
    return list.length > 0 ? list[0] : null;
  });

  const [activeBranch, setActiveBranch] = useState<Branch | null>(() => {
    const list = loadFromStorage<Branch[]>('sufrah_v2_branches', INITIAL_BRANCHES);
    return list.length > 0 ? list[0] : null;
  });

  const [tables, setTables] = useState<DiningTable[]>(() =>
    loadFromStorage('sufrah_v2_tables', INITIAL_TABLES)
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    loadFromStorage('sufrah_v2_categories', INITIAL_CATEGORIES)
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadFromStorage('sufrah_v2_products', INITIAL_PRODUCTS)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage('sufrah_v2_orders', INITIAL_ORDERS)
  );
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    loadFromStorage('sufrah_v2_reservations', INITIAL_RESERVATIONS)
  );
  const [reviews, setReviews] = useState<Review[]>(() =>
    loadFromStorage('sufrah_v2_reviews', INITIAL_REVIEWS)
  );
  const [plans, setPlans] = useState<Plan[]>(() =>
    loadFromStorage('sufrah_v2_plans', SAAS_PLANS)
  );
  const [coupons, setCoupons] = useState<Coupon[]>(() =>
    loadFromStorage('sufrah_v2_coupons', INITIAL_COUPONS)
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    loadFromStorage('sufrah_v2_activity_logs', INITIAL_ACTIVITY_LOGS)
  );

  // Web Audio Chime for live incoming orders
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

  // -----------------------------------------------------------------
  // Live Cloud Synchronization with Railway MySQL & Real-time SSE
  // -----------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    // 1. Initial Bootstrap Fetch from Cloud API
    api.fetchBootstrapData().then(data => {
      if (!isMounted || !data) return;

      if (data.restaurants.length > 0) {
        setRestaurants(data.restaurants);
        setActiveRestaurant(prev => {
          if (!prev) return data.restaurants[0];
          const matched = data.restaurants.find(r => r.id === prev.id);
          return matched || data.restaurants[0];
        });
      }
      if (data.branches.length > 0) {
        setBranches(data.branches);
        setActiveBranch(prev => {
          if (!prev) return data.branches[0];
          const matched = data.branches.find(b => b.id === prev.id);
          return matched || data.branches[0];
        });
      }
      if (data.tables.length > 0) setTables(data.tables);
      if (data.categories.length > 0) setCategories(data.categories);
      if (data.products.length > 0) setProducts(data.products);
      if (data.orders.length > 0) setOrders(data.orders);
      if (data.reservations.length > 0) setReservations(data.reservations);
      if (data.reviews.length > 0) setReviews(data.reviews);
      if (data.coupons.length > 0) setCoupons(data.coupons);
      if (data.plans.length > 0) setPlans(data.plans);
      if (data.activityLogs.length > 0) setActivityLogs(data.activityLogs);
    });

    // 2. Real-Time SSE Listener across all devices
    const unsubscribe = api.subscribeToEvents((type, payload) => {
      if (!isMounted) return;

      if (type === 'new_order') {
        setOrders(prev => {
          if (prev.some(o => o.id === payload.id || o.order_number === payload.order_number)) {
            return prev;
          }
          playNotificationSound();
          return [payload, ...prev];
        });
      } else if (type === 'order_status_updated') {
        setOrders(prev => prev.map(o => o.id === payload.id ? { ...o, status: payload.status } : o));
      } else if (type === 'table_updated') {
        setTables(prev => prev.map(t => t.id === payload.id ? { ...t, status: payload.status } : t));
      } else if (type === 'table_created') {
        setTables(prev => prev.some(t => t.id === payload.id) ? prev : [...prev, payload]);
      } else if (type === 'table_deleted') {
        setTables(prev => prev.filter(t => t.id !== payload.id));
      } else if (type === 'product_created') {
        setProducts(prev => prev.some(p => p.id === payload.id) ? prev : [...prev, payload]);
      } else if (type === 'product_updated') {
        setProducts(prev => prev.map(p => p.id === payload.id ? { ...p, ...payload } : p));
      } else if (type === 'product_deleted') {
        setProducts(prev => prev.filter(p => p.id !== payload.id));
      } else if (type === 'category_created') {
        setCategories(prev => prev.some(c => c.id === payload.id) ? prev : [...prev, payload]);
      } else if (type === 'category_deleted') {
        setCategories(prev => prev.filter(c => c.id !== payload.id));
      } else if (type === 'restaurant_created') {
        setRestaurants(prev => prev.some(r => r.id === payload.id) ? prev : [...prev, payload]);
      } else if (type === 'plan_activated') {
        setActiveRestaurant(prev => prev && prev.id === payload.restaurant_id ? { ...prev, plan_name: payload.planName } : prev);
        setRestaurants(prev => prev.map(r => r.id === payload.restaurant_id ? { ...r, plan_name: payload.planName } : r));
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sync state to localStorage for offline cache
  useEffect(() => {
    localStorage.setItem('sufrah_v2_plans', JSON.stringify(plans));
  }, [plans]);

  useEffect(() => {
    localStorage.setItem('sufrah_v2_restaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem('sufrah_v2_branches', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('sufrah_v2_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('sufrah_v2_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('sufrah_v2_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sufrah_v2_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sufrah_v2_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('sufrah_v2_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('sufrah_v2_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('sufrah_v2_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  const handleSetActiveRestaurant = (restaurant: Restaurant | null) => {
    setActiveRestaurant(restaurant);
    if (restaurant) {
      localStorage.setItem('sufrah_v2_active_restaurant_id', String(restaurant.id));
      const restBranch = branches.find(b => b.restaurant_id === restaurant.id);
      if (restBranch) {
        setActiveBranch(restBranch);
      }
    } else {
      localStorage.removeItem('sufrah_v2_active_restaurant_id');
    }
  };

  const createOrder = (orderData: Partial<Order> & { items: OrderItem[] }): Order => {
    const nextId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
    const orderNum = `ORD-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const subtotal = orderData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxRate = activeRestaurant?.tax_percentage || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const deliveryFee = orderData.order_type === 'delivery' ? (orderData.delivery_fee || activeRestaurant?.delivery_fee_base || 0) : 0;
    const discountAmount = orderData.discount_amount || 0;
    const totalAmount = Math.max(0, subtotal + taxAmount + deliveryFee - discountAmount);

    const newOrder: Order = {
      id: nextId,
      order_number: orderNum,
      restaurant_id: activeRestaurant ? activeRestaurant.id : 1,
      branch_id: activeBranch ? activeBranch.id : 1,
      branch_name: activeBranch ? activeBranch.name_ar : 'الفرع الرئيسي',
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

    // Optimistic local update
    setOrders(prev => [newOrder, ...prev]);

    if (orderData.table_id) {
      updateTableStatus(orderData.table_id, 'occupied');
    }

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

    // Async Cloud API persist & SSE broadcast
    api.createOrder(newOrder).catch(err => {
      console.warn('Order cloud sync delayed:', err);
    });

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

    // Cloud API call
    api.updateOrderStatus(orderId, newStatus).catch(console.error);
  };

  const updateTableStatus = (tableId: number, status: 'available' | 'occupied' | 'reserved') => {
    setTables(prev => {
      const next = prev.map(t => (t.id === tableId ? { ...t, status } : t));
      saveToStorage('sufrah_v2_tables', next);
      return next;
    });

    api.updateTableStatus(tableId, status).catch(console.error);
  };

  const getRestaurantMaxTables = (restaurantId: number): number => {
    const rest = restaurants.find(r => r.id === restaurantId);
    if (!rest) return 10;
    const plan = plans.find(p => p.name_ar === rest.plan_name || rest.plan_name.includes(p.name_en));
    if (plan) return plan.max_tables;
    if (rest.plan_name.includes('Starter') || rest.plan_name.includes('مجانية')) return 10;
    if (rest.plan_name.includes('Pro') || rest.plan_name.includes('احترافية')) return 60;
    if (rest.plan_name.includes('Enterprise') || rest.plan_name.includes('مؤسسية')) return 1000;
    return 10;
  };

  const addTable = (tableData: Partial<DiningTable>): { success: boolean; message: string; table?: DiningTable } => {
    if (!activeRestaurant) return { success: false, message: 'لا يوجد مطعم نشط' };

    const restBranches = branches.filter(b => b.restaurant_id === activeRestaurant.id);
    const targetBranchId = tableData.branch_id || (restBranches[0]?.id || 1);
    const restBranchIds = restBranches.map(b => b.id);

    const currentTables = tables.filter(t => restBranchIds.includes(t.branch_id));
    const maxAllowed = getRestaurantMaxTables(activeRestaurant.id);

    if (currentTables.length >= maxAllowed) {
      return {
        success: false,
        message: `لقد وصلت للحد الأقصى لعدد الطاولات المسموح به (${maxAllowed} طاولات) في باقتك الحالية (${activeRestaurant.plan_name}). يرجى ترقية الباقة لزيادة عدد الطاولات.`
      };
    }

    const nextId = tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1;
    const cleanNum = tableData.table_number?.trim() || `T-${String(currentTables.length + 1).padStart(2, '0')}`;

    if (currentTables.some(t => t.table_number.toLowerCase() === cleanNum.toLowerCase())) {
      return {
        success: false,
        message: `رقم الطاولة (${cleanNum}) مسجل مسبقاً، يرجى كتابة رقم مختلف.`
      };
    }

    const newTable: DiningTable = {
      id: nextId,
      branch_id: targetBranchId,
      table_number: cleanNum,
      capacity: Number(tableData.capacity) || 4,
      status: tableData.status || 'available',
      qr_token: `qr_${activeRestaurant.slug}_${cleanNum.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    };

    const next = [...tables, newTable];
    setTables(next);
    saveToStorage('sufrah_v2_tables', next);

    const log: ActivityLog = {
      id: Date.now(),
      user_name: activeRestaurant.name_ar,
      role: 'restaurant_owner',
      action: 'Table Created',
      description: `تمت إضافة طاولة جديدة (${cleanNum}) بسعة ${newTable.capacity} أشخاص`,
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);

    api.addTable(newTable).catch(console.error);

    return {
      success: true,
      message: `تمت إضافة الطاولة (${cleanNum}) بنجاح!`,
      table: newTable
    };
  };

  const updateTable = (tableId: number, updates: Partial<DiningTable>) => {
    setTables(prev => {
      const next = prev.map(t => (t.id === tableId ? { ...t, ...updates } : t));
      saveToStorage('sufrah_v2_tables', next);
      return next;
    });

    const target = tables.find(t => t.id === tableId);
    if (target && activeRestaurant) {
      const log: ActivityLog = {
        id: Date.now(),
        user_name: activeRestaurant.name_ar,
        role: 'restaurant_owner',
        action: 'Table Updated',
        description: `تم تعديل بيانات الطاولة (${target.table_number})`,
        timestamp: 'الآن'
      };
      setActivityLogs(prev => [log, ...prev]);
    }
  };

  const deleteTable = (tableId: number): { success: boolean; message: string } => {
    const target = tables.find(t => t.id === tableId);
    if (!target) return { success: false, message: 'الطاولة غير موجودة' };

    setTables(prev => {
      const next = prev.filter(t => t.id !== tableId);
      saveToStorage('sufrah_v2_tables', next);
      return next;
    });

    const log: ActivityLog = {
      id: Date.now(),
      user_name: activeRestaurant?.name_ar || 'مالك المطعم',
      role: 'restaurant_owner',
      action: 'Table Deleted',
      description: `تم حذف الطاولة (${target.table_number})`,
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);

    api.deleteTable(tableId).catch(console.error);

    return { success: true, message: `تم حذف الطاولة (${target.table_number}) بنجاح.` };
  };

  const addProduct = (productData: Partial<Product>) => {
    if (!activeRestaurant) return;
    const nextId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const defaultCatId = categories.length > 0 ? categories[0].id : 1;
    const newProd: Product = {
      id: nextId,
      restaurant_id: activeRestaurant.id,
      category_id: productData.category_id || defaultCatId,
      name_ar: productData.name_ar || 'صنف جديد',
      name_en: productData.name_en || 'New Dish',
      description_ar: productData.description_ar || '',
      description_en: productData.description_en || '',
      base_price: productData.base_price || 10000,
      discount_price: productData.discount_price,
      image_url: productData.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      calories: productData.calories || 450,
      prep_time_minutes: productData.prep_time_minutes || 15,
      ingredients_ar: productData.ingredients_ar || '',
      is_available: true,
      is_featured: false,
      sizes: productData.sizes || [],
      addons: productData.addons || []
    };
    setProducts(prev => [newProd, ...prev]);

    api.addProduct(newProd).catch(console.error);
  };

  const updateProduct = (productId: number, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
    api.updateProduct(productId, updates).catch(console.error);
  };

  const deleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    api.deleteProduct(productId).catch(console.error);
  };

  const addCategory = (categoryData: Partial<Category>) => {
    if (!activeRestaurant) return;
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
    api.addCategory(newCat).catch(console.error);
  };

  const updateCategory = (categoryId: number, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, ...updates } : c));
  };

  const deleteCategory = (categoryId: number) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    api.deleteCategory(categoryId).catch(console.error);
  };

  const addBranch = (branchData: Partial<Branch>) => {
    if (!activeRestaurant) return;
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
    if (!activeRestaurant) return;
    const nextId = reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1;
    const newRes: Reservation = {
      id: nextId,
      restaurant_id: activeRestaurant.id,
      branch_id: activeBranch ? activeBranch.id : 1,
      branch_name: activeBranch ? activeBranch.name_ar : 'الفرع الرئيسي',
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
    if (!activeRestaurant) return;
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
    const slug = (data.slug || `restaurant-${nextId}`).toLowerCase().trim().replace(/[\s_]+/g, '-');
    const newRest: Restaurant = {
      id: nextId,
      name_ar: data.name_ar || 'مطعم جديد',
      name_en: data.name_en || 'New Restaurant',
      slug,
      custom_domain: data.custom_domain,
      logo_url: data.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      cover_url: data.cover_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      description_ar: data.description_ar || 'مطعم ومقهى عصري',
      phone: data.phone || '+964 770 000 0000',
      email: data.email || `info@${slug}.com`,
      address: data.address || 'العراق',
      currency: 'IQD',
      tax_percentage: data.tax_percentage || 5,
      status: 'active',
      created_at: new Date().toISOString().slice(0, 10),
      theme_primary_color: data.theme_primary_color || '#f59e0b',
      plan_name: data.plan_name || 'الباقة الاحترافية (Pro)',
      delivery_fee_base: data.delivery_fee_base || 3000,
      whatsapp_number: data.whatsapp_number || data.phone || '+9647700000000'
    };

    // Auto create main branch
    const branchId = branches.length > 0 ? Math.max(...branches.map(b => b.id)) + 1 : 1;
    const mainBranch: Branch = {
      id: branchId,
      restaurant_id: newRest.id,
      name_ar: 'الفرع الرئيسي',
      name_en: 'Main Branch',
      phone: newRest.phone,
      address: newRest.address,
      latitude: 33.3152,
      longitude: 44.3661,
      opening_time: '11:00',
      closing_time: '01:00',
      manager_name: 'المدير العام',
      is_active: true
    };

    // Auto create initial 5 tables
    const newTables: DiningTable[] = Array.from({ length: 5 }, (_, i) => ({
      id: (tables.length > 0 ? Math.max(...tables.map(t => t.id)) : 0) + i + 1,
      branch_id: branchId,
      table_number: `طاولة ${i + 1}`,
      capacity: 4,
      status: 'available',
      qr_token: `TBL-${slug}-${i + 1}`
    }));

    // Auto create starter categories
    const baseCatId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) : 0;
    const starterCategories: Category[] = [
      { id: baseCatId + 1, restaurant_id: newRest.id, name_ar: 'الأطباق الرئيسية', name_en: 'Main Dishes', slug: 'main', icon_name: 'Flame', sort_order: 1 },
      { id: baseCatId + 2, restaurant_id: newRest.id, name_ar: 'المقبلات والسلطات', name_en: 'Appetizers', slug: 'appetizers', icon_name: 'Salad', sort_order: 2 },
      { id: baseCatId + 3, restaurant_id: newRest.id, name_ar: 'المشروبات المنعشة', name_en: 'Drinks', slug: 'drinks', icon_name: 'Coffee', sort_order: 3 },
    ];

    setRestaurants(prev => [...prev, newRest]);
    setBranches(prev => [...prev, mainBranch]);
    setTables(prev => [...prev, ...newTables]);
    setCategories(prev => [...prev, ...starterCategories]);
    setActiveRestaurant(newRest);
    setActiveBranch(mainBranch);

    const log: ActivityLog = {
      id: Date.now(),
      user_name: newRest.name_ar,
      role: 'restaurant_owner',
      action: 'Restaurant Created',
      description: `تم إنشاء مطعم جديد: ${newRest.name_ar} مع الفرع الرئيسي وقوائم الأصناف`,
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);

    api.createRestaurant(newRest).catch(console.error);

    return newRest;
  };

  const applyCoupon = (code: string, currentTotal: number): { success: boolean; discount: number; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode && c.is_active);

    if (!coupon) {
      return {
        success: false,
        discount: 0,
        message: 'كود الخصم غير صالح أو منتهي الصلاحية'
      };
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
    if (!activeRestaurant) return;
    setActiveRestaurant(prev => (prev ? { ...prev, whatsapp_number: whatsapp } : null));
    setRestaurants(prev => prev.map(r => r.id === activeRestaurant.id ? { ...r, whatsapp_number: whatsapp } : r));
  };

  const updatePlan = (planId: number, updates: Partial<Plan>) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, ...updates } : p));
  };

  const activateRestaurantPlan = (code: string, restaurantId?: number): { success: boolean; message: string; planName?: string } => {
    const cleanCode = code.trim().toUpperCase();
    const targetRest = restaurantId
      ? restaurants.find(r => r.id === restaurantId)
      : (activeRestaurant || restaurants[0]);

    if (!targetRest) {
      return { success: false, message: 'يرجى تسجيل مطعم أولاً لتطبيق رمز التفعيل عليه' };
    }

    let upgradedPlan = '';
    if (cleanCode === 'SUFRA-PRO-2026' || cleanCode === 'SUFRA-PRO' || cleanCode === 'PRO2026') {
      upgradedPlan = 'الباقة الاحترافية (Pro)';
    } else if (cleanCode === 'SUFRA-ENTERPRISE' || cleanCode === 'VIP-2026' || cleanCode === 'ENTERPRISE') {
      upgradedPlan = 'الباقة المؤسسية (Enterprise)';
    } else if (cleanCode.startsWith('PRO-') || cleanCode.includes('PRO')) {
      upgradedPlan = 'الباقة الاحترافية (Pro)';
    } else if (cleanCode.startsWith('VIP-') || cleanCode.includes('VIP')) {
      upgradedPlan = 'الباقة المؤسسية (Enterprise)';
    } else {
      return { success: false, message: 'رمز التفعيل غير صحيح أو منتهي الصلاحية' };
    }

    const updatedRest = { ...targetRest, plan_name: upgradedPlan };
    setRestaurants(prev => prev.map(r => r.id === targetRest.id ? updatedRest : r));
    if (activeRestaurant && activeRestaurant.id === targetRest.id) {
      setActiveRestaurant(updatedRest);
    }

    const log: ActivityLog = {
      id: Date.now(),
      user_name: targetRest.name_ar,
      role: 'restaurant_owner',
      action: 'Plan Upgraded',
      description: `تمت ترقية باقة المطعم إلى (${upgradedPlan}) بنجاح عبر كود التفعيل: ${cleanCode}`,
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);

    api.activatePlan(code, targetRest.id).catch(console.error);

    return {
      success: true,
      planName: upgradedPlan,
      message: `مبروك! تم تفعيل ${upgradedPlan} لمطعم (${targetRest.name_ar}) بنجاح!`
    };
  };

  const updateRestaurantBranding = (restaurantId: number, updates: Partial<Restaurant>) => {
    setRestaurants(prev => {
      const next = prev.map(r => (r.id === restaurantId ? { ...r, ...updates } : r));
      saveToStorage('sufrah_v2_restaurants', next);
      return next;
    });
    if (activeRestaurant && activeRestaurant.id === restaurantId) {
      setActiveRestaurant(prev => (prev ? { ...prev, ...updates } : null));
    }

    const log: ActivityLog = {
      id: Date.now(),
      user_name: activeRestaurant?.name_ar || 'مالك المطعم',
      role: 'restaurant_owner',
      action: 'Branding Updated',
      description: 'تم تحديث هوية وصور المطعم (اللوجو وصورة الغلاف)',
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeRestaurant,
        setActiveRestaurant: handleSetActiveRestaurant,
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
        addTable,
        updateTable,
        deleteTable,
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
        updatePlan,
        activateRestaurantPlan,
        updateRestaurantBranding,
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
