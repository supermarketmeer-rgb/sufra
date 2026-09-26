import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Sparkles,
  Layers,
  Utensils,
  Building2
} from 'lucide-react';

export const BranchDashboard: React.FC = () => {
  const {
    activeBranch,
    tables,
    updateTableStatus,
    reservations,
    updateReservationStatus,
    orders,
    setCurrentRole
  } = useApp();

  const [tableFilter, setTableFilter] = useState<'all' | 'available' | 'occupied' | 'reserved'>('all');
  const [activeTab, setActiveTab] = useState<'tables' | 'reservations'>('tables');

  const branchTables = tables.filter(t => t.branch_id === activeBranch?.id);
  const branchReservations = reservations.filter(r => r.branch_id === activeBranch?.id);

  const filteredTables = tableFilter === 'all'
    ? branchTables
    : branchTables.filter(t => t.status === tableFilter);

  const occupiedCount = branchTables.filter(t => t.status === 'occupied').length;
  const availableCount = branchTables.filter(t => t.status === 'available').length;
  const reservedCount = branchTables.filter(t => t.status === 'reserved').length;
  const pendingReservationsCount = branchReservations.filter(r => r.status === 'pending').length;

  if (!activeBranch) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center max-w-xl mx-auto my-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">إدارة الفروع والصالة</h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-6">
          يرجى تسجيل وتفعيل مطعم لإدارة الفروع وتخطيط الطاولات وحجوزات الزبائن.
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
      {/* Branch Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">{activeBranch.name_ar}</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/20">
              مدير الفرع: {activeBranch.manager_name}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {activeBranch.address} · ساعات العمل: {activeBranch.opening_time} - {activeBranch.closing_time}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'tables' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              طاولات الصالة ({branchTables.length})
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors relative ${
                activeTab === 'reservations' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              حجوزات الطاولات ({branchReservations.length})
              {pendingReservationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400">طاولات متاحة</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">{availableCount}</div>
          <div className="text-[11px] text-slate-500">جاهزة لاستقبال الزبائن</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400">طاولات مشغولة</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{occupiedCount}</div>
          <div className="text-[11px] text-slate-500">زبائن يتناولون الطعام الآن</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400">طاولات محجوزة</span>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1">{reservedCount}</div>
          <div className="text-[11px] text-slate-500">حجز مسبق مؤكد</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-xs text-slate-400">طلبات حجز معلقة</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{pendingReservationsCount}</div>
          <div className="text-[11px] text-slate-500">تحتاج موافقة أو اتصال</div>
        </div>
      </div>

      {/* Tab 1: Tables Interactive Grid */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {(['all', 'available', 'occupied', 'reserved'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setTableFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    tableFilter === st
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'all' && 'الكل'}
                  {st === 'available' && 'المتاحة'}
                  {st === 'occupied' && 'المشغولة'}
                  {st === 'reserved' && 'المحجوزة'}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400">
              انقر على أي طاولة لتغيير حالتها فورياً
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTables.map(t => {
              const statusConfig = {
                available: { text: 'متاحة', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400', badge: 'bg-emerald-500' },
                occupied: { text: 'مشغولة (طلب قيد التحضير)', bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400', badge: 'bg-rose-500' },
                reserved: { text: 'محجوزة مسبقاً', bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400', badge: 'bg-blue-500' },
              }[t.status];

              return (
                <div
                  key={t.id}
                  className={`border rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all ${statusConfig.bg}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xl font-black font-mono tracking-tight text-white">
                        {t.table_number}
                      </span>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>سعة {t.capacity} مقاعد</span>
                      </div>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.badge} animate-pulse`} />
                  </div>

                  <div className="text-xs font-semibold">
                    الحالة: {statusConfig.text}
                  </div>

                  {/* Quick status changer buttons */}
                  <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => updateTableStatus(t.id, 'available')}
                      className={`py-1 text-[10px] font-bold rounded ${
                        t.status === 'available' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      إتاحة
                    </button>
                    <button
                      onClick={() => updateTableStatus(t.id, 'occupied')}
                      className={`py-1 text-[10px] font-bold rounded ${
                        t.status === 'occupied' ? 'bg-rose-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      إشغال
                    </button>
                    <button
                      onClick={() => updateTableStatus(t.id, 'reserved')}
                      className={`py-1 text-[10px] font-bold rounded ${
                        t.status === 'reserved' ? 'bg-blue-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      حجز
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Reservations Management */}
      {activeTab === 'reservations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">قائمة حجوزات الطاولات المستقبلية</h3>
            <span className="text-xs text-slate-400">إشعار فوري عند طلب الزبون الحجز عبر المنيو</span>
          </div>

          <div className="divide-y divide-slate-800/80">
            {branchReservations.map(res => (
              <div key={res.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{res.customer_name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        res.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' :
                        res.status === 'cancelled' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {res.status === 'confirmed' ? 'مؤكد' : res.status === 'cancelled' ? 'ملغي' : 'بانتظار التأكيد'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 mt-1 font-mono">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Phone className="w-3 h-3 text-amber-400" />
                        {res.customer_phone}
                      </span>
                      <span>التاريخ: {res.reservation_date}</span>
                      <span>الوقت: {res.reservation_time}</span>
                      <span>الضيوف: {res.guest_count} أشخاص</span>
                    </div>

                    {res.special_requests && (
                      <p className="text-xs text-slate-300 mt-1 italic">
                        ملاحظة الزبون: "{res.special_requests}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {res.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateReservationStatus(res.id, 'confirmed')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تأكيد الحجز</span>
                      </button>
                      <button
                        onClick={() => updateReservationStatus(res.id, 'cancelled')}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 text-xs rounded-xl transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>إلغاء</span>
                      </button>
                    </>
                  )}
                  {res.status === 'confirmed' && (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تم تأكيد الحجز وإشعار الزبون</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
