import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';
import { Product, ProductSize, ProductAddon, Category, DiningTable, User, UserRole, Branch } from '../../types';
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
  EyeOff,
  Sliders,
  AlertCircle,
  MessageCircle,
  Store,
  Camera,
  Upload,
  Palette,
  Image as ImageIcon,
  LayoutGrid,
  Users,
  PlusCircle,
  KeyRound,
  Lock,
  ShieldCheck,
  Bike,
  Receipt
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const {
    activeRestaurant,
    branches,
    addBranch,
    updateBranch,
    deleteBranch,
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
    plans,
    users,
    updateUser,
    createUser,
    deleteUser,
    setCurrentRole,
    updateRestaurantWhatsApp,
    updateRestaurantBranding,
    addTable,
    updateTable,
    deleteTable
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'branches' | 'tables' | 'staff' | 'qr' | 'ai' | 'reports' | 'branding'>('menu');
  const [ownerWhatsApp, setOwnerWhatsApp] = useState<string>(activeRestaurant?.whatsapp_number || '+9647701234567');
  const [savedWhatsAppSuccess, setSavedWhatsAppSuccess] = useState(false);

  // Staff & User Management States
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaffUser, setEditingStaffUser] = useState<User | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('cashier');
  const [staffBranchId, setStaffBranchId] = useState<number>(branches[0]?.id || 1);
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffPin, setStaffPin] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffIsActive, setStaffIsActive] = useState(true);
  const [staffMsg, setStaffMsg] = useState<{ success: boolean; message: string } | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<{ [key: number]: boolean }>({});
  const [staffRoleFilter, setStaffRoleFilter] = useState<'all' | UserRole>('all');
  const [staffBranchFilter, setStaffBranchFilter] = useState<number | 'all'>('all');
  const [staffToDelete, setStaffToDelete] = useState<User | null>(null);
  const [isDeletingStaff, setIsDeletingStaff] = useState(false);
  const [staffDeleteNotice, setStaffDeleteNotice] = useState<{ success: boolean; message: string } | null>(null);

  // Table Management States
  const [showTableModal, setShowTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<DiningTable | null>(null);
  const [tableNumberInput, setTableNumberInput] = useState('');
  const [tableCapacityInput, setTableCapacityInput] = useState<number>(4);
  const [tableStatusInput, setTableStatusInput] = useState<'available' | 'occupied' | 'reserved'>('available');
  const [tableErrorMsg, setTableErrorMsg] = useState<string | null>(null);

  // Restaurant Branding & Photo Upload states
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [brandingTarget, setBrandingTarget] = useState<'all' | 'logo' | 'cover'>('all');
  const [newLogoUrl, setNewLogoUrl] = useState(activeRestaurant?.logo_url || '');
  const [newCoverUrl, setNewCoverUrl] = useState(activeRestaurant?.cover_url || '');
  const [newRestName, setNewRestName] = useState(activeRestaurant?.name_ar || '');
  const [newRestDesc, setNewRestDesc] = useState(activeRestaurant?.description_ar || '');
  const [savedBrandingSuccess, setSavedBrandingSuccess] = useState(false);

  useEffect(() => {
    if (activeRestaurant) {
      setNewLogoUrl(activeRestaurant.logo_url || '');
      setNewCoverUrl(activeRestaurant.cover_url || '');
      setNewRestName(activeRestaurant.name_ar || '');
      setNewRestDesc(activeRestaurant.description_ar || '');
      setOwnerWhatsApp(activeRestaurant.whatsapp_number || '+9647701234567');
    }
  }, [activeRestaurant]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewCoverUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBranding = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeRestaurant) return;
    updateRestaurantBranding(activeRestaurant.id, {
      logo_url: newLogoUrl || activeRestaurant.logo_url,
      cover_url: newCoverUrl || activeRestaurant.cover_url,
      name_ar: newRestName || activeRestaurant.name_ar,
      description_ar: newRestDesc || activeRestaurant.description_ar,
      whatsapp_number: ownerWhatsApp || activeRestaurant.whatsapp_number
    });
    setSavedBrandingSuccess(true);
    setTimeout(() => {
      setSavedBrandingSuccess(false);
      setShowBrandingModal(false);
    }, 1500);
  };

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

  // Product Sizes & Addons & Availability
  const [productModalTab, setProductModalTab] = useState<'info' | 'sizes' | 'addons'>('info');
  const [prodSizes, setProdSizes] = useState<ProductSize[]>([]);
  const [prodAddons, setProdAddons] = useState<ProductAddon[]>([]);
  const [prodIsAvailable, setProdIsAvailable] = useState<boolean>(true);

  const handleAddSize = () => {
    const newSize: ProductSize = {
      id: Date.now(),
      product_id: editingProduct?.id || 0,
      name_ar: `حجم جديد ${prodSizes.length + 1}`,
      name_en: `Size ${prodSizes.length + 1}`,
      extra_price: prodSizes.length === 0 ? 0 : 2500,
      is_default: prodSizes.length === 0
    };
    setProdSizes(prev => [...prev, newSize]);
  };

  const handleUpdateSize = (id: number, field: keyof ProductSize, val: any) => {
    setProdSizes(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const handleDeleteSize = (id: number) => {
    setProdSizes(prev => prev.filter(s => s.id !== id));
  };

  const handleAddAddon = () => {
    const newAddon: ProductAddon = {
      id: Date.now(),
      product_id: editingProduct?.id || 0,
      name_ar: `إضافة جديدة ${prodAddons.length + 1}`,
      name_en: `Addon ${prodAddons.length + 1}`,
      price: 1000
    };
    setProdAddons(prev => [...prev, newAddon]);
  };

  const handleUpdateAddon = (id: number, field: keyof ProductAddon, val: any) => {
    setProdAddons(prev => prev.map(a => a.id === id ? { ...a, [field]: val } : a));
  };

  const handleDeleteAddon = (id: number) => {
    setProdAddons(prev => prev.filter(a => a.id !== id));
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProdImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Branch management states
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [branchDeleteNotice, setBranchDeleteNotice] = useState<{ success: boolean; message: string } | null>(null);
  const [isDeletingBranch, setIsDeletingBranch] = useState(false);
  const [branchNameAr, setBranchNameAr] = useState('');
  const [branchNameEn, setBranchNameEn] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchManager, setBranchManager] = useState('');
  const [branchOpeningTime, setBranchOpeningTime] = useState('10:00');
  const [branchClosingTime, setBranchClosingTime] = useState('00:00');
  const [branchFormMsg, setBranchFormMsg] = useState<{ success: boolean; message: string } | null>(null);

  // QR Studio states
  const [qrType, setQrType] = useState<'restaurant' | 'branch' | 'table' | 'delivery' | 'takeaway'>('delivery');
  const [selectedBranchId, setSelectedBranchId] = useState<number>(branches[0]?.id || 1);
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>('T-01');
  const [qrColor, setQrColor] = useState<string>('#1e293b');
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [customQrBase, setCustomQrBase] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.origin) {
      // If running on local machine, mobile phone cannot access localhost, so default to live cloud domain!
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'https://sufra-production-ef42.up.railway.app';
      }
      return window.location.origin;
    }
    return 'https://sufra-production-ef42.up.railway.app';
  });

  // Calculate dynamic QR target link that opens directly in mobile browsers
  const getQrUrl = () => {
    if (!activeRestaurant) return customQrBase || 'https://sufra-production-ef42.up.railway.app';
    
    let base = (customQrBase || (typeof window !== 'undefined' ? window.location.origin : 'https://sufra-production-ef42.up.railway.app')).trim();
    if (!base.startsWith('http://') && !base.startsWith('https://')) {
      base = `https://${base}`;
    }
    base = base.replace(/\/+$/, '');

    const params = new URLSearchParams();
    params.set('role', 'customer');
    params.set('restaurant', String(activeRestaurant.id));
    if (selectedBranchId) params.set('branch', String(selectedBranchId));
    if (qrType === 'delivery') {
      params.set('type', 'delivery');
    } else if (qrType === 'takeaway') {
      params.set('type', 'takeaway');
    } else if (qrType === 'table' && selectedTableNumber) {
      params.set('table', selectedTableNumber);
    }

    return `${base}/?${params.toString()}`;
  };

  useEffect(() => {
    if (qrCanvasRef.current && activeRestaurant) {
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
  }, [qrType, selectedBranchId, selectedTableNumber, qrColor, activeRestaurant?.slug, activeTab, customQrBase]);

  const handleDownloadQr = () => {
    if (!qrCanvasRef.current || !activeRestaurant) return;
    const url = qrCanvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_${activeRestaurant.slug}_${qrType}${qrType === 'table' ? `_${selectedTableNumber}` : ''}.png`;
    a.click();
  };

  const handlePrintQr = () => {
    window.print();
  };

  const handleOpenEditProduct = (prod: Product, tab: 'info' | 'sizes' | 'addons' = 'info') => {
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
    setProdSizes(prod.sizes ? JSON.parse(JSON.stringify(prod.sizes)) : []);
    setProdAddons(prod.addons ? JSON.parse(JSON.stringify(prod.addons)) : []);
    setProdIsAvailable(prod.is_available !== false);
    setProductModalTab(tab);
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
        image_url: prodImageUrl,
        is_available: prodIsAvailable,
        sizes: prodSizes,
        addons: prodAddons
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
        is_available: prodIsAvailable,
        sizes: prodSizes,
        addons: prodAddons
      });
    }

    setShowAddProductModal(false);
    setEditingProduct(null);
    setProdNameAr('');
    setProdNameEn('');
    setProdDescAr('');
  };

  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchNameAr('');
    setBranchNameEn('');
    setBranchPhone('');
    setBranchAddress('');
    setBranchManager('');
    setBranchOpeningTime('10:00');
    setBranchClosingTime('00:00');
    setBranchFormMsg(null);
    setShowAddBranchModal(true);
  };

  const handleOpenEditBranch = (b: Branch) => {
    setEditingBranch(b);
    setBranchNameAr(b.name_ar);
    setBranchNameEn(b.name_en || '');
    setBranchPhone(b.phone || '');
    setBranchAddress(b.address || '');
    setBranchManager(b.manager_name || '');
    setBranchOpeningTime(b.opening_time || '10:00');
    setBranchClosingTime(b.closing_time || '00:00');
    setBranchFormMsg(null);
    setShowAddBranchModal(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchNameAr.trim()) {
      setBranchFormMsg({ success: false, message: 'يرجى إدخال اسم الفرع بالعربية' });
      return;
    }

    if (editingBranch) {
      const res = updateBranch(editingBranch.id, {
        name_ar: branchNameAr.trim(),
        name_en: branchNameEn.trim() || branchNameAr.trim(),
        phone: branchPhone.trim(),
        address: branchAddress.trim(),
        manager_name: branchManager.trim(),
        opening_time: branchOpeningTime,
        closing_time: branchClosingTime
      });
      setBranchFormMsg(res);
      if (res.success) {
        setTimeout(() => {
          setShowAddBranchModal(false);
          setEditingBranch(null);
          setBranchFormMsg(null);
        }, 1000);
      }
    } else {
      addBranch({
        name_ar: branchNameAr.trim(),
        name_en: branchNameEn.trim() || branchNameAr.trim(),
        phone: branchPhone.trim(),
        address: branchAddress.trim(),
        manager_name: branchManager.trim(),
        opening_time: branchOpeningTime,
        closing_time: branchClosingTime
      });
      setBranchFormMsg({ success: true, message: 'تمت إضافة الفرع الجديد بنجاح' });
      setTimeout(() => {
        setShowAddBranchModal(false);
        setBranchFormMsg(null);
      }, 1000);
    }
  };

  const handleDeleteBranch = (b: Branch) => {
    setBranchToDelete(b);
    setBranchDeleteNotice(null);
  };

  const handleConfirmDeleteBranch = () => {
    if (!branchToDelete) return;
    setIsDeletingBranch(true);
    const res = deleteBranch(branchToDelete.id);
    if (!res.success) {
      setBranchDeleteNotice(res);
      setIsDeletingBranch(false);
    } else {
      setBranchDeleteNotice(res);
      setTimeout(() => {
        setBranchToDelete(null);
        setBranchDeleteNotice(null);
        setIsDeletingBranch(false);
      }, 1000);
    }
  };

  if (!activeRestaurant) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center max-w-xl mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center mb-4">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">لا يوجد مطعم مسجل أو محدد حالياً</h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          التطبيق مهيأ ونظيف لاستقبال المطاعم الجديدة بدون أي بيانات وهمية. تفضل بتسجيل مطعمك الأول للبدء في إدارة المنيو والفروع.
        </p>
        <button
          onClick={() => setCurrentRole('super_admin')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>الانتقال لتسجيل مطعم جديد (لوحة الإدارة)</span>
        </button>
      </div>
    );
  }

  const filteredProducts = selectedCatId === 'all'
    ? products
    : products.filter(p => p.category_id === selectedCatId);

  const restaurantOrders = orders.filter(o => o.restaurant_id === activeRestaurant.id);
  const totalSales = restaurantOrders.reduce((sum, o) => sum + o.total_amount, 0);

  const restaurantBranches = branches.filter(b => b.restaurant_id === activeRestaurant.id);
  const restaurantBranchIds = restaurantBranches.map(b => b.id);
  const restaurantTables = tables.filter(t => restaurantBranchIds.includes(t.branch_id));
  const restaurantUsers = users.filter(u => u.restaurant_id === activeRestaurant.id);

  const handleOpenAddStaff = () => {
    setEditingStaffUser(null);
    setStaffName('');
    setStaffRole('cashier');
    setStaffBranchId(restaurantBranches[0]?.id || 1);
    setStaffUsername('');
    setStaffPassword('123456');
    setStaffPin(String(Math.floor(1000 + Math.random() * 9000)));
    setStaffPhone('');
    setStaffIsActive(true);
    setStaffMsg(null);
    setShowStaffModal(true);
  };

  const handleOpenEditStaff = (user: User) => {
    setEditingStaffUser(user);
    setStaffName(user.name);
    setStaffRole(user.role);
    setStaffBranchId(user.branch_id || restaurantBranches[0]?.id || 1);
    setStaffUsername(user.username);
    setStaffPassword(user.password || '');
    setStaffPin(user.pin_code || '');
    setStaffPhone(user.phone || '');
    setStaffIsActive(user.is_active);
    setStaffMsg(null);
    setShowStaffModal(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffUsername.trim() || !staffName.trim()) {
      setStaffMsg({ success: false, message: 'يرجى إدخال الاسم الكامل واسم المستخدم' });
      return;
    }

    if (editingStaffUser) {
      const res = updateUser(editingStaffUser.id, {
        name: staffName.trim(),
        role: staffRole,
        branch_id: staffBranchId,
        username: staffUsername.trim().toLowerCase(),
        password: staffPassword.trim(),
        pin_code: staffPin.trim(),
        phone: staffPhone.trim(),
        is_active: staffIsActive
      });
      setStaffMsg(res);
      if (res.success) {
        setTimeout(() => setShowStaffModal(false), 1200);
      }
    } else {
      const res = createUser({
        restaurant_id: activeRestaurant.id,
        branch_id: staffBranchId,
        name: staffName.trim(),
        role: staffRole,
        username: staffUsername.trim().toLowerCase(),
        email: `${staffUsername.trim().toLowerCase()}@${activeRestaurant.slug || 'sufrah'}.com`,
        password: staffPassword.trim() || '123456',
        pin_code: staffPin.trim() || '1234',
        phone: staffPhone.trim(),
        is_active: staffIsActive
      });
      setStaffMsg(res);
      if (res.success) {
        setTimeout(() => setShowStaffModal(false), 1200);
      }
    }
  };

  const handleDeleteStaff = (user: User) => {
    setStaffToDelete(user);
    setStaffDeleteNotice(null);
  };

  const currentPlan = plans.find(p => p.name_ar === activeRestaurant.plan_name || activeRestaurant.plan_name.includes(p.name_en));
  const maxAllowedTables = currentPlan?.max_tables || (activeRestaurant.plan_name.includes('Starter') || activeRestaurant.plan_name.includes('مجانية') ? 10 : 60);

  const handleOpenAddTable = () => {
    if (restaurantTables.length >= maxAllowedTables) {
      alert(`لقد وصلت للحد الأقصى لعدد الطاولات المسموح به (${maxAllowedTables} طاولات) في باقتك الحالية (${activeRestaurant.plan_name}). يرجى ترقية الباقة لإضافة المزيد من الطاولات.`);
      return;
    }
    setEditingTable(null);
    setTableNumberInput(`T-${String(restaurantTables.length + 1).padStart(2, '0')}`);
    setTableCapacityInput(4);
    setTableStatusInput('available');
    setTableErrorMsg(null);
    setShowTableModal(true);
  };

  const handleOpenEditTable = (table: DiningTable) => {
    setEditingTable(table);
    setTableNumberInput(table.table_number);
    setTableCapacityInput(table.capacity);
    setTableStatusInput(table.status);
    setTableErrorMsg(null);
    setShowTableModal(true);
  };

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumberInput.trim()) return;

    if (editingTable) {
      updateTable(editingTable.id, {
        table_number: tableNumberInput.trim(),
        capacity: Number(tableCapacityInput) || 4,
        status: tableStatusInput
      });
      setShowTableModal(false);
      setEditingTable(null);
    } else {
      const res = addTable({
        table_number: tableNumberInput.trim(),
        capacity: Number(tableCapacityInput) || 4,
        status: tableStatusInput,
        branch_id: restaurantBranches[0]?.id || 1
      });
      if (res.success) {
        setShowTableModal(false);
      } else {
        setTableErrorMsg(res.message);
      }
    }
  };

  const handleDeleteTable = (tableId: number, tableNum: string) => {
    if (confirm(`هل أنت متأكد من حذف الطاولة (${tableNum})؟ سيتم إلغاء تفعيل الـ QR كود المرتبط بها.`)) {
      deleteTable(tableId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Restaurant Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        <div className="h-44 sm:h-52 relative group overflow-hidden">
          <img
            src={activeRestaurant.cover_url}
            alt=""
            className="w-full h-full object-cover brightness-75 transition-all group-hover:brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          
          {/* Quick Change Cover Button */}
          <button
            onClick={() => {
              setBrandingTarget('cover');
              setShowBrandingModal(true);
            }}
            className="absolute top-4 left-4 z-10 px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold rounded-xl border border-slate-700/80 shadow-lg backdrop-blur flex items-center gap-2 transition-all cursor-pointer hover:border-amber-500/50"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>تغيير صورة الواجهة (الغلاف)</span>
          </button>
        </div>

        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14">
          <div className="flex items-center gap-4">
            <div
              className="relative group cursor-pointer"
              onClick={() => {
                setBrandingTarget('logo');
                setShowBrandingModal(true);
              }}
              title="انقر لتغيير لوجو المطعم"
            >
              <img
                src={activeRestaurant.logo_url}
                alt=""
                className="w-24 h-24 rounded-2xl object-cover border-4 border-slate-900 shadow-2xl bg-slate-800 transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-bold transition-opacity">
                <Camera className="w-5 h-5 text-amber-400 mb-1" />
                <span>تغيير اللوجو</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{activeRestaurant.name_ar}</h1>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  activeRestaurant.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}>
                  {activeRestaurant.status === 'active' ? 'نشط أونلاين' : 'موقوف مؤقتاً'}
                </span>
                <button
                  onClick={() => {
                    setBrandingTarget('all');
                    setShowBrandingModal(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="تعديل هوية وصور المطعم"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
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
            { id: 'tables', label: `الطاولات والصالة (${restaurantTables.length}/${maxAllowedTables})`, icon: <LayoutGrid className="w-4 h-4" /> },
            { id: 'staff', label: `طاقم العمل والمستخدمين (${restaurantUsers.length})`, icon: <Users className="w-4 h-4" /> },
            { id: 'branding', label: 'هوية وصور المطعم (اللوجو والغلاف)', icon: <Palette className="w-4 h-4" /> },
            { id: 'qr', label: 'استوديو رموز QR', icon: <QrCode className="w-4 h-4" /> },
            { id: 'branches', label: `الفروع (${restaurantBranches.length})`, icon: <Building2 className="w-4 h-4" /> },
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
                  setProdPrepTime(15);
                  setProdCalories(550);
                  setProdImageUrl('/src/assets/images/dish_mixed_grills_1790265810518.jpg');
                  setProdSizes([
                    { id: Date.now(), product_id: 0, name_ar: 'عادي (Regular)', name_en: 'Regular', extra_price: 0, is_default: true },
                    { id: Date.now() + 1, product_id: 0, name_ar: 'كبير (Large)', name_en: 'Large', extra_price: 3000 }
                  ]);
                  setProdAddons([
                    { id: Date.now() + 2, product_id: 0, name_ar: 'جبنة إضافية', name_en: 'Extra Cheese', price: 1500 }
                  ]);
                  setProdIsAvailable(true);
                  setProductModalTab('info');
                  setShowAddProductModal(true);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors whitespace-nowrap cursor-pointer"
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
                    <button
                      type="button"
                      onClick={() => handleOpenEditProduct(prod, 'sizes')}
                      className="hover:text-amber-400 transition-colors flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                      title="إدارة وتعديل أحجام الوجبة"
                    >
                      <Layers className="w-3 h-3 text-amber-400/80" />
                      <span>{prod.sizes?.length || 0} أحجام متوفرة</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditProduct(prod, 'addons')}
                      className="hover:text-amber-400 transition-colors flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                      title="إدارة وتعديل إضافات الوجبة"
                    >
                      <PlusCircle className="w-3 h-3 text-amber-400/80" />
                      <span>{prod.addons?.length || 0} إضافات</span>
                    </button>
                    {prod.calories && <span>{prod.calories} سعرة</span>}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  {/* Availability Instant Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateProduct(prod.id, { is_available: prod.is_available === false ? true : false });
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-sm ${
                      prod.is_available !== false
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                    title="انقر للتبديل الفوري بين متوفر وغير متوفر"
                  >
                    <span className={`w-2 h-2 rounded-full ${prod.is_available !== false ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
                    <span>{prod.is_available !== false ? 'متاح للطلب' : 'غير متوفر حالياً'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditProduct(prod, 'info')}
                      className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
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
              <label className="text-xs font-semibold text-slate-300">نوع رمز الـ QR المطلوب توليده:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => setQrType('table')}
                  className={`p-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    qrType === 'table'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-md ring-1 ring-amber-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">🪑</span>
                  <span className="font-bold">QR طاولات الصالة</span>
                  <span className="text-[10px] text-slate-500">طاولة محددة داخل المطعم</span>
                </button>

                <button
                  onClick={() => setQrType('delivery')}
                  className={`p-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    qrType === 'delivery'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-md ring-1 ring-emerald-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">🛵</span>
                  <span className="font-bold">QR التوصيل المنزلي</span>
                  <span className="text-[10px] text-emerald-400/80">توصيل تلقائي لموقع الزبون</span>
                </button>

                <button
                  onClick={() => setQrType('takeaway')}
                  className={`p-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    qrType === 'takeaway'
                      ? 'bg-blue-500/15 border-blue-500 text-blue-400 shadow-md ring-1 ring-blue-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">🛍️</span>
                  <span className="font-bold">QR الاستلام السفري</span>
                  <span className="text-[10px] text-blue-400/80">سفري واستلام من الفرع</span>
                </button>

                <button
                  onClick={() => setQrType('restaurant')}
                  className={`p-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    qrType === 'restaurant'
                      ? 'bg-purple-500/15 border-purple-500 text-purple-400 shadow-md ring-1 ring-purple-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl">📖</span>
                  <span className="font-bold">المنيو الرقمي العام</span>
                  <span className="text-[10px] text-slate-500">تصفح عام لكافة الأقسام</span>
                </button>
              </div>
            </div>

            {/* Delivery QR Info Box */}
            {qrType === 'delivery' && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-1.5">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <span className="text-base">🛵</span>
                  <span>كيو ار كود طلبات التوصيل المنزلي (Delivery QR)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  هذا الكود مخصص لطباعته على <strong>كروت التوصيل، بروشورات المطعم، أكياس وتغليف الوجبات، ملصقات التوصيل، وصفحات السوشيال ميديا وواتساب</strong>.
                  عند قيام الزبون بمسح هذا الـ QR بكاميرا هاتفه، يتم نقله تلقائياً وبشكل كامل إلى نمط <strong>«🛵 توصيل لموقعك»</strong> دون الحاجة لاختيار زر التوصيل ودون الحاجة لرقم طاولة؛ فيقوم الزبون باختيار وجباته مباشرة وإدخال عنوانه وإرسال الطلب بنقرة واحدة!
                </p>
              </div>
            )}

            {/* Takeaway QR Info Box */}
            {qrType === 'takeaway' && (
              <div className="p-4 bg-blue-950/40 border border-blue-500/30 rounded-xl space-y-1.5">
                <div className="text-xs font-bold text-blue-400 flex items-center gap-2">
                  <span className="text-base">🛍️</span>
                  <span>كيو ار كود طلبات الاستلام السفري (Takeaway QR)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  هذا الكود مخصص للزبائن الراغبين بطلب وجباتهم مسبقاً واستلامها جاهزة وسريعة من فرع المطعم.
                  عند مسح هذا الـ QR، يتم الانتقال تلقائياً إلى نمط <strong>«🛍️ استلام سفري»</strong> بدون الحاجة لاختيار زر السفري؛ ويختار الزبون وجباته ويرسل طلبه ليتم تجهيزه في المطبخ بدون أجور توصيل وبدون طاولة!
                </p>
              </div>
            )}

            {/* Table QR Info Box */}
            {qrType === 'table' && (
              <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-1.5">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
                  <span className="text-base">🪑</span>
                  <span>كيو ار كود طاولات الصالة (Dine-in Table QR)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  اختر رقم الطاولة من القائمة أدناه ليتم توليد باركود يوضع على ستاند الطاولة داخل الصالة؛ وعند مسح الزبون للباركود، يتم تحديد رقم طاولته تلقائياً وإرسال الطلبات إلى الكاشير والمطبخ مع رقم الطاولة.
                </p>
              </div>
            )}

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

            {/* Domain URL configuration */}
            <div className="space-y-1.5 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block">نطاق رابط الـ QR (الدومين المباشر):</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={customQrBase}
                  onChange={e => setCustomQrBase(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  placeholder="https://sufra-production-ef42.up.railway.app"
                />
                <button
                  type="button"
                  onClick={() => setCustomQrBase('https://sufra-production-ef42.up.railway.app')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-lg transition-colors shrink-0"
                >
                  السحابة (Railway)
                </button>
              </div>
              <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
                <span>رابط الفتح المباشر عند المسح:</span>
                <span className="text-amber-400 font-mono text-[11px] truncate max-w-[240px] sm:max-w-none">{getQrUrl()}</span>
              </div>
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
                  {qrType === 'table'
                    ? `طاولة رقم: ${selectedTableNumber}`
                    : qrType === 'delivery'
                    ? '🛵 طلبات التوصيل المنزلي السريع'
                    : qrType === 'takeaway'
                    ? '🛍️ طلبات الاستلام السفري من الفرع'
                    : 'امسح بالهاتف لفتح المنيو'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {qrType === 'delivery'
                    ? 'توصيل مباشر إلى باب منزلك · اطلب فوراً'
                    : qrType === 'takeaway'
                    ? 'اطلب واستلم وجبتك ساخنة مباشرة من المطعم'
                    : 'لا يتطلب تطبيق · اطلب وادفع فوراً'}
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

      {/* Tab: Table Management */}
      {activeTab === 'tables' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Plan Limit Usage Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
            {/* Delivery & Takeaway QR Shortcut Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-xl">
                  📲
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <span>رموز QR للطلبات الخارجية (بدون طاولة)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      توصيل وسفري
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    بالإضافة لطاولات الصالة، يمتلك مطعمك رمز QR خاص بالتوصيل لبيت الزبون، ورمز QR خاص بالاستلام السفري من الفرع.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setQrType('delivery');
                    setActiveTab('qr');
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🛵 QR التوصيل</span>
                </button>
                <button
                  onClick={() => {
                    setQrType('takeaway');
                    setActiveTab('qr');
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🛍️ QR السفري</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg sm:text-xl font-bold text-white">إدارة طاولات الصالة والـ QR Code</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {activeRestaurant.plan_name}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  يمكنك إضافة طاولات جديدة، تعديل أرقامها وسعتها، أو حذفها لتحديث الـ QR Code الخاص بكل طاولة.
                </p>
              </div>

              <button
                onClick={handleOpenAddTable}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة طاولة جديدة</span>
              </button>
            </div>

            {/* Plan Limit Progress Bar */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">استهلاك الطاولات في باقتك الحالية:</span>
                <span className="font-mono font-bold text-white">
                  <span className="text-amber-400">{restaurantTables.length}</span> / {maxAllowedTables} طاولة
                </span>
              </div>
              
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all rounded-full ${
                    restaurantTables.length >= maxAllowedTables ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (restaurantTables.length / maxAllowedTables) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {activeRestaurant.plan_name.includes('Starter') || activeRestaurant.plan_name.includes('مجانية')
                    ? 'الحد الأقصى في الباقة المجانية: 10 طاولات'
                    : `الحد الأقصى في باقتك: ${maxAllowedTables} طاولة`}
                </span>
                {restaurantTables.length >= maxAllowedTables ? (
                  <span className="text-rose-400 font-bold">تم الوصول للحد الأقصى للطاولات في هذه الباقة</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">
                    متبقي {maxAllowedTables - restaurantTables.length} طاولات إضافية
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {restaurantTables.map(table => (
              <div
                key={table.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-4 shadow-lg transition-all relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black text-sm flex items-center justify-center font-mono">
                      {table.table_number}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">طاولة {table.table_number}</h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span>سعة {table.capacity} أشخاص</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    table.status === 'available'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : table.status === 'occupied'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}>
                    {table.status === 'available' ? 'متاحة' : table.status === 'occupied' ? 'مشغولة' : 'محجوزة'}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">رمز QR المباشر:</span>
                  <button
                    onClick={() => {
                      setSelectedTableNumber(table.table_number);
                      setActiveTab('qr');
                    }}
                    className="text-amber-400 hover:underline font-mono text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>عرض وطباعة</span>
                  </button>
                </div>

                {/* Action buttons */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenEditTable(table)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>تعديل</span>
                  </button>

                  <button
                    onClick={() => handleDeleteTable(table.id, table.table_number)}
                    className="px-3 py-1.5 bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 text-xs font-semibold rounded-lg border border-rose-800/30 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف الطاولة</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {restaurantTables.length === 0 && (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-3">
              <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">لا توجد طاولات مضافة حالياً</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                أضف طاولات مطعمك لتوليد رموز الـ QR للطلب المباشر من الصالة.
              </p>
              <button
                onClick={handleOpenAddTable}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl"
              >
                + إضافة طاولة الآن
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Staff & User Accounts Management */}
      {activeTab === 'staff' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 text-2xl shadow-lg shadow-amber-500/20 font-bold">
                  👥
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>إدارة طاقم العمل وحسابات الدخول</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold">
                      {restaurantUsers.length} حسابات موظفين
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    تعيين وتغيير اسم المستخدم، وكلمة المرور، ورمز الـ PIN المكوّن من 4 أرقام لكل محطة (الكاشير، الشيف، المدير، الدليفري) لمنع تداخل البيانات بين الفروع.
                  </p>
                </div>
              </div>

              <button
                onClick={handleOpenAddStaff}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>إضافة موظف جديد لطاقم العمل</span>
              </button>
            </div>

            {/* Filter pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              {/* Role filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { id: 'all', label: 'كافة الأدوار' },
                  { id: 'cashier', label: '🧾 الكاشير (POS)' },
                  { id: 'kitchen', label: '👨‍🍳 شيف المطبخ (KDS)' },
                  { id: 'branch_manager', label: '🏢 مدير الفرع' },
                  { id: 'driver', label: '🛵 مندوب التوصيل' },
                  { id: 'restaurant_owner', label: '👑 مالك المطعم' },
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setStaffRoleFilter(r.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      staffRoleFilter === r.id
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Branch filter if multiple branches */}
              {restaurantBranches.length > 1 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">تصفية حسب الفرع:</span>
                  <select
                    value={staffBranchFilter}
                    onChange={e => setStaffBranchFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                  >
                    <option value="all">كافة الفروع</option>
                    {restaurantBranches.map(b => (
                      <option key={b.id} value={b.id}>{b.name_ar}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Staff Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {restaurantUsers
              .filter(u => staffRoleFilter === 'all' || u.role === staffRoleFilter)
              .filter(u => staffBranchFilter === 'all' || !u.branch_id || u.branch_id === staffBranchFilter)
              .map(user => {
                const branchObj = branches.find(b => b.id === user.branch_id);
                const isPasswordVisible = showPasswordMap[user.id];

                const roleBadge = (() => {
                  switch (user.role) {
                    case 'kitchen':
                      return { label: 'شيف المطبخ (KDS)', icon: '👨‍🍳', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
                    case 'cashier':
                      return { label: 'الكاشير (POS)', icon: '🧾', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
                    case 'branch_manager':
                      return { label: 'مدير الفرع والصالة', icon: '🏢', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
                    case 'driver':
                      return { label: 'مندوب التوصيل الميداني', icon: '🛵', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
                    case 'restaurant_owner':
                      return { label: 'مالك المطعم (مدير)', icon: '👑', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
                    default:
                      return { label: 'موظف', icon: '👤', color: 'bg-slate-800 text-slate-300 border-slate-700' };
                  }
                })();

                return (
                  <div
                    key={user.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-lg transition-all"
                  >
                    <div>
                      {/* Top Row: Role & Status */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${roleBadge.color}`}>
                          <span>{roleBadge.icon}</span>
                          <span>{roleBadge.label}</span>
                        </span>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          user.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {user.is_active ? 'حساب نشط 🟢' : 'معطل 🔴'}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="pt-3 space-y-2.5 text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                            {user.name.slice(0, 1)}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm leading-tight">{user.name}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {branchObj ? `فرع: ${branchObj.name_ar}` : 'كافة فروع المطعم'}
                            </p>
                          </div>
                        </div>

                        {/* Credentials Box */}
                        <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2 mt-3 font-mono">
                          {/* Username */}
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-[11px] text-slate-400 font-sans">اسم المستخدم:</span>
                            <span className="font-bold text-amber-400">{user.username}</span>
                          </div>

                          {/* Password */}
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-[11px] text-slate-400 font-sans">كلمة المرور:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white">
                                {isPasswordVisible ? (user.password || 'لا توجد') : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowPasswordMap(prev => ({ ...prev, [user.id]: !prev[user.id] }))}
                                className="p-1 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                                title={isPasswordVisible ? 'إخفاء كلمة المرور' : 'عرض كلمة المرور'}
                              >
                                {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* PIN Code */}
                          <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-900">
                            <span className="text-[11px] text-slate-400 font-sans">رمز الـ PIN السريع:</span>
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-black tracking-widest text-xs border border-amber-500/20">
                              {user.pin_code || '1234'}
                            </span>
                          </div>

                          {user.phone && (
                            <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-900">
                              <span className="text-[11px] text-slate-400 font-sans">رقم الهاتف:</span>
                              <span className="text-slate-300 text-[11px]">{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleOpenEditStaff(user)}
                        className="flex-1 py-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>تعديل الحساب وتغيير الباسوورد</span>
                      </button>

                      {user.role !== 'restaurant_owner' && (
                        <button
                          onClick={() => handleDeleteStaff(user)}
                          className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950 hover:bg-rose-950/40 rounded-xl border border-slate-800 transition-colors cursor-pointer"
                          title="حذف حساب الموظف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {restaurantUsers.length === 0 && (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-3">
              <Users className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">لا يوجد موظفون مسجلون حالياً</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                قم بإضافة حسابات لطاقم العمل في مطعمك (الكاشير، الشيف، المدير، مندوب التوصيل) ليتمكن كل موظف من الدخول لمحطته المخصصة.
              </p>
              <button
                onClick={handleOpenAddStaff}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl"
              >
                + إضافة موظف الآن
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Branches */}
      {activeTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">فروع المطعم ونقاط الخدمة</h3>
            <button
              onClick={handleOpenAddBranch}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فرع جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurantBranches.map(b => (
              <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">{b.name_ar}</h4>
                    <p className="text-xs text-slate-400">{b.name_en}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      فرع نشط
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditBranch(b)}
                      title="تعديل الفرع"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 rounded-lg transition-colors cursor-pointer border border-slate-700/60"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBranch(b)}
                      title="حذف الفرع"
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors cursor-pointer border border-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditBranch(b)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>تعديل</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBranch(b)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg border border-rose-500/20 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentRole('branch_manager')}
                    className="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg border border-blue-500/20 transition-colors cursor-pointer"
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

      {/* Tab: Restaurant Branding & Photo Studio */}
      {activeTab === 'branding' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                  <Palette className="w-5 h-5 text-amber-400" />
                  <span>هوية وصور المطعم (اللوجو وصورة الواجهة)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  قم برفع لوجو المطعم وصورة الغلاف لتظهر بشكل مباشر وفخم في منيو الزبائن (QR Menu).
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSaveBranding()}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>حفظ التعديلات في المنيو</span>
              </button>
            </div>

            {savedBrandingSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>تم حفظ وتحديث هوية المطعم وصور المنيو بنجاح!</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Box 1: Restaurant Logo Upload */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-400" />
                    <span>شعار المطعم (Logo)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">يفضل صورة مربعة 1:1</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-slate-900 shrink-0 shadow-lg relative group">
                    <img
                      src={newLogoUrl || activeRestaurant.logo_url}
                      alt="Logo Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    {/* Device Upload Button */}
                    <label className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>اختيار لوجو من الجهاز / الموبايل</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Direct URL Input */}
                    <input
                      type="text"
                      placeholder="أو الصق رابط صورة الشعار (URL)..."
                      value={newLogoUrl}
                      onChange={e => setNewLogoUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Logo Presets */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-2 font-semibold">أو اختر من شعارات جاهزة بنقرة واحدة:</span>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {[
                      { label: 'مشاوي', url: '/src/assets/images/dish_mixed_grills_1790265810518.jpg' },
                      { label: 'برجر', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
                      { label: 'شاورما', url: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&q=80' },
                      { label: 'بيتزا', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80' },
                      { label: 'كافيه', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80' },
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewLogoUrl(p.url)}
                        className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                          newLogoUrl === p.url ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <img src={p.url} alt="" className="w-10 h-10 rounded-lg object-cover mx-auto mb-1" />
                        <span className="text-[10px] text-slate-300 block truncate">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Box 2: Restaurant Cover Banner Upload */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>صورة الواجهة والغلاف (Cover Banner)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">بانوراما عريضة 16:9</span>
                </div>

                <div className="space-y-3">
                  <div className="h-28 w-full rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-slate-900 relative shadow-lg">
                    <img
                      src={newCoverUrl || activeRestaurant.cover_url}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                      <span className="text-[11px] text-slate-200 font-bold">معاينة واجهة المنيو</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Device Upload Button */}
                    <label className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm shrink-0">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>اختيار صورة غلاف من الجهاز</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Direct URL Input */}
                    <input
                      type="text"
                      placeholder="أو الصق رابط صورة الغلاف (URL)..."
                      value={newCoverUrl}
                      onChange={e => setNewCoverUrl(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Cover Presets */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-2 font-semibold">أو اختر من صور واجهة فخمة جاهزة:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'مطعم فاخر', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80' },
                      { label: 'جلسة هادئة', url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=1200&q=80' },
                      { label: 'كافيه عصري', url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80' },
                      { label: 'مشاوي ولحوم', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80' },
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewCoverUrl(p.url)}
                        className={`p-1 rounded-xl border text-center transition-all cursor-pointer ${
                          newCoverUrl === p.url ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                        }`}
                      >
                        <img src={p.url} alt="" className="w-full h-12 rounded-lg object-cover mb-1" />
                        <span className="text-[10px] text-slate-300 block truncate">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Box 3: Restaurant Info */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">معلومات المطعم الأساسية</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">اسم المطعم بالعربية</label>
                  <input
                    type="text"
                    value={newRestName}
                    onChange={e => setNewRestName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">وصف المطعم والمأكولات</label>
                  <input
                    type="text"
                    value={newRestDesc}
                    onChange={e => setNewRestDesc(e.target.value)}
                    placeholder="مثال: أشهى المأكولات الشرقية والغربية"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">رقم واتساب الطلبات</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={ownerWhatsApp}
                    onChange={e => setOwnerWhatsApp(e.target.value)}
                    placeholder="+964 770 000 0000"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 text-right"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Branding Upload Modal (Triggered by Camera Buttons on banner or logo) */}
      {showBrandingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-cairo" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <span>
                  {brandingTarget === 'logo' ? 'تغيير لوجو المطعم' : brandingTarget === 'cover' ? 'تغيير صورة واجهة المطعم (الغلاف)' : 'تعديل هوية وصور المطعم'}
                </span>
              </h3>
              <button
                onClick={() => setShowBrandingModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {savedBrandingSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>تم حفظ الصور بنجاح! يتم الآن التحديث...</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Target: Logo */}
              {(brandingTarget === 'logo' || brandingTarget === 'all') && (
                <div className="space-y-2">
                  <label className="block text-slate-300 font-bold">شعار المطعم (Logo)</label>
                  <div className="flex items-center gap-3">
                    <img
                      src={newLogoUrl || activeRestaurant.logo_url}
                      alt=""
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-700 bg-slate-800 shrink-0"
                    />
                    <div className="flex-1 space-y-1.5">
                      <label className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>اختيار ملف من الموبايل أو الكمبيوتر</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="أو ضع رابط الشعار (URL)..."
                        value={newLogoUrl}
                        onChange={e => setNewLogoUrl(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Target: Cover */}
              {(brandingTarget === 'cover' || brandingTarget === 'all') && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="block text-slate-300 font-bold">صورة الواجهة / الغلاف (Banner)</label>
                  <div className="h-24 w-full rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 relative">
                    <img
                      src={newCoverUrl || activeRestaurant.cover_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0">
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>رفع صورة واجهة من الجهاز</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="أو ضع رابط صورة الغلاف (URL)..."
                      value={newCoverUrl}
                      onChange={e => setNewCoverUrl(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Fast Presets */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">أو اختر قالباً سريعاً بنقرة واحدة:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'فاخر', cover: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80', logo: '/src/assets/images/dish_mixed_grills_1790265810518.jpg' },
                    { label: 'برجر', cover: 'https://images.unsplash.com/photo-1586816001966-79b736744398?w=1200&q=80', logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
                    { label: 'كافيه', cover: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80', logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80' },
                    { label: 'مشاوي', cover: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80', logo: '/src/assets/images/dish_mixed_grills_1790265810518.jpg' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (brandingTarget === 'logo') setNewLogoUrl(p.logo);
                        else if (brandingTarget === 'cover') setNewCoverUrl(p.cover);
                        else {
                          setNewLogoUrl(p.logo);
                          setNewCoverUrl(p.cover);
                        }
                      }}
                      className="p-1 rounded-xl border border-slate-800 hover:border-amber-500 bg-slate-950 text-center transition-colors cursor-pointer"
                    >
                      <img src={p.cover} alt="" className="w-full h-10 rounded-lg object-cover mb-1" />
                      <span className="text-[10px] text-slate-300 block">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowBrandingModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleSaveBranding()}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                حفظ الصورة فوراً
              </button>
            </div>
          </div>
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-5 md:p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-amber-400" />
                <span>{editingProduct ? `تعديل الصنف: ${editingProduct.name_ar}` : 'إضافة صنف وجبة جديد إلى المنيو'}</span>
              </h3>
              <button
                onClick={() => {
                  setShowAddProductModal(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-white w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Sub-Tabs & Availability Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setProductModalTab('info')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    productModalTab === 'info'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white bg-slate-800/60'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>البيانات الأساسية والصورة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProductModalTab('sizes')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    productModalTab === 'sizes'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white bg-slate-800/60'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>الأحجام ({prodSizes.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setProductModalTab('addons')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    productModalTab === 'addons'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white bg-slate-800/60'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>الإضافات ({prodAddons.length})</span>
                </button>
              </div>

              {/* Instant Availability Toggle in Modal */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400 font-medium">حالة التوفر:</span>
                <button
                  type="button"
                  onClick={() => setProdIsAvailable(!prodIsAvailable)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    prodIsAvailable
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${prodIsAvailable ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                  <span>{prodIsAvailable ? 'متاح للطلب' : 'غير متوفر حالياً'}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveProduct} className="text-xs">
              {/* Tab 1: Info & Image */}
              {productModalTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Column 1: Details */}
                  <div className="md:col-span-7 space-y-2.5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">اسم الصنف بالعربية *</label>
                        <input
                          type="text"
                          required
                          value={prodNameAr}
                          onChange={e => setProdNameAr(e.target.value)}
                          placeholder="مثال: شاورما لحم عربي"
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">الاسم بالإنجليزية</label>
                        <input
                          type="text"
                          value={prodNameEn}
                          onChange={e => setProdNameEn(e.target.value)}
                          placeholder="Beef Shawarma"
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-500/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">القسم / التصنيف *</label>
                        <select
                          value={prodCategory}
                          onChange={e => setProdCategory(Number(e.target.value))}
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-500/50"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name_ar}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">السعر الأساسي (د.ع) *</label>
                        <input
                          type="number"
                          required
                          value={prodPrice}
                          onChange={e => setProdPrice(Number(e.target.value))}
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-white font-mono outline-none focus:border-amber-500/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">سعر الخصم (د.ع)</label>
                        <input
                          type="number"
                          value={prodDiscount || ''}
                          onChange={e => setProdDiscount(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="اختياري"
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2 text-white font-mono outline-none focus:border-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">التحضير (دقيقة)</label>
                        <input
                          type="number"
                          value={prodPrepTime}
                          onChange={e => setProdPrepTime(Number(e.target.value))}
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2 text-white font-mono outline-none focus:border-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1 font-medium">السعرات (Cal)</label>
                        <input
                          type="number"
                          value={prodCalories}
                          onChange={e => setProdCalories(Number(e.target.value))}
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2 text-white font-mono outline-none focus:border-amber-500/50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1 font-medium">الوصف والمكونات</label>
                      <textarea
                        rows={2}
                        value={prodDescAr}
                        onChange={e => setProdDescAr(e.target.value)}
                        placeholder="وصف ومكونات الطبق..."
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-500/50 resize-none"
                      />
                    </div>
                  </div>

                  {/* Column 2: Transparent Image Box */}
                  <div className="md:col-span-5 bg-transparent border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                        <span>صورة الطبق / الوجبة</span>
                      </span>
                      {prodImageUrl && (
                        <button
                          type="button"
                          onClick={() => setProdImageUrl('')}
                          className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                        >
                          إلغاء الصورة
                        </button>
                      )}
                    </div>

                    {/* Image Preview Box */}
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-slate-800 bg-slate-950/40 flex items-center justify-center group">
                      {prodImageUrl ? (
                        <img
                          src={prodImageUrl}
                          alt="معاينة الوجبة"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500 gap-1 text-center p-2">
                          <ImageIcon className="w-8 h-8 opacity-40 text-slate-400" />
                          <span className="text-[11px]">لا توجد صورة محددة</span>
                        </div>
                      )}
                      <label className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11px] cursor-pointer transition-opacity">
                        <Camera className="w-5 h-5 mb-1 text-amber-400" />
                        <span>تغيير الصورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProductImageUpload}
                        />
                      </label>
                    </div>

                    {/* Upload Action */}
                    <label className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl font-bold cursor-pointer transition-all active:scale-95 text-center text-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع صورة من هاتفك أو جهازك</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProductImageUpload}
                      />
                    </label>

                    {/* Direct URL */}
                    <input
                      type="text"
                      value={prodImageUrl}
                      onChange={e => setProdImageUrl(e.target.value)}
                      placeholder="أو الصق رابط صورة مباشر (URL)..."
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-2 text-[11px] text-white placeholder-slate-500 font-mono outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Sizes Manager */}
              {productModalTab === 'sizes' && (
                <div className="space-y-3 min-h-[220px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>إدارة وتحديد أحجام الوجبة</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        حدد أحجاماً متعددة (صغير، عادي، كبير، عائلي) مع فارق السعر لكل حجم عن السعر الأساسي.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSize}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة حجم جديد</span>
                    </button>
                  </div>

                  {prodSizes.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs space-y-2">
                      <Layers className="w-8 h-8 opacity-40 mx-auto text-amber-400" />
                      <p>لا توجد أحجام مخصصة - سيعتمد النظام السعر الأساسي فقط.</p>
                      <button
                        type="button"
                        onClick={handleAddSize}
                        className="text-amber-400 underline font-semibold cursor-pointer"
                      >
                        اضغط هنا لإضافة أحجام متعددة (عادي / كبير / عائلي)
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {prodSizes.map((size, idx) => (
                        <div
                          key={size.id || idx}
                          className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5"
                        >
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">اسم الحجم (عربي) *</label>
                              <input
                                type="text"
                                required
                                value={size.name_ar}
                                onChange={e => handleUpdateSize(size.id, 'name_ar', e.target.value)}
                                placeholder="مثال: كبير (Large)"
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">اسم الحجم (إنجليزي)</label>
                              <input
                                type="text"
                                value={size.name_en || ''}
                                onChange={e => handleUpdateSize(size.id, 'name_en', e.target.value)}
                                placeholder="Large"
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">السعر الإضافي (د.ع)</label>
                              <input
                                type="number"
                                min="0"
                                step="250"
                                value={size.extra_price}
                                onChange={e => handleUpdateSize(size.id, 'extra_price', Number(e.target.value))}
                                placeholder="0 د.ع"
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white font-mono outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteSize(size.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer shrink-0 mt-3"
                            title="حذف هذا الحجم"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Addons Manager */}
              {productModalTab === 'addons' && (
                <div className="space-y-3 min-h-[220px]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-bold text-xs flex items-center gap-1.5">
                        <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                        <span>إدارة الإضافات والخيارات (Addons)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        خيارات إضافية تظهر للزبون عند طلب الوجبة (مثل صوص حار، جبنة إضافية، مخلل، خبز زيادة).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAddon}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة خيار إضافي</span>
                    </button>
                  </div>

                  {prodAddons.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs space-y-2">
                      <PlusCircle className="w-8 h-8 opacity-40 mx-auto text-amber-400" />
                      <p>لا توجد إضافات مخصصة لهذه الوجبة حالياً.</p>
                      <button
                        type="button"
                        onClick={handleAddAddon}
                        className="text-amber-400 underline font-semibold cursor-pointer"
                      >
                        اضغط هنا لإضافة خيارات إضافية للوجبة
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {prodAddons.map((addon, idx) => (
                        <div
                          key={addon.id || idx}
                          className="flex items-center gap-2 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5"
                        >
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">اسم الإضافة (عربي) *</label>
                              <input
                                type="text"
                                required
                                value={addon.name_ar}
                                onChange={e => handleUpdateAddon(addon.id, 'name_ar', e.target.value)}
                                placeholder="مثال: جبنة إضافية"
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">اسم الإضافة (إنجليزي)</label>
                              <input
                                type="text"
                                value={addon.name_en || ''}
                                onChange={e => handleUpdateAddon(addon.id, 'name_en', e.target.value)}
                                placeholder="Extra Cheese"
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white outline-none focus:border-amber-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 mb-0.5">سعر الإضافة (د.ع - 0 = مجاني)</label>
                              <input
                                type="number"
                                min="0"
                                step="250"
                                value={addon.price}
                                onChange={e => handleUpdateAddon(addon.id, 'price', Number(e.target.value))}
                                placeholder="1000 د.ع"
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white font-mono outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddon(addon.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer shrink-0 mt-3"
                            title="حذف هذه الإضافة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800">
                <div className="text-[11px] text-slate-400">
                  <span>{prodSizes.length} أحجام</span>
                  <span className="mx-1.5">•</span>
                  <span>{prodAddons.length} إضافات</span>
                  <span className="mx-1.5">•</span>
                  <span className={prodIsAvailable ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                    {prodIsAvailable ? 'متاح للطلب' : 'غير متوفر'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddProductModal(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition-colors text-xs cursor-pointer"
                  >
                    {editingProduct ? 'حفظ التعديلات' : 'حفظ الصنف ونشره في المنيو'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Branch Modal */}
      {showAddBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in font-cairo" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingBranch ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد للمطعم'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingBranch ? `تحديث تفاصيل الفرع (${editingBranch.name_ar})` : 'إنشاء وتفعيل نقطة خدمة جديدة'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddBranchModal(false);
                  setEditingBranch(null);
                  setBranchFormMsg(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {branchFormMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                branchFormMsg.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}>
                <span>{branchFormMsg.success ? '✅' : '⚠️'}</span>
                <span>{branchFormMsg.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveBranch} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">اسم الفرع بالعربية <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: فرع الكرادة"
                    value={branchNameAr}
                    onChange={e => setBranchNameAr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">اسم الفرع بالإنجليزية</label>
                  <input
                    type="text"
                    placeholder="e.g. Karrada Branch"
                    value={branchNameEn}
                    onChange={e => setBranchNameEn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-white outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">العنوان وموقع الفرع</label>
                <input
                  type="text"
                  placeholder="شارع 14 رمضان، مقابل المركز التجاري"
                  value={branchAddress}
                  onChange={e => setBranchAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-white outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">هاتف الفرع للتواصل</label>
                  <input
                    type="text"
                    value={branchPhone}
                    onChange={e => setBranchPhone(e.target.value)}
                    placeholder="+964 770 000 0000"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">اسم مدير الفرع</label>
                  <input
                    type="text"
                    value={branchManager}
                    onChange={e => setBranchManager(e.target.value)}
                    placeholder="اسم المسؤول"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">وقت بدء العمل</label>
                  <input
                    type="time"
                    value={branchOpeningTime}
                    onChange={e => setBranchOpeningTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-white outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">وقت الإغلاق</label>
                  <input
                    type="time"
                    value={branchClosingTime}
                    onChange={e => setBranchClosingTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-white outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBranchModal(false);
                    setEditingBranch(null);
                    setBranchFormMsg(null);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl cursor-pointer transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl cursor-pointer shadow-lg shadow-amber-500/10 transition-all flex items-center gap-1.5"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{editingBranch ? 'حفظ التعديلات' : 'حفظ وتفعيل الفرع'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Branch Confirmation Modal */}
      {branchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-cairo" dir="rtl">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">تأكيد حذف الفرع</h3>
                <p className="text-xs text-slate-400">إجراء حساس لا يمكن التراجع عنه</p>
              </div>
            </div>

            {branchDeleteNotice && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                branchDeleteNotice.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}>
                <span>{branchDeleteNotice.success ? '✅' : '⚠️'}</span>
                <span>{branchDeleteNotice.message}</span>
              </div>
            )}

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">اسم الفرع:</span>
                <span className="font-bold text-white text-xs">{branchToDelete.name_ar}</span>
              </div>
              {branchToDelete.address && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">العنوان:</span>
                  <span className="text-slate-300 text-xs">{branchToDelete.address}</span>
                </div>
              )}
              {branchToDelete.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">الهاتف:</span>
                  <span className="font-mono text-amber-400 text-xs">{branchToDelete.phone}</span>
                </div>
              )}
              <p className="text-xs text-rose-300/80 pt-2 border-t border-slate-800/80 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف هذا الفرع نهائياً؟ سيتم إلغاء ارتباط الطاولات التابعة له فوراً.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={isDeletingBranch}
                onClick={() => {
                  setBranchToDelete(null);
                  setBranchDeleteNotice(null);
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isDeletingBranch}
                onClick={handleConfirmDeleteBranch}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-500/20 cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingBranch ? 'جارٍ الحذف...' : 'نعم، حذف الفرع'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Add / Edit Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {editingTable ? `تعديل الطاولة (${editingTable.table_number})` : 'إضافة طاولة جديدة للصالة'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingTable ? 'تحديث السعة أو الحالة أو رقم الطاولة' : 'ربط الطاولة تلقائياً برمز QR للطلبات'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {tableErrorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{tableErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveTable} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  رقم أو اسم الطاولة <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: T-01 أو طاولة 5"
                  value={tableNumberInput}
                  onChange={e => {
                    setTableNumberInput(e.target.value);
                    setTableErrorMsg(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    سعة الطاولة (عدد الأفراد)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={tableCapacityInput}
                    onChange={e => setTableCapacityInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-sm text-white outline-none transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    حالة الطاولة
                  </label>
                  <select
                    value={tableStatusInput}
                    onChange={e => setTableStatusInput(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-sm text-white outline-none transition-all cursor-pointer"
                  >
                    <option value="available">متاحة (Available)</option>
                    <option value="occupied">مشغولة (Occupied)</option>
                    <option value="reserved">محجوزة (Reserved)</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span>الخطة الحالية:</span>
                  <span className="font-bold text-amber-400">{activeRestaurant.plan_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>حد الطاولات المسموح:</span>
                  <span className="font-bold text-white">{restaurantTables.length} / {maxAllowedTables} طاولة</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
                >
                  {editingTable ? 'حفظ التعديلات' : 'إضافة وتثبيت الطاولة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Add/Edit Modal (تعديل الحساب وتغيير الباسوورد) */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-cairo" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {editingStaffUser ? 'تعديل حساب الموظف وتغيير كلمة المرور' : 'إضافة حساب موظف جديد'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {editingStaffUser ? `تحديث بيانات (${editingStaffUser.name}) وكلمة المرور والـ PIN` : 'إنشاء حساب لطاقم العمل في المطعم'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {staffMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                staffMsg.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}>
                <span>{staffMsg.success ? '✅' : '⚠️'}</span>
                <span>{staffMsg.message}</span>
              </div>
            )}

            <form onSubmit={handleSaveStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  الاسم الكامل للموظف <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد عبد الله"
                  value={staffName}
                  onChange={e => setStaffName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    الدور الوظيفي <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={staffRole}
                    onChange={e => setStaffRole(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-sm text-white outline-none transition-all cursor-pointer"
                  >
                    <option value="cashier">كاشير ونقاط البيع (POS)</option>
                    <option value="kitchen">طاهي المطبخ (شاشة KDS)</option>
                    <option value="branch_manager">مدير الفرع والصالة</option>
                    <option value="driver">مندوب التوصيل (Delivery)</option>
                    <option value="restaurant_owner">مالك المطعم (مدير عام)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    الفرع التابع له <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={staffBranchId}
                    onChange={e => setStaffBranchId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-sm text-white outline-none transition-all cursor-pointer"
                  >
                    {restaurantBranches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>بيانات تسجيل الدخول وتغيير كلمة المرور:</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    اسم المستخدم (Username) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: chef_sufrah أو cashier_1"
                    value={staffUsername}
                    onChange={e => setStaffUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-sm text-amber-300 font-mono outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">يستخدم هذا الاسم لتسجيل دخول الموظف إلى محطته</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      كلمة المرور الجديدة (Password) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="كلمة المرور"
                      value={staffPassword}
                      onChange={e => setStaffPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-sm text-white font-mono outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      رمز الـ PIN السريع (4 أرقام) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="1234"
                      value={staffPin}
                      onChange={e => setStaffPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-sm text-amber-400 font-mono tracking-widest text-center outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    رقم الهاتف (اختياري)
                  </label>
                  <input
                    type="tel"
                    placeholder="07XXXXXXXXX"
                    value={staffPhone}
                    onChange={e => setStaffPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-sm text-white outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="staffActiveToggle"
                  checked={staffIsActive}
                  onChange={e => setStaffIsActive(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                />
                <label htmlFor="staffActiveToggle" className="text-xs text-slate-300 cursor-pointer">
                  حساب الموظف مفعّل ونشط (يمكنه تسجيل الدخول للعمل)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{editingStaffUser ? 'حفظ التعديلات وكلمة المرور' : 'إنشاء حساب الموظف'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff Confirmation Modal */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-cairo" dir="rtl">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">تأكيد حذف حساب الموظف</h3>
                <p className="text-xs text-slate-400">إجراء حساس لا يمكن التراجع عنه</p>
              </div>
            </div>

            {staffDeleteNotice && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                staffDeleteNotice.success ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}>
                <span>{staffDeleteNotice.success ? '✅' : '⚠️'}</span>
                <span>{staffDeleteNotice.message}</span>
              </div>
            )}

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">الاسم الكامل:</span>
                <span className="font-bold text-white text-xs">{staffToDelete.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">اسم المستخدم:</span>
                <span className="font-mono font-bold text-amber-400 text-xs">{staffToDelete.username}</span>
              </div>
              <p className="text-xs text-rose-300/80 pt-2 border-t border-slate-800/80 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف هذا الحساب نهائياً؟ سيتم إلغاء صلاحيات الدخول لمحطة العمل فوراً.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={isDeletingStaff}
                onClick={() => setStaffToDelete(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isDeletingStaff}
                onClick={() => {
                  setIsDeletingStaff(true);
                  const res = deleteUser(staffToDelete.id);
                  setIsDeletingStaff(false);
                  if (res.success) {
                    setStaffToDelete(null);
                  } else {
                    setStaffDeleteNotice(res);
                  }
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingStaff ? 'جاري الحذف...' : 'نعم، حذف الحساب نهائياً'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
