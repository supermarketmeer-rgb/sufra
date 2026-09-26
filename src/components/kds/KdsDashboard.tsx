import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  Volume2,
  VolumeX,
  Flame,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const KdsDashboard: React.FC = () => {
  const {
    activeRestaurant,
    activeBranch,
    orders,
    updateOrderStatus,
    playNotificationSound,
    setCurrentRole
  } = useApp();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'dine_in' | 'delivery' | 'takeaway'>('all');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Tick elapsed time every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Filter kitchen active orders (new, in_review, preparing)
  const kitchenOrders = orders.filter(o =>
    o.restaurant_id === activeRestaurant?.id &&
    (o.status === 'new' || o.status === 'in_review' || o.status === 'preparing') &&
    (filterType === 'all' || o.order_type === filterType)
  );

  const getElapsedMinutes = (createdAt: string) => {
    const elapsedMs = currentTime - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(elapsedMs / (60 * 1000)));
  };

  const getUrgencyConfig = (minutes: number) => {
    if (minutes < 10) {
      return {
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        borderColor: 'border-slate-800 hover:border-emerald-500/40',
        label: 'طبيعي',
        pulse: false
      };
    }
    if (minutes < 18) {
      return {
        badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        borderColor: 'border-amber-500/40',
        label: 'متأخر',
        pulse: false
      };
    }
    return {
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/50',
      borderColor: 'border-rose-500 ring-1 ring-rose-500/30',
      label: 'عاجل جداً',
      pulse: true
    };
  };

  if (!activeRestaurant) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center max-w-xl mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center mb-4">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">شاشة المطبخ الذكية (KDS)</h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          يرجى تسجيل وتفعيل مطعم لاستقبال طلبات وتذاكر المطبخ في الوقت الفعلي.
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
    <div className="space-y-6">
      {/* KDS Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">شاشة المطبخ الذكية (Kitchen Display System - KDS)</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {activeBranch?.name_ar || 'الفرع الرئيسي'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              تحديث فوري وتنبيهات صوتية بدون إعادة تحميل الصفحة · {kitchenOrders.length} تذاكر قيد العمل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterType === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilterType('dine_in')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterType === 'dine_in' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              صالة
            </button>
            <button
              onClick={() => setFilterType('delivery')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterType === 'delivery' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
              }`}
            >
              توصيل
            </button>
          </div>

          {/* Sound Alert Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playNotificationSound();
            }}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
            title="تفعيل أو كتم جرس التنبيه"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'الجرس مفعل' : 'مكتوم'}</span>
          </button>
        </div>
      </div>

      {/* Ticket Grid */}
      {kitchenOrders.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white">المطبخ منتهي من كافة الطلبات!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            لا توجد طلبات معلقة حالياً في المطبخ. عند وصول أي طلب جديد من الكاشير أو المنيو سيظهر هنا فوراً مصحوباً بتنبيه صوتي.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kitchenOrders.map(order => {
            const minutesElapsed = getElapsedMinutes(order.created_at);
            const urgency = getUrgencyConfig(minutesElapsed);

            return (
              <div
                key={order.id}
                className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between shadow-xl transition-all ${urgency.borderColor}`}
              >
                <div>
                  {/* Ticket Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <div className="font-black text-white text-base font-mono flex items-center gap-2">
                        <span>{order.order_number}</span>
                      </div>
                      <div className="text-xs text-amber-400 font-bold mt-0.5">
                        {order.order_type === 'dine_in'
                          ? `طاولة: ${order.table_number || 'صالة'}`
                          : order.order_type === 'delivery' ? 'طلب توصيل خارجي' : 'استلام سفري'}
                      </div>
                    </div>

                    <div className="text-left font-mono">
                      <div className={`px-2 py-0.5 rounded-lg border text-xs font-bold flex items-center gap-1 ${urgency.badgeColor}`}>
                        <Clock className="w-3 h-3" />
                        <span>{minutesElapsed} دقيقة</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{urgency.label}</span>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {order.notes && (
                    <div className="my-2.5 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                      <span className="line-clamp-2">{order.notes}</span>
                    </div>
                  )}

                  {/* Order Items List */}
                  <div className="py-2 space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-white text-xs">
                            <span className="text-amber-400 font-mono text-sm ml-1.5 font-black">{item.quantity}×</span>
                            {item.product_name}
                          </span>
                        </div>

                        {item.selected_size && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            الحجم: {item.selected_size.name_ar}
                          </div>
                        )}

                        {item.selected_addons && item.selected_addons.length > 0 && (
                          <div className="text-[10px] text-emerald-400 mt-0.5 flex flex-wrap gap-1">
                            {item.selected_addons.map((a, aidx) => (
                              <span key={aidx} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                                + {a.name_ar}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Action Button (Bump Ticket) */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                  {order.status === 'new' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-colors"
                    >
                      <Flame className="w-4 h-4" />
                      <span>بدء الطهي والتحضير</span>
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>جاهز للتسليم (Bump Ticket)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
