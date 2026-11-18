import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle, Edit2, Eye, MapPin, Plus, Search, XCircle } from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { RouteMapModal } from '../components/RouteMapModal';
import { StatusBadge } from '../components/StatusBadge';
import type { Cargo, Driver, Trip, TripStatus, Vehicle } from '../types';

const TRIP_STATUSES: TripStatus[] = ['PLANNED', 'LOADING', 'ON_ROUTE', 'COMPLETED', 'CANCELLED'];

export const TripsPage: React.FC = () => {
  const { t, notify, formatDate, formatMoney } = useApp();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);
  const [detailTrip, setDetailTrip] = useState<Trip | null>(null);
  const [mapTrip, setMapTrip] = useState<Trip | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    vehicleId: '',
    driverId: '',
    cargoId: '',
    origin: '',
    destination: '',
    loadingDate: todayStr,
    unloadingDate: todayStr,
    freightPrice: '3800',
    distanceKm: '2500',
    status: 'PLANNED' as TripStatus,
    notes: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [trList, vList, dList, cList] = await Promise.all([
        api.trips.list({ search, status: statusFilter }),
        api.vehicles.list(),
        api.drivers.list(),
        api.cargos.list(),
      ]);
      setTrips(trList);
      setVehicles(vList);
      setDrivers(dList);
      setCargos(cList);
    } catch {
      notify('Error loading trips', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      vehicleId: vehicles[0] ? String(vehicles[0].id) : '',
      driverId: vehicles[0]?.driverId
        ? String(vehicles[0].driverId)
        : drivers[0]
          ? String(drivers[0].id)
          : '',
      cargoId: '',
      origin: 'Toshkent (O‘zbekiston)',
      destination: 'Moskva (Rossiya)',
      loadingDate: todayStr,
      unloadingDate: todayStr,
      freightPrice: '3800',
      distanceKm: '2500',
      status: 'PLANNED',
      notes: '',
    });
    setFormOpen(true);
  };

  const openEdit = (tr: Trip) => {
    setEditing(tr);
    setForm({
      vehicleId: String(tr.vehicleId),
      driverId: String(tr.driverId),
      cargoId: tr.cargoId ? String(tr.cargoId) : '',
      origin: tr.origin,
      destination: tr.destination,
      loadingDate: tr.loadingDate.split('T')[0],
      unloadingDate: tr.unloadingDate.split('T')[0],
      freightPrice: String(tr.freightPrice),
      distanceKm: String(tr.distanceKm),
      status: tr.status,
      notes: tr.notes,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        vehicleId: Number(form.vehicleId),
        driverId: Number(form.driverId),
        cargoId: form.cargoId ? Number(form.cargoId) : null,
        origin: form.origin,
        destination: form.destination,
        loadingDate: form.loadingDate,
        unloadingDate: form.unloadingDate,
        freightPrice: Number(form.freightPrice),
        distanceKm: Number(form.distanceKm),
        status: form.status,
        notes: form.notes,
      };
      if (editing) {
        await api.trips.update(editing.id, payload);
      } else {
        await api.trips.create(payload);
      }
      setFormOpen(false);
      notify(t.common.save, 'success');
      loadData();
    } catch (err: any) {
      if (err?.code === 'OVERLAPPING_TRIP') {
        notify(t.trips.overlapError, 'error');
      } else {
        notify(err?.message || 'Error', 'error');
      }
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await api.trips.complete(id);
      notify(t.statuses.COMPLETED, 'success');
      loadData();
    } catch (err: any) {
      notify(err?.message || 'Error', 'error');
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await api.trips.cancel(id);
      notify(t.statuses.CANCELLED, 'info');
      loadData();
    } catch (err: any) {
      notify(err?.message || 'Error', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-[#F5F8FF]">{t.trips.title}</h2>
          <p className="text-xs text-[#9BAFC8] mt-0.5">{t.trips.subtitle}</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0788F9] hover:bg-[#2596FA] text-white text-xs font-bold shadow-[0_0_16px_rgba(7,136,249,0.4)]"
        >
          <Plus className="w-4 h-4" />
          {t.trips.addBtn}
        </button>
      </div>

      {/* Filters */}
      <div className="fura-card p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-[#9BAFC8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.common.search}
            className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F5F8FF]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-xs text-[#F5F8FF]"
        >
          <option value="ALL">
            {t.common.status}: {t.common.all}
          </option>
          {TRIP_STATUSES.map((st) => (
            <option key={st} value={st}>
              {(t.statuses as Record<string, string>)[st]}
            </option>
          ))}
        </select>
      </div>

      {/* Trips Cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="fura-card p-8 text-center text-xs text-[#9BAFC8]">{t.common.loading}</div>
        ) : trips.length === 0 ? (
          <div className="fura-card p-8 text-center text-xs text-[#9BAFC8]">{t.common.noData}</div>
        ) : (
          trips.map((tr) => (
            <div
              key={tr.id}
              className="fura-card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#142B49]/70 transition"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-sm font-extrabold text-[#F5F8FF] tabular-nums">
                    {tr.tripCode}
                  </span>
                  <StatusBadge status={tr.status} />
                  <span className="text-xs font-semibold text-[#0788F9]">
                    {tr.vehicle.plateNumber} ({tr.vehicle.model})
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#D7E3FC]">
                  {tr.origin} → {tr.destination}{' '}
                  <span className="text-[#9BAFC8] font-normal tabular-nums">
                    ({tr.distanceKm} {t.common.km})
                  </span>
                </p>
                <p className="text-[11px] text-[#9BAFC8]">
                  {tr.driver.fullName} • {tr.cargo ? tr.cargo.name : '—'} •{' '}
                  {formatDate(tr.loadingDate)} → {formatDate(tr.unloadingDate)} •{' '}
                  <span className="text-[#00C875] font-bold">{formatMoney(tr.freightPrice)}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => setMapTrip(tr)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1B32] border border-[#243F60] hover:border-[#0788F9] text-xs font-semibold text-[#0788F9]"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {t.trips.mapBtn}
                </button>
                <button
                  onClick={() => setDetailTrip(tr)}
                  className="p-2 rounded-lg bg-[#0B1B32] border border-[#243F60] text-[#D7E3FC] hover:border-[#0788F9]"
                  title={t.common.view}
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => openEdit(tr)}
                  className="p-2 rounded-lg bg-[#0B1B32] border border-[#243F60] text-[#FFA526] hover:border-[#FFA526]"
                  title={t.common.edit}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {tr.status !== 'COMPLETED' && tr.status !== 'CANCELLED' && (
                  <>
                    <button
                      onClick={() => handleComplete(tr.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#00C875]/15 border border-[#00C875]/40 text-[#00C875] text-xs font-semibold"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {t.trips.completeBtn}
                    </button>
                    <button
                      onClick={() => handleCancel(tr.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] text-xs font-semibold"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {t.trips.cancelBtn}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Trip Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `${t.common.edit}: ${editing.tripCode}` : t.trips.addBtn}
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.trips.vehicle} *</label>
              <select
                required
                value={form.vehicleId}
                onChange={(e) => {
                  const vid = e.target.value;
                  const v = vehicles.find((item) => String(item.id) === vid);
                  setForm({
                    ...form,
                    vehicleId: vid,
                    driverId: v?.driverId ? String(v.driverId) : form.driverId,
                  });
                }}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              >
                <option value="">—</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} — {v.model}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.trips.driver} *</label>
              <select
                required
                value={form.driverId}
                onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              >
                <option value="">—</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.trips.cargo}</label>
              <select
                value={form.cargoId}
                onChange={(e) => setForm({ ...form, cargoId: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              >
                <option value="">—</option>
                {cargos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.common.status}</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TripStatus })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              >
                {TRIP_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {(t.statuses as Record<string, string>)[st]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.trips.origin} *</label>
              <input
                required
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.trips.destination} *
              </label>
              <input
                required
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.trips.loadingDate} *
              </label>
              <input
                required
                type="date"
                value={form.loadingDate}
                onChange={(e) => setForm({ ...form, loadingDate: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.trips.unloadingDate} *
              </label>
              <input
                required
                type="date"
                value={form.unloadingDate}
                onChange={(e) => setForm({ ...form, unloadingDate: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.trips.freightPrice} ($)
              </label>
              <input
                type="number"
                value={form.freightPrice}
                onChange={(e) => setForm({ ...form, freightPrice: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.trips.distance}</label>
              <input
                type="number"
                value={form.distanceKm}
                onChange={(e) => setForm({ ...form, distanceKm: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[#9BAFC8] font-semibold mb-1">{t.common.notes}</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#142B49] border border-[#243F60]"
            >
              {t.common.cancel}
            </button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-[#0788F9] text-white font-bold">
              {t.common.save}
            </button>
          </div>
        </form>
      </Modal>

      {/* Trip Details Modal */}
      <Modal
        open={Boolean(detailTrip)}
        onClose={() => setDetailTrip(null)}
        title={detailTrip?.tripCode || ''}
      >
        {detailTrip && (
          <div className="space-y-3 text-xs">
            <div className="fura-card-inset p-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[#9BAFC8]">{t.trips.vehicle}</p>
                <p className="font-bold text-[#F5F8FF] mt-0.5">
                  {detailTrip.vehicle.plateNumber} ({detailTrip.vehicle.model})
                </p>
              </div>
              <div>
                <p className="text-[#9BAFC8]">{t.trips.driver}</p>
                <p className="font-bold text-[#F5F8FF] mt-0.5">{detailTrip.driver.fullName}</p>
              </div>
              <div>
                <p className="text-[#9BAFC8]">{t.trips.origin}</p>
                <p className="font-bold text-[#F5F8FF] mt-0.5">{detailTrip.origin}</p>
              </div>
              <div>
                <p className="text-[#9BAFC8]">{t.trips.destination}</p>
                <p className="font-bold text-[#F5F8FF] mt-0.5">{detailTrip.destination}</p>
              </div>
              <div>
                <p className="text-[#9BAFC8]">{t.trips.freightPrice}</p>
                <p className="font-bold text-[#00C875] mt-0.5">
                  {formatMoney(detailTrip.freightPrice)}
                </p>
              </div>
              <div>
                <p className="text-[#9BAFC8]">{t.trips.distance}</p>
                <p className="font-bold text-[#F5F8FF] mt-0.5">
                  {detailTrip.distanceKm} {t.common.km}
                </p>
              </div>
            </div>
            {detailTrip.notes && (
              <div className="fura-card-inset p-3">
                <p className="text-[#9BAFC8] mb-1">{t.common.notes}</p>
                <p className="text-[#F5F8FF]">{detailTrip.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {mapTrip && (
        <RouteMapModal
          open={Boolean(mapTrip)}
          onClose={() => setMapTrip(null)}
          title={`${mapTrip.tripCode} — ${mapTrip.vehicle.plateNumber}`}
          origin={mapTrip.origin}
          destination={mapTrip.destination}
          plateNumber={mapTrip.vehicle.plateNumber}
          progressPct={mapTrip.progressPct || 50}
        />
      )}
    </div>
  );
};
