export type UserRole = 
  | 'super_admin' 
  | 'restaurant_owner' 
  | 'branch_manager' 
  | 'cashier' 
  | 'kitchen' 
  | 'driver' 
  | 'customer';

export interface User {
  id: number;
  restaurant_id?: number;
  branch_id?: number;
  role: UserRole;
  name: string;
  email: string;
  username: string;
  password?: string;
  pin_code?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at?: string;
}

export interface Restaurant {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  custom_domain?: string;
  logo_url: string;
  cover_url: string;
  description_ar: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  tax_percentage: number;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  theme_primary_color: string;
  plan_name: string;
  delivery_fee_base: number;
  whatsapp_number?: string;
}

export interface Branch {
  id: number;
  restaurant_id: number;
  name_ar: string;
  name_en: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  opening_time: string;
  closing_time: string;
  manager_name: string;
  is_active: boolean;
}

export interface DiningTable {
  id: number;
  branch_id: number;
  table_number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  qr_token: string;
}

export interface Category {
  id: number;
  restaurant_id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  icon_name: string;
  sort_order: number;
}

export interface ProductSize {
  id: number;
  product_id: number;
  name_ar: string;
  name_en: string;
  extra_price: number;
  is_default?: boolean;
}

export interface ProductAddon {
  id: number;
  product_id: number;
  name_ar: string;
  name_en: string;
  price: number;
  is_free?: boolean;
}

export interface Product {
  id: number;
  restaurant_id: number;
  category_id: number;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  base_price: number;
  discount_price?: number;
  image_url: string;
  calories?: number;
  prep_time_minutes: number;
  ingredients_ar?: string;
  is_available: boolean;
  is_featured: boolean;
  sizes: ProductSize[];
  addons: ProductAddon[];
}

export interface OrderItem {
  id: string;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  selected_size?: ProductSize;
  selected_addons?: ProductAddon[];
  special_instructions?: string;
  subtotal: number;
}

export type OrderType = 'dine_in' | 'takeaway' | 'delivery' | 'pre_order';
export type OrderStatus = 'new' | 'in_review' | 'preparing' | 'ready' | 'out_for_delivery' | 'completed' | 'cancelled';

export interface Order {
  id: number;
  order_number: string;
  restaurant_id: number;
  branch_id: number;
  branch_name: string;
  table_id?: number;
  table_number?: string;
  order_type: OrderType;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  delivery_fee: number;
  total_amount: number;
  customer_name: string;
  customer_phone?: string;
  delivery_address?: string;
  delivery_coords?: { lat: number; lng: number };
  notes?: string;
  payment_method?: 'cash' | 'visa' | 'mastercard' | 'zaincash' | 'asia_hawala' | 'qicard';
  payment_status: 'pending' | 'completed' | 'refunded';
  created_at: string;
  items: OrderItem[];
}

export interface Reservation {
  id: number;
  restaurant_id: number;
  branch_id: number;
  branch_name: string;
  customer_name: string;
  customer_phone: string;
  guest_count: number;
  reservation_date: string;
  reservation_time: string;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface Review {
  id: number;
  restaurant_id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  is_approved: boolean;
}

export interface Plan {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  price_monthly: number;
  price_yearly: number;
  currency: string;
  max_branches: number;
  max_tables: number;
  max_products: number;
  has_pos: boolean;
  has_kds: boolean;
  has_delivery_gps: boolean;
  has_ai_analytics: boolean;
  has_custom_domain: boolean;
  trial_days?: number;
  features: string[];
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  is_active: boolean;
}

export interface ActivityLog {
  id: number;
  user_name: string;
  role: string;
  action: string;
  description: string;
  timestamp: string;
}
