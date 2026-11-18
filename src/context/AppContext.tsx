import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { getTranslations, type TranslationKeys } from '../i18n';
import type { ApplicationSettings, Language, PageId } from '../types';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextValue {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  settings: ApplicationSettings;
  setSettings: React.Dispatch<React.SetStateAction<ApplicationSettings>>;
  t: TranslationKeys;
  switchLanguage: (lang: Language) => Promise<void>;
  formatDate: (iso: string | Date) => string;
  formatMoney: (amountUsd: number) => string;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  toasts: ToastState[];
  dismissToast: (id: number) => void;
}

const DEFAULT_SETTINGS: ApplicationSettings = {
  id: 1,
  ownerName: 'Jasurbek',
  companyName: 'FURA CONTROL',
  roleTitle: 'Bosh dispetcher',
  phone: '+998 90 123 45 67',
  email: 'dispatch@furacontrol.uz',
  language: 'uz',
  dateFormat: 'DD.MM.YYYY',
  currency: 'USD',
  sidebarCompact: false,
  showSimulatedGps: true,
};

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [settings, setSettings] = useState<ApplicationSettings>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  useEffect(() => {
    api.settings
      .get()
      .then((s) => setSettings(s))
      .catch(() => {});
  }, []);

  const notify = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 3600);
    },
    []
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const switchLanguage = useCallback(
    async (lang: Language) => {
      setSettings((prev) => ({ ...prev, language: lang }));
      try {
        const updated = await api.settings.update({ ...settings, language: lang });
        setSettings(updated);
      } catch {
        // Keep optimistic UI switch even if network is slow
      }
    },
    [settings]
  );

  const formatDate = useCallback(
    (iso: string | Date) => {
      const d = typeof iso === 'string' ? new Date(iso) : iso;
      if (Number.isNaN(d.getTime())) return '—';
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      if (settings.dateFormat === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`;
      if (settings.dateFormat === 'DD/MM/YYYY') return `${dd}/${mm}/${yyyy}`;
      return `${dd}.${mm}.${yyyy}`;
    },
    [settings.dateFormat]
  );

  const formatMoney = useCallback(
    (amountUsd: number) => {
      if (settings.currency === 'UZS') {
        const val = Math.round(amountUsd * 12800).toLocaleString('en-US');
        return `${val} so‘m`;
      }
      if (settings.currency === 'RUB') {
        const val = Math.round(amountUsd * 96).toLocaleString('en-US');
        return `${val} ₽`;
      }
      return `$${Math.round(amountUsd).toLocaleString('en-US')}`;
    },
    [settings.currency]
  );

  const t = getTranslations(settings.language);

  return (
    <AppContext.Provider
      value={{
        activePage,
        setActivePage,
        settings,
        setSettings,
        t,
        switchLanguage,
        formatDate,
        formatMoney,
        notify,
        toasts,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
