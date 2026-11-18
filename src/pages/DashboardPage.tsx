import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Navigation,
  Package,
  Plus,
  Route,
  Truck,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { KpiCard } from '../components/KpiCard';
import { StatusBadge } from '../components/StatusBadge';

export const DashboardPage: React.FC = () => {
  const { t, settings, setActivePage, formatDate, formatMoney } = useApp();
  const [data, setData] = useState<Awaited<ReturnType<typeof api.dashboard>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .dashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-[#9BAFC8] text-sm">
        {t.common.loading}
      </div>
    );
  }

  const { stats, utilizationChart, recentTrips, upcomingLoading, upcomingUnloading, calendarPreviewTrips } =
    data;

  const chartData = utilizationChart.map((item) => ({
    name: (t.statuses as Record<string, string>)[item.key] ?? item.key,
    count: item.count,
    color: item.color,
  }));

  // Build simple current-month day grid for Monthly Calendar Preview
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getTripsForDay = (dayNum: number) => {
    const target = new Date(year, month, dayNum);
    target.setHours(12, 0, 0, 0);
    return calendarPreviewTrips.filter((tr) => {
      const s = new Date(tr.loadingDate);
      const e = new Date(tr.unloadingDate);
      s.setHours(0, 0, 0, 0);
      e.setHours(23, 59, 59, 999);
      return target >= s && target <= e;
    });
  };

  return (
    <div className="space-y-6">
      {/* Stitch Welcome Hero Banner */}
      <div className="truck-hero-bg rounded-2xl border border-[#243F60] p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-[#F5F8FF] tracking-tight">
            {t.dashboard.welcome}, {settings.ownerName}!
          </h2>
          <p className="text-sm text-[#D7E3FC]/80 mt-1">{t.dashboard.welcomeSub}</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setActivePage('trips')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0788F9] hover:bg-[#2596FA] text-white text-xs font-bold shadow-[0_0_16px_rgba(7,136,249,0.45)] transition"
          >
            <Plus className="w-4 h-4" />
            {t.dashboard.quickTrip}
          </button>
          <button
            onClick={() => setActivePage('vehicles')}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#142B49]/90 border border-[#243F60] hover:border-[#0788F9] text-[#F5F8FF] text-xs font-semibold transition"
          >
            <Truck className="w-4 h-4 text-[#0788F9]" />
            {t.dashboard.quickVehicle}
          </button>
        </div>
      </div>

      {/* Primary Fleet KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title={t.dashboard.totalVehicles}
          value={stats.totalVehicles}
          icon={<Truck className="w-5 h-5" />}
          accentColor="blue"
        />
        <KpiCard
          title={t.dashboard.onRouteVehicles}
          value={stats.onRouteVehicles}
          icon={<Navigation className="w-5 h-5" />}
          accentColor="green"
        />
        <KpiCard
          title={t.dashboard.availableVehicles}
          value={stats.availableVehicles}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="purple"
        />
        <KpiCard
          title={t.dashboard.busyVehicles}
          value={stats.busyVehicles}
          icon={<Clock className="w-5 h-5" />}
          accentColor="orange"
        />
      </div>

      {/* Secondary Cargo & Trip KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title={t.dashboard.totalCargos}
          value={stats.totalCargos}
          icon={<Package className="w-5 h-5" />}
          accentColor="orange"
        />
        <KpiCard
          title={t.dashboard.activeTrips}
          value={stats.activeTrips}
          icon={<Route className="w-5 h-5" />}
          accentColor="blue"
        />
        <KpiCard
          title={t.dashboard.completedTrips}
          value={stats.completedTrips}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="green"
        />
      </div>

      {/* Middle Section: Monthly Calendar Preview + Recent Trips & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Monthly Calendar Preview */}
        <div className="xl:col-span-7 fura-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#0788F9]" />
              <h3 className="text-base font-bold text-[#F5F8FF]">
                {t.dashboard.calendarPreview}
              </h3>
            </div>
            <button
              onClick={() => setActivePage('calendar')}
              className="text-xs font-semibold text-[#0788F9] hover:underline"
            >
              {t.dashboard.viewAll}
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-[#9BAFC8] uppercase">
            {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstWeekday }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-14 rounded-lg bg-[#0B1B32]/40" />
            ))}
            {days.map((dayNum) => {
              const dayTrips = getTripsForDay(dayNum);
              const isToday = dayNum === now.getDate();
              return (
                <div
                  key={dayNum}
                  onClick={() => setActivePage('calendar')}
                  className={`h-14 rounded-lg p-1.5 border cursor-pointer transition flex flex-col justify-between ${
                    isToday
                      ? 'bg-[#0788F9]/15 border-[#0788F9]'
                      : 'bg-[#0B1B32]/70 border-[#243F60]/60 hover:border-[#0788F9]/60'
                  }`}
                >
                  <span
                    className={`text-[11px] font-bold tabular-nums ${
                      isToday ? 'text-[#0788F9]' : 'text-[#D7E3FC]'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayTrips.length > 0 && (
                    <div className="flex flex-wrap gap-0.5">
                      {dayTrips.slice(0, 2).map((tr) => (
                        <span
                          key={tr.id}
                          className={`w-full truncate text-[9px] font-bold px-1 rounded ${
                            tr.status === 'COMPLETED'
                              ? 'bg-[#00C875]/25 text-[#00C875]'
                              : tr.status === 'LOADING'
                                ? 'bg-[#FFA526]/25 text-[#FFA526]'
                                : 'bg-[#0788F9]/25 text-[#0788F9]'
                          }`}
                        >
                          {tr.vehicle.plateNumber}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Trips + Quick Actions */}
        <div className="xl:col-span-5 space-y-6">
          <div className="fura-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F5F8FF]">{t.dashboard.recentTrips}</h3>
              <button
                onClick={() => setActivePage('trips')}
                className="text-xs font-semibold text-[#0788F9] hover:underline"
              >
                {t.dashboard.viewAll}
              </button>
            </div>

            <div className="space-y-2.5">
              {recentTrips.slice(0, 4).map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => setActivePage('trips')}
                  className="fura-card-inset p-3 flex items-center justify-between gap-3 cursor-pointer hover:border-[#0788F9]/60 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F5F8FF] tabular-nums">
                        {trip.vehicle.plateNumber}
                      </span>
                      <span className="text-[11px] text-[#9BAFC8]">{trip.tripCode}</span>
                    </div>
                    <p className="text-xs text-[#9BAFC8] truncate mt-0.5">
                      {trip.origin} → {trip.destination}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StatusBadge status={trip.status} />
                    <p className="text-[11px] font-semibold text-[#D7E3FC] mt-1 tabular-nums">
                      {formatMoney(trip.freightPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setActivePage('cargos')}
              className="fura-card p-3.5 text-left hover:border-[#0788F9] transition flex items-center gap-2.5"
            >
              <Package className="w-4 h-4 text-[#FFA526]" />
              <span className="text-xs font-semibold text-[#F5F8FF]">{t.dashboard.quickCargo}</span>
            </button>
            <button
              onClick={() => setActivePage('drivers')}
              className="fura-card p-3.5 text-left hover:border-[#0788F9] transition flex items-center gap-2.5"
            >
              <Users className="w-4 h-4 text-[#00C875]" />
              <span className="text-xs font-semibold text-[#F5F8FF]">{t.dashboard.quickDriver}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Fleet Utilization Chart + Upcoming Loading / Unloading */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 fura-card p-5">
          <h3 className="text-base font-bold text-[#F5F8FF] mb-4">
            {t.dashboard.fleetUtilization}
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#9BAFC8" fontSize={11} tickLine={false} />
                <YAxis stroke="#9BAFC8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1B32',
                    borderColor: '#243F60',
                    borderRadius: '8px',
                    color: '#F5F8FF',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="fura-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#FFA526] uppercase tracking-wider">
              {t.dashboard.upcomingLoading}
            </h3>
            {upcomingLoading.length === 0 ? (
              <p className="text-xs text-[#9BAFC8]">{t.common.noData}</p>
            ) : (
              upcomingLoading.map((item) => (
                <div
                  key={item.id}
                  className="fura-card-inset p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-[#F5F8FF]">{item.vehicle.plateNumber}</p>
                    <p className="text-[#9BAFC8]">{item.origin}</p>
                  </div>
                  <span className="font-semibold text-[#FFA526] tabular-nums">
                    {formatDate(item.loadingDate)}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="fura-card p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#8055F5] uppercase tracking-wider">
              {t.dashboard.upcomingUnloading}
            </h3>
            {upcomingUnloading.length === 0 ? (
              <p className="text-xs text-[#9BAFC8]">{t.common.noData}</p>
            ) : (
              upcomingUnloading.map((item) => (
                <div
                  key={item.id}
                  className="fura-card-inset p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-[#F5F8FF]">{item.vehicle.plateNumber}</p>
                    <p className="text-[#9BAFC8]">{item.destination}</p>
                  </div>
                  <span className="font-semibold text-[#8055F5] tabular-nums">
                    {formatDate(item.unloadingDate)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
