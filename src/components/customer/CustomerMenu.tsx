import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Product, ProductSize, ProductAddon, OrderItem, OrderType } from '../../types';
import {
  Search,
  ShoppingBag,
  Star,
  Clock,
  Flame,
  Plus,
  Minus,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Gift,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Phone,
  Sparkles,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronDown,
  MessageCircle,
  Send,
  Share2,
  Store,
  UtensilsCrossed
} from 'lucide-react';

export const CustomerMenu: React.FC = () => {
  const {
    activeRestaurant,
    activeBranch,
    categories,
    products,
    tables,
    createOrder,
    addReservation,
    addReview,
    reviews,
    coupons,
    applyCoupon,
    setCurrentRole
  } = useApp();

  // Navigation mode
  const [activeTab, setActiveTab] = useState<'menu' | 'reservation' | 'reviews' | 'loyalty'>('menu');
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [selectedTableNum, setSelectedTableNum] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get('table') || params.get('t');
      if (tableParam) return decodeURIComponent(tableParam);
    }
    return 'طاولة 1';
  });

  // Search & Category
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');

  // Dish Detail Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(undefined);
  const [selectedAddons, setSelectedAddons] = useState<ProductAddon[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Cart
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'zaincash' | 'asia_hawala' | 'qicard' | 'visa' | 'mastercard'>('cash');
  const [couponInput, setCouponInput] = useState('');
  const [discountVal, setDiscountVal] = useState(0);

  // Reservation Form
  const [resName, setResName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resDate, setResDate] = useState(new Date().toISOString().slice(0, 10));
  const [resTime, setResTime] = useState('20:00');
  const [resGuests, setResGuests] = useState(2);
  const [resNotes, setResNotes] = useState('');
  const [reservationSubmitted, setReservationSubmitted] = useState(false);

  // Review Form
  const [revRating, setRevRating] = useState(5);
  const [revName, setRevName] = useState('');
  const [revComment, setRevComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Order Success Modal
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);
  const [scannedTableDetected, setScannedTableDetected] = useState<string | null>(null);

  // Auto-detect QR scan parameters from URL (e.g. ?table=T-02&branch=1)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get('table');
      if (tableParam) {
        setSelectedTableNum(tableParam);
        setOrderType('dine_in');
        setScannedTableDetected(tableParam);
      }
      const dishParam = params.get('dish');
      if (dishParam) {
        const found = products.find(p => p.id === Number(dishParam));
        if (found) {
          handleOpenProduct(found);
        }
      }
    }
  }, [products]);

  // Open Product Modal
  const handleOpenProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setSelectedSize(prod.sizes?.[0]);
    setSelectedAddons([]);
    setSpecialInstructions('');
  };

  const handleAddModalToCart = () => {
    if (!selectedProduct) return;

    const basePrice = selectedProduct.discount_price || selectedProduct.base_price;
    const sizeExtra = selectedSize ? selectedSize.extra_price : 0;
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = basePrice + sizeExtra + addonsTotal;

    const newItem: OrderItem = {
      id: `cart-item-${Date.now()}-${Math.random()}`,
      product_id: selectedProduct.id,
      product_name: selectedProduct.name_ar,
      unit_price: unitPrice,
      quantity: 1,
      selected_size: selectedSize,
      selected_addons: selectedAddons,
      special_instructions: specialInstructions,
      subtotal: unitPrice
    };

    setCart(prev => [...prev, newItem]);
    setSelectedProduct(null);
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
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
  const deliveryFee = orderType === 'delivery' ? (activeRestaurant?.delivery_fee_base || 0) : 0;
  const totalAmount = Math.max(0, subtotal + taxAmount + deliveryFee - discountVal);

  const handleApplyCouponCode = () => {
    const res = applyCoupon(couponInput, subtotal);
    if (res.success) {
      setDiscountVal(res.discount);
      alert(res.message);
    } else {
      alert(res.message);
    }
  };

  // Build formatted WhatsApp message for direct ordering
  const buildWhatsAppOrderMessage = (orderNum: string, currentCart: OrderItem[], currentTotal: number) => {
    const restName = activeRestaurant?.name_ar || 'المطعم';
    const branchName = activeBranch?.name_ar || 'الفرع الرئيسي';
    let msg = `*طلب جديد عبر واتساب - ${restName}* 🍽️\n`;
    msg += `*الفرع:* ${branchName}\n`;
    
    if (orderType === 'dine_in') {
      msg += `*نوع الطلب:* 🪑 داخل الصالة (طاولة رقم: ${selectedTableNum})\n`;
    } else if (orderType === 'delivery') {
      msg += `*نوع الطلب:* 🛵 توصيل دليفري\n`;
      msg += `*عنوان التوصيل:* ${deliveryAddress || 'العنوان المسجل'}\n`;
    } else if (orderType === 'takeaway') {
      msg += `*نوع الطلب:* 🛍️ استلام سفري من الفرع\n`;
    } else {
      msg += `*نوع الطلب:* ⏱️ طلب مسبق\n`;
    }

    if (customerName) msg += `*اسم الزبون:* ${customerName}\n`;
    if (customerPhone) msg += `*رقم الهاتف:* ${customerPhone}\n`;

    msg += `\n📋 *قائمة المأكولات والمشروبات:*\n`;

    currentCart.forEach((item, index) => {
      msg += `${index + 1}️⃣ *${item.quantity}x ${item.product_name}*\n`;
      if (item.selected_size) {
        msg += `   ▫️ الحجم: ${item.selected_size.name_ar}\n`;
      }
      if (item.selected_addons && item.selected_addons.length > 0) {
        msg += `   ▫️ الإضافات: ${item.selected_addons.map(a => a.name_ar).join('، ')}\n`;
      }
      if (item.special_instructions) {
        msg += `   ▫️ التوصية والملاحظات: ${item.special_instructions}\n`;
      }
      msg += `   ▫️ السعر: ${item.subtotal.toLocaleString()} د.ع\n\n`;
    });

    if (orderNotes) {
      msg += `📝 *ملاحظات وتوصيات خاصة:* ${orderNotes}\n\n`;
    }

    msg += `💰 *ملخص الحساب:*\n`;
    msg += `- المجموع الفرعي: ${subtotal.toLocaleString()} د.ع\n`;
    if (taxAmount > 0) msg += `- الضريبة (${taxRate}%): ${taxAmount.toLocaleString()} د.ع\n`;
    if (deliveryFee > 0) msg += `- أجور التوصيل: ${deliveryFee.toLocaleString()} د.ع\n`;
    if (discountVal > 0) msg += `- الخصم: -${discountVal.toLocaleString()} د.ع\n`;
    msg += `*المجموع الإجمالي: ${currentTotal.toLocaleString()} د.ع*\n`;
    msg += `*طريقة الدفع:* ${paymentMethod === 'cash' ? 'نقدي عند الاستلام' : paymentMethod.toUpperCase()}\n`;
    msg += `*رقم الطلب في النظام:* #${orderNum}\n\n`;
    msg += `يرجى تأكيد استلام الطلب والبدء بالتحضير. شكراً لكم!`;

    return msg;
  };

  // Direct send via WhatsApp
  const handleSendViaWhatsApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cart.length === 0) return;

    const tableObj = tables.find(t => t.table_number === selectedTableNum);

    const newOrder = createOrder({
      restaurant_id: activeRestaurant?.id || 1,
      branch_id: activeBranch?.id || 1,
      branch_name: activeBranch?.name_ar || 'الفرع الرئيسي',
      table_id: orderType === 'dine_in' ? tableObj?.id : undefined,
      table_number: orderType === 'dine_in' ? selectedTableNum : undefined,
      order_type: orderType,
      discount_amount: discountVal,
      delivery_fee: deliveryFee,
      items: cart,
      payment_method: paymentMethod,
      customer_name: customerName || 'زبون واتساب',
      customer_phone: customerPhone,
      delivery_address: deliveryAddress,
      notes: orderNotes
    });

    try {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } catch {}

    const rawNumber = activeRestaurant?.whatsapp_number || '+9647701234567';
    const cleanPhone = rawNumber.replace(/[^0-9]/g, '');
    const message = buildWhatsAppOrderMessage(newOrder.order_number, cart, totalAmount);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    setPlacedOrderNumber(newOrder.order_number);
    setCart([]);
    setShowCartDrawer(false);
    setDiscountVal(0);
    setCouponInput('');

    // Launch WhatsApp
    window.open(waUrl, '_blank');
  };

  // Recommend specific dish to a friend via WhatsApp
  const handleRecommendDishViaWhatsApp = (prod: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const restName = activeRestaurant?.name_ar || 'المطعم';
    const price = (prod.discount_price || prod.base_price).toLocaleString();
    const text = `أوصيك بتجربة هذا الصنف اللذيذ من منيو *${restName}* 😋🍴\n\n*${prod.name_ar}* (${price} د.ع)\n${prod.description_ar}\n\nتفضل بفتح المنيو والطلب مباشرة عبر الرابط:\nhttps://${activeRestaurant?.slug || 'menu'}.sufrah.menu?table=${selectedTableNum}&dish=${prod.id}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const tableObj = tables.find(t => t.table_number === selectedTableNum);

    const newOrder = createOrder({
      restaurant_id: activeRestaurant?.id || 1,
      branch_id: activeBranch?.id || 1,
      branch_name: activeBranch?.name_ar || 'الفرع الرئيسي',
      table_id: orderType === 'dine_in' ? tableObj?.id : undefined,
      table_number: orderType === 'dine_in' ? selectedTableNum : undefined,
      order_type: orderType,
      discount_amount: discountVal,
      delivery_fee: deliveryFee,
      items: cart,
      payment_method: paymentMethod,
      customer_name: customerName || 'زبون السفرة',
      customer_phone: customerPhone,
      delivery_address: deliveryAddress,
      notes: orderNotes
    });

    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {}

    setPlacedOrderNumber(newOrder.order_number);
    setCart([]);
    setShowCartDrawer(false);
    setDiscountVal(0);
    setCouponInput('');
  };

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName || !resPhone) return;

    addReservation({
      customer_name: resName,
      customer_phone: resPhone,
      guest_count: resGuests,
      reservation_date: resDate,
      reservation_time: resTime,
      special_requests: resNotes
    });

    setReservationSubmitted(true);
    setResName('');
    setResPhone('');
    setResNotes('');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revName || !revComment) return;

    addReview({
      customer_name: revName,
      rating: revRating,
      comment: revComment
    });

    setReviewSubmitted(true);
    setRevName('');
    setRevComment('');
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesSearch = p.name_ar.includes(searchQuery) ||
                          p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description_ar.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  if (!activeRestaurant) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center max-w-xl mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 mx-auto flex items-center justify-center mb-4 font-black text-2xl shadow-lg shadow-amber-500/20">
          س
        </div>
        <h2 className="text-xl font-bold text-white mb-2">مرحباً بك في سُفرة SaaS</h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          التطبيق مهيأ حالياً ونظيف لاستقبال المطاعم الجديدة بدون أي بيانات افتراضية.
          قم بتسجيل أول مطعم لتفعيل منيو الـ QR الإلكتروني والبدء في تلقي الطلبات.
        </p>
        <button
          onClick={() => setCurrentRole('super_admin')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
        >
          <Store className="w-4 h-4" />
          <span>تسجيل مطعم جديد (لوحة الإدارة)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-6">
      {/* Scanned QR Table & Direct WhatsApp Notification Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <MessageCircle className="w-6 h-6 fill-emerald-400 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs sm:text-sm">
                {scannedTableDetected ? `تم فتح المنيو عبر مسح QR كود (طاولة: ${scannedTableDetected})` : 'الطلب المباشر والتوصية عبر واتساب مفعل 🟢'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                WhatsApp Direct Order
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              اختر وجباتك ومشروباتك وتفضيلاتك وسيتم تجهيز الطلب وإرساله إلى واتساب المطعم مباشرة بنقرة واحدة!
            </p>
          </div>
        </div>

        {orderType === 'dine_in' && (
          <div className="self-end sm:self-center px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono font-bold text-amber-400">
            طاولة: {selectedTableNum}
          </div>
        )}
      </div>

      {/* Brand Hero & Information Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="h-44 sm:h-56 relative">
          <img
            src={activeRestaurant.cover_url}
            alt=""
            className="w-full h-full object-cover brightness-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="p-5 sm:p-6 -mt-16 sm:-mt-20 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 text-center sm:text-right">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <img
              src={activeRestaurant.logo_url}
              alt=""
              className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-900 shadow-2xl bg-slate-800"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">{activeRestaurant.name_ar}</h1>
              <p className="text-xs text-slate-300 mt-0.5">{activeRestaurant.name_en}</p>
              <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-400 mt-2 font-mono">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>4.9 (184 تقييم)</span>
                </span>
                <span>· {activeBranch?.name_ar || 'الفرع الرئيسي'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${activeRestaurant.whatsapp_number?.replace(/\+/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>واتساب المطعم</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs (Menu, Reservation, Reviews, Loyalty) */}
        <div className="border-t border-slate-800/80 px-4 flex items-center justify-around sm:justify-start gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'menu', label: 'قائمة الطعام (المنيو)', icon: <Flame className="w-4 h-4" /> },
            { id: 'reservation', label: 'حجز طاولة', icon: <Calendar className="w-4 h-4" /> },
            { id: 'reviews', label: 'تقييمات الزبائن', icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'loyalty', label: 'نقاط المكافآت', icon: <Gift className="w-4 h-4" /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Menu View */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Order Type Selector (Dine-in, Takeaway, Delivery, Pre-order) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-300">طريقة استلام وجبتك:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'dine_in', label: 'داخل المطعم (طاولة)', icon: '🍽️' },
                { id: 'takeaway', label: 'استلام سفري', icon: '🛍️' },
                { id: 'delivery', label: 'توصيل لموقعك', icon: '🛵' },
                { id: 'pre_order', label: 'طلب مسبق للاستلام', icon: '⏱️' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setOrderType(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    orderType === opt.id
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>

            {orderType === 'dine_in' && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-slate-400">رقم الطاولة الحالية:</span>
                <select
                  value={selectedTableNum}
                  onChange={e => setSelectedTableNum(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white font-mono font-bold"
                >
                  {tables.map(t => (
                    <option key={t.id} value={t.table_number}>طاولة {t.table_number}</option>
                  ))}
                </select>
                <span className="text-[11px] text-emerald-400">تم تحديد الطاولة من مسح QR Code</span>
              </div>
            )}
          </div>

          {/* Search & Categories */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث عن وجبتك المفضلة (مشاوي، برغر، بيتزا، قهوة)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pr-9 pl-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Category horizontal scroll */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                جميع الأقسام ({products.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.name_ar}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.length === 0 && (
              <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <UtensilsCrossed className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-white font-bold text-sm mb-1">لا توجد وجبات في المنيو حالياً</h3>
                <p className="text-slate-400 text-xs max-w-md mx-auto">
                  لم يقم المطعم بإضافة وجبات بعد. يمكنك إضافة الأقسام والأصناف والأسعار بالدينار العراقي من لوحة المالك.
                </p>
                <button
                  onClick={() => setCurrentRole('restaurant_owner')}
                  className="mt-4 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-xl border border-amber-500/30 transition-colors"
                >
                  الانتقال للوحة المالك لإضافة الأصناف
                </button>
              </div>
            )}
            {filteredProducts.map(prod => {
              const price = prod.discount_price || prod.base_price;
              const isAvailable = prod.is_available !== false;
              return (
                <div
                  key={prod.id}
                  onClick={() => {
                    if (isAvailable) handleOpenProduct(prod);
                  }}
                  className={`bg-slate-900 border rounded-2xl p-4 flex gap-3 transition-all ${
                    isAvailable
                      ? 'border-slate-800 hover:border-amber-500/40 cursor-pointer active:scale-[0.98] group'
                      : 'border-slate-800/60 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-slate-950 shrink-0 relative">
                    <img
                      src={prod.image_url}
                      alt={prod.name_ar}
                      className={`w-full h-full object-cover transition-transform ${isAvailable ? 'group-hover:scale-105' : 'grayscale'}`}
                    />
                    {!isAvailable ? (
                      <span className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center text-rose-400 font-bold text-xs text-center p-1">
                        غير متوفر حالياً
                      </span>
                    ) : prod.discount_price ? (
                      <span className="absolute top-1.5 right-1.5 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        خصم
                      </span>
                    ) : null}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className={`font-bold text-sm transition-colors ${isAvailable ? 'text-white group-hover:text-amber-400' : 'text-slate-400 line-through'}`}>
                        {prod.name_ar}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {prod.description_ar}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-1">
                      <div className="font-mono">
                        <span className="text-amber-400 font-bold text-sm">
                          {price.toLocaleString()} د.ع
                        </span>
                        {prod.discount_price && (
                          <span className="text-[10px] text-slate-500 line-through mr-1.5">
                            {prod.base_price.toLocaleString()} د.ع
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isAvailable ? (
                          <>
                            <button
                              type="button"
                              onClick={e => handleRecommendDishViaWhatsApp(prod, e)}
                              className="px-2 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-1 transition-colors border border-emerald-500/20"
                              title="توصية بالوجبة وإرسالها عبر واتساب"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-emerald-400 text-slate-950" />
                              <span className="text-[10px] font-bold hidden xs:inline">توصية</span>
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleOpenProduct(prod);
                              }}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>اختيار</span>
                            </button>
                          </>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-800 text-slate-500 text-xs font-semibold rounded-lg">
                            نفدت الكمية
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Table Reservation */}
      {activeTab === 'reservation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg mx-auto space-y-4">
          <div className="text-center space-y-1">
            <Calendar className="w-10 h-10 text-amber-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">حجز طاولة مسبقاً في المطعم</h2>
            <p className="text-xs text-slate-400">احجز طاولتك المفضلة واستمتع بضيافة استثنائية دون انتظار</p>
          </div>

          {reservationSubmitted ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-white text-sm">تم إرسال طلب الحجز بنجاح!</h3>
              <p className="text-xs text-slate-300">
                سيقوم فريق الاستقبال بمراجعة الحجز وتأكيده لك عبر رسالة هاتفية أو واتساب في غضون دقائق.
              </p>
              <button
                onClick={() => setReservationSubmitted(false)}
                className="mt-3 px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                طلب حجز آخر
              </button>
            </div>
          ) : (
            <form onSubmit={handleReservationSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">الاسم الكريم *</label>
                  <input
                    type="text"
                    required
                    placeholder="اسمك الكامل"
                    value={resName}
                    onChange={e => setResName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    placeholder="+964 770 000 0000"
                    value={resPhone}
                    onChange={e => setResPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">التاريخ</label>
                  <input
                    type="date"
                    value={resDate}
                    onChange={e => setResDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الوقت</label>
                  <input
                    type="time"
                    value={resTime}
                    onChange={e => setResTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">عدد الضيوف</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={resGuests}
                    onChange={e => setResGuests(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">طلبات خاصة (عيد ميلاد، طاولة هادئة، ورود)</label>
                <textarea
                  rows={2}
                  value={resNotes}
                  onChange={e => setResNotes(e.target.value)}
                  placeholder="أي رغبات تود إعلامنا بها مسبقاً..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20"
              >
                تأكيد وإرسال طلب الحجز
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab 3: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Add Review Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-white text-sm">شاركنا رأيك وتجربتك في المطعم</h3>
            {reviewSubmitted ? (
              <div className="text-emerald-400 text-xs font-semibold">
                شكراً لمشاركتك! تم تسجيل تقييمك بنجاح.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">التقييم:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(st => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setRevRating(st)}
                        className="text-amber-400 hover:scale-125 transition-transform"
                      >
                        <Star className={`w-5 h-5 ${st <= revRating ? 'fill-amber-400' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="اسمك الكريم"
                    value={revName}
                    onChange={e => setRevName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="اكتب تعليقك حول جودة الطعام والخدمة..."
                  value={revComment}
                  onChange={e => setRevComment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />

                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
                >
                  نشر التقييم
                </button>
              </form>
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{r.customer_name}</span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-300 mt-1">{r.comment}</p>
                <div className="text-[10px] text-slate-500 font-mono pt-1">{r.created_at}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Loyalty Points */}
      {activeTab === 'loyalty' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">برنامج ولاء ومكافآت السفرة</h2>
          <p className="text-xs text-slate-400">
            اكسب نقطة واحدة مقابل كل 1,000 د.ع تنفقها، واستبدل نقاطك بوجبات مجانية وخصومات فورية عند زيارتك القادمة.
          </p>
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 inline-block font-mono">
            <span className="text-xs text-slate-400 block">رصيد نقاطك الحالي:</span>
            <span className="text-3xl font-black text-amber-400">140 نقطة</span>
            <span className="text-[11px] text-emerald-400 block mt-1">تؤهلك لخصم 15,000 د.ع في طلبك القادم</span>
          </div>
        </div>
      )}

      {/* Dish Detail Sheet / Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-base">{selectedProduct.name_ar}</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="h-44 rounded-xl overflow-hidden bg-slate-950">
              <img src={selectedProduct.image_url} alt="" className="w-full h-full object-cover" />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedProduct.description_ar}
            </p>

            {/* Sizes Selection */}
            {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">اختر الحجم المناسب:</label>
                <div className="grid grid-cols-3 gap-2">
                  {selectedProduct.sizes.map(size => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`p-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                        selectedSize?.id === size.id
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>{size.name_ar}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {size.extra_price > 0 ? `+${size.extra_price.toLocaleString()} د.ع` : 'السعر الأساسي'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Addons Selection */}
            {selectedProduct.addons && selectedProduct.addons.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">إضافات وتفضيلات:</label>
                <div className="space-y-1.5">
                  {selectedProduct.addons.map(addon => {
                    const isSelected = selectedAddons.some(a => a.id === addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
                          } else {
                            setSelectedAddons([...selectedAddons, addon]);
                          }
                        }}
                        className={`p-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-500/10 border-amber-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{addon.name_ar}</span>
                        <span className="font-mono text-amber-400 font-semibold">
                          {addon.price > 0 ? `+${addon.price.toLocaleString()} د.ع` : 'مجاناً'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">ملاحظاتك للشيف:</label>
              <input
                type="text"
                placeholder="بدون بصل، استواء كامل، صوص إضافي..."
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleAddModalToCart}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20"
              >
                إضافة إلى السلة
              </button>
              <button
                type="button"
                onClick={() => selectedProduct && handleRecommendDishViaWhatsApp(selectedProduct)}
                className="px-3.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
                title="توصية بالوجبة ومشاركتها عبر واتساب"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span className="hidden sm:inline">توصية عبر واتساب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
          <button
            onClick={() => setShowCartDrawer(true)}
            className="w-full p-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-2xl shadow-2xl shadow-amber-500/40 flex items-center justify-between font-bold text-xs transition-transform active:scale-95"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center font-mono text-[11px]">
                {cart.length}
              </div>
              <span>عرض السلة وإتمام الطلب</span>
            </div>
            <div className="font-mono text-sm font-black">
              {totalAmount.toLocaleString()} د.ع
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">سلة الطلبات</h3>
              </div>
              <button onClick={() => setShowCartDrawer(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Items */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {cart.map(item => (
                <div key={item.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex-1 truncate">
                    <div className="font-bold text-white truncate">{item.product_name}</div>
                    <div className="text-[11px] font-mono text-amber-400">
                      {item.unit_price.toLocaleString()} د.ع
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900 rounded-lg p-1 border border-slate-800">
                    <button onClick={() => updateCartQuantity(item.id, -1)} className="w-5 h-5 flex items-center justify-center text-slate-400">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-5 text-center font-bold text-white font-mono">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.id, 1)} className="w-5 h-5 flex items-center justify-center text-slate-400">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Form */}
            <form onSubmit={handlePlaceOrder} className="space-y-3 text-xs pt-2 border-t border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1">الاسم الكريم *</label>
                <input
                  type="text"
                  required
                  placeholder="اسمك"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">رقم الهاتف للتواصل</label>
                <input
                  type="text"
                  placeholder="+964 770 000 0000"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              {orderType === 'delivery' && (
                <div>
                  <label className="block text-slate-400 mb-1">عنوان التوصيل بالتفصيل *</label>
                  <input
                    type="text"
                    required
                    placeholder="المنطقة، الشارع، أقرب نقطة دالة..."
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                </div>
              )}

              {/* Coupon */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="كود خصم (SUFRAH10)"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white font-mono uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCouponCode}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  تطبيق
                </button>
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-slate-400">طريقة الدفع:</label>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  {[
                    { id: 'cash', label: 'نقدي (Cash)' },
                    { id: 'zaincash', label: 'ZainCash' },
                    { id: 'qicard', label: 'QiCard' },
                  ].map(m => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2 rounded-lg border text-center font-bold transition-colors ${
                        paymentMethod === m.id
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span className="font-mono text-white">{subtotal.toLocaleString()} د.ع</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>الضريبة ({taxRate}%):</span>
                    <span className="font-mono text-white">{taxAmount.toLocaleString()} د.ع</span>
                  </div>
                )}
                {deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>أجور التوصيل:</span>
                    <span className="font-mono text-white">{deliveryFee.toLocaleString()} د.ع</span>
                  </div>
                )}
                {discountVal > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>الخصم المطبق:</span>
                    <span className="font-mono">-{discountVal.toLocaleString()} د.ع</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-slate-800">
                  <span>المجموع الإجمالي:</span>
                  <span className="text-amber-400 font-mono text-base font-black">
                    {totalAmount.toLocaleString()} د.ع
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {/* Primary WhatsApp Direct Order Button */}
                <button
                  type="button"
                  onClick={handleSendViaWhatsApp}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                  <span>إرسال وتأكيد الطلب عبر واتساب مباشرة 📲</span>
                </button>

                {/* Secondary Internal / KDS Submission */}
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>تأكيد داخلي وإرسال لشاشة المطبخ (KDS)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmed Modal */}
      {placedOrderNumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">تم استلام طلبك بنجاح!</h3>
              <p className="text-xs text-slate-400 mt-1">يتم الآن تجهيز وجبتك في المطبخ بأعلى معايير الجودة</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 font-mono">
              <span className="text-[11px] text-slate-500 block">رقم الطلب الخاص بك:</span>
              <span className="text-lg font-black text-amber-400">{placedOrderNumber}</span>
            </div>

            <div className="space-y-2">
              <a
                href={`https://wa.me/${(activeRestaurant.whatsapp_number || '+9647701234567').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`السلام عليكم ورحمة الله، أود متابعة حالة طلبي رقم: #${placedOrderNumber}`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>متابعة الطلب عبر واتساب مع المطعم</span>
              </a>

              <button
                onClick={() => setPlacedOrderNumber(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                العودة إلى المنيو
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Discreet floating return button for manager/owner preview */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setCurrentRole('restaurant_owner')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/30 shadow-xl backdrop-blur transition-all cursor-pointer"
        >
          <span>العودة للوحة التحكم</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
