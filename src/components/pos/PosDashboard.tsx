import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { Product, OrderItem, DiningTable, Order } from '../../types';
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Receipt,
  User,
  ShoppingBag,
  Sparkles,
  Bell,
  Clock,
  Phone,
  MapPin,
  ChefHat,
  Check,
  X,
  AlertCircle,
  Bike,
  Eye,
  Store,
  UtensilsCrossed,
  ChevronDown,
  TrendingUp
} from 'lucide-react';

export const PosDashboard: React.FC = () => {
  const {
    activeRestaurant,
    setActiveRestaurant,
    restaurants,
    activeBranch,
    branches,
    categories,
    products,
    tables,
    createOrder,
    orders,
    updateOrderStatus,
    playNotificationSound,
    coupons,
    applyCoupon,
    setCurrentRole,
    currentUser
  } = useApp();

  const [showRestPicker, setShowRestPicker] = useState(false);

  const restaurantProducts = products.filter(p => p.restaurant_id === activeRestaurant?.id);
  const restaurantCategories = categories.filter(c => c.restaurant_id === activeRestaurant?.id);
  const branchTables = tables.filter(t => !activeBranch?.id || t.branch_id === activeBranch.id);

  const [selectedCatId, setSelectedCatId] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedOrderType, setSelectedOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [selectedTable, setSelectedTable] = useState<DiningTable | null>(branchTables[0] || null);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Incoming Online / External Orders state (Waiting for Cashier Confirmation)
  const [showIncomingDrawer, setShowIncomingDrawer] = useState(false);
  const [selectedIncomingOrder, setSelectedIncomingOrder] = useState<Order | null>(null);
  const [incomingSuccessMsg, setIncomingSuccessMsg] = useState<string | null>(null);

  // View Mode: 'register' (نقطة البيع السريعة) or 'orders_log' (شاشة المبيعات والطلبات للمتابعة)
  const [posViewMode, setPosViewMode] = useState<'register' | 'orders_log'>('register');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'new' | 'preparing' | 'ready' | 'completed' | 'cancelled'>('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'all' | 'dine_in' | 'takeaway' | 'delivery'>('all');
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);

  const currRestId = Number(activeRestaurant?.id || currentUser?.restaurant_id || 1);
  const restaurantOrders = orders.filter(o => Number(o.restaurant_id) === currRestId);
  const totalSales = restaurantOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const completedOrders = restaurantOrders.filter(o => o.status === 'completed');

  // Filtered orders for the Orders & Sales monitoring table
  const filteredOrdersLog = restaurantOrders.filter(o => {
    if (orderStatusFilter !== 'all' && o.status !== orderStatusFilter) {
      return false;
    }
    if (orderTypeFilter !== 'all' && o.order_type !== orderTypeFilter) {
      return false;
    }
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.trim().toLowerCase();
      const matchNum = String(o.order_number || '').toLowerCase().includes(q);
      const matchCustomer = String(o.customer_name || '').toLowerCase().includes(q);
      const matchPhone = String(o.customer_phone || '').includes(q);
      const matchTable = String(o.table_number || '').toLowerCase().includes(q);
      return matchNum || matchCustomer || matchPhone || matchTable;
    }
    return true;
  });

  // Strictly filter pending incoming orders for the active restaurant ONLY
  const incomingOrders = orders.filter(o => {
    const orderRestId = Number(o.restaurant_id);
    const isSameRest = orderRestId === currRestId;
    const s = String(o.status || '').toLowerCase().trim();
    return isSameRest && (s === 'new' || s === 'in_review');
  });

  // Sound alert on new incoming order
  const prevIncomingCount = useRef(incomingOrders.length);
  useEffect(() => {
    if (incomingOrders.length > prevIncomingCount.current) {
      try {
        playNotificationSound();
      } catch {}
    }
    prevIncomingCount.current = incomingOrders.length;
  }, [incomingOrders.length, playNotificationSound]);

  const handleAcceptOrder = (orderId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    updateOrderStatus(orderId, 'preparing');
    setIncomingSuccessMsg(`✅ تم تأكيد الطلب #${orderId} وإرساله للمطبخ بنجاح!`);
    setTimeout(() => setIncomingSuccessMsg(null), 3000);
  };

  const handleRejectOrder = (orderId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('هل أنت متأكد من رفض هذا الطلب؟')) {
      updateOrderStatus(orderId, 'cancelled');
      setIncomingSuccessMsg(`⚠️ تم رفض الطلب #${orderId}`);
      setTimeout(() => setIncomingSuccessMsg(null), 3000);
    }
  };

  const handlePrintIncomingOrder = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompletedOrderReceipt({
      order,
      cashTendered: order.total_amount,
      changeDue: 0
    });
  };

  // Payment Drawer state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'visa' | 'mastercard' | 'zaincash' | 'asia_hawala' | 'qicard'>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);

  // Receipt Modal state
  const [completedOrderReceipt, setCompletedOrderReceipt] = useState<any | null>(null);

  const filteredProducts = restaurantProducts.filter(p => {
    const matchesCat = selectedCatId === 'all' || p.category_id === selectedCatId;
    const matchesSearch = p.name_ar.includes(searchQuery) ||
                          p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.id.toString() === searchQuery;
    return matchesCat && matchesSearch;
  });

  const addToCart = (product: Product) => {
    const existingIndex = cart.findIndex(item => item.product_id === product.id);
    const unitPrice = product.discount_price || product.base_price;

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = updated[existingIndex].quantity * updated[existingIndex].unit_price;
      setCart(updated);
    } else {
      const newItem: OrderItem = {
        id: `item-${Date.now()}-${Math.random()}`,
        product_id: product.id,
        product_name: product.name_ar,
        unit_price: unitPrice,
        quantity: 1,
        subtotal: unitPrice
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        return {
          ...item,
          quantity: newQty,
          subtotal: newQty * item.unit_price
        };
      }
      return item;
    }).filter(Boolean) as OrderItem[]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const taxRate = activeRestaurant?.tax_percentage || 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount);

  const handleApplyCoupon = () => {
    const res = applyCoupon(couponCode, subtotal);
    if (res.success) {
      setDiscountAmount(res.discount);
    } else {
      alert(res.message);
    }
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) return;

    const order = createOrder({
      restaurant_id: activeRestaurant?.id || 1,
      branch_id: activeBranch?.id || 1,
      branch_name: activeBranch?.name_ar || 'الفرع الرئيسي',
      table_id: selectedOrderType === 'dine_in' ? selectedTable?.id : undefined,
      table_number: selectedOrderType === 'dine_in' ? selectedTable?.table_number : undefined,
      order_type: selectedOrderType,
      status: 'preparing', // Counter order entered directly by cashier goes straight to kitchen
      discount_amount: discountAmount,
      items: cart,
      payment_method: selectedPaymentMethod,
      payment_status: 'completed',
      customer_name: 'زبون الكاشير (POS)'
    });

    setCompletedOrderReceipt({
      order,
      cashTendered: selectedPaymentMethod === 'cash' ? (cashTendered || totalAmount) : totalAmount,
      changeDue: selectedPaymentMethod === 'cash' ? Math.max(0, (cashTendered || totalAmount) - totalAmount) : 0
    });

    setShowPaymentModal(false);
    setCart([]);
    setDiscountAmount(0);
    setCouponCode('');
    setCashTendered(0);
  };

  if (!activeRestaurant) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center max-w-xl mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center mb-4">
          <Receipt className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">شاشة نقاط البيع والكاشير (POS)</h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          يرجى تسجيل مطعم وتحديده أولاً لاستخدام شاشة الكاشير ومعالجة الطلبات وإصدار الفواتير الحرارية.
        </p>
        <button
          onClick={() => setCurrentRole('super_admin')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
        >
          <span>الانتقال لتسجيل مطعم جديد (لوحة الإدارة)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 min-h-[calc(100vh-120px)] relative">
      {/* Top Header Switcher: Fast POS Register vs Sales & Orders Tracking */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2.5 rounded-2xl shadow-lg">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setPosViewMode('register')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              posViewMode === 'register'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>نقطة البيع وتسجيل الطلبات (POS)</span>
          </button>

          <button
            type="button"
            onClick={() => setPosViewMode('orders_log')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              posViewMode === 'orders_log'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>شاشة المبيعات وسجل الطلبات (للمتابعة)</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              posViewMode === 'orders_log' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-amber-400'
            }`}>
              {restaurantOrders.length}
            </span>
          </button>
        </div>

        {/* Right side controls: Restaurant Switcher + Online Orders alert */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Restaurant Switcher for Cashier (Only super_admin can switch) */}
          {currentUser?.role === 'super_admin' && restaurants.length > 1 && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowRestPicker(!showRestPicker)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
                title="تغيير المطعم الحالي لشاشة الكاشير"
              >
                <Store className="w-4 h-4 text-amber-400" />
                <span className="truncate max-w-[110px]">{activeRestaurant?.name_ar || 'اختر المطعم'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {showRestPicker && (
                <div className="absolute top-full mt-1.5 right-0 w-60 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 animate-fade-in font-cairo">
                  <div className="px-3.5 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>المطعم النشط للكاشير</span>
                    <span className="text-[10px] text-amber-400 font-mono">({restaurants.length})</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1">
                    {restaurants.map(rest => (
                      <button
                        key={rest.id}
                        type="button"
                        onClick={() => {
                          setActiveRestaurant(rest);
                          setShowRestPicker(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-right hover:bg-slate-800 transition-colors cursor-pointer ${
                          rest.id === activeRestaurant?.id ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-slate-200'
                        }`}
                      >
                        <Store className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate flex-1">{rest.name_ar}</span>
                        {rest.id === activeRestaurant?.id && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dedicated Incoming Online Orders Alert Button (Non-intrusive) */}
          <button
            type="button"
            onClick={() => setShowIncomingDrawer(true)}
            className={`flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 shadow-lg ${
              incomingOrders.length > 0
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 border-amber-400 ring-2 ring-amber-500/50 animate-pulse'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
            title="الطلبات الخارجية الواردة بانتظار التأكيد والإرسال للمطبخ"
          >
            <Bell className={`w-4 h-4 ${incomingOrders.length > 0 ? 'text-slate-950 animate-bounce' : 'text-slate-400'}`} />
            <span>الطلبات الواردة</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${
              incomingOrders.length > 0 ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {incomingOrders.length}
            </span>
          </button>
        </div>
      </div>

      {posViewMode === 'register' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          {/* Products & Fast Sale Grid (8 Cols) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* POS Fast Search Bar */}
            <div className="flex items-center gap-2.5">
              <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex items-center gap-3 flex-1 shadow-sm">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="البحث بالاسم، أو رقم الصنف السريع (مثال: 1، كباب، برغر)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono shrink-0">
                  <Barcode className="w-4 h-4 text-amber-400" />
                  <span>Barcode Ready</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPosViewMode('orders_log')}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-2xl text-xs font-bold text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer shrink-0"
                title="فتح شاشة المبيعات وسجل الطلبات للمتابعة"
              >
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">سجل المبيعات</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-amber-400 font-bold">
                  {restaurantOrders.length}
                </span>
              </button>
            </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCatId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCatId === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            الكل
          </button>
          {restaurantCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCatId(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCatId === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.name_ar}
            </button>
          ))}
        </div>

        {/* Product Cards for Rapid Click Add */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredProducts.map(prod => {
            const price = prod.discount_price || prod.base_price;
            return (
              <div
                key={prod.id}
                onClick={() => addToCart(prod)}
                className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all active:scale-95 group select-none shadow-sm"
              >
                <div>
                  <div className="h-28 rounded-xl overflow-hidden bg-slate-950 mb-2 relative">
                    <img
                      src={prod.image_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-1.5 left-1.5 bg-slate-950/80 text-amber-400 text-[10px] font-mono px-1.5 py-0.5 rounded">
                      #{prod.id}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs line-clamp-1">{prod.name_ar}</h4>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-amber-400 font-bold font-mono text-xs">
                    {price.toLocaleString()} د.ع
                  </span>
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POS Cart & Bill Summary Panel (4-5 Cols) */}
      <div className="lg:col-span-5 xl:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-2xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-sm">سلة البيع الحالية</h3>
            </div>
            <span className="text-xs font-mono text-slate-400 font-medium">{cart.length} أصناف</span>
          </div>

          {/* Dine-in vs Takeaway selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedOrderType('dine_in')}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                selectedOrderType === 'dine_in'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              داخل الصالة (طاولة)
            </button>
            <button
              onClick={() => setSelectedOrderType('takeaway')}
              className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                selectedOrderType === 'takeaway'
                  ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              سفري (Takeaway)
            </button>
          </div>

          {selectedOrderType === 'dine_in' && (
            <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 whitespace-nowrap">الطاولة:</span>
              <select
                value={selectedTable?.id}
                onChange={e => {
                  const t = branchTables.find(tbl => tbl.id === Number(e.target.value));
                  if (t) setSelectedTable(t);
                }}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-1.5 font-mono"
              >
                {branchTables.map(tbl => (
                  <option key={tbl.id} value={tbl.id}>
                    {tbl.table_number} ({tbl.capacity} مقاعد) - {tbl.status}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cart Items List */}
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                السلة فارغة، انقر على الأصناف لإضافتها للفاتورة
              </div>
            ) : (
              cart.map(item => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800/80 p-2.5 rounded-xl flex items-center justify-between gap-2"
                >
                  <div className="flex-1 truncate">
                    <div className="font-semibold text-white text-xs truncate">{item.product_name}</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {item.unit_price.toLocaleString()} × {item.quantity} = {item.subtotal.toLocaleString()} د.ع
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-900 rounded-lg p-1 border border-slate-800">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-mono font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Coupon Input */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder="كود خصم (مثال: SUFRAH10)"
              value={couponCode}
              onChange={e => setCouponCode(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono uppercase"
            />
            <button
              onClick={handleApplyCoupon}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200"
            >
              تطبيق
            </button>
          </div>
        </div>

        {/* Bill Totals & Pay Button */}
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>المجموع الفرعي:</span>
            <span className="font-mono text-slate-200">{subtotal.toLocaleString()} د.ع</span>
          </div>
          {taxAmount > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>ضريبة القيمة المضافة ({taxRate}%):</span>
              <span className="font-mono text-slate-200">{taxAmount.toLocaleString()} د.ع</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
              <span>الخصم المطبق:</span>
              <span className="font-mono">-{discountAmount.toLocaleString()} د.ع</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
            <span>المبلغ المستحق للدفع:</span>
            <span className="text-amber-400 font-mono text-base font-black">
              {totalAmount.toLocaleString()} د.ع
            </span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => setShowPaymentModal(true)}
            className="w-full mt-3 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 disabled:pointer-events-none text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Banknote className="w-5 h-5" />
            <span>تسديد الحساب وإصدار الفاتورة ({totalAmount.toLocaleString()} د.ع)</span>
          </button>
        </div>
      </div>
    </div>
      ) : (
        /* Tab: Sales and Orders Monitoring Screen (Matching Owner Dashboard) */
        <div className="space-y-6 animate-fade-in">
          {/* Top Header Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-sm shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>شاشة المبيعات ومتابعة الطلبات</span>
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                    {activeRestaurant?.name_ar}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  متابعة مبيعات اليوم، إشغال الصالة، وتفاصيل وحالة جميع طلبات المطعم فورياً
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPosViewMode('register')}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل طلب جديد (POS)</span>
            </button>
          </div>

          {/* 3 KPI Stat Cards - Identical to Owner Dashboard Overview Tab */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-semibold">مبيعات اليوم</span>
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Banknote className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {totalSales.toLocaleString()} د.ع
              </div>
              <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>من {completedOrders.length} طلبات مكتملة</span>
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-semibold">متوسط قيمة الطلب</span>
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                  <CreditCard className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {Math.round(totalSales / (restaurantOrders.length || 1)).toLocaleString()} د.ع
              </div>
              <p className="text-[11px] text-slate-400 mt-1">معدل الفاتورة للزبون</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-semibold">إشغال الطاولات الحالي</span>
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Store className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {tables.filter(t => t.status === 'occupied').length} / {tables.length}
              </div>
              <p className="text-[11px] text-amber-400 mt-1">طاولات مشغولة داخل الصالة</p>
            </div>
          </div>

          {/* Sijill al-Talabat al-Haliya (Current Orders Log Table matching Owner Dashboard) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>سجل الطلبات الحالية بالمطعم</span>
                  <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-mono font-bold rounded-full border border-amber-500/20">
                    {filteredOrdersLog.length} طلب
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  البحث والتصفية، معاينة تفاصيل الطلب، تحديث الحالة، وإعادة طباعة الفواتير
                </p>
              </div>

              {/* Search input */}
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث برقم الطلب، اسم الزبون، أو الهاتف..."
                  value={orderSearchQuery}
                  onChange={e => setOrderSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold ml-1">حالة الطلب:</span>
              {[
                { id: 'all', label: 'الكل' },
                { id: 'new', label: 'جديد' },
                { id: 'preparing', label: 'قيد التحضير' },
                { id: 'ready', label: 'جاهز' },
                { id: 'completed', label: 'مكتمل' },
                { id: 'cancelled', label: 'ملغي' },
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setOrderStatusFilter(st.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    orderStatusFilter === st.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  {st.label}
                </button>
              ))}

              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />

              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold ml-1">النوع:</span>
              {[
                { id: 'all', label: 'كافة الأنواع' },
                { id: 'dine_in', label: 'داخل الصالة' },
                { id: 'takeaway', label: 'سفري' },
                { id: 'delivery', label: 'توصيل خارجي' },
              ].map(tp => (
                <button
                  key={tp.id}
                  type="button"
                  onClick={() => setOrderTypeFilter(tp.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    orderTypeFilter === tp.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  {tp.label}
                </button>
              ))}
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full text-right text-xs bg-white">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-bold">
                  <tr>
                    <th className="py-3 px-3">رقم الطلب</th>
                    <th className="py-3 px-3">الوقت</th>
                    <th className="py-3 px-3">النوع</th>
                    <th className="py-3 px-3">الزبون / الهاتف</th>
                    <th className="py-3 px-3">المبلغ الإجمالي</th>
                    <th className="py-3 px-3">طريقة الدفع</th>
                    <th className="py-3 px-3">الحالة</th>
                    <th className="py-3 px-3 text-center">إجراءات المتابعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
                  {filteredOrdersLog.length === 0 ? (
                    <tr className="bg-white">
                      <td colSpan={8} className="py-12 text-center text-slate-500 bg-white">
                        لا توجد طلبات تطابق الفلتر الحالي
                      </td>
                    </tr>
                  ) : (
                    filteredOrdersLog.map(o => (
                      <tr key={o.id} className="bg-white hover:bg-amber-50/60 dark:bg-transparent dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400 bg-white">
                          #{o.order_number}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400 text-[11px] bg-white">
                          {new Date(o.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-3 bg-white">
                          {o.order_type === 'dine_in' ? (
                            <span className="inline-flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold">
                              <span>داخل المطعم</span>
                              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">({o.table_number || 'صالة'})</span>
                            </span>
                          ) : o.order_type === 'takeaway' ? (
                            <span className="text-cyan-700 dark:text-cyan-400 font-bold">سفري (Takeaway)</span>
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">توصيل خارجي</span>
                          )}
                        </td>
                        <td className="py-3 px-3 bg-white">
                          <div className="font-bold text-slate-900 dark:text-white">{o.customer_name || 'زبون عام'}</div>
                          {o.customer_phone && (
                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{o.customer_phone}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white bg-white">
                          {o.total_amount.toLocaleString()} د.ع
                        </td>
                        <td className="py-3 px-3 uppercase text-slate-700 dark:text-slate-300 font-mono text-[11px] font-medium bg-white">
                          {o.payment_method === 'cash' ? 'نقداً (Cash)' :
                           o.payment_method === 'visa' || o.payment_method === 'mastercard' ? 'بطاقة بنكية' :
                           o.payment_method === 'zaincash' ? 'زين كاش' : o.payment_method}
                        </td>
                        <td className="py-3 px-3 bg-white">
                          <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                            o.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                            o.status === 'preparing' ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                            o.status === 'ready' ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                            o.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' :
                            'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
                          }`}>
                            {o.status === 'new' ? 'جديد' :
                             o.status === 'in_review' ? 'قيد المراجعة' :
                             o.status === 'preparing' ? 'قيد التحضير' :
                             o.status === 'ready' ? 'جاهز' :
                             o.status === 'out_for_delivery' ? 'في الطريق' :
                             o.status === 'completed' ? 'مكتمل' :
                             o.status === 'cancelled' ? 'ملغي' : o.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 bg-white">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Order Details */}
                            <button
                              type="button"
                              onClick={() => setSelectedDetailOrder(o)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:border-transparent dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
                              title="معاينة تفاصيل الطلب والأصناف"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Print Receipt */}
                            <button
                              type="button"
                              onClick={() => handlePrintIncomingOrder(o)}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 dark:border-transparent dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-400 rounded-lg transition-colors cursor-pointer"
                              title="طباعة إيصال الفاتورة"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Change status quick actions */}
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value as any)}
                              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-800 dark:text-slate-300 rounded-lg px-1.5 py-1 focus:outline-none focus:border-amber-500 font-semibold cursor-pointer shadow-sm"
                              title="تحديث حالة الطلب"
                            >
                              <option value="new">جديد</option>
                              <option value="preparing">قيد التحضير</option>
                              <option value="ready">جاهز</option>
                              <option value="completed">مكتمل</option>
                              <option value="cancelled">ملغي</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payment Selection Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-cairo">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">طريقة الدفع وإتمام الفاتورة</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>

            <div className="text-center py-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">إجمالي المبلغ المطلوب:</span>
              <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                {totalAmount.toLocaleString()} د.ع
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">اختر وسيلة الدفع:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'cash', label: 'نقدي (Cash)', icon: <Banknote className="w-4 h-4 text-emerald-500" /> },
                  { id: 'zaincash', label: 'زين كاش (ZainCash)', icon: <Smartphone className="w-4 h-4 text-amber-500" /> },
                  { id: 'asia_hawala', label: 'آسيا حوالة', icon: <Smartphone className="w-4 h-4 text-rose-500" /> },
                  { id: 'qicard', label: 'كي كارد (QiCard)', icon: <CreditCard className="w-4 h-4 text-blue-500" /> },
                  { id: 'visa', label: 'Visa Card', icon: <CreditCard className="w-4 h-4 text-indigo-500" /> },
                  { id: 'mastercard', label: 'MasterCard', icon: <CreditCard className="w-4 h-4 text-orange-500" /> },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedPaymentMethod(m.id as any)}
                    className={`p-3 rounded-xl border flex items-center gap-2 font-bold transition-all cursor-pointer ${
                      selectedPaymentMethod === m.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 shadow-sm'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedPaymentMethod === 'cash' && (
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <label className="block text-slate-600 dark:text-slate-400 font-semibold">المبلغ المستلم من الزبون (د.ع):</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={cashTendered || ''}
                    placeholder={totalAmount.toString()}
                    onChange={e => setCashTendered(Number(e.target.value))}
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-slate-900 dark:text-white font-mono text-sm font-bold"
                  />
                  <button
                    onClick={() => setCashTendered(totalAmount)}
                    className="px-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold cursor-pointer"
                  >
                    مطابق
                  </button>
                </div>
                {cashTendered > totalAmount && (
                  <div className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-between pt-1">
                    <span>الباقي للزبون:</span>
                    <span className="font-mono text-sm">{(cashTendered - totalAmount).toLocaleString()} د.ع</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleCompleteSale}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm rounded-xl transition-all shadow-md cursor-pointer"
            >
              تأكيد الدفع وطباعة الإيصال
            </button>
          </div>
        </div>
      )}

      {/* Thermal Receipt Print Modal - Authentic Supermarket Layout */}
      {completedOrderReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-cairo">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>تم تجهيز الفاتورة بنجاح</span>
              </span>
              <button onClick={() => setCompletedOrderReceipt(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>

            {/* Printable Thermal Paper Slip (Supermarket Format - 80mm) */}
            <div className="printable-receipt bg-white text-black p-4 rounded-xl font-mono text-[11px] leading-tight space-y-2.5 border border-slate-200 shadow-sm" dir="rtl">
              {/* Restaurant Header */}
              <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-black">
                <div className="font-black text-base">{activeRestaurant?.name_ar || 'سُفرة'}</div>
                <div className="text-[10px] font-semibold">{activeBranch?.name_ar || 'الفرع الرئيسي'}</div>
                {activeBranch?.phone && <div className="text-[10px]">هاتف: {activeBranch.phone}</div>}
                {activeRestaurant?.address && <div className="text-[9px] text-slate-700">{activeRestaurant.address}</div>}
              </div>

              {/* Order Info */}
              <div className="text-[10px] space-y-0.5 pb-2 border-b border-dashed border-black">
                <div className="flex justify-between font-bold">
                  <span>رقم الفاتورة:</span>
                  <span>#{completedOrderReceipt.order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>التاريخ والوقت:</span>
                  <span>{new Date(completedOrderReceipt.order.created_at || Date.now()).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>نوع الطلب:</span>
                  <span className="font-bold">
                    {completedOrderReceipt.order.order_type === 'dine_in' ? `داخل الصالة (طاولة ${completedOrderReceipt.order.table_number || completedOrderReceipt.order.table_id || 'عام'})` :
                     completedOrderReceipt.order.order_type === 'takeaway' ? 'استلام سفري (Takeaway)' : 'توصيل دليفري (Delivery)'}
                  </span>
                </div>
                {completedOrderReceipt.order.customer_name && completedOrderReceipt.order.customer_name !== 'زبون الكاشير (POS)' && (
                  <div className="flex justify-between">
                    <span>الزبون:</span>
                    <span>{completedOrderReceipt.order.customer_name}</span>
                  </div>
                )}
                {completedOrderReceipt.order.customer_phone && (
                  <div className="flex justify-between">
                    <span>الهاتف:</span>
                    <span dir="ltr">{completedOrderReceipt.order.customer_phone}</span>
                  </div>
                )}
                {completedOrderReceipt.order.delivery_address && (
                  <div className="text-[9px] pt-0.5">
                    <span className="font-bold">العنوان: </span>
                    <span>{completedOrderReceipt.order.delivery_address}</span>
                  </div>
                )}
              </div>

              {/* Items Table (Supermarket Column Format) */}
              <div className="pb-2 border-b border-dashed border-black">
                <div className="grid grid-cols-12 font-bold text-[10px] pb-1 border-b border-black">
                  <span className="col-span-6 text-right">الصنف</span>
                  <span className="col-span-2 text-center">العدد</span>
                  <span className="col-span-2 text-center">السعر</span>
                  <span className="col-span-2 text-left">المجموع</span>
                </div>
                <div className="divide-y divide-dashed divide-slate-300 py-1 text-[10px]">
                  {completedOrderReceipt.order.items.map((it: OrderItem, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 py-1 items-center">
                      <span className="col-span-6 text-right font-semibold truncate">{it.product_name}</span>
                      <span className="col-span-2 text-center font-bold">{it.quantity}</span>
                      <span className="col-span-2 text-center font-mono">{it.unit_price?.toLocaleString()}</span>
                      <span className="col-span-2 text-left font-mono font-bold">{it.subtotal?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Totals */}
              <div className="text-[10px] space-y-1 pb-2 border-b-2 border-black">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono">{completedOrderReceipt.order.subtotal?.toLocaleString()} د.ع</span>
                </div>

                {/* Delivery fee: ONLY shown if greater than 0 */}
                {completedOrderReceipt.order.delivery_fee && completedOrderReceipt.order.delivery_fee > 0 ? (
                  <div className="flex justify-between font-bold">
                    <span>أجور التوصيل:</span>
                    <span className="font-mono">{completedOrderReceipt.order.delivery_fee.toLocaleString()} د.ع</span>
                  </div>
                ) : null}

                {completedOrderReceipt.order.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span>الضريبة:</span>
                    <span className="font-mono">{completedOrderReceipt.order.tax_amount.toLocaleString()} د.ع</span>
                  </div>
                )}

                {completedOrderReceipt.order.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span>الخصم المطبق:</span>
                    <span className="font-mono">-{completedOrderReceipt.order.discount_amount.toLocaleString()} د.ع</span>
                  </div>
                )}

                {/* Grand Total */}
                <div className="flex justify-between font-black text-sm pt-1 border-t border-black">
                  <span>الإجمالي النهائي:</span>
                  <span className="font-mono">{completedOrderReceipt.order.total_amount?.toLocaleString()} د.ع</span>
                </div>

                {/* Payment Breakdown */}
                <div className="flex justify-between pt-1 text-[9px]">
                  <span>طريقة الدفع:</span>
                  <span className="font-bold uppercase">{completedOrderReceipt.order.payment_method === 'cash' ? 'نقداً (Cash)' : completedOrderReceipt.order.payment_method}</span>
                </div>
                {completedOrderReceipt.cashTendered > 0 && completedOrderReceipt.order.payment_method === 'cash' && (
                  <>
                    <div className="flex justify-between text-[9px]">
                      <span>المدفوع:</span>
                      <span className="font-mono">{completedOrderReceipt.cashTendered.toLocaleString()} د.ع</span>
                    </div>
                    {completedOrderReceipt.changeDue > 0 && (
                      <div className="flex justify-between text-[9px] font-bold">
                        <span>المتبقي (الباقي):</span>
                        <span className="font-mono">{completedOrderReceipt.changeDue.toLocaleString()} د.ع</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Barcode & Supermarket Footer */}
              <div className="text-center pt-2 space-y-1 text-[9px]">
                <div className="font-mono tracking-widest text-xs font-bold">||||| | ||||| || |||||| | ||||</div>
                <div className="font-bold">شكراً لزيارتكم ونتمنى لكم وجبة شهية!</div>
                <div className="text-[8px] text-slate-600">نظام سُفرة السحابي لإدارة المطاعم</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => window.print()}
                className="py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة حرارية (80mm)</span>
              </button>
              <button
                onClick={() => setCompletedOrderReceipt(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Online Orders Slide-over Drawer (Non-blocking, does not touch active cart) */}
      {showIncomingDrawer && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-start bg-slate-950/70 backdrop-blur-sm animate-fade-in font-cairo" dir="rtl">
          <div className="w-full max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  incomingOrders.length > 0 ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <span>الطلبات الواردة أونلاين</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                      {incomingOrders.length} طلب معلق
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">مراجعة وتأكيد طلبات الزبائن قبل إرسالها للمطبخ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIncomingDrawer(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Notification alert banner */}
            {incomingSuccessMsg && (
              <div className="m-4 mb-0 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-xs flex items-center gap-2 animate-fade-in font-bold">
                <span>{incomingSuccessMsg}</span>
              </div>
            )}

            {/* Orders List Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50 dark:bg-slate-950/40">
              {incomingOrders.length === 0 ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-16 h-16 rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-500 mb-3 shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">لا توجد طلبات معلقة حالياً</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                    جميع الطلبات الخارجية تم تأكيدها وإرسالها للمطبخ بنجاح. أي طلب جديد يصل سيظهر هنا فوراً مع رنة تنبيه.
                  </p>
                </div>
              ) : (
                incomingOrders.map(order => {
                  const isDelivery = order.order_type === 'delivery';
                  const isTakeaway = order.order_type === 'takeaway';
                  const isDineIn = order.order_type === 'dine_in';

                  return (
                    <div
                      key={order.id}
                      className="bg-white dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-amber-400 rounded-2xl p-4 space-y-3 shadow-sm transition-all"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isDelivery && (
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                              <Bike className="w-3 h-3" />
                              <span>توصيل دليفري</span>
                            </span>
                          )}
                          {isTakeaway && (
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                              <ShoppingBag className="w-3 h-3" />
                              <span>استلام سفري</span>
                            </span>
                          )}
                          {isDineIn && (
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                              <UtensilsCrossed className="w-3 h-3" />
                              <span>طاولة {order.table_number || order.table_id}</span>
                            </span>
                          )}
                          <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                            #{order.order_number}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {new Date(order.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Customer Details */}
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{order.customer_name}</span>
                          {order.customer_phone && (
                            <a
                              href={`tel:${order.customer_phone}`}
                              className="flex items-center gap-1 text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-mono font-bold"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{order.customer_phone}</span>
                            </a>
                          )}
                        </div>

                        {order.delivery_address && (
                          <div className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300 text-[11px] pt-1">
                            <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                            <span>{order.delivery_address}</span>
                          </div>
                        )}

                        {order.notes && (
                          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/15 text-amber-900 dark:text-amber-300 text-[11px]">
                            <span className="font-bold">ملاحظات:</span> {order.notes}
                          </div>
                        )}
                      </div>

                      {/* Items Summary */}
                      <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="py-1 flex items-center justify-between">
                            <span className="text-slate-800 dark:text-slate-200">
                              <span className="font-bold text-amber-600 dark:text-amber-400 font-mono ml-1">{it.quantity}x</span>
                              {it.product_name}
                            </span>
                            <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{it.subtotal.toLocaleString()} د.ع</span>
                          </div>
                        ))}
                      </div>

                      {/* Price Total */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">الإجمالي المستحق:</span>
                        <span className="font-black text-amber-600 dark:text-amber-400 text-sm font-mono">
                          {order.total_amount.toLocaleString()} د.ع
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={(e) => handleAcceptOrder(order.id, e)}
                          className="sm:col-span-7 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <ChefHat className="w-4 h-4" />
                          <span>تأكيد وإرسال للمطبخ 👨‍🍳</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handlePrintIncomingOrder(order, e)}
                          className="sm:col-span-3 py-2.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer border border-slate-200 dark:border-transparent"
                          title="طباعة الفاتورة"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>طباعة</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleRejectOrder(order.id, e)}
                          className="sm:col-span-2 py-2.5 px-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-500/20 flex items-center justify-center transition-all cursor-pointer"
                          title="رفض أو إلغاء الطلب"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            {incomingOrders.length > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    incomingOrders.forEach(o => updateOrderStatus(o.id, 'preparing'));
                    setIncomingSuccessMsg(`✅ تم تأكيد جميع الطلبات (${incomingOrders.length}) وإرسالها للمطبخ!`);
                    setTimeout(() => setIncomingSuccessMsg(null), 3000);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>تأكيد كل الطلبات دفعة واحدة وإرسالها للمطبخ ({incomingOrders.length})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    {/* Selected Order Details Modal for Cashier Monitoring */}
    {selectedDetailOrder && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in font-cairo">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  تفاصيل الطلب #{selectedDetailOrder.order_number}
                </h3>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {new Date(selectedDetailOrder.created_at).toLocaleString('ar-EG')}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDetailOrder(null)}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content scrollable */}
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Customer and Order Type Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">نوع الطلب:</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {selectedDetailOrder.order_type === 'dine_in' ? `طاولة (${selectedDetailOrder.table_number || 'صالة'})` :
                   selectedDetailOrder.order_type === 'takeaway' ? 'استلام سفري (Takeaway)' : 'توصيل خارجي (Delivery)'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">الزبون:</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{selectedDetailOrder.customer_name || 'زبون عام'}</span>
                {selectedDetailOrder.customer_phone && (
                  <a href={`tel:${selectedDetailOrder.customer_phone}`} className="text-amber-600 dark:text-amber-400 text-[11px] font-mono mt-0.5 block font-bold">
                    {selectedDetailOrder.customer_phone}
                  </a>
                )}
              </div>
            </div>

            {selectedDetailOrder.delivery_address && (
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-start gap-2">
                <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">عنوان التوصيل:</span>
                  <span className="text-slate-800 dark:text-slate-200 mt-0.5 block font-medium">{selectedDetailOrder.delivery_address}</span>
                </div>
              </div>
            )}

            {selectedDetailOrder.notes && (
              <div className="p-3 bg-amber-50 dark:bg-amber-500/5 rounded-xl border border-amber-200 dark:border-amber-500/20 text-xs text-amber-900 dark:text-amber-300">
                <span className="font-bold block text-[11px] text-amber-700 dark:text-amber-400">ملاحظات الزبون:</span>
                <span>{selectedDetailOrder.notes}</span>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">الأصناف المطلوبة ({selectedDetailOrder.items?.length || 0}):</h4>
              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800/80 p-2 text-xs">
                {selectedDetailOrder.items?.map((it, idx) => (
                  <div key={idx} className="py-2 px-1 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-black">{it.quantity}x</span>
                        <span>{it.product_name}</span>
                        {it.selected_size && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">({it.selected_size.name_ar})</span>
                        )}
                      </div>
                      {it.selected_addons && it.selected_addons.length > 0 && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 pr-4">
                          + {it.selected_addons.map(a => a.name_ar).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="text-left font-mono font-bold text-slate-800 dark:text-slate-200">
                      {it.subtotal?.toLocaleString()} د.ع
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Financials */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>طريقة الدفع:</span>
                <span className="text-slate-900 dark:text-slate-200 font-bold uppercase">{selectedDetailOrder.payment_method}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>حالة الطلب:</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{selectedDetailOrder.status}</span>
              </div>
              <div className="flex justify-between text-slate-900 dark:text-white font-bold text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>المبلغ الإجمالي:</span>
                <span className="text-amber-600 dark:text-amber-400">{selectedDetailOrder.total_amount?.toLocaleString()} د.ع</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                handlePrintIncomingOrder(selectedDetailOrder);
              }}
              className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة إيصال الفاتورة</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDetailOrder(null)}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};
