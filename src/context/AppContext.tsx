import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  User,
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
  INITIAL_USERS,
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
  users: User[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isBootstrapLoading: boolean;
  
  // User Authentication & Management
  loginUser: (identifier: string, passwordOrPin: string, restaurantId?: number) => { success: boolean; message: string; user?: User };
  logoutUser: () => void;
  updateUser: (userId: number, updates: Partial<User>) => { success: boolean; message: string };
  createUser: (newUser: Omit<User, 'id'>) => { success: boolean; message: string; user?: User };
  deleteUser: (userId: number) => { success: boolean; message: string };
  
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
  addCategory: (categoryData: Partial<Category>) => Promise<Category | null>;
  updateCategory: (categoryId: number, updates: Partial<Category>) => void;
  deleteCategory: (categoryId: number) => void;
  addBranch: (branchData: Partial<Branch>) => void;
  updateBranch: (branchId: number, updates: Partial<Branch>) => { success: boolean; message: string };
  deleteBranch: (branchId: number) => { success: boolean; message: string };
  addReservation: (res: Partial<Reservation>) => void;
  updateReservationStatus: (resId: number, status: 'pending' | 'confirmed' | 'cancelled') => void;
  addReview: (reviewData: Partial<Review>) => void;
  createRestaurant: (data: Partial<Restaurant> & {
    owner_name?: string;
    owner_username?: string;
    owner_email?: string;
    owner_password?: string;
    owner_phone?: string;
  }) => Restaurant;
  applyCoupon: (code: string, currentTotal: number) => { success: boolean; discount: number; message: string };
  playNotificationSound: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  updateRestaurantWhatsApp: (whatsapp: string) => void;
  updatePlan: (planId: number, updates: Partial<Plan>) => void;
  activateRestaurantPlan: (code: string, restaurantId?: number) => { success: boolean; message: string; planName?: string };
  updateRestaurantBranding: (restaurantId: number, updates: Partial<Restaurant>) => void;
  toggleRestaurantStatus: (restaurantId: number) => void;
  deleteRestaurant: (restaurantId: number) => { success: boolean; message: string };
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
      const rawParam = params.get('restaurant') || params.get('r');
      if (rawParam && list.length > 0) {
        const decoded = decodeURIComponent(rawParam).trim().toLowerCase();
        const found = list.find(r => 
          String(r.id) === decoded || 
          (r.slug && r.slug.toLowerCase() === decoded) ||
          (r.name_ar && r.name_ar.toLowerCase().includes(decoded)) ||
          (r.name_en && r.name_en.toLowerCase().includes(decoded))
        );
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
  const [plans, setPlans] = useState<Plan[]>(() => {
    const list = loadFromStorage<Plan[]>('sufrah_v2_plans', SAAS_PLANS);
    return list.map(p => {
      if (p.slug === 'free' || p.id === 1) {
        return {
          ...p,
          name_ar: 'الباقة المجانية (تجريبية 14 يوم)',
          name_en: 'Free 14-Day Trial',
          has_pos: true,
          has_kds: true,
          trial_days: 14,
          features: [
            'فترة تجريبية مجانية لمدة 14 يوم',
            'منيو إلكتروني QR تفاعلي',
            'نظام الكاشير وتسجيل الطلبات (POS)',
            'شاشة المطبخ KDS مع التنبيهات',
            'إدارة الأصناف والصور',
            'دعم فني مباشر'
          ]
        };
      }
      return p;
    });
  });
  const [coupons, setCoupons] = useState<Coupon[]>(() =>
    loadFromStorage('sufrah_v2_coupons', INITIAL_COUPONS)
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    loadFromStorage('sufrah_v2_activity_logs', INITIAL_ACTIVITY_LOGS)
  );
  const [isBootstrapLoading, setIsBootstrapLoading] = useState(true);
  const normalizeDigits = (str: string): string => {
    if (!str) return '';
    return str
      .replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1632 + 48))
      .replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1776 + 48));
  };

  const [users, setUsers] = useState<User[]>(() => {
    const saved = loadFromStorage<User[]>('sufrah_v2_users', []);
    // If nothing is saved yet (first run), use INITIAL_USERS
    if (!saved || saved.length === 0) return INITIAL_USERS;
    // IMPORTANT: Do NOT re-add missing INITIAL_USERS.
    // Deleted users (e.g. staff of a deleted restaurant) must stay deleted.
    // Re-merging INITIAL_USERS here was the bug that allowed deleted staff to log in again.

    // OFFLINE SAFETY NET: remove users belonging to restaurants not in local storage
    const savedRestaurants = loadFromStorage<Restaurant[]>('sufrah_v2_restaurants', []);
    if (savedRestaurants && savedRestaurants.length > 0) {
      const validRestIds = new Set(savedRestaurants.map(r => Number(r.id)));
      const cleaned = saved.filter(u => u.role === 'super_admin' || !u.restaurant_id || validRestIds.has(Number(u.restaurant_id)));
      if (cleaned.length !== saved.length) {
        // Save cleaned list immediately to localStorage
        try { localStorage.setItem('sufrah_v2_users', JSON.stringify(cleaned)); } catch {}
        return cleaned;
      }
    }
    return saved;
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadFromStorage<User | null>('sufrah_v2_current_user', null)
  );

  const activeRestaurantRef = useRef<Restaurant | null>(activeRestaurant);
  const currentUserRef = useRef<User | null>(currentUser);
  useEffect(() => {
    activeRestaurantRef.current = activeRestaurant;
  }, [activeRestaurant]);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

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
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const rawParam = params.get('restaurant') || params.get('r');
            if (rawParam) {
              const decoded = decodeURIComponent(rawParam).trim().toLowerCase();
              const matchedParam = data.restaurants.find(
                r => String(r.id) === decoded || 
                     (r.slug && r.slug.toLowerCase() === decoded) || 
                     (r.name_ar && r.name_ar.toLowerCase().includes(decoded)) || 
                     (r.name_en && r.name_en.toLowerCase().includes(decoded))
              );
              if (matchedParam) return matchedParam;
            }
          }
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
      if (data.plans.length > 0) {
        setPlans(data.plans.map(p => {
          if (p.slug === 'free' || p.id === 1 || p.price_monthly === 0) {
            return {
              ...p,
              name_ar: 'الباقة المجانية (تجريبية 14 يوم)',
              name_en: 'Free 14-Day Trial',
              has_pos: true,
              has_kds: true,
              trial_days: 14,
              features: [
                'فترة تجريبية مجانية لمدة 14 يوم',
                'منيو إلكتروني QR تفاعلي',
                'نظام الكاشير وتسجيل الطلبات (POS)',
                'شاشة المطبخ KDS مع التنبيهات',
                'إدارة الأصناف والصور',
                'دعم فني مباشر'
              ]
            };
          }
          return p;
        }));
      }
      if (data.users && data.users.length > 0) {
        setUsers(data.users);
      } else if (data.restaurants.length > 0) {
        // Even if no users came from cloud, clean local users that belong to deleted restaurants
        const validRestIds = new Set(data.restaurants.map((r: { id: number }) => Number(r.id)));
        setUsers(prev => {
          const cleaned = prev.filter(u => u.role === 'super_admin' || !u.restaurant_id || validRestIds.has(Number(u.restaurant_id)));
          if (cleaned.length !== prev.length) {
            saveToStorage('sufrah_v2_users', cleaned);
          }
          return cleaned;
        });
      }
    }).finally(() => {
      if (isMounted) setIsBootstrapLoading(false);
    });

    // 2. Real-Time SSE Listener across all devices
    const unsubscribe = api.subscribeToEvents((type, payload) => {
      if (!isMounted) return;

      if (type === 'new_order') {
        setOrders(prev => {
          if (prev.some(o => o.id === payload.id || o.order_number === payload.order_number)) {
            return prev;
          }
          // Only play sound if order is for this user's active restaurant
          const activeId = activeRestaurantRef.current ? Number(activeRestaurantRef.current.id) : Number(currentUserRef.current?.restaurant_id || 0);
          if (!activeId || Number(payload.restaurant_id) === activeId) {
            playNotificationSound();
          }
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
        setCategories(prev => {
          if (prev.some(c => c.id === payload.id)) return prev;
          // Match any optimistic category with the same name and restaurant
          const tempIdx = prev.findIndex(c => c.id > 1000000 && c.restaurant_id === payload.restaurant_id && c.name_ar === payload.name_ar);
          if (tempIdx !== -1) {
            const next = [...prev];
            next[tempIdx] = payload;
            return next;
          }
          return [...prev, payload];
        });
      } else if (type === 'category_updated') {
        setCategories(prev => prev.map(c => c.id === payload.id ? { ...c, ...payload } : c));
      } else if (type === 'category_deleted') {
        setCategories(prev => prev.filter(c => c.id !== payload.id));
      } else if (type === 'restaurant_created') {
        setRestaurants(prev => prev.some(r => r.id === payload.id) ? prev : [...prev, payload]);
      } else if (type === 'restaurant_updated') {
        setRestaurants(prev => prev.map(r => r.id === payload.id ? { ...r, ...payload } : r));
        setActiveRestaurant(prev => (prev && prev.id === payload.id ? { ...prev, ...payload } : prev));
      } else if (type === 'restaurant_status_updated') {
        setRestaurants(prev => prev.map(r => r.id === payload.id ? { ...r, status: payload.status } : r));
        setActiveRestaurant(prev => (prev && prev.id === payload.id ? { ...prev, status: payload.status } : prev));
      } else if (type === 'restaurant_deleted') {
        setRestaurants(prev => prev.filter(r => r.id !== payload.id));
        setBranches(prev => prev.filter(b => b.restaurant_id !== payload.id));
        setProducts(prev => prev.filter(p => p.restaurant_id !== payload.id));
        setCategories(prev => prev.filter(c => c.restaurant_id !== payload.id));
        setOrders(prev => prev.filter(o => o.restaurant_id !== payload.id));
        setUsers(prev => prev.filter(u => Number(u.restaurant_id) !== Number(payload.id)));
        // Staff of the deleted restaurant are logged out immediately (never switched to another restaurant)
        const sessUser = currentUserRef.current;
        if (sessUser && sessUser.role !== 'super_admin' && Number(sessUser.restaurant_id) === Number(payload.id)) {
          setCurrentUser(null);
          setCurrentRole('customer');
          localStorage.removeItem('sufrah_v2_current_user');
          localStorage.removeItem('sufrah_v2_active_restaurant_id');
        }
        setActiveRestaurant(prev => (prev && Number(prev.id) === Number(payload.id) ? null : prev));
      } else if (type === 'plan_activated') {
        setActiveRestaurant(prev => prev && prev.id === payload.restaurant_id ? { ...prev, plan_name: payload.planName } : prev);
        setRestaurants(prev => prev.map(r => r.id === payload.restaurant_id ? { ...r, plan_name: payload.planName } : r));
      } else if (type === 'user_created') {
        setUsers(prev => {
          const exists = prev.some(u => u.id === payload.id || u.username === payload.username);
          if (exists) {
            return prev.map(u => (u.id === payload.id || u.username === payload.username) ? { ...u, ...payload } : u);
          }
          return [...prev, payload];
        });
      } else if (type === 'user_deleted') {
        setUsers(prev => {
          const updated = prev.filter(u => String(u.id) !== String(payload.id));
          saveToStorage('sufrah_v2_users', updated);
          return updated;
        });
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

  useEffect(() => {
    localStorage.setItem('sufrah_v2_users', JSON.stringify(users));
  }, [users]);

  // Link or ensure every restaurant has a dedicated restaurant_owner user account
  useEffect(() => {
    let changed = false;
    const nextUsers = [...users];
    restaurants.forEach(r => {
      const hasOwner = nextUsers.some(u => Number(u.restaurant_id) === Number(r.id) && u.role === 'restaurant_owner');
      if (!hasOwner) {
        // First check if an existing user matches this restaurant by phone, email, or username
        const rPhoneClean = (r.phone || '').replace(/\D/g, '');
        const matchedUserIndex = nextUsers.findIndex(u => {
          const uPhoneClean = (u.phone || '').replace(/\D/g, '');
          const matchPhone = rPhoneClean.length >= 7 && uPhoneClean.length >= 7 && rPhoneClean.slice(-10) === uPhoneClean.slice(-10);
          const matchEmail = u.email && r.email && u.email.toLowerCase() === r.email.toLowerCase();
          const matchUsername = u.username && r.slug && u.username.toLowerCase() === r.slug.toLowerCase();
          return matchPhone || matchEmail || matchUsername;
        });

        if (matchedUserIndex !== -1) {
          changed = true;
          nextUsers[matchedUserIndex] = {
            ...nextUsers[matchedUserIndex],
            restaurant_id: r.id,
            role: 'restaurant_owner'
          };
        } else {
          // Only create if really no matching user exists at all
          changed = true;
          const nextId = nextUsers.length > 0 ? Math.max(...nextUsers.map(u => u.id)) + 1 : 1;
          const autoOwner: User = {
            id: nextId,
            restaurant_id: r.id,
            role: 'restaurant_owner',
            name: `مالك ${r.name_ar}`,
            username: (r.slug || `owner_${r.id}`).toLowerCase().trim(),
            email: r.email || `owner@${r.slug || r.id}.com`,
            phone: r.phone || '',
            password: '123456',
            pin_code: rPhoneClean.length >= 4 ? rPhoneClean.slice(-4) : '1234',
            is_active: true,
            created_at: r.created_at || new Date().toISOString().slice(0, 10)
          };
          nextUsers.push(autoOwner);
        }
      }
    });
    if (changed) {
      setUsers(nextUsers);
    }
  }, [restaurants]);

  // Session guard: kick out any logged-in staff whose account or restaurant was deleted/suspended/inactive
  useEffect(() => {
    if (!currentUser || currentUser.role === 'super_admin') return;
    const userStillExists = users.some(u => String(u.id) === String(currentUser.id) && u.is_active);
    const rest = currentUser.restaurant_id
      ? restaurants.find(r => Number(r.id) === Number(currentUser.restaurant_id))
      : undefined;
    if (!userStillExists || !rest || rest.status === 'suspended' || rest.status === 'inactive') {
      setCurrentUser(null);
      setCurrentRole('customer');
      setActiveRestaurant(null);
      localStorage.removeItem('sufrah_v2_current_user');
      localStorage.removeItem('sufrah_v2_active_restaurant_id');
    }
  }, [currentUser, users, restaurants]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sufrah_v2_current_user', JSON.stringify(currentUser));
      if (currentUser.restaurant_id) {
        const rest = restaurants.find(r => Number(r.id) === Number(currentUser.restaurant_id));
        if (rest && activeRestaurant?.id !== rest.id) {
          setActiveRestaurant(rest);
          localStorage.setItem('sufrah_v2_active_restaurant_id', String(rest.id));
        }
      }
      if (currentUser.branch_id) {
        const branch = branches.find(b => b.id === currentUser.branch_id) || INITIAL_BRANCHES.find(b => b.id === currentUser.branch_id);
        if (branch && activeBranch?.id !== branch.id) {
          setActiveBranch(branch);
        }
      }
    } else {
      localStorage.removeItem('sufrah_v2_current_user');
    }
  }, [currentUser, restaurants, branches]);

  const loginUser = (identifier: string, passwordOrPin: string, restaurantId?: number): { success: boolean; message: string; user?: User } => {
    const rawId = normalizeDigits(identifier || '').trim().toLowerCase();
    const cleanSecret = normalizeDigits(passwordOrPin || '').trim();

    if (!rawId) {
      return { success: false, message: 'يرجى إدخال اسم المستخدم أو رقم الهاتف أو اسم المطعم' };
    }

    const cleanIdWithUnderscore = rawId.replace(/[\s\-]+/g, '_');
    const cleanIdNoSep = rawId.replace(/[\s_\-]+/g, '');
    const cleanDigits = rawId.replace(/\D/g, '');

    // STRICT account matching: exact username, email or full phone number only.
    // (No fuzzy/substring/name matching — it caused one restaurant's staff to open another restaurant's account.)
    const candidates = users.filter(u => {
      if (!u.is_active) return false;
      const uUsername = (u.username || '').toLowerCase().trim();
      const uEmail = (u.email || '').toLowerCase().trim();
      const uPhoneDigits = (u.phone || '').replace(/\D/g, '');

      if (uUsername && (uUsername === rawId || uUsername === cleanIdWithUnderscore)) return true;
      if (uEmail && uEmail === rawId) return true;
      if (cleanDigits.length >= 7 && uPhoneDigits.length >= 7) {
        // Compare last 10 digits to tolerate +964 / 0 prefixes
        if (uPhoneDigits.slice(-10) === cleanDigits.slice(-10)) return true;
      }
      return false;
    });

    // Staff of deleted restaurants must never log in
    const validCandidates = candidates.filter(u => {
      if (u.role === 'super_admin') return true;
      if (!u.restaurant_id) return false;
      return restaurants.some(r => Number(r.id) === Number(u.restaurant_id));
    });

    if (validCandidates.length === 0) {
      return {
        success: false,
        message: candidates.length > 0
          ? 'هذا الحساب تابع لمطعم محذوف أو غير موجود، لا يمكن تسجيل الدخول.'
          : 'اسم المستخدم غير مسجل. تأكد من كتابة اسم المستخدم أو البريد أو رقم الهاتف بشكل صحيح.'
      };
    }

    // Verify password / PIN against the matched account(s) only
    const found = validCandidates.find(u => {
      const userPassword = normalizeDigits(u.password || '').trim();
      const userPin = normalizeDigits(u.pin_code || '').trim();
      return (
        (userPassword !== '' && userPassword === cleanSecret) ||
        (userPin !== '' && userPin === cleanSecret)
      );
    });

    if (!found) {
      return {
        success: false,
        message: 'كلمة المرور أو رمز PIN غير صحيح.'
      };
    }

    const foundRest = found.restaurant_id ? restaurants.find(r => Number(r.id) === Number(found.restaurant_id)) : undefined;
    if (found.role !== 'super_admin' && foundRest) {
      if (foundRest.status === 'inactive') {
        return {
          success: false,
          message: 'حساب المطعم قيد المراجعة وغير مفعل حالياً. يرجى الانتظار لحين اعتماد وتفعيل الحساب من قِبل إدارة المنصة (السوبر آدمن).'
        };
      }
      if (foundRest.status === 'suspended') {
        return {
          success: false,
          message: 'تم إيقاف هذا المطعم مؤقتاً من قبل إدارة المنصة. يرجى التواصل مع الدعم الفني.'
        };
      }
    }

    // Success! Lock session to authenticated user
    setCurrentUser(found);
    setCurrentRole(found.role);

    // Bind active restaurant & branch strictly to this user
    const targetRestId = found.restaurant_id || (found.role === 'super_admin' ? (restaurantId || activeRestaurant?.id || restaurants[0]?.id) : null);
    if (targetRestId) {
      const targetRest = restaurants.find(r => r.id === targetRestId) || INITIAL_RESTAURANTS.find(r => r.id === targetRestId);
      if (targetRest) {
        setActiveRestaurant(targetRest);
        localStorage.setItem('sufrah_v2_active_restaurant_id', String(targetRest.id));
      }
    }

    if (found.branch_id) {
      const targetBranch = branches.find(b => b.id === found.branch_id) || INITIAL_BRANCHES.find(b => b.id === found.branch_id);
      if (targetBranch) {
        setActiveBranch(targetBranch);
      }
    } else if (targetRestId) {
      const firstBranch = branches.find(b => b.restaurant_id === targetRestId) || INITIAL_BRANCHES.find(b => b.restaurant_id === targetRestId);
      if (firstBranch) {
        setActiveBranch(firstBranch);
      }
    }

    const roleNameAr = (() => {
      switch (found.role) {
        case 'super_admin': return 'المدير العام للمنصة';
        case 'restaurant_owner': return 'صاحب المطعم';
        case 'branch_manager': return 'مدير الفرع';
        case 'cashier': return 'الكاشير (POS)';
        case 'kitchen': return 'المطبخ (KDS)';
        case 'driver': return 'سائق التوصيل';
        default: return 'طاقم العمل';
      }
    })();

    const restObj = restaurants.find(r => r.id === (targetRestId || found.restaurant_id));
    const restName = restObj ? `مطعم ${restObj.name_ar}` : 'المنصة';

    const log: ActivityLog = {
      id: Date.now(),
      user_name: found.name,
      role: found.role,
      action: 'User Logged In',
      description: `تم تسجيل دخول (${found.name}) بنجاح بصلاحية (${roleNameAr})${restObj ? ` إلى (${restName})` : ''}`,
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);

    return {
      success: true,
      message: `أهلاً بك يا ${found.name}! تم تسجيل الدخول بنجاح بصلاحية (${roleNameAr})${restObj ? ` في ${restName}` : ''}`,
      user: found
    };
  };

  const logoutUser = () => {
    const prevUser = currentUser;
    setCurrentUser(null);
    setCurrentRole('customer');
    localStorage.removeItem('sufrah_v2_current_user');
    if (prevUser) {
      const log: ActivityLog = {
        id: Date.now(),
        user_name: prevUser.name,
        role: prevUser.role,
        action: 'User Logged Out',
        description: `قام المستخدم (${prevUser.name}) بتسجيل الخروج من النظام`,
        timestamp: 'الآن'
      };
      setActivityLogs(prev => [log, ...prev]);
    }
  };

  const updateUser = (userId: number, updates: Partial<User>): { success: boolean; message: string } => {
    // Check if updated username is already taken by another user
    if (updates.username) {
      const cleanUsername = updates.username.trim().toLowerCase();
      const conflict = users.find(u => u.id !== userId && u.username.toLowerCase() === cleanUsername);
      if (conflict) {
        return { success: false, message: 'اسم المستخدم هذا محجوز مسبقاً، يرجى اختيار اسم مستخدم آخر' };
      }
    }

    // Check if updated email is already taken
    if (updates.email) {
      const cleanEmail = updates.email.trim().toLowerCase();
      const conflict = users.find(u => u.id !== userId && u.email.toLowerCase() === cleanEmail);
      if (conflict) {
        return { success: false, message: 'البريد الإلكتروني هذا مستخدم مسبقاً' };
      }
    }

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, ...updates };
        if (currentUser?.id === userId) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));

    const log: ActivityLog = {
      id: Date.now(),
      user_name: currentUser?.name || 'النظام',
      role: currentRole,
      action: 'User Credentials Updated',
      description: `تم تحديث بيانات المستخدم (معرف: ${userId}) وكلمة المرور/اسم المستخدم بنجاح`,
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);

    // Persist to Cloud MySQL
    api.updateUser(userId, updates);

    return { success: true, message: 'تم حفظ وتحديث بيانات المستخدم وكلمة المرور بنجاح!' };
  };

  const createUser = (newUserData: Omit<User, 'id'>): { success: boolean; message: string; user?: User } => {
    const cleanUsername = newUserData.username.trim().toLowerCase();
    const conflict = users.find(u => u.username.toLowerCase() === cleanUsername);
    if (conflict) {
      return { success: false, message: 'اسم المستخدم موجود مسبقاً، يرجى اختيار اسم مستخدم بديل' };
    }

    const newUser: User = {
      ...newUserData,
      id: Date.now(),
      created_at: new Date().toISOString().slice(0, 10),
      is_active: newUserData.is_active ?? true
    };

    setUsers(prev => [...prev, newUser]);

    const log: ActivityLog = {
      id: Date.now(),
      user_name: currentUser?.name || 'مدير النظام',
      role: currentRole,
      action: 'Staff User Created',
      description: `تم إنشاء حساب مستخدم جديد (${newUser.name}) برتبة (${newUser.role})`,
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);

    return { success: true, message: 'تم إنشاء حساب الموظف بنجاح!', user: newUser };
  };

  const deleteUser = (userId: number): { success: boolean; message: string } => {
    const target = users.find(u => String(u.id) === String(userId));
    if (!target) {
      return { success: false, message: 'المستخدم غير موجود أو تم حذفه مسبقاً' };
    }

    if (currentUser && String(currentUser.id) === String(userId)) {
      return { success: false, message: 'لا يمكن حذف الحساب الحالي المسجل دخولك به' };
    }

    const remainingUsers = users.filter(u => String(u.id) !== String(userId));
    setUsers(remainingUsers);
    saveToStorage('sufrah_v2_users', remainingUsers);

    // Call Cloud API
    api.deleteUser(Number(userId)).catch(() => {});

    const log: ActivityLog = {
      id: Date.now(),
      user_name: currentUser?.name || 'مدير النظام',
      role: currentRole,
      action: 'User Deleted',
      description: `تم حذف حساب المستخدم (${target.name} - ${target.username}) نهائياً`,
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);

    return { success: true, message: `تم حذف حساب (${target.name}) بنجاح` };
  };

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
      restaurant_id: Number(orderData.restaurant_id || activeRestaurant?.id || 1),
      branch_id: Number(orderData.branch_id || activeBranch?.id || 1),
      branch_name: orderData.branch_name || activeBranch?.name_ar || 'الفرع الرئيسي',
      table_id: orderData.table_id,
      table_number: orderData.table_number,
      order_type: orderData.order_type || 'dine_in',
      status: orderData.status || 'new',
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
      is_available: productData.is_available !== false,
      is_featured: Boolean(productData.is_featured),
      sizes: productData.sizes || [],
      addons: productData.addons || []
    };
    setProducts(prev => [newProd, ...prev]);

    api.addProduct(newProd).then(saved => {
      if (saved && saved.id) {
        setProducts(prev => prev.map(p => p.id === nextId ? { ...newProd, ...saved } : p));
      }
    }).catch(console.error);
  };

  const updateProduct = (productId: number, updates: Partial<Product>) => {
    setProducts(prev => {
      const next = prev.map(p => Number(p.id) === Number(productId) ? { ...p, ...updates } : p);
      localStorage.setItem('sufrah_v2_products', JSON.stringify(next));
      return next;
    });
    api.updateProduct(productId, updates).catch(console.error);
  };

  const deleteProduct = (productId: number) => {
    setProducts(prev => {
      const next = prev.filter(p => Number(p.id) !== Number(productId));
      localStorage.setItem('sufrah_v2_products', JSON.stringify(next));
      return next;
    });
    api.deleteProduct(productId).catch(console.error);
  };

  const addCategory = async (categoryData: Partial<Category>): Promise<Category | null> => {
    // Resolve restaurant: activeRestaurant OR currentUser's restaurant OR first loaded restaurant
    let targetRest = activeRestaurant;
    if (!targetRest && currentUser?.restaurant_id) {
      targetRest = restaurants.find(r => r.id === currentUser.restaurant_id) || null;
    }
    if (!targetRest && restaurants.length > 0) {
      targetRest = restaurants[0];
    }
    if (targetRest && !activeRestaurant) {
      setActiveRestaurant(targetRest);
    }

    if (!targetRest) {
      alert('يرجى تحديد أو اختيار مطعم أولاً لإضافة القسم.');
      return null;
    }

    const tempId = Date.now();
    const cleanNameAr = (categoryData.name_ar || 'قسم جديد').trim();
    const cleanNameEn = (categoryData.name_en || cleanNameAr).trim();
    const slug = (categoryData.slug || cleanNameEn || cleanNameAr)
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, '-')
      .replace(/[^\w\u0621-\u064A\-]/g, '');

    const newCat: Category = {
      id: tempId,
      restaurant_id: targetRest.id,
      name_ar: cleanNameAr,
      name_en: cleanNameEn,
      slug: slug || `cat-${tempId}`,
      icon_name: categoryData.icon_name || 'utensils',
      sort_order: categories.length + 1
    };

    // Optimistic local update
    setCategories(prev => [...prev, newCat]);

    try {
      const saved = await api.addCategory({
        restaurant_id: targetRest.id,
        name_ar: cleanNameAr,
        name_en: cleanNameEn,
        slug: slug || `cat-${tempId}`,
        icon_name: newCat.icon_name,
        sort_order: newCat.sort_order
      });

      if (saved) {
        setCategories(prev => prev.map(c => c.id === tempId ? saved : c));
        return saved;
      }
    } catch (err) {
      console.error('Failed to add category via API:', err);
    }
    return newCat;
  };

  const updateCategory = (categoryId: number, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, ...updates } : c));
    api.updateCategory(categoryId, updates).catch(console.error);
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
      phone: branchData.phone || '07700000000',
      address: branchData.address || 'العنوان',
      latitude: branchData.latitude || 33.315,
      longitude: branchData.longitude || 44.354,
      opening_time: branchData.opening_time || '10:00',
      closing_time: branchData.closing_time || '00:00',
      manager_name: branchData.manager_name || 'مدير الفرع',
      is_active: true
    };
    setBranches(prev => {
      const next = [...prev, newBranch];
      try {
        localStorage.setItem('sufrah_v2_branches', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const updateBranch = (branchId: number, updates: Partial<Branch>): { success: boolean; message: string } => {
    const target = branches.find(b => b.id === branchId);
    if (!target) return { success: false, message: 'الفرع غير موجود' };

    setBranches(prev => {
      const next = prev.map(b => b.id === branchId ? { ...b, ...updates } : b);
      try {
        localStorage.setItem('sufrah_v2_branches', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    if (activeBranch && activeBranch.id === branchId) {
      setActiveBranch(prev => prev ? { ...prev, ...updates } : null);
    }

    const log: ActivityLog = {
      id: Date.now(),
      user_name: currentUser?.name || 'مدير النظام',
      role: currentRole,
      action: 'Branch Updated',
      description: `تم تحديث بيانات الفرع (${updates.name_ar || target.name_ar})`,
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);

    return { success: true, message: 'تم تحديث بيانات الفرع بنجاح' };
  };

  const deleteBranch = (branchId: number): { success: boolean; message: string } => {
    const target = branches.find(b => b.id === branchId);
    if (!target) return { success: false, message: 'الفرع غير موجود' };

    const restBranches = branches.filter(b => b.restaurant_id === target.restaurant_id);
    if (restBranches.length <= 1) {
      return {
        success: false,
        message: 'لا يمكن حذف الفرع الوحيد للمطعم، يجب أن يتوفر فرع واحد على الأقل.'
      };
    }

    const updatedBranches = branches.filter(b => b.id !== branchId);
    setBranches(updatedBranches);
    try {
      localStorage.setItem('sufrah_v2_branches', JSON.stringify(updatedBranches));
    } catch (e) {
      console.error(e);
    }

    if (activeBranch && activeBranch.id === branchId) {
      const remainingForRest = updatedBranches.filter(b => b.restaurant_id === target.restaurant_id);
      setActiveBranch(remainingForRest.length > 0 ? remainingForRest[0] : null);
    }

    setTables(prev => {
      const next = prev.filter(t => t.branch_id !== branchId);
      try {
        localStorage.setItem('sufrah_v2_tables', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    const log: ActivityLog = {
      id: Date.now(),
      user_name: currentUser?.name || 'مدير النظام',
      role: currentRole,
      action: 'Branch Deleted',
      description: `تم حذف الفرع (${target.name_ar})`,
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);

    return { success: true, message: `تم حذف الفرع "${target.name_ar}" بنجاح` };
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

  const createRestaurant = (data: Partial<Restaurant> & {
    owner_name?: string;
    owner_username?: string;
    owner_email?: string;
    owner_password?: string;
    owner_phone?: string;
  }): Restaurant => {
    const nextId = restaurants.length > 0 ? Math.max(...restaurants.map(r => r.id)) + 1 : 1;
    const slug = (data.slug || `restaurant-${nextId}`).toLowerCase().trim().replace(/[\s_]+/g, '-');
    const newStatus: 'active' | 'inactive' | 'suspended' = data.status || 'inactive';

    const newRest: Restaurant = {
      id: nextId,
      name_ar: data.name_ar || 'مطعم جديد',
      name_en: data.name_en || 'New Restaurant',
      slug,
      custom_domain: data.custom_domain,
      logo_url: data.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      cover_url: data.cover_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      description_ar: data.description_ar || 'مطعم ومقهى عصري',
      phone: data.phone || '07700000000',
      email: data.email || `info@${slug}.com`,
      address: data.address || 'العراق',
      currency: 'IQD',
      tax_percentage: data.tax_percentage || 0,
      status: newStatus,
      created_at: new Date().toISOString().slice(0, 10),
      theme_primary_color: data.theme_primary_color || '#f59e0b',
      plan_name: data.plan_name || 'الباقة المجانية (Starter)',
      delivery_fee_base: data.delivery_fee_base || 3000,
      whatsapp_number: data.whatsapp_number || data.phone || '07700000000'
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
      manager_name: data.owner_name || 'المدير العام',
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

    // Auto-create owner user for this restaurant so they can log in
    const nextUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const phoneClean = (data.owner_phone || newRest.phone || '').replace(/\D/g, '');
    const ownerUser: User = {
      id: nextUserId,
      restaurant_id: newRest.id,
      branch_id: branchId,
      role: 'restaurant_owner',
      name: data.owner_name || `مالك ${newRest.name_ar}`,
      username: (data.owner_username || slug || newRest.phone).toLowerCase().trim(),
      email: data.owner_email || newRest.email,
      phone: data.owner_phone || newRest.phone,
      password: data.owner_password || '123456',
      pin_code: phoneClean.length >= 4 ? phoneClean.slice(-4) : '1234',
      is_active: true,
      created_at: new Date().toISOString().slice(0, 10)
    };

    setRestaurants(prev => [...prev, newRest]);
    setBranches(prev => [...prev, mainBranch]);
    setTables(prev => [...prev, ...newTables]);
    setUsers(prev => [...prev, ownerUser]);
    setActiveRestaurant(newRest);
    setActiveBranch(mainBranch);

    const log: ActivityLog = {
      id: Date.now(),
      user_name: newRest.name_ar,
      role: 'restaurant_owner',
      action: 'Restaurant Registered',
      description: `تم تسجيل مطعم جديد: ${newRest.name_ar} (الحالة: ${newStatus === 'active' ? 'نشط وفعال' : 'غير مفعل - بانتظار التفعيل'})`,
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);

    api.createRestaurant({ ...newRest, ...data }).then(res => {
      if (res && res.restaurant) {
        const sRest = res.restaurant;
        const sUser = res.user;
        setRestaurants(prev => prev.map(r => r.id === newRest.id ? sRest : r));
        setActiveRestaurant(prev => prev && prev.id === newRest.id ? sRest : prev);
        if (sUser) {
          setUsers(prev => prev.map(u => (u.id === ownerUser.id || (u.restaurant_id === newRest.id && u.role === 'restaurant_owner')) ? sUser : u));
        }
      }
    }).catch(console.error);

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
    const cleanNumber = whatsapp.trim();
    const updatedRest = {
      ...activeRestaurant,
      whatsapp_number: cleanNumber,
      phone: cleanNumber
    };
    setActiveRestaurant(updatedRest);
    setRestaurants(prev => {
      const next = prev.map(r => r.id === activeRestaurant.id ? updatedRest : r);
      saveToStorage('sufrah_v2_restaurants', next);
      return next;
    });
    api.updateRestaurant(activeRestaurant.id, {
      whatsapp_number: cleanNumber,
      phone: cleanNumber
    }).catch(console.error);
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
    const finalUpdates: Partial<Restaurant> = {
      ...updates
    };
    if (updates.whatsapp_number) {
      finalUpdates.phone = updates.whatsapp_number;
    }
    setRestaurants(prev => {
      const next = prev.map(r => (r.id === restaurantId ? { ...r, ...finalUpdates } : r));
      saveToStorage('sufrah_v2_restaurants', next);
      return next;
    });
    if (activeRestaurant && activeRestaurant.id === restaurantId) {
      setActiveRestaurant(prev => (prev ? { ...prev, ...finalUpdates } : null));
    }
    api.updateRestaurant(restaurantId, finalUpdates).catch(console.error);

    const log: ActivityLog = {
      id: Date.now(),
      user_name: activeRestaurant?.name_ar || 'مالك المطعم',
      role: 'restaurant_owner',
      action: 'Branding Updated',
      description: 'تم تحديث هوية وصور وبيانات المطعم بنجاح',
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);
  };

  const toggleRestaurantStatus = (restaurantId: number) => {
    const target = restaurants.find(r => r.id === restaurantId);
    if (!target) return;
    const newStatus: 'active' | 'suspended' = (target.status === 'inactive' || target.status === 'suspended') ? 'active' : 'suspended';

    setRestaurants(prev => prev.map(r => (r.id === restaurantId ? { ...r, status: newStatus } : r)));
    if (activeRestaurant && activeRestaurant.id === restaurantId) {
      setActiveRestaurant(prev => (prev ? { ...prev, status: newStatus } : null));
    }

    const log: ActivityLog = {
      id: Date.now(),
      user_name: 'مدير المنصة العام',
      role: 'super_admin',
      action: newStatus === 'active' ? 'Restaurant Activated' : 'Restaurant Suspended',
      description: `تم ${newStatus === 'active' ? (target.status === 'inactive' ? 'تفعيل واعتماد' : 'استئناف تشغيل') : 'إيقاف مؤقت لنشاط'} مطعم (${target.name_ar})`,
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);

    api.updateRestaurantStatus(restaurantId, newStatus).catch(console.error);
  };

  const deleteRestaurant = (restaurantId: number): { success: boolean; message: string } => {
    const target = restaurants.find(r => r.id === restaurantId);
    if (!target) return { success: false, message: 'المطعم غير موجود' };

    setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
    setBranches(prev => prev.filter(b => b.restaurant_id !== restaurantId));
    setProducts(prev => prev.filter(p => p.restaurant_id !== restaurantId));
    setCategories(prev => prev.filter(c => c.restaurant_id !== restaurantId));
    setOrders(prev => prev.filter(o => o.restaurant_id !== restaurantId));
    const deletedBranchIds = new Set(branches.filter(b => b.restaurant_id === restaurantId).map(b => b.id));
    setTables(prev => prev.filter(t => !deletedBranchIds.has(t.branch_id)));
    setUsers(prev => prev.filter(u => Number(u.restaurant_id) !== Number(restaurantId)));
    if (currentUser && currentUser.role !== 'super_admin' && Number(currentUser.restaurant_id) === Number(restaurantId)) {
      setCurrentUser(null);
      setCurrentRole('customer');
      localStorage.removeItem('sufrah_v2_current_user');
      localStorage.removeItem('sufrah_v2_active_restaurant_id');
    }
    const remaining = restaurants.filter(r => r.id !== restaurantId);
    setActiveRestaurant(remaining.length > 0 ? remaining[0] : null);
    const remainingBranch = branches.filter(b => b.restaurant_id !== restaurantId);
    setActiveBranch(remainingBranch.length > 0 ? remainingBranch[0] : null);

    const log: ActivityLog = {
      id: Date.now(),
      user_name: 'مدير المنصة العام',
      role: 'super_admin',
      action: 'Restaurant Deleted',
      description: `تم حذف مطعم (${target.name_ar}) وكافة فروعه وطاولاته وقوائمه نهائياً`,
      timestamp: 'الآن'
    };
    setActivityLogs(prev => [log, ...prev]);

    api.deleteRestaurant(restaurantId).catch(console.error);

    return {
      success: true,
      message: `تم حذف مطعم "${target.name_ar}" وكافة بياناته بنجاح`
    };
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
        users,
        currentUser,
        setCurrentUser,
        isBootstrapLoading,
        loginUser,
        logoutUser,
        updateUser,
        createUser,
        deleteUser,
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
        updateBranch,
        deleteBranch,
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
        toggleRestaurantStatus,
        deleteRestaurant,
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
