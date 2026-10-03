import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import {
  Bike,
  MapPin,
  Navigation,
  Phone,
  CheckCircle2,
  Clock,
  Compass,
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const DriverDashboard: React.FC = () => {
  const {
    activeRestaurant,
    activeBranch,
    orders,
    updateOrderStatus
  } = useApp();

  const deliveryOrders = orders.filter(o =>
    o.order_type === 'delivery' &&
    o.restaurant_id === activeRestaurant?.id &&
    (!activeBranch?.id || o.branch_id === activeBranch.id) &&
    (o.status === 'ready' || o.status === 'out_for_delivery')
  );

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(deliveryOrders[0] || null);

  const handleStartDelivery = (orderId: number) => {
    updateOrderStatus(orderId, 'out_for_delivery');
  };

  const handleCompleteDelivery = (orderId: number) => {
    updateOrderStatus(orderId, 'completed');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-140px)]">
      {/* Active Deliveries List (4 Cols) */}
      <div className="lg:col-span-5 xl:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Bike className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="font-bold text-white text-sm">مهام التوصيل الميداني</h3>
                <p className="text-[11px] text-slate-400">تتبع GPS وتوجيه المسار الذكي</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-bold">
              {deliveryOrders.length} طلبات
            </span>
          </div>

          <div className="mt-3 space-y-2.5 max-h-[500px] overflow-y-auto">
            {deliveryOrders.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                لا توجد طلبات توصيل جاهزة حالياً للمندوب
              </div>
            ) : (
              deliveryOrders.map(ord => {
                const isSelected = selectedOrder?.id === ord.id;
                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs font-mono text-cyan-400">{ord.order_number}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        ord.status === 'out_for_delivery'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {ord.status === 'out_for_delivery' ? 'في الطريق للعميل' : 'جاهز للاستلام'}
                      </span>
                    </div>

                    <div className="font-bold text-sm text-white mt-1.5">{ord.customer_name}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{ord.delivery_address || 'العنوان المسجل'}</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">المبلغ: {ord.total_amount.toLocaleString()} د.ع</span>
                      <span className="text-slate-400 uppercase">{ord.payment_method}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Driver Profile Status */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
              ع
            </div>
            <div>
              <div className="text-xs font-bold text-white">المندوب: عادل العبيدي</div>
              <div className="text-[10px] text-slate-400">دراجة نارية · رقم اللوحة: 18402 بغداد</div>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* GPS Interactive Map & Navigation Panel (8 Cols) */}
      <div className="lg:col-span-7 xl:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
        {selectedOrder ? (
          <>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-cyan-400" />
                    <span>تتبع المسار المباشر (Live GPS Tracking)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    الوجهة: {selectedOrder.customer_name} · {selectedOrder.delivery_address}
                  </p>
                </div>

                <a
                  href={`tel:${selectedOrder.customer_phone}`}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors w-fit"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>اتصال بالزبون ({selectedOrder.customer_phone || '+964 770 123 4567'})</span>
                </a>
              </div>

              {/* Interactive Vector Route Map Simulation */}
              <div className="relative mt-4 h-72 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                <svg className="w-full h-full absolute inset-0 opacity-60" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid Roads */}
                  <line x1="50" y1="50" x2="750" y2="50" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="50" y1="120" x2="750" y2="120" stroke="#334155" strokeWidth="3" />
                  <line x1="50" y1="200" x2="750" y2="200" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1="120" y1="20" x2="120" y2="300" stroke="#334155" strokeWidth="2" />
                  <line x1="300" y1="20" x2="300" y2="300" stroke="#334155" strokeWidth="4" />
                  <line x1="550" y1="20" x2="550" y2="300" stroke="#334155" strokeWidth="3" />

                  {/* Route Polyline (Amber to Cyan) */}
                  <path
                    d="M 160 80 Q 300 80 300 160 T 520 220"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                </svg>

                {/* Restaurant Origin Marker */}
                <div className="absolute left-[20%] top-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/40">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-white bg-slate-900/90 px-1.5 py-0.5 rounded mt-1 border border-slate-800">
                    {activeRestaurant?.name_ar || 'المطعم'}
                  </span>
                </div>

                {/* Driver Live Moving Pin */}
                <div className="absolute left-[40%] top-[45%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
                  <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-cyan-400/50">
                    <Bike className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold text-cyan-300 bg-slate-900 px-1 rounded border border-cyan-500/40">
                    المندوب (مباشر)
                  </span>
                </div>

                {/* Customer Destination Marker */}
                <div className="absolute left-[70%] top-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold shadow-lg shadow-rose-500/40">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-white bg-slate-900/90 px-1.5 py-0.5 rounded mt-1 border border-slate-800">
                    موقع الزبون
                  </span>
                </div>

                {/* Overlay Route Info */}
                <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl text-xs space-y-1 font-mono">
                  <div className="text-slate-400">المسافة المتبقية: <span className="text-white font-bold">3.4 كم</span></div>
                  <div className="text-slate-400">الوقت المتوقع (ETA): <span className="text-cyan-400 font-bold">12 دقيقة</span></div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                المبلغ المطلوب تحصيله عند التسليم: <span className="font-bold text-white font-mono">{selectedOrder.total_amount.toLocaleString()} د.ع</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedOrder.status === 'ready' && (
                  <button
                    onClick={() => handleStartDelivery(selectedOrder.id)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    استلام الوجبة والانطلاق نحو الزبون
                  </button>
                )}

                {selectedOrder.status === 'out_for_delivery' && (
                  <button
                    onClick={() => handleCompleteDelivery(selectedOrder.id)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم تسليم الطلب للزبون بنجاح</span>
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-24 text-slate-500 text-xs">
            اختر طلباً من القائمة الجانبية لعرض مسار الخريطة والـ GPS
          </div>
        )}
      </div>
    </div>
  );
};
