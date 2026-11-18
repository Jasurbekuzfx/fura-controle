import React, { useCallback, useEffect, useState } from 'react';
import {
  Download,
  Edit2,
  Eye,
  MapPin,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Truck,
} from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { RouteMapModal } from '../components/RouteMapModal';
import { StatusBadge } from '../components/StatusBadge';
import type { Driver, Vehicle, VehicleStatus, VehicleType } from '../types';

const VEHICLE_TYPES: VehicleType[] = ['TENT', 'REF', 'MEGA', 'KONT'];
const VEHICLE_STATUSES: VehicleStatus[] = [
  'AVAILABLE',
  'ON_ROUTE',
  'LOADING',
  'BUSY',
  'UNDER_REPAIR',
];

export const VehiclesPage: React.FC = () => {
  const { t, notify, formatDate } = useApp();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trashMode, setTrashMode] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [detailVehicle, setDetailVehicle] = useState<Vehicle | null>(null);
  const [mapVehicle, setMapVehicle] = useState<Vehicle | null>(null);

  const [form, setForm] = useState({
    plateNumber: '',
    model: '',
    vehicleType: 'TENT' as VehicleType,
    driverId: '',
    phone: '',
    capacityTons: '22',
    volumeM3: '92',
    currentLocation: '',
    destination: '',
    status: 'AVAILABLE' as VehicleStatus,
    notes: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [vList, dList] = await Promise.all([
        api.vehicles.list({
          trash: trashMode,
          search,
          type: typeFilter,
          status: statusFilter,
        }),
        api.drivers.list(),
      ]);
      setVehicles(vList);
      setDrivers(dList);
    } catch {
      notify('Error loading vehicles', 'error');
    } finally {
      setLoading(false);
    }
  }, [trashMode, search, typeFilter, statusFilter, notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      plateNumber: '',
      model: '',
      vehicleType: 'TENT',
      driverId: '',
      phone: '',
      capacityTons: '22',
      volumeM3: '92',
      currentLocation: '',
      destination: '',
      status: 'AVAILABLE',
      notes: '',
    });
    setFormOpen(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      plateNumber: v.plateNumber,
      model: v.model,
      vehicleType: v.vehicleType,
      driverId: v.driverId ? String(v.driverId) : '',
      phone: v.phone,
      capacityTons: String(v.capacityTons),
      volumeM3: String(v.volumeM3),
      currentLocation: v.currentLocation,
      destination: v.destination,
      status: v.status,
      notes: v.notes,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        plateNumber: form.plateNumber,
        model: form.model,
        vehicleType: form.vehicleType,
        driverId: form.driverId ? Number(form.driverId) : null,
        phone: form.phone,
        capacityTons: Number(form.capacityTons),
        volumeM3: Number(form.volumeM3),
        currentLocation: form.currentLocation,
        destination: form.destination,
        status: form.status,
        notes: form.notes,
      };
      if (editing) {
        await api.vehicles.update(editing.id, payload);
      } else {
        await api.vehicles.create(payload);
      }
      setFormOpen(false);
      notify(t.common.save, 'success');
      loadData();
    } catch (err: any) {
      if (err?.code === 'DUPLICATE_PLATE' || err?.code === 'DUPLICATE_PLATE_TRASH') {
        notify(t.vehicles.duplicatePlate, 'error');
      } else if (err?.code === 'DRIVER_ALREADY_ASSIGNED') {
        notify(t.drivers.alreadyAssigned, 'error');
      } else {
        notify(err?.message || 'Error', 'error');
      }
    }
  };

  const handleSoftDelete = async (id: number) => {
    if (!confirm(t.common.confirmDelete)) return;
    try {
      await api.vehicles.softDelete(id);
      notify(t.common.trash, 'info');
      loadData();
    } catch (err: any) {
      notify(err?.message || 'Error', 'error');
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await api.vehicles.restore(id);
      notify(t.common.restore, 'success');
      loadData();
    } catch (err: any) {
      notify(err?.message || 'Error', 'error');
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (!confirm(t.common.confirmDelete)) return;
    try {
      await api.vehicles.permanentDelete(id);
      notify(t.common.permanentDelete, 'info');
      loadData();
    } catch (err: any) {
      notify(err?.message || 'Error', 'error');
    }
  };

  // Available drivers for assignment (either unassigned or currently assigned to the editing vehicle)
  const assignableDrivers = drivers.filter(
    (d) => !d.vehicle || (editing && d.vehicle.id === editing.id)
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-[#F5F8FF]">{t.vehicles.title}</h2>
          <p className="text-xs text-[#9BAFC8] mt-0.5">{t.vehicles.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setTrashMode((v) => !v)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-semibold transition ${
              trashMode
                ? 'bg-[#EF4444]/15 border-[#EF4444] text-[#EF4444]'
                : 'bg-[#102440] border-[#243F60] text-[#D7E3FC] hover:border-[#0788F9]'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            {trashMode ? t.common.activeList : t.common.trash}
          </button>

          <a
            href="/api/vehicles/export/xlsx"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#102440] border border-[#243F60] hover:border-[#0788F9] text-xs font-semibold text-[#D7E3FC] transition"
          >
            <Download className="w-4 h-4 text-[#00C875]" />
            {t.common.exportExcel}
          </a>

          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0788F9] hover:bg-[#2596FA] text-white text-xs font-bold shadow-[0_0_16px_rgba(7,136,249,0.4)] transition"
          >
            <Plus className="w-4 h-4" />
            {t.vehicles.addBtn}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="fura-card p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-[#9BAFC8] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.common.search}
            className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg pl-9 pr-3 py-2 text-xs text-[#F5F8FF] placeholder-[#9BAFC8] focus:outline-none focus:border-[#0788F9]"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-xs text-[#F5F8FF] focus:outline-none focus:border-[#0788F9]"
        >
          <option value="ALL">
            {t.vehicles.type}: {t.common.all}
          </option>
          {VEHICLE_TYPES.map((vt) => (
            <option key={vt} value={vt}>
              {vt}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-xs text-[#F5F8FF] focus:outline-none focus:border-[#0788F9]"
        >
          <option value="ALL">
            {t.common.status}: {t.common.all}
          </option>
          {VEHICLE_STATUSES.map((st) => (
            <option key={st} value={st}>
              {(t.statuses as Record<string, string>)[st]}
            </option>
          ))}
        </select>
      </div>

      {/* Vehicles Table */}
      <div className="fura-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1B32] border-b border-[#243F60] text-[11px] font-bold uppercase tracking-wider text-[#9BAFC8]">
                <th className="py-3 px-4">{t.vehicles.plateNumber}</th>
                <th className="py-3 px-4">{t.vehicles.model}</th>
                <th className="py-3 px-4">{t.vehicles.type}</th>
                <th className="py-3 px-4">{t.vehicles.driver}</th>
                <th className="py-3 px-4">{t.vehicles.currentLocation}</th>
                <th className="py-3 px-4">{t.common.status}</th>
                <th className="py-3 px-4 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A3353] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#9BAFC8]">
                    {t.common.loading}
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#9BAFC8]">
                    {t.common.noData}
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-[#142B49] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#F5F8FF] tabular-nums">
                      <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#0B1B32] border border-[#243F60]">
                        <Truck className="w-3.5 h-3.5 text-[#0788F9]" />
                        {v.plateNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#F5F8FF]">{v.model}</p>
                      <p className="text-[11px] text-[#9BAFC8] tabular-nums">
                        {v.capacityTons} t • {v.volumeM3} m³
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#D7E3FC]">{v.vehicleType}</td>
                    <td className="py-3.5 px-4">
                      {v.driver ? (
                        <div>
                          <p className="font-semibold text-[#F5F8FF]">{v.driver.fullName}</p>
                          <p className="text-[11px] text-[#9BAFC8]">{v.driver.phone}</p>
                        </div>
                      ) : (
                        <span className="text-[#9BAFC8]">{t.vehicles.unassigned}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-[#F5F8FF]">{v.currentLocation || '—'}</p>
                      <p className="text-[11px] text-[#9BAFC8]">→ {v.destination || '—'}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {!trashMode ? (
                          <>
                            <button
                              onClick={() => setMapVehicle(v)}
                              className="p-1.5 rounded-lg bg-[#0B1B32] border border-[#243F60] text-[#0788F9] hover:border-[#0788F9]"
                              title={t.vehicles.routeMap}
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDetailVehicle(v)}
                              className="p-1.5 rounded-lg bg-[#0B1B32] border border-[#243F60] text-[#D7E3FC] hover:border-[#0788F9]"
                              title={t.common.view}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openEdit(v)}
                              className="p-1.5 rounded-lg bg-[#0B1B32] border border-[#243F60] text-[#FFA526] hover:border-[#FFA526]"
                              title={t.common.edit}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSoftDelete(v.id)}
                              className="p-1.5 rounded-lg bg-[#0B1B32] border border-[#243F60] text-[#EF4444] hover:border-[#EF4444]"
                              title={t.common.delete}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRestore(v.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00C875]/15 border border-[#00C875]/40 text-[#00C875] font-semibold"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              {t.common.restore}
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(v.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {t.common.permanentDelete}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Vehicle Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `${t.common.edit}: ${editing.plateNumber}` : t.vehicles.addBtn}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.vehicles.plateNumber} *
              </label>
              <input
                required
                value={form.plateNumber}
                onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
                placeholder="01 A 123 UA"
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF] focus:outline-none focus:border-[#0788F9]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.vehicles.model} *
              </label>
              <input
                required
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="Volvo FH16 540"
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF] focus:outline-none focus:border-[#0788F9]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.vehicles.type}</label>
              <select
                value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value as VehicleType })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              >
                {VEHICLE_TYPES.map((vt) => (
                  <option key={vt} value={vt}>
                    {vt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.common.status}</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as VehicleStatus })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              >
                {VEHICLE_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {(t.statuses as Record<string, string>)[st]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.vehicles.driver}</label>
              <select
                value={form.driverId}
                onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              >
                <option value="">{t.vehicles.unassigned}</option>
                {assignableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.phone})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.vehicles.phone}</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+998 90 123 45 67"
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.vehicles.capacity}</label>
              <input
                type="number"
                step="0.1"
                value={form.capacityTons}
                onChange={(e) => setForm({ ...form, capacityTons: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.vehicles.volume}</label>
              <input
                type="number"
                step="0.1"
                value={form.volumeM3}
                onChange={(e) => setForm({ ...form, volumeM3: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.vehicles.currentLocation}
              </label>
              <input
                value={form.currentLocation}
                onChange={(e) => setForm({ ...form, currentLocation: e.target.value })}
                placeholder="Toshkent"
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.vehicles.destination}
              </label>
              <input
                value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })}
                placeholder="Moskva"
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

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#142B49] border border-[#243F60] text-[#D7E3FC]"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#0788F9] hover:bg-[#2596FA] text-white font-bold shadow-[0_0_16px_rgba(7,136,249,0.4)]"
            >
              {t.common.save}
            </button>
          </div>
        </form>
      </Modal>

      {/* Vehicle Details Modal */}
      <Modal
        open={Boolean(detailVehicle)}
        onClose={() => setDetailVehicle(null)}
        title={detailVehicle ? `${detailVehicle.plateNumber} — ${detailVehicle.model}` : ''}
      >
        {detailVehicle && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 fura-card-inset p-4">
              <div>
                <p className="text-[#9BAFC8]">{t.vehicles.type}</p>
                <p className="font-bold text-[#F5F8FF] mt-0.5">{detailVehicle.vehicleType}</p>
              </div>
              <div>
                <p className="text-[#9BAFC8]">{t.common.status}</p>
                <div className="mt-1">
                  <StatusBadge status={detailVehicle.status} />
                </div>
              </div>
              <div>
                <p className="text-[#9BAFC8]">{t.vehicles.driver}</p>
                <p className="font-bold text-[#F5F8FF] mt-0.5">
                  {detailVehicle.driver?.fullName || t.vehicles.unassigned}
                </p>
              </div>
              <div>
                <p className="text-[#9BAFC8]">{t.vehicles.capacity} / {t.vehicles.volume}</p>
                <p className="font-bold text-[#F5F8FF] mt-0.5">
                  {detailVehicle.capacityTons} t / {detailVehicle.volumeM3} m³
                </p>
              </div>
              <div>
                <p className="text-[#9BAFC8]">{t.vehicles.currentLocation}</p>
                <p className="font-bold text-[#F5F8FF] mt-0.5">
                  {detailVehicle.currentLocation || '—'}
                </p>
              </div>
              <div>
                <p className="text-[#9BAFC8]">{t.vehicles.destination}</p>
                <p className="font-bold text-[#F5F8FF] mt-0.5">{detailVehicle.destination || '—'}</p>
              </div>
            </div>
            {detailVehicle.notes && (
              <div className="fura-card-inset p-3">
                <p className="text-[#9BAFC8] mb-1">{t.common.notes}</p>
                <p className="text-[#F5F8FF]">{detailVehicle.notes}</p>
              </div>
            )}
            <p className="text-[11px] text-[#9BAFC8]">
              ID #{detailVehicle.id} • {formatDate(detailVehicle.createdAt)}
            </p>
          </div>
        )}
      </Modal>

      {/* Simulated GPS Route Map Modal */}
      {mapVehicle && (
        <RouteMapModal
          open={Boolean(mapVehicle)}
          onClose={() => setMapVehicle(null)}
          plateNumber={mapVehicle.plateNumber}
          origin={mapVehicle.currentLocation || 'Toshkent'}
          destination={
            mapVehicle.destination && mapVehicle.destination !== '—'
              ? mapVehicle.destination
              : 'Moskva'
          }
          progressPct={mapVehicle.status === 'ON_ROUTE' ? 62 : 20}
        />
      )}
    </div>
  );
};
