import React, { useEffect, useState } from 'react';
import { Search, Truck, Package, User, Route } from 'lucide-react';
import { Modal } from './Modal';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import type { Cargo, Driver, Trip, Vehicle } from '../types';

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ open, onClose }) => {
  const { t, setActivePage } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    vehicles: Vehicle[];
    drivers: Driver[];
    cargos: Cargo[];
    trips: Trip[];
  }>({ vehicles: [], drivers: [], cargos: [], trips: [] });

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    const timer = setTimeout(() => {
      if (!query.trim()) {
        setResults({ vehicles: [], drivers: [], cargos: [], trips: [] });
        return;
      }
      api
        .search(query)
        .then(setResults)
        .catch(() => {});
    }, 180);
    return () => clearTimeout(timer);
  }, [query, open]);

  const navigate = (page: Parameters<typeof setActivePage>[0]) => {
    setActivePage(page);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t.header.searchPlaceholder} maxWidthClass="max-w-2xl">
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#9BAFC8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.header.searchPlaceholder}
            className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#F5F8FF] placeholder-[#9BAFC8] focus:outline-none focus:border-[#0788F9]"
          />
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {results.vehicles.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase text-[#9BAFC8] mb-1.5">{t.nav.vehicles}</p>
              {results.vehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => navigate('vehicles')}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#142B49] hover:bg-[#1C385E] text-left mb-1"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-[#F5F8FF]">
                    <Truck className="w-4 h-4 text-[#0788F9]" />
                    {v.plateNumber} — {v.model}
                  </span>
                  <span className="text-xs text-[#9BAFC8]">{v.currentLocation}</span>
                </button>
              ))}
            </div>
          )}

          {results.drivers.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase text-[#9BAFC8] mb-1.5">{t.nav.drivers}</p>
              {results.drivers.map((d) => (
                <button
                  key={d.id}
                  onClick={() => navigate('drivers')}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#142B49] hover:bg-[#1C385E] text-left mb-1"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-[#F5F8FF]">
                    <User className="w-4 h-4 text-[#00C875]" />
                    {d.fullName}
                  </span>
                  <span className="text-xs text-[#9BAFC8]">{d.phone}</span>
                </button>
              ))}
            </div>
          )}

          {results.cargos.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase text-[#9BAFC8] mb-1.5">{t.nav.cargos}</p>
              {results.cargos.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate('cargos')}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#142B49] hover:bg-[#1C385E] text-left mb-1"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-[#F5F8FF]">
                    <Package className="w-4 h-4 text-[#FFA526]" />
                    {c.code} — {c.name}
                  </span>
                  <span className="text-xs text-[#9BAFC8]">{c.customerName}</span>
                </button>
              ))}
            </div>
          )}

          {results.trips.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase text-[#9BAFC8] mb-1.5">{t.nav.trips}</p>
              {results.trips.map((tr) => (
                <button
                  key={tr.id}
                  onClick={() => navigate('trips')}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#142B49] hover:bg-[#1C385E] text-left mb-1"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-[#F5F8FF]">
                    <Route className="w-4 h-4 text-[#8055F5]" />
                    {tr.tripCode}: {tr.origin} → {tr.destination}
                  </span>
                  <span className="text-xs text-[#9BAFC8]">{tr.vehicle.plateNumber}</span>
                </button>
              ))}
            </div>
          )}

          {query.trim() &&
            results.vehicles.length === 0 &&
            results.drivers.length === 0 &&
            results.cargos.length === 0 &&
            results.trips.length === 0 && (
              <p className="text-center text-sm text-[#9BAFC8] py-6">{t.common.noData}</p>
            )}
        </div>
      </div>
    </Modal>
  );
};
