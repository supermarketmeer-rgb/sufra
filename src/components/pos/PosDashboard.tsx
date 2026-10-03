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
  ChevronDown
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

  // Filter pending incoming orders with high tolerance & cross-restaurant visibility
  const isPendingStatus = (st: any) => {
    const s = String(st || '').toLowerCase().trim();
    return s === 'new' || s === 'in_review';
  };

  const currRestId = Number(activeRestaurant?.id || currentUser?.restaurant_id || 0);

  // Orders specifically matching the active restaurant
  const currentRestPending = orders.filter(o => {
    const orderRestId = Number(o.restaurant_id);
    const isSameRest = currRestId === 0 || orderRestId === currRestId;
    return isSameRest && isPendingStatus(o.status);
  });

  // All pending orders across the entire restaurant system
  const allSystemPending = orders.filter(o => isPendingStatus(o.status));

  // If the active restaurant has pending orders, show them.
  // If active restaurant has 0 orders but other restaurants have pending orders,
  // show all pending orders so the cashier NEVER misses a customer order!
  const incomingOrders = currentRestPending.length > 0 ? currentRestPending : allSystemPending;
  const isViewingOtherRestOrders = currentRestPending.length === 0 && allSystemPending.length > 0;

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-120px)] relative">
      {/* Products & Fast Sale Grid (8 Cols) */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* POS Top Action Bar: Search + Restaurant Switcher + Incoming Online Orders Alert Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
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

          {/* Restaurant Switcher for Cashier */}
          {restaurants.length > 1 && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowRestPicker(!showRestPicker)}
                className="flex items-center gap-2 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-2xl text-xs font-bold text-white transition-all shadow-sm cursor-pointer"
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
            className={`flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer shrink-0 shadow-lg ${
              incomingOrders.length > 0
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 border-amber-400 ring-2 ring-amber-500/50 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
            title="الطلبات الخارجية الواردة بانتظار التأكيد والإرسال للمطبخ"
          >
            <Bell className={`w-4 h-4 ${incomingOrders.length > 0 ? 'text-slate-950 animate-bounce' : 'text-slate-400'}`} />
            <span>الطلبات الواردة أونلاين</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${
              incomingOrders.length > 0 ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {incomingOrders.length}
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

      {/* Payment Selection Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">طريقة الدفع وإتمام الفاتورة</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="text-center py-2 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">إجمالي المبلغ المطلوب:</span>
              <div className="text-2xl font-black font-mono text-amber-400">
                {totalAmount.toLocaleString()} د.ع
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">اختر وسيلة الدفع:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'cash', label: 'نقدي (Cash)', icon: <Banknote className="w-4 h-4 text-emerald-400" /> },
                  { id: 'zaincash', label: 'زين كاش (ZainCash)', icon: <Smartphone className="w-4 h-4 text-amber-400" /> },
                  { id: 'asia_hawala', label: 'آسيا حوالة', icon: <Smartphone className="w-4 h-4 text-rose-400" /> },
                  { id: 'qicard', label: 'كي كارد (QiCard)', icon: <CreditCard className="w-4 h-4 text-blue-400" /> },
                  { id: 'visa', label: 'Visa Card', icon: <CreditCard className="w-4 h-4 text-indigo-400" /> },
                  { id: 'mastercard', label: 'MasterCard', icon: <CreditCard className="w-4 h-4 text-orange-400" /> },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedPaymentMethod(m.id as any)}
                    className={`p-3 rounded-xl border flex items-center gap-2 font-semibold transition-all ${
                      selectedPaymentMethod === m.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedPaymentMethod === 'cash' && (
              <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <label className="block text-slate-400">المبلغ المستلم من الزبون (د.ع):</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={cashTendered || ''}
                    placeholder={totalAmount.toString()}
                    onChange={e => setCashTendered(Number(e.target.value))}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono text-sm font-bold"
                  />
                  <button
                    onClick={() => setCashTendered(totalAmount)}
                    className="px-3 bg-slate-800 text-slate-200 rounded-lg font-bold"
                  >
                    مطابق
                  </button>
                </div>
                {cashTendered > totalAmount && (
                  <div className="text-emerald-400 font-bold flex items-center justify-between pt-1">
                    <span>الباقي للزبون:</span>
                    <span className="font-mono text-sm">{(cashTendered - totalAmount).toLocaleString()} د.ع</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleCompleteSale}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm rounded-xl transition-colors shadow-lg cursor-pointer"
            >
              تأكيد الدفع وطباعة الإيصال
            </button>
          </div>
        </div>
      )}

      {/* Thermal Receipt Print Modal */}
      {completedOrderReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>تم إتمام الفاتورة بنجاح</span>
              </span>
              <button onClick={() => setCompletedOrderReceipt(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Printable Thermal Paper Slip */}
            <div className="printable-receipt bg-white text-slate-950 p-4 rounded-xl font-mono text-[11px] leading-tight space-y-2 border border-slate-200 shadow-md">
              <div className="text-center border-b border-dashed border-slate-300 pb-2">
                <div className="font-black text-sm">{activeRestaurant?.name_ar || 'سُفرة'}</div>
                <div className="text-[10px] text-slate-600">{activeBranch?.name_ar || 'الفرع الرئيسي'}</div>
                <div className="text-[10px] text-slate-500">{activeBranch?.phone || ''}</div>
              </div>

              <div className="space-y-0.5 border-b border-dashed border-slate-300 pb-2 text-[10px]">
                <div className="flex justify-between">
                  <span>رقم الفاتورة:</span>
                  <span className="font-bold">{completedOrderReceipt.order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>التاريخ:</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
                {completedOrderReceipt.order.table_number && (
                  <div className="flex justify-between">
                    <span>الطاولة:</span>
                    <span className="font-bold">{completedOrderReceipt.order.table_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>طريقة الدفع:</span>
                  <span className="uppercase">{completedOrderReceipt.order.payment_method}</span>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-slate-100 py-1">
                {completedOrderReceipt.order.items.map((it: OrderItem, idx: number) => (
                  <div key={idx} className="py-1 flex justify-between">
                    <span>{it.quantity}x {it.product_name}</span>
                    <span className="font-bold">{it.subtotal.toLocaleString()} د.ع</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{completedOrderReceipt.order.subtotal.toLocaleString()} د.ع</span>
                </div>
                {completedOrderReceipt.order.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span>الضريبة:</span>
                    <span>{completedOrderReceipt.order.tax_amount.toLocaleString()} د.ع</span>
                  </div>
                )}
                {completedOrderReceipt.order.discount_amount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>الخصم:</span>
                    <span>-{completedOrderReceipt.order.discount_amount.toLocaleString()} د.ع</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-xs pt-1 border-t border-slate-300">
                  <span>الإجمالي النهائي:</span>
                  <span>{completedOrderReceipt.order.total_amount.toLocaleString()} د.ع</span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="text-center pt-2 text-[9px] text-slate-500">
                <div className="font-mono tracking-widest text-xs font-bold mb-0.5">||||| | ||||| || ||||||</div>
                شكراً لزيارتكم ونتمنى لكم وجبة شهية!
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => window.print()}
                className="py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الإيصال الفوري</span>
              </button>
              <button
                onClick={() => setCompletedOrderReceipt(null)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                إغلاق وبدء طلب جديد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Online Orders Slide-over Drawer (Non-blocking, does not touch active cart) */}
      {showIncomingDrawer && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-start bg-slate-950/70 backdrop-blur-sm animate-fade-in font-cairo" dir="rtl">
          <div className="w-full max-w-xl h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  incomingOrders.length > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <span>الطلبات الواردة أونلاين</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {incomingOrders.length} طلب معلق
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">مراجعة وتأكيد طلبات الزبائن قبل إرسالها للمطبخ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIncomingDrawer(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Notification alert banner */}
            {incomingSuccessMsg && (
              <div className="m-4 mb-0 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
                <span>{incomingSuccessMsg}</span>
              </div>
            )}

            {/* Cross-restaurant warning/helper banner */}
            {isViewingOtherRestOrders && (
              <div className="m-4 mb-0 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 text-slate-200 text-xs space-y-2 animate-fade-in">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Store className="w-4 h-4 shrink-0" />
                    <span>تم جلب ({allSystemPending.length}) طلبات معلقة من: {restaurants.find(r => r.id === allSystemPending[0]?.restaurant_id)?.name_ar || 'مطعم آخر'}</span>
                  </div>
                  {restaurants.find(r => r.id === allSystemPending[0]?.restaurant_id) && (
                    <button
                      type="button"
                      onClick={() => {
                        const target = restaurants.find(r => r.id === allSystemPending[0]?.restaurant_id);
                        if (target) {
                          setActiveRestaurant(target);
                          setIncomingSuccessMsg(`✅ تم تحويل شاشة الكاشير إلى: ${target.name_ar}`);
                          setTimeout(() => setIncomingSuccessMsg(null), 3000);
                        }
                      }}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-[11px] rounded-lg transition-all shadow-sm cursor-pointer"
                    >
                      التحويل للمطعم
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-300">
                  شاشة الكاشير مضبوطة حالياً على: <span className="font-bold text-white">"{activeRestaurant?.name_ar || 'غير محدد'}"</span>. يمكنك تأكيد هذه الطلبات وإرسالها للمطبخ فوراً من هنا.
                </p>
              </div>
            )}

            {/* Orders List Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {incomingOrders.length === 0 ? (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-16 h-16 rounded-3xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500/60" />
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">لا توجد طلبات معلقة حالياً</h4>
                  <p className="text-xs text-slate-400 max-w-xs">
                    جميع الطلبات الخارجية تم تأكيدها وإرسالها للمطبخ بنجاح. أي طلب جديد يصل سيظهر هنا فوراً مع رنة تنبيه.
                  </p>
                </div>
              ) : (
                incomingOrders.map(order => {
                  const isDelivery = order.order_type === 'delivery';
                  const isTakeaway = order.order_type === 'takeaway';
                  const isDineIn = order.order_type === 'dine_in';
                  const orderRest = restaurants.find(r => r.id === order.restaurant_id);

                  return (
                    <div
                      key={order.id}
                      className="bg-slate-950/70 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-lg transition-all"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {restaurants.length > 1 && orderRest && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                              <Store className="w-3 h-3 text-amber-400" />
                              <span>{orderRest.name_ar}</span>
                            </span>
                          )}
                          {isDelivery && (
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              <Bike className="w-3 h-3" />
                              <span>توصيل دليفري</span>
                            </span>
                          )}
                          {isTakeaway && (
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              <ShoppingBag className="w-3 h-3" />
                              <span>استلام سفري</span>
                            </span>
                          )}
                          {isDineIn && (
                            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <UtensilsCrossed className="w-3 h-3" />
                              <span>طاولة {order.table_number || order.table_id}</span>
                            </span>
                          )}
                          <span className="font-mono text-xs font-bold text-amber-400">
                            #{order.order_number}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(order.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Customer Details */}
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{order.customer_name}</span>
                          {order.customer_phone && (
                            <a
                              href={`tel:${order.customer_phone}`}
                              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-mono font-semibold"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{order.customer_phone}</span>
                            </a>
                          )}
                        </div>

                        {order.delivery_address && (
                          <div className="flex items-start gap-1.5 text-slate-300 text-[11px] pt-1">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            <span>{order.delivery_address}</span>
                          </div>
                        )}

                        {order.notes && (
                          <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/15 text-amber-300/90 text-[11px]">
                            <span className="font-bold">ملاحظات:</span> {order.notes}
                          </div>
                        )}
                      </div>

                      {/* Items Summary */}
                      <div className="bg-slate-900/80 rounded-xl p-2.5 divide-y divide-slate-800/60 text-xs">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="py-1 flex items-center justify-between">
                            <span className="text-slate-200">
                              <span className="font-bold text-amber-400 font-mono ml-1">{it.quantity}x</span>
                              {it.product_name}
                            </span>
                            <span className="font-mono text-slate-300">{it.subtotal.toLocaleString()} د.ع</span>
                          </div>
                        ))}
                      </div>

                      {/* Price Total */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                        <span className="text-xs text-slate-400">الإجمالي المستحق:</span>
                        <span className="font-black text-amber-400 text-sm font-mono">
                          {order.total_amount.toLocaleString()} د.ع
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={(e) => handleAcceptOrder(order.id, e)}
                          className="sm:col-span-7 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <ChefHat className="w-4 h-4" />
                          <span>تأكيد وإرسال للمطبخ 👨‍🍳</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handlePrintIncomingOrder(order, e)}
                          className="sm:col-span-3 py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                          title="طباعة الفاتورة"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>طباعة</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleRejectOrder(order.id, e)}
                          className="sm:col-span-2 py-2.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/20 flex items-center justify-center transition-all cursor-pointer"
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
              <div className="p-4 border-t border-slate-800 bg-slate-900/90 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    incomingOrders.forEach(o => updateOrderStatus(o.id, 'preparing'));
                    setIncomingSuccessMsg(`✅ تم تأكيد جميع الطلبات (${incomingOrders.length}) وإرسالها للمطبخ!`);
                    setTimeout(() => setIncomingSuccessMsg(null), 3000);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>تأكيد كل الطلبات دفعة واحدة وإرسالها للمطبخ ({incomingOrders.length})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
