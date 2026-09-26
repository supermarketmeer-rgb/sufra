import React, { useState } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { Product, OrderItem, DiningTable } from '../../types';
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
  Sparkles
} from 'lucide-react';

export const PosDashboard: React.FC = () => {
  const {
    activeRestaurant,
    activeBranch,
    categories,
    products,
    tables,
    createOrder,
    coupons,
    applyCoupon
  } = useApp();

  const [selectedCatId, setSelectedCatId] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedOrderType, setSelectedOrderType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
  const [selectedTable, setSelectedTable] = useState<DiningTable | null>(tables[0] || null);
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Payment Drawer state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'visa' | 'mastercard' | 'zaincash' | 'asia_hawala' | 'qicard'>('cash');
  const [cashTendered, setCashTendered] = useState<number>(0);

  // Receipt Modal state
  const [completedOrderReceipt, setCompletedOrderReceipt] = useState<any | null>(null);

  const filteredProducts = products.filter(p => {
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
  const taxRate = activeRestaurant.tax_percentage || 0;
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
      restaurant_id: activeRestaurant.id,
      branch_id: activeBranch.id,
      branch_name: activeBranch.name_ar,
      table_id: selectedOrderType === 'dine_in' ? selectedTable?.id : undefined,
      table_number: selectedOrderType === 'dine_in' ? selectedTable?.table_number : undefined,
      order_type: selectedOrderType,
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-120px)]">
      {/* Products & Fast Sale Grid (8 Cols) */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* Search & Barcode Simulator */}
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="البحث بالاسم، أو رقم الصنف السريع (مثال: 1، كباب، برغر)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono">
            <Barcode className="w-4 h-4 text-amber-400" />
            <span>Barcode Ready</span>
          </div>
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
          {categories.map(cat => (
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
                  const t = tables.find(tbl => tbl.id === Number(e.target.value));
                  if (t) setSelectedTable(t);
                }}
                className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded-lg p-1.5 font-mono"
              >
                {tables.map(tbl => (
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
                <div className="font-black text-sm">{activeRestaurant.name_ar}</div>
                <div className="text-[10px] text-slate-600">{activeBranch.name_ar}</div>
                <div className="text-[10px] text-slate-500">{activeBranch.phone}</div>
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
                    <span className="font-bold">{it.subtotal.toLocaleString()}</span>
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
    </div>
  );
};
