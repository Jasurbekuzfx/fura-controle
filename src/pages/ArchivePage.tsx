import React, { useCallback, useEffect, useState } from 'react';
import { Archive as ArchiveIcon, Search } from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import type { Trip } from '../types';

export const ArchivePage: React.FC = () => {
  const { t, formatDate, formatMoney } = useApp();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const list = await api.trips.list({
        archive: true,
        search,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setTrips(list);
    } finally {
      setLoading(false);
    }
  }, [search, fromDate, toDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl lg:text-2xl font-extrabold text-[#F5F8FF]">{t.archive.title}</h2>
        <p className="text-xs text-[#9BAFC8] mt-0.5">{t.archive.subtitle}</p>
      </div>

      {/* Search & Date Filters */}
      <div className="fura-card p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-[#9BAFC8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.common.search}
            className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F5F8FF]"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#9BAFC8] whitespace-nowrap">{t.archive.fromDate}:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-2.5 py-2 text-xs text-[#F5F8FF]"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#9BAFC8] whitespace-nowrap">{t.archive.toDate}:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-2.5 py-2 text-xs text-[#F5F8FF]"
          />
        </div>
      </div>

      {/* Archive Table */}
      <div className="fura-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1B32] border-b border-[#243F60] text-[11px] font-bold uppercase tracking-wider text-[#9BAFC8]">
                <th className="py-3 px-4">{t.trips.tripCode}</th>
                <th className="py-3 px-4">{t.trips.vehicle}</th>
                <th className="py-3 px-4">{t.trips.driver}</th>
                <th className="py-3 px-4">{t.trips.cargo}</th>
                <th className="py-3 px-4">{t.trips.origin} → {t.trips.destination}</th>
                <th className="py-3 px-4">{t.trips.loadingDate}</th>
                <th className="py-3 px-4">{t.archive.deliveryDate}</th>
                <th className="py-3 px-4">{t.trips.distance}</th>
                <th className="py-3 px-4">{t.trips.freightPrice}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A3353] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#9BAFC8]">
                    {t.common.loading}
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#9BAFC8]">
                    {t.common.noData}
                  </td>
                </tr>
              ) : (
                trips.map((tr) => (
                  <tr key={tr.id} className="hover:bg-[#142B49] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#F5F8FF] tabular-nums">
                      <span className="inline-flex items-center gap-1.5">
                        <ArchiveIcon className="w-3.5 h-3.5 text-[#00C875]" />
                        {tr.tripCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#F5F8FF]">
                      {tr.vehicle.plateNumber}
                    </td>
                    <td className="py-3.5 px-4 text-[#D7E3FC]">{tr.driver.fullName}</td>
                    <td className="py-3.5 px-4 text-[#9BAFC8]">{tr.cargo?.name || '—'}</td>
                    <td className="py-3.5 px-4 text-[#D7E3FC]">
                      {tr.origin} → {tr.destination}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-[#9BAFC8]">
                      {formatDate(tr.loadingDate)}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-[#00C875] font-semibold">
                      {formatDate(tr.completedAt || tr.unloadingDate)}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      {tr.distanceKm} {t.common.km}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums font-bold text-[#F5F8FF]">
                      <div className="flex items-center gap-2">
                        {formatMoney(tr.freightPrice)}
                        <StatusBadge status={tr.status} />
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
  );
};
