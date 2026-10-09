/**
 * Production API & Real-time Live Synchronization Service
 * Connects React UI directly to Railway MySQL via REST & Server-Sent Events (SSE)
 */

import { Order, OrderStatus, Product, Category, DiningTable, Restaurant, Plan, Branch, Reservation, Review, Coupon, ActivityLog, User } from '../types';

export interface BootstrapData {
  restaurants: Restaurant[];
  branches: Branch[];
  tables: DiningTable[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  reservations: Reservation[];
  reviews: Review[];
  coupons: Coupon[];
  plans: Plan[];
  activityLogs: ActivityLog[];
  users?: User[];
}

export const api = {
  // 1. Fetch bootstrap data from Railway MySQL
  async fetchBootstrapData(): Promise<BootstrapData | null> {
    try {
      const res = await fetch('/api/data', {
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
    } catch (err) {
      console.warn('⚠️ Fetching from /api/data failed (falling back to cache/local):', err);
    }
    return null;
  },

  // 2. Orders API
  async createOrder(orderData: any): Promise<Order | null> {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const json = await res.json();
      if (json.success && json.order) {
        return json.order;
      }
    } catch (err) {
      console.error('Failed to create order via API:', err);
    }
    return null;
  },

  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<boolean> {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to update order status via API:', err);
      return false;
    }
  },

  // 3. Tables API
  async updateTableStatus(tableId: number, status: 'available' | 'occupied' | 'reserved'): Promise<boolean> {
    try {
      const res = await fetch(`/api/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to update table status via API:', err);
      return false;
    }
  },

  async addTable(tableData: Partial<DiningTable>): Promise<DiningTable | null> {
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableData)
      });
      const json = await res.json();
      if (json.success && json.table) return json.table;
    } catch (err) {
      console.error('Failed to add table via API:', err);
    }
    return null;
  },

  async deleteTable(tableId: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to delete table via API:', err);
      return false;
    }
  },

  // 4. Products API
  async addProduct(productData: Partial<Product>): Promise<Product | null> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      const json = await res.json();
      if (json.success && json.product) return json.product;
    } catch (err) {
      console.error('Failed to add product via API:', err);
    }
    return null;
  },

  async updateProduct(productId: number, updates: Partial<Product>): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to update product via API:', err);
      return false;
    }
  },

  async deleteProduct(productId: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to delete product via API:', err);
      return false;
    }
  },

  // 5. Categories API
  async addCategory(catData: Partial<Category>): Promise<Category | null> {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData)
      });
      const json = await res.json();
      if (json.success && json.category) return json.category;
    } catch (err) {
      console.error('Failed to add category via API:', err);
    }
    return null;
  },

  async updateCategory(catId: number, updates: Partial<Category>): Promise<Category | null> {
    try {
      const res = await fetch(`/api/categories/${catId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      if (json.success && json.category) return json.category;
    } catch (err) {
      console.error('Failed to update category via API:', err);
    }
    return null;
  },

  async deleteCategory(catId: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/categories/${catId}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to delete category via API:', err);
      return false;
    }
  },

  // 6. Restaurant Registration & Plan Activation
  async createRestaurant(data: any): Promise<{ restaurant: Restaurant; user?: User } | null> {
    try {
      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.success && json.restaurant) {
        return { restaurant: json.restaurant, user: json.user };
      }
    } catch (err) {
      console.error('Failed to create restaurant via API:', err);
    }
    return null;
  },

  async updateRestaurant(restaurantId: number, data: any): Promise<boolean> {
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to update restaurant via API:', err);
      return false;
    }
  },

  async updateRestaurantStatus(restaurantId: number, status: 'active' | 'suspended' | 'inactive'): Promise<boolean> {
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to update restaurant status via API:', err);
      return false;
    }
  },

  async deleteRestaurant(restaurantId: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to delete restaurant via API:', err);
      return false;
    }
  },

  async activatePlan(code: string, restaurantId?: number): Promise<{ success: boolean; message: string; planName?: string }> {
    try {
      const res = await fetch('/api/plans/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, restaurant_id: restaurantId })
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.error('Failed to activate plan via API:', err);
      return { success: false, message: 'فشل الاتصال بالخادم لتفعيل الباقة' };
    }
  },

  // 7. Auth Login
  async login(username: string, password?: string): Promise<{ success: boolean; user?: any; message?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const json = await res.json();
      return json;
    } catch (err) {
      console.error('Failed to login via API:', err);
      return { success: false, message: 'فشل الاتصال بخدمة التحقق' };
    }
  },

  // 8. Delete User API
  async deleteUser(userId: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      return res.ok;
    } catch (err) {
      console.warn('Failed to delete user via API:', err);
      return false;
    }
  },

  // 9. Server-Sent Events (SSE) Real-Time Listener
  subscribeToEvents(onEvent: (type: string, data: any) => void): () => void {
    if (typeof window === 'undefined' || !window.EventSource) {
      return () => {};
    }

    let es: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      try {
        es = new EventSource('/api/events');

        es.addEventListener('new_order', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('new_order', data);
          } catch {}
        });

        es.addEventListener('order_status_updated', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('order_status_updated', data);
          } catch {}
        });

        es.addEventListener('table_updated', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('table_updated', data);
          } catch {}
        });

        es.addEventListener('table_created', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('table_created', data);
          } catch {}
        });

        es.addEventListener('table_deleted', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('table_deleted', data);
          } catch {}
        });

        es.addEventListener('product_created', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('product_created', data);
          } catch {}
        });

        es.addEventListener('product_updated', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('product_updated', data);
          } catch {}
        });

        es.addEventListener('product_deleted', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('product_deleted', data);
          } catch {}
        });

        es.addEventListener('category_created', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('category_created', data);
          } catch {}
        });

        es.addEventListener('category_updated', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('category_updated', data);
          } catch {}
        });

        es.addEventListener('category_deleted', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('category_deleted', data);
          } catch {}
        });

        es.addEventListener('restaurant_created', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('restaurant_created', data);
          } catch {}
        });

        es.addEventListener('plan_activated', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('plan_activated', data);
          } catch {}
        });

        es.addEventListener('restaurant_updated', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('restaurant_updated', data);
          } catch {}
        });

        es.addEventListener('restaurant_status_updated', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('restaurant_status_updated', data);
          } catch {}
        });

        es.addEventListener('restaurant_deleted', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('restaurant_deleted', data);
          } catch {}
        });

        es.addEventListener('user_deleted', (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data);
            onEvent('user_deleted', data);
          } catch {}
        });

        es.onerror = () => {
          if (es) {
            es.close();
            es = null;
          }
          // Retry connection after 5s
          clearTimeout(reconnectTimeout);
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (err) {
        console.warn('SSE connection failed:', err);
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (es) {
        es.close();
        es = null;
      }
    };
  },

  async updateUser(userId: number, updates: Partial<User>): Promise<boolean> {
    try {
      const res = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, ...updates })
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to update user via API:', err);
      return false;
    }
  }
};
