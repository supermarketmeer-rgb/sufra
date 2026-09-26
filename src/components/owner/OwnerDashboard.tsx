import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { Product, ProductSize, ProductAddon, Category } from '../../types';
import {
  UtensilsCrossed,
  QrCode,
  Building2,
  TrendingUp,
  Sparkles,
  Plus,
  Printer,
  Download,
  Flame,
  CheckCircle2,
  Clock,
  DollarSign,
  Share2,
  FileSpreadsheet,
  Layers,
  Edit2,
  Trash2,
  Eye,
  Sliders,
  AlertCircle,
  MessageCircle
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const {
    activeRestaurant,
    branches,
    addBranch,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    tables,
    orders,
    setCurrentRole,
    updateRestaurantWhatsApp
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'branches' | 'qr' | 'ai' | 'reports'>('menu');
  const [ownerWhatsApp, setOwnerWhatsApp] = useState<string>(activeRestaurant.whatsapp_number || '+9647701234567');
  const [savedWhatsAppSuccess, setSavedWhatsAppSuccess] = useState(false);

  // Menu filters & modals
  const [selectedCatId, setSelectedCatId] = useState<number | 'all'>('all');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCatNameAr, setNewCatNameAr] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);

  // New product form
  const [prodNameAr, setProdNameAr] = useState('');
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodCategory, setProdCategory] = useState<number>(categories[0]?.id || 1);
  const [prodPrice, setProdPrice] = useState<number>(12000);
  const [prodDiscount, setProdDiscount] = useState<number | undefined>(undefined);
  const [prodPrepTime, setProdPrepTime] = useState<number>(15);
  const [prodCalories, setProdCalories] = useState<number>(550);
  const [prodDescAr, setProdDescAr] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('/src/assets/images/dish_mixed_grills_1790265810518.jpg');

  // New branch form
  const [branchNameAr, setBranchNameAr] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchManager, setBranchManager] = useState('');

  // QR Studio states
  const [qrType, setQrType] = useState<'restaurant' | 'branch' | 'table'>('table');
  const [selectedBranchId, setSelectedBranchId] = useState<number>(branches[0]?.id || 1);
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>('T-01');
  const [qrColor, setQrColor] = useState<string>('#1e293b');
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate dynamic QR target link
  const getQrUrl = () => {
    const baseUrl = `https://${activeRestaurant.slug}.sufrah.menu`;
    if (qrType === 'restaurant') return baseUrl;
    if (qrType === 'branch') return `${baseUrl}/branch/${selectedBranchId}`;
    return `${baseUrl}?table=${selectedTableNumber}&branch=${selectedBranchId}`;
  };

  useEffect(() => {
    if (qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        getQrUrl(),
        {
          width: 260,
          margin: 2,
          color: {
            dark: qrColor,
            light: '#ffffff'
          }
        },
        err => {
          if (err) console.error(err);
        }
      );
    }
  }, [qrType, selectedBranchId, selectedTableNumber, qrColor, activeRestaurant.slug, activeTab]);

  const handleDownloadQr = () => {
    if (!qrCanvasRef.current) return;
    const url = qrCanvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_${activeRestaurant.slug}_${qrType}_${selectedTableNumber}.png`;
    a.click();
  };

  const handlePrintQr = () => {
    window.print();
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdNameAr(prod.name_ar);
    setProdNameEn(prod.name_en || '');
    setProdCategory(prod.category_id);
    setProdPrice(prod.base_price);
    setProdDiscount(prod.discount_price);
    setProdPrepTime(prod.prep_time_minutes || 15);
    setProdCalories(prod.calories || 500);
    setProdDescAr(prod.description_ar || '');
    setProdImageUrl(prod.image_url || '/src/assets/images/dish_mixed_grills_1790265810518.jpg');
    setShowAddProductModal(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setNewCatNameAr(cat.name_ar);
    setNewCatNameEn(cat.name_en || '');
    setShowAddCategoryModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNameAr || !prodPrice) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name_ar: prodNameAr,
        name_en: prodNameEn || prodNameAr,
        category_id: prodCategory,
        base_price: Number(prodPrice),
        discount_price: prodDiscount ? Number(prodDiscount) : undefined,
        prep_time_minutes: Number(prodPrepTime),
        calories: Number(prodCalories),
        description_ar: prodDescAr,
        image_url: prodImageUrl
      });
    } else {
      addProduct({
        name_ar: prodNameAr,
        name_en: prodNameEn || prodNameAr,
        category_id: prodCategory,
        base_price: Number(prodPrice),
        discount_price: prodDiscount ? Number(prodDiscount) : undefined,
        prep_time_minutes: Number(prodPrepTime),
        calories: Number(prodCalories),
        description_ar: prodDescAr,
        image_url: prodImageUrl,
        sizes: [
          { id: Date.now(), product_id: 0, name_ar: 'عادي (Regular)', name_en: 'Regular', extra_price: 0, is_default: true },
          { id: Date.now() + 1, product_id: 0, name_ar: 'كبير (Large)', name_en: 'Large', extra_price: 3000 },
        ],
        addons: [
          { id: Date.now() + 2, product_id: 0, name_ar: 'جبنة إضافية', name_en: 'Extra Cheese', price: 1500 },
          { id: Date.now() + 3, product_id: 0, name_ar: 'صوص حار مميز', name_en: 'Spicy Dip', price: 1000 },
        ]
      });
    }

    setShowAddProductModal(false);
    setEditingProduct(null);
    setProdNameAr('');
    setProdNameEn('');
    setProdDescAr('');
  };

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchNameAr) return;

    addBranch({
      name_ar: branchNameAr,
      phone: branchPhone,
      address: branchAddress,
      manager_name: branchManager
    });

    setShowAddBranchModal(false);
    setBranchNameAr('');
    setBranchPhone('');
    setBranchAddress('');
    setBranchManager('');
  };

  const filteredProducts = selectedCatId === 'all'
    ? products
    : products.filter(p => p.category_id === selectedCatId);

  const restaurantOrders = orders.filter(o => o.restaurant_id === activeRestaurant.id);
  const totalSales = restaurantOrders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="space-y-6">
      {/* Restaurant Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="h-40 relative">
          <img
            src={activeRestaurant.cover_url}
            alt=""
            className="w-full h-full object-cover brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>

        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12">
          <div className="flex items-center gap-4">
            <img
              src={activeRestaurant.logo_url}
              alt=""
              className="w-20 h-20 rounded-2xl object-cover border-4 border-slate-900 shadow-2xl bg-slate-800"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{activeRestaurant.name_ar}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                  {activeRestaurant.status === 'active' ? 'نشط أونلاين' : 'مغلق مؤقتاً'}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                <span className="text-amber-400 font-semibold">{activeRestaurant.slug}.sufrah.menu</span>
                {activeRestaurant.custom_domain && <span>· {activeRestaurant.custom_domain}</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentRole('customer')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>معاينة منيو العميل</span>
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>توليد وطباعة QR كود</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'menu', label: 'إدارة المنيو والأصناف', icon: <UtensilsCrossed className="w-4 h-4" /> },
            { id: 'qr', label: 'استوديو رموز QR', icon: <QrCode className="w-4 h-4" /> },
            { id: 'branches', label: `الفروع (${branches.length})`, icon: <Building2 className="w-4 h-4" /> },
            { id: 'overview', label: 'المبيعات والطلبات', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'ai', label: 'تحليلات AI الذكية', icon: <Sparkles className="w-4 h-4" /> },
            { id: 'reports', label: 'التقارير المالية وتصدير Excel', icon: <FileSpreadsheet className="w-4 h-4" /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
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

      {/* Tab 1: Menu & Catalog Management */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Categories bar & Add dish button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCatId('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCatId === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                جميع الأصناف ({products.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCatId === cat.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.name_ar}
                </button>
              ))}
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setNewCatNameAr('');
                  setNewCatNameEn('');
                  setShowAddCategoryModal(true);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-medium border border-dashed border-slate-700 hover:border-amber-400 text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors whitespace-nowrap"
                title="إضافة قسم أو تصنيف جديد"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>قسم جديد</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {selectedCatId !== 'all' && (
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => {
                      const target = categories.find(c => c.id === selectedCatId);
                      if (target) handleOpenEditCategory(target);
                    }}
                    className="px-2.5 py-1 text-slate-300 hover:text-amber-400 text-xs font-medium rounded-lg hover:bg-slate-800 flex items-center gap-1 transition-colors"
                    title="تعديل اسم القسم"
                  >
                    <Edit2 className="w-3 h-3 text-amber-400" />
                    <span>تعديل القسم</span>
                  </button>
                  <button
                    onClick={() => {
                      const target = categories.find(c => c.id === selectedCatId);
                      if (target && window.confirm(`هل أنت متأكد من حذف قسم "${target.name_ar}" وجميع تفاصيله؟`)) {
                        deleteCategory(target.id);
                        setSelectedCatId('all');
                      }
                    }}
                    className="px-2.5 py-1 text-slate-300 hover:text-rose-400 text-xs font-medium rounded-lg hover:bg-slate-800 flex items-center gap-1 transition-colors"
                    title="حذف هذا القسم"
                  >
                    <Trash2 className="w-3 h-3 text-rose-400" />
                    <span>حذف القسم</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProdNameAr('');
                  setProdNameEn('');
                  setProdDescAr('');
                  setProdPrice(12000);
                  setProdDiscount(undefined);
                  setShowAddProductModal(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة طبق / وجبة جديدة</span>
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(prod => (
              <div
                key={prod.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  <div className="relative h-44 rounded-xl overflow-hidden bg-slate-950 mb-3">
                    <img
                      src={prod.image_url}
                      alt={prod.name_ar}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {prod.discount_price && (
                      <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-md">
                        خصم خاص
                      </span>
                    )}
                    <div className="absolute bottom-2 left-2.5 bg-slate-950/80 backdrop-blur-sm text-slate-300 text-[11px] px-2 py-0.5 rounded-md font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{prod.prep_time_minutes} دقيقة</span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-white text-sm">{prod.name_ar}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{prod.name_en}</p>
                    </div>
                    <div className="text-left font-mono">
                      <div className="text-amber-400 font-bold text-sm">
                        {(prod.discount_price || prod.base_price).toLocaleString()} د.ع
                      </div>
                      {prod.discount_price && (
                        <div className="text-[11px] text-slate-500 line-through">
                          {prod.base_price.toLocaleString()} د.ع
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                    {prod.description_ar}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{prod.sizes?.length || 0} أحجام متوفرة</span>
                    <span>{prod.addons?.length || 0} إضافات</span>
                    {prod.calories && <span>{prod.calories} سعرة</span>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    متاح للطلب
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditProduct(prod)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="تعديل بيانات الصنف"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`هل أنت متأكد من حذف صنف "${prod.name_ar}" من المنيو؟`)) {
                          deleteProduct(prod.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="حذف الصنف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: QR Code Generator Studio */}
      {activeTab === 'qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-400" />
                <span>استوديو تصميم وتوليد رموز الاستجابة السريعة (QR Code Studio)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                توليد باركود رقمي فوري عالي الدقة لكل فرع، منيو عام، أو طاولة محددة جاهزة للطباعة والتنزيل.
              </p>
            </div>

            {/* QR Target Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">نوع رمز الـ QR المطلوب:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setQrType('table')}
                  className={`p-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                    qrType === 'table'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  QR طاولة طعام محددة
                </button>
                <button
                  onClick={() => setQrType('branch')}
                  className={`p-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                    qrType === 'branch'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  QR فرع كامل
                </button>
                <button
                  onClick={() => setQrType('restaurant')}
                  className={`p-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                    qrType === 'restaurant'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  المنيو الرقمي العام
                </button>
              </div>
            </div>

            {/* If table QR, select table */}
            {qrType === 'table' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">اختر الفرع:</label>
                  <select
                    value={selectedBranchId}
                    onChange={e => setSelectedBranchId(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name_ar}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">اختر رقم الطاولة:</label>
                  <select
                    value={selectedTableNumber}
                    onChange={e => setSelectedTableNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono"
                  >
                    {tables.map(t => (
                      <option key={t.id} value={t.table_number}>طاولة {t.table_number} ({t.capacity} مقاعد)</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Color Customization */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">لون الباركود والعلامة التجارية:</label>
              <div className="flex items-center gap-3">
                {[
                  { name: 'داكن فاخر', val: '#1e293b' },
                  { name: 'ذهبي عنبري', val: '#b45309' },
                  { name: 'كحلي ملكي', val: '#1e3a8a' },
                  { name: 'أحمر قرمزي', val: '#991b1b' },
                  { name: 'أخضر زمردي', val: '#065f46' },
                ].map(c => (
                  <button
                    key={c.val}
                    onClick={() => setQrColor(c.val)}
                    style={{ backgroundColor: c.val }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      qrColor === c.val ? 'scale-110 border-amber-400 shadow-md ring-2 ring-white/20' : 'border-transparent'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 font-mono break-all">
              <div className="text-[11px] text-slate-500 mb-1">رابط الهبوط عند المسح بالهاتف:</div>
              <span className="text-amber-400">{getQrUrl()}</span>
            </div>

            {/* WhatsApp Direct Ordering Setup */}
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                  <span className="text-xs font-bold text-white">إعدادات استقبال الطلبات مباشرة على واتساب</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                  مفعل ونشط 🟢
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                عند قيام الزبون بمسح رمز الـ QR بكاميرا الموبايل واختياره للوجبات والمشروبات، يتيح له النظام خيار الإرسال والتأكيد الفوري عبر واتساب مباشرة إلى هذا الرقم بصيغة منسقة وتفصيلية!
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="+964 770 123 4567"
                  value={ownerWhatsApp}
                  onChange={e => setOwnerWhatsApp(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    updateRestaurantWhatsApp(ownerWhatsApp);
                    setSavedWhatsAppSuccess(true);
                    setTimeout(() => setSavedWhatsAppSuccess(false), 2500);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors shrink-0"
                >
                  {savedWhatsAppSuccess ? 'تم الحفظ بنجاح!' : 'حفظ الرقم'}
                </button>
              </div>
            </div>
          </div>

          {/* QR Live Print Preview Stand */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-between text-center">
            <div className="w-full flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white">معاينة بطاقة الطاولة المطبوعة</span>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono">
                Standard A6 Stand
              </span>
            </div>

            {/* Stand Graphic */}
            <div className="bg-white text-slate-950 p-6 rounded-2xl shadow-2xl max-w-[280px] w-full flex flex-col items-center space-y-3 border-4 border-amber-500/30">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                س
              </div>
              <div>
                <h4 className="font-bold text-base leading-tight text-slate-900">{activeRestaurant.name_ar}</h4>
                <p className="text-[11px] text-slate-500">{activeRestaurant.name_en}</p>
              </div>

              {/* QR Canvas */}
              <div className="p-2 border border-slate-200 rounded-xl bg-white shadow-inner">
                <canvas ref={qrCanvasRef} className="rounded-lg" />
              </div>

              <div className="text-center">
                <div className="font-black text-xs text-amber-600 tracking-wider">
                  {qrType === 'table' ? `طاولة رقم: ${selectedTableNumber}` : 'امسح بالهاتف لفتح المنيو'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  لا يتطلب تطبيق · اطلب وادفع فوراً
                </div>
              </div>
            </div>

            {/* Print & Download Action Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full mt-6">
              <button
                onClick={handleDownloadQr}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>تحميل PNG عالي الدقة</span>
              </button>
              <button
                onClick={handlePrintQr}
                className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الستاند PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Branches */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">فروع المطعم ونقاط الخدمة</h3>
            <button
              onClick={() => setShowAddBranchModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فرع جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map(b => (
              <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">{b.name_ar}</h4>
                    <p className="text-xs text-slate-400">{b.name_en}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    فرع نشط
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">العنوان:</span>
                    <span>{b.address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">الهاتف:</span>
                    <span>{b.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">مدير الفرع:</span>
                    <span className="font-semibold text-white">{b.manager_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">ساعات العمل:</span>
                    <span className="font-mono">{b.opening_time} - {b.closing_time}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setCurrentRole('branch_manager')}
                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg border border-blue-500/20"
                  >
                    دخول لوحة الفرع
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Overview & Orders */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-semibold">مبيعات اليوم</span>
              <div className="text-2xl font-bold font-mono text-white mt-2">
                {totalSales.toLocaleString()} د.ع
              </div>
              <p className="text-[11px] text-emerald-400 mt-1">من {restaurantOrders.length} طلبات مكتملة</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-semibold">متوسط قيمة الطلب</span>
              <div className="text-2xl font-bold font-mono text-white mt-2">
                {Math.round(totalSales / (restaurantOrders.length || 1)).toLocaleString()} د.ع
              </div>
              <p className="text-[11px] text-slate-400 mt-1">معدل الفاتورة للزبون</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
              <span className="text-xs text-slate-400 font-semibold">إشغال الطاولات الحالي</span>
              <div className="text-2xl font-bold font-mono text-white mt-2">
                {tables.filter(t => t.status === 'occupied').length} / {tables.length}
              </div>
              <p className="text-[11px] text-amber-400 mt-1">طاولات مشغولة داخل الصالة</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">سجل الطلبات الحالية بالمطعم</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">رقم الطلب</th>
                    <th className="py-3 px-3">النوع</th>
                    <th className="py-3 px-3">الزبون</th>
                    <th className="py-3 px-3">المبلغ الإجمالي</th>
                    <th className="py-3 px-3">طريقة الدفع</th>
                    <th className="py-3 px-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {restaurantOrders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-mono text-amber-400">{o.order_number}</td>
                      <td className="py-3 px-3">
                        {o.order_type === 'dine_in' ? `داخل المطعم (${o.table_number})` : 'توصيل خارجي'}
                      </td>
                      <td className="py-3 px-3 text-white font-medium">{o.customer_name}</td>
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        {o.total_amount.toLocaleString()} د.ع
                      </td>
                      <td className="py-3 px-3 uppercase text-slate-300 font-mono">{o.payment_method}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: AI Sales Optimizer */}
      {activeTab === 'ai' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">محرك الذكاء الاصطناعي لتحليل المبيعات واقتراح العروض</h3>
              <p className="text-xs text-slate-400">خوارزميات تحليل سلة الشراء وتوقع ساعات الذروة لزيادة الأرباح</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-purple-400">زيادة قيمة السلة (AOV Upselling)</span>
              <h4 className="text-sm font-bold text-white">عرض الكومبو الذكي للمشاوي</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                72% من زبائن صينية المشاوي يضيفون الحمص وسلطة الفتوش إذا عُرضت عليهم في السلة بنقرة واحدة مع خصم 10%.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-400 font-semibold">+18.5% زيادة متوقعة بالمبيعات</div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-purple-400">توقع ذروة الطلب (Surge Alert)</span>
              <h4 className="text-sm font-bold text-white">ذروة الغداء والعشاء القادمة</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                يتوقع النظام 85 طلب بين الساعة 1:30 ظهراً و 3:45 عصراً. يُوصى بتجهيز 15 كغم أسياخ كباب وتتبيل الشيش طاووق مبكراً.
              </p>
              <div className="pt-2 text-xs font-mono text-blue-400 font-semibold">-32% تقليل وقت الانتظار</div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-purple-400">أصناف عالية الهامش الربحي (Stars)</span>
              <h4 className="text-sm font-bold text-white">القهوة المختصة والعصائر الطازجة</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                تحقق المشروبات هامش ربح صافي يتجاوز 82%. تم تفعيل اقتراح الكابتشينو تلقائياً مع وجبات البرغر والحلويات.
              </p>
              <div className="pt-2 text-xs font-mono text-amber-400 font-semibold">+12% هامش الربح الإجمالي</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Reports & Export */}
      {activeTab === 'reports' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">التقارير المالية والمحاسبية</h3>
            <button
              onClick={() => {
                const csvData = "data:text/csv;charset=utf-8," + encodeURIComponent(
                  "OrderNumber,Customer,Type,Amount,PaymentMethod,Status\n" +
                  restaurantOrders.map(o => `${o.order_number},${o.customer_name},${o.order_type},${o.total_amount},${o.payment_method},${o.status}`).join("\n")
                );
                const a = document.createElement('a');
                a.href = csvData;
                a.download = `Report_${activeRestaurant.slug}_Sales.csv`;
                a.click();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تصدير ملف Excel / CSV</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            يمكنك تصدير كافة العمليات اليومية أو الشهرية مع تفاصيل الضرائب والخصومات لطابعات الدفاتر والمحاسبين.
          </p>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>{editingCategory ? 'تعديل اسم وبيانات القسم' : 'إضافة قسم / تصنيف جديد للمنيو'}</span>
              </h3>
              <button
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!newCatNameAr.trim()) return;
                if (editingCategory) {
                  updateCategory(editingCategory.id, {
                    name_ar: newCatNameAr.trim(),
                    name_en: newCatNameEn.trim() || newCatNameAr.trim()
                  });
                } else {
                  addCategory({
                    name_ar: newCatNameAr.trim(),
                    name_en: newCatNameEn.trim() || newCatNameAr.trim()
                  });
                }
                setNewCatNameAr('');
                setNewCatNameEn('');
                setEditingCategory(null);
                setShowAddCategoryModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-400 mb-1">اسم القسم بالعربية *</label>
                <input
                  type="text"
                  required
                  value={newCatNameAr}
                  onChange={e => setNewCatNameAr(e.target.value)}
                  placeholder="مثال: مشروبات ساخنة، مقبلات باردة، شاورما..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">اسم القسم بالإنجليزية (اختياري)</label>
                <input
                  type="text"
                  value={newCatNameEn}
                  onChange={e => setNewCatNameEn(e.target.value)}
                  placeholder="Hot Drinks, Cold Appetizers..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition-colors"
                >
                  {editingCategory ? 'حفظ التعديلات' : 'حفظ القسم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingProduct ? `تعديل الصنف: ${editingProduct.name_ar}` : 'إضافة صنف وجبة جديد إلى المنيو'}
              </h3>
              <button
                onClick={() => {
                  setShowAddProductModal(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">اسم الصنف بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={prodNameAr}
                    onChange={e => setProdNameAr(e.target.value)}
                    placeholder="مثال: شاورما لحم عربي"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    value={prodNameEn}
                    onChange={e => setProdNameEn(e.target.value)}
                    placeholder="Arabic Beef Shawarma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">القسم / التصنيف *</label>
                <select
                  value={prodCategory}
                  onChange={e => setProdCategory(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name_ar}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">السعر الأساسي (د.ع) *</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={e => setProdPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">سعر الخصم (اختياري)</label>
                  <input
                    type="number"
                    value={prodDiscount || ''}
                    onChange={e => setProdDiscount(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="سعر العرض"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">مدة التحضير (بالدقائق)</label>
                  <input
                    type="number"
                    value={prodPrepTime}
                    onChange={e => setProdPrepTime(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">السعرات الحرارية</label>
                  <input
                    type="number"
                    value={prodCalories}
                    onChange={e => setProdCalories(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">الوصف والمكونات</label>
                <textarea
                  rows={3}
                  value={prodDescAr}
                  onChange={e => setProdDescAr(e.target.value)}
                  placeholder="وصف شهي ومكونات الطبق..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProductModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition-colors"
                >
                  {editingProduct ? 'حفظ التعديلات' : 'حفظ الصنف ونشره في المنيو'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Branch Modal */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">إضافة فرع جديد للمطعم</h3>
              <button onClick={() => setShowAddBranchModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateBranch} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">اسم الفرع *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فرع زيونة"
                  value={branchNameAr}
                  onChange={e => setBranchNameAr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">العنوان التفصيلي</label>
                <input
                  type="text"
                  placeholder="شارع الربيعي، مقابل المول"
                  value={branchAddress}
                  onChange={e => setBranchAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">هاتف الفرع</label>
                  <input
                    type="text"
                    value={branchPhone}
                    onChange={e => setBranchPhone(e.target.value)}
                    placeholder="+964 770 000 0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">اسم مدير الفرع</label>
                  <input
                    type="text"
                    value={branchManager}
                    onChange={e => setBranchManager(e.target.value)}
                    placeholder="اسم المسؤول"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddBranchModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
                >
                  حفظ وتفعيل الفرع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
