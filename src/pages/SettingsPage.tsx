import React, { useCallback, useEffect, useState } from 'react';
import { Database, DownloadCloud, RotateCcw, Save, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import type { BackupFile, Language } from '../types';

export const SettingsPage: React.FC = () => {
  const { t, settings, setSettings, switchLanguage, notify, formatDate } = useApp();
  const [form, setForm] = useState(settings);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [busyBackup, setBusyBackup] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const loadBackups = useCallback(async () => {
    try {
      const list = await api.backup.list();
      setBackups(list);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadBackups();
  }, [loadBackups]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.settings.update(form);
      setSettings(updated);
      notify(t.settings.savedSuccess, 'success');
    } catch {
      notify('Failed to save settings', 'error');
    }
  };

  const handleCreateBackup = async () => {
    setBusyBackup(true);
    try {
      await api.backup.create();
      notify('Backup created', 'success');
      loadBackups();
    } catch {
      notify('Backup failed', 'error');
    } finally {
      setBusyBackup(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    if (!confirm(`${t.settings.restoreBackup}: ${filename}?`)) return;
    setBusyBackup(true);
    try {
      await api.backup.restore(filename);
      notify('Database restored successfully', 'success');
      loadBackups();
    } catch {
      notify('Restore failed', 'error');
    } finally {
      setBusyBackup(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl lg:text-2xl font-extrabold text-[#F5F8FF]">{t.settings.title}</h2>
        <p className="text-xs text-[#9BAFC8] mt-0.5">{t.settings.subtitle}</p>
      </div>

      {/* Profile & Preferences Form */}
      <form onSubmit={handleSave} className="fura-card p-6 space-y-6 text-xs">
        <div>
          <h3 className="text-sm font-bold text-[#F5F8FF] mb-3">{t.settings.profileSection}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.settings.ownerName}
              </label>
              <input
                value={form.ownerName}
                onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.settings.companyName}
              </label>
              <input
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.settings.roleTitle}
              </label>
              <input
                value={form.roleTitle}
                onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.settings.phone}</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[#9BAFC8] font-semibold mb-1">{t.settings.email}</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-[#243F60] pt-5">
          <h3 className="text-sm font-bold text-[#F5F8FF] mb-3">{t.settings.preferencesSection}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.settings.language}
              </label>
              <select
                value={form.language}
                onChange={(e) => {
                  const lang = e.target.value as Language;
                  setForm({ ...form, language: lang });
                  switchLanguage(lang);
                }}
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              >
                <option value="uz">O‘zbekcha (UZ)</option>
                <option value="ru">Русский (RU)</option>
              </select>
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.settings.dateFormat}
              </label>
              <select
                value={form.dateFormat}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dateFormat: e.target.value as 'DD.MM.YYYY' | 'YYYY-MM-DD' | 'DD/MM/YYYY',
                  })
                }
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              >
                <option value="DD.MM.YYYY">DD.MM.YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              </select>
            </div>
            <div>
              <label className="block text-[#9BAFC8] font-semibold mb-1">
                {t.settings.currency}
              </label>
              <select
                value={form.currency}
                onChange={(e) =>
                  setForm({ ...form, currency: e.target.value as 'USD' | 'UZS' | 'RUB' })
                }
                className="w-full bg-[#0B1B32] border border-[#243F60] rounded-lg px-3 py-2 text-[#F5F8FF]"
              >
                <option value="USD">USD ($)</option>
                <option value="UZS">UZS (so‘m)</option>
                <option value="RUB">RUB (₽)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0788F9] hover:bg-[#2596FA] text-white font-bold shadow-[0_0_16px_rgba(7,136,249,0.4)]"
          >
            <Save className="w-4 h-4" />
            {t.common.save}
          </button>
        </div>
      </form>

      {/* Database Backup & Restore */}
      <div className="fura-card p-6 space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#F5F8FF] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#00C875]" />
              {t.settings.backupSection}
            </h3>
            <p className="text-[#9BAFC8] mt-0.5">{t.settings.backupHint}</p>
          </div>
          <button
            disabled={busyBackup}
            onClick={handleCreateBackup}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00C875] hover:bg-[#00C875]/90 text-[#071426] font-bold transition disabled:opacity-50"
          >
            <DownloadCloud className="w-4 h-4" />
            {t.settings.createBackup}
          </button>
        </div>

        <div className="space-y-2">
          {backups.length === 0 ? (
            <p className="text-[#9BAFC8] py-3">{t.common.noData}</p>
          ) : (
            backups.map((b) => (
              <div
                key={b.name}
                className="fura-card-inset p-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <ShieldCheck className="w-4 h-4 text-[#0788F9] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-[#F5F8FF] truncate">{b.name}</p>
                    <p className="text-[11px] text-[#9BAFC8] tabular-nums">
                      {formatDate(b.createdAt)} • {(b.sizeBytes / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  disabled={busyBackup}
                  onClick={() => handleRestoreBackup(b.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#102440] border border-[#243F60] hover:border-[#FFA526] text-[#FFA526] font-semibold flex-shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t.settings.restoreBackup}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
