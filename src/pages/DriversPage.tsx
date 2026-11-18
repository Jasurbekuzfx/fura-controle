import React, { useCallback, useEffect, useState } from 'react';
import { Download, Edit2, Eye, Link2, Plus, Search, Trash2, Unlink, User } from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import type { Driver, DriverStatus, Vehicle } from '../types';

const DRIVER_STATUSES: DriverStatus[] = ['AVAILABLE', 'ON_ROUTE', 'RESTING', 'ON_LEAVE'];
const CATEGORIES = ['B', 'C', 'D', 'E'] as const;

export const DriversPage: React.FC = () => {
  const { t, notify } = useApp();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [detailDriver, setDetailDriver] = useState<Driver | null>(null);
  const [assignDriver, setAssignDriver] = useState<Driver | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    licenseNumber: '',
    categories: ['B', 'C', 'E'] as string[],
    experienceYears: '5',
    status: 'AVAILABLE' as DriverStatus,
    vehicleId: '',
    notes: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dList, vList] = await Promise.all([
        api.drivers.list({ search, category: categoryFilter, status: statusFilter }),
        api.vehicles.list(),
      ]);
      setDrivers(dList);
      setVehicles(vList);
    } catch {
      notify('Error loading drivers', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter, notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      fullName: '',
      phone: '+998 ',
      licenseNumber: '',
      categories: ['B', 'C', 'E'],
      experienceYears: '5',
      status: 'AVAILABLE',
      vehicleId: '',
      notes: '',
    });
    setFormOpen(true);
  };

  const openEdit = (d: Driver) => {
    setEditing(d);
    setForm({
      fullName: d.fullName,
      phone: d.phone,
      licenseNumber: d.licenseNumber,
      categories: d.licenseCategories
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      experienceYears: String(d.experienceYears),
      status: d.status,
      vehicleId: d.vehicle ? String(d.vehicle.id) : '',
      notes: d.notes,
    });
    setFormOpen(true);
  };

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        fullName: form.fullName,
        phone: form.phone,
        licenseNumber: form.licenseNumber,
        licenseCategories: form.categories.join(',') || 'C,E',
        experienceYears: Number(form.experienceYears),
        status: form.status,
        notes: form.notes,
        ...(!editing && form.vehicleId ? { vehicleId: Number(form.vehicleId) } : {}),
      };
      if (editing) {
        await api.drivers.update(editing.id, payload);
      } else {
        await api.drivers.create(payload);
      }
      setFormOpen(false);
      notify(t.common.save, 'success');
      loadData();
    } catch (err: any) {
      notify(err?.message || 'Error', 'error');
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignDriver) return;
    try {
      await api.drivers.assignVehicle(
        assignDriver.id,
        selectedVehicleId ? Number(selectedVehicleId) : null
      );
      setAssignDriver(null);
      notify(t.common.save, 'success');
      loadData();
    } catch (err: any) {
      notify(err?.message || t.drivers.alreadyAssigned, 'error');
    }
  };

  const handleUnassign = async (d: Driver) => {
    try {
      await api.drivers.assignVehicle(d.id, null);
      notify(t.drivers.unassignVehicle, 'info');
      loadData();
    } catch (err: any) {
      notify(err?.message || 'Error', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.common.confirmDelete)) return;
    try {
      await api.drivers.delete(id);
      notify(t.common.delete, 'info');
      loadData();
    } catch (err: any) {
      notify(err?.message || 'Error', 'error');
    }
  };

  const unassignedVehicles = vehicles.filter((v) => !v.driverId);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-[#F5F8FF]">{t.drivers.title}</h2>
          <p className="text-xs text-[#9BAFC8] mt-0.5">{t.drivers.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/api/drivers/export/xlsx"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#102440] border border-[#243F60] hover:border-[#0788F9] text-xs font-semibold text-[#D7E3FC]"
          >
            <Download className="w-4 h-4 text-[#00C875]" />
            {t.common.exportExcel}
          </a>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0788F9] hover:bg-[#2596FA] text-white text-xs font-bold shadow-[0_0_16px_rgba(7,136,249,0.4)]"
          >
            <Plus className="w-4 h-4" />
            {t.drivers.addBtn}
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
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-xs text-[#F5F8FF]"
        >
          <option value="ALL">
            {t.drivers.categories}: {t.common.all}
          </option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-xs text-[#F5F8FF]"
        >
          <option value="ALL">
            {t.common.status}: {t.common.all}
          </option>
          {DRIVER_STATUSES.map((st) => (
            <option key={st} value={st}>
              {(t.statuses as Record<string, string>)[st]}
            </option>
          ))}
        </select>
      </div>

      {/* Drivers List */}
      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          <div className="fura-card p-8 text-center text-xs text-[#9BAFC8]">{t.common.loading}</div>
        ) : drivers.length === 0 ? (
          <div className="fura-card p-8 text-center text-xs text-[#9BAFC8]">{t.common.noData}</div>
        ) : (
          drivers.map((d) => (
            <div
              key={d.id}
              className="fura-card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#142B49]/70 transition"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#0788F9]/15 border border-[#0788F9]/30 flex items-center justify-center text-[#0788F9] flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-bold text-[#F5F8FF]">{d.fullName}</h4>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="text-xs text-[#9BAFC8] mt-1 tabular-nums">
                    {d.phone} • {d.licenseNumber} • {d.licenseCategories} • {d.experienceYears}{' '}
                    {t.common.years}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3">
                <div className="fura-card-inset px-3 py-2 text-xs">
                  <span className="text-[#9BAFC8]">{t.drivers.assignedVehicle}: </span>
                  <span className="font-bold text-[#F5F8FF]">
                    {d.vehicle ? `${d.vehicle.plateNumber} (${d.vehicle.model})` : t.vehicles.unassigned}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setAssignDriver(d);
                      setSelectedVehicleId(d.vehicle ? String(d.vehicle.id) : '');
                    }}
                    className="p-2 rounded-lg bg-[#0B1B32] border border-[#243F60] text-[#00C875] hover:border-[#00C875]"
                    title={t.drivers.assignVehicle}
                  >
                    <Link2 className="w-4 h-4" />
                  </button>
                  {d.vehicle && (
                    <button
                      onClick={() => handleUnassign(d)}
                      className="p-2 rounded-lg bg-[#0B1B32] border border-[#243F60] text-[#FFA526] hover:border-[#FFA526]"
                      title={t.drivers.unassignVehicle}
                    >
                      <Unlink className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setDetailDriver(d)}
                    className="p-2 rounded-lg bg-[#0B1B32] border border-[#243F60] text-[#D7E3FC] hover:border-[#0788F9]"
                    title={t.common.view}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEdit(d)}
                    className="p-2 rounded-lg bg-[#0B1B32] border border-[#243F60] text-[#0788F9] hover:border-[#0788F9]"
                    title={t.common.edit}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="p-2 rounded-lg bg-[#0B1B32] border border-[#243F60] text-[#EF4444] hover:border-[#EF4444]"
                    title={t.common.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Driver Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `${t.common.edit}: ${editing.fullName}` : t.drivers.addBtn}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.drivers.fullName} *
              </label>
              <input
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.drivers.phone} *</label>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.drivers.licenseNumber} *
              </label>
              <input
                required
                value={form.licenseNumber}
                onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.drivers.experience}
              </label>
              <input
                type="number"
                min={0}
                value={form.experienceYears}
                onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.common.status}</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as DriverStatus })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              >
                {DRIVER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {(t.statuses as Record<string, string>)[st]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#9BAFC8] font-semibold mb-1.5">
              {t.drivers.categories}
            </label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => {
                const active = form.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg border font-bold transition ${
                      active
                        ? 'bg-[#0788F9] border-[#0788F9] text-white'
                        : 'bg-[#0B1B32] border-[#243F60] text-[#9BAFC8]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {!editing && (
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.drivers.assignedVehicle}
              </label>
              <select
                value={form.vehicleId}
                onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              >
                <option value="">{t.vehicles.unassigned}</option>
                {unassignedVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} — {v.model}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              className="px-5 py-2 rounded-lg bg-[#0788F9] text-white font-bold"
            >
              {t.common.save}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Vehicle Modal */}
      <Modal
        open={Boolean(assignDriver)}
        onClose={() => setAssignDriver(null)}
        title={t.drivers.assignVehicle}
        subtitle={assignDriver?.fullName}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2.5 text-[#F5F8FF]"
          >
            <option value="">{t.vehicles.unassigned}</option>
            {vehicles
              .filter((v) => !v.driverId || v.driverId === assignDriver?.id)
              .map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plateNumber} — {v.model}
                </option>
              ))}
          </select>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAssignDriver(null)}
              className="px-4 py-2 rounded-lg bg-[#142B49] border border-[#243F60]"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#0788F9] text-white font-bold"
            >
              {t.common.save}
            </button>
          </div>
        </form>
      </Modal>

      {/* Driver Profile Modal */}
      <Modal
        open={Boolean(detailDriver)}
        onClose={() => setDetailDriver(null)}
        title={detailDriver?.fullName || ''}
      >
        {detailDriver && (
          <div className="space-y-3 text-xs">
            <div className="fura-card-inset p-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[#9BAFC8]">{t.drivers.phone}</p>
                <p className="font-bold text-[#F5F8FF] mt-0.5">{detailDriver.phone}</p>
              </div>
              <div>
                <p className="text-[#9BAFC8]">{t.drivers.licenseNumber}</p>
                <p className="font-bold text-[#F5F8FF] mt-0.5">{detailDriver.licenseNumber}</p>
              </div>
              <div>
                <p className="text-[#9BAFC8]">{t.drivers.categories}</p>
                <p className="font-bold text-[#F5F8FF] mt-0.5">{detailDriver.licenseCategories}</p>
              </div>
              <div>
                <p className="text-[#9BAFC8]">{t.drivers.experience}</p>
                <p className="font-bold text-[#F5F8FF] mt-0.5">
                  {detailDriver.experienceYears} {t.common.years}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[#9BAFC8]">{t.drivers.assignedVehicle}</p>
                <p className="font-bold text-[#F5F8FF] mt-0.5">
                  {detailDriver.vehicle
                    ? `${detailDriver.vehicle.plateNumber} (${detailDriver.vehicle.model})`
                    : t.vehicles.unassigned}
                </p>
              </div>
            </div>
            {detailDriver.notes && (
              <div className="fura-card-inset p-3">
                <p className="text-[#9BAFC8] mb-1">{t.common.notes}</p>
                <p className="text-[#F5F8FF]">{detailDriver.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
