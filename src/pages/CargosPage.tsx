import React, { useCallback, useEffect, useState } from 'react';
import { Edit2, Package, Plus, Search, Trash2 } from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/Modal';
import { StatusBadge } from '../components/StatusBadge';
import type { Cargo, CargoStatus, Driver, Vehicle } from '../types';

const CARGO_STATUSES: CargoStatus[] = ['PENDING', 'LOADING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

export const CargosPage: React.FC = () => {
  const { t, notify, formatDate, formatMoney } = useApp();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Cargo | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    name: '',
    cargoType: 'Sanoat mollari',
    loadingAddress: '',
    destinationAddress: '',
    weightTons: '20',
    volumeM3: '82',
    loadingDate: todayStr,
    unloadingDate: todayStr,
    price: '3500',
    customerName: '',
    customerPhone: '',
    vehicleId: '',
    driverId: '',
    status: 'PENDING' as CargoStatus,
    notes: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cList, vList, dList] = await Promise.all([
        api.cargos.list({ search, status: statusFilter }),
        api.vehicles.list(),
        api.drivers.list(),
      ]);
      setCargos(cList);
      setVehicles(vList);
      setDrivers(dList);
    } catch {
      notify('Error loading cargos', 'error');
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
      name: '',
      cargoType: 'Sanoat mollari',
      loadingAddress: '',
      destinationAddress: '',
      weightTons: '20',
      volumeM3: '82',
      loadingDate: todayStr,
      unloadingDate: todayStr,
      price: '3500',
      customerName: '',
      customerPhone: '',
      vehicleId: '',
      driverId: '',
      status: 'PENDING',
      notes: '',
    });
    setFormOpen(true);
  };

  const openEdit = (c: Cargo) => {
    setEditing(c);
    setForm({
      name: c.name,
      cargoType: c.cargoType,
      loadingAddress: c.loadingAddress,
      destinationAddress: c.destinationAddress,
      weightTons: String(c.weightTons),
      volumeM3: String(c.volumeM3),
      loadingDate: c.loadingDate.split('T')[0],
      unloadingDate: c.unloadingDate.split('T')[0],
      price: String(c.price),
      customerName: c.customerName,
      customerPhone: c.customerPhone,
      vehicleId: c.vehicleId ? String(c.vehicleId) : '',
      driverId: c.driverId ? String(c.driverId) : '',
      status: c.status,
      notes: c.notes,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        weightTons: Number(form.weightTons),
        volumeM3: Number(form.volumeM3),
        price: Number(form.price),
        vehicleId: form.vehicleId ? Number(form.vehicleId) : null,
        driverId: form.driverId ? Number(form.driverId) : null,
      };
      if (editing) {
        await api.cargos.update(editing.id, payload);
      } else {
        await api.cargos.create(payload);
      }
      setFormOpen(false);
      notify(t.common.save, 'success');
      loadData();
    } catch (err: any) {
      notify(err?.message || 'Error', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.common.confirmDelete)) return;
    try {
      await api.cargos.delete(id);
      notify(t.common.delete, 'info');
      loadData();
    } catch (err: any) {
      notify(err?.message || 'Error', 'error');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-[#F5F8FF]">{t.cargos.title}</h2>
          <p className="text-xs text-[#9BAFC8] mt-0.5">{t.cargos.subtitle}</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0788F9] hover:bg-[#2596FA] text-white text-xs font-bold shadow-[0_0_16px_rgba(7,136,249,0.4)]"
        >
          <Plus className="w-4 h-4" />
          {t.cargos.addBtn}
        </button>
      </div>

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
          {CARGO_STATUSES.map((st) => (
            <option key={st} value={st}>
              {(t.statuses as Record<string, string>)[st]}
            </option>
          ))}
        </select>
      </div>

      <div className="fura-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0B1B32] border-b border-[#243F60] text-[11px] font-bold uppercase tracking-wider text-[#9BAFC8]">
                <th className="py-3 px-4">{t.cargos.code}</th>
                <th className="py-3 px-4">{t.cargos.name}</th>
                <th className="py-3 px-4">{t.cargos.customerName}</th>
                <th className="py-3 px-4">
                  {t.cargos.loadingAddress} → {t.cargos.destinationAddress}
                </th>
                <th className="py-3 px-4">{t.cargos.weight}</th>
                <th className="py-3 px-4">{t.cargos.price}</th>
                <th className="py-3 px-4">{t.common.status}</th>
                <th className="py-3 px-4 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A3353] text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#9BAFC8]">
                    {t.common.loading}
                  </td>
                </tr>
              ) : cargos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#9BAFC8]">
                    {t.common.noData}
                  </td>
                </tr>
              ) : (
                cargos.map((c) => (
                  <tr key={c.id} className="hover:bg-[#142B49] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#0788F9] tabular-nums">
                      <span className="inline-flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" />
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#F5F8FF]">{c.name}</p>
                      <p className="text-[11px] text-[#9BAFC8]">{c.cargoType}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#F5F8FF]">{c.customerName}</p>
                      <p className="text-[11px] text-[#9BAFC8]">{c.customerPhone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="text-[#F5F8FF]">{c.loadingAddress}</p>
                      <p className="text-[11px] text-[#9BAFC8]">
                        → {c.destinationAddress} ({formatDate(c.loadingDate)})
                      </p>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      {c.weightTons} t / {c.volumeM3} m³
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#F5F8FF] tabular-nums">
                      {formatMoney(c.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg bg-[#0B1B32] border border-[#243F60] text-[#FFA526] hover:border-[#FFA526]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg bg-[#0B1B32] border border-[#243F60] text-[#EF4444] hover:border-[#EF4444]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? `${t.common.edit}: ${editing.code}` : t.cargos.addBtn}
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.cargos.name} *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.cargos.type}</label>
              <input
                value={form.cargoType}
                onChange={(e) => setForm({ ...form, cargoType: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.cargos.loadingAddress} *
              </label>
              <input
                required
                value={form.loadingAddress}
                onChange={(e) => setForm({ ...form, loadingAddress: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.cargos.destinationAddress} *
              </label>
              <input
                required
                value={form.destinationAddress}
                onChange={(e) => setForm({ ...form, destinationAddress: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.cargos.weight}</label>
              <input
                type="number"
                step="0.1"
                value={form.weightTons}
                onChange={(e) => setForm({ ...form, weightTons: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.cargos.volume}</label>
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
                {t.cargos.loadingDate}
              </label>
              <input
                type="date"
                value={form.loadingDate}
                onChange={(e) => setForm({ ...form, loadingDate: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.cargos.unloadingDate}
              </label>
              <input
                type="date"
                value={form.unloadingDate}
                onChange={(e) => setForm({ ...form, unloadingDate: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.cargos.customerName} *
              </label>
              <input
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.cargos.customerPhone}
              </label>
              <input
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.cargos.price} ($)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.common.status}</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as CargoStatus })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              >
                {CARGO_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {(t.statuses as Record<string, string>)[st]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.vehicles.title}</label>
              <select
                value={form.vehicleId}
                onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              >
                <option value="">{t.vehicles.unassigned}</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} ({v.model})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.drivers.title}</label>
              <select
                value={form.driverId}
                onChange={(e) => setForm({ ...form, driverId: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              >
                <option value="">{t.vehicles.unassigned}</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
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
    </div>
  );
};
