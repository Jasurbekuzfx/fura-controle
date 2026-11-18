import React, { useEffect, useState } from 'react';
import {
  Archive,
  BarChart3,
  Bell,
  Calendar,
  Home,
  Map as MapIcon,
  Menu,
  Package,
  Search,
  Settings,
  Truck,
  User,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { PageId } from '../types';
import { GlobalSearchModal } from './GlobalSearchModal';

const NAV_ITEMS: Array<{ id: PageId; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'dashboard', icon: Home },
  { id: 'vehicles', icon: Truck },
  { id: 'cargos', icon: Package },
  { id: 'drivers', icon: Users },
  { id: 'trips', icon: MapIcon },
  { id: 'calendar', icon: Calendar },
  { id: 'archive', icon: Archive },
  { id: 'reports', icon: BarChart3 },
  { id: 'settings', icon: Settings },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activePage, setActivePage, settings, t, switchLanguage, formatDate, toasts, dismissToast } =
    useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleNav = (id: PageId) => {
    setActivePage(id);
    setMobileOpen(false);
  };

  const SidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="p-4 flex flex-col overflow-y-auto">
        {/* Preserved Stitch Logo */}
        <div className="flex items-center justify-between px-2 py-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#0788F9] to-sky-400 flex items-center justify-center shadow-[0_0_16px_rgba(7,136,249,0.45)] flex-shrink-0">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-[#F5F8FF] leading-none truncate">
                {settings.companyName || t.appName}
              </h1>
              <p className="text-[11px] text-[#9BAFC8] mt-1 truncate">{t.appSubtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-[#9BAFC8] hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 mt-1 text-sm font-medium">
          {NAV_ITEMS.map(({ id, icon: Icon }) => {
            const isActive = activePage === id;
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'text-white bg-[#0788F9] shadow-[0_0_16px_rgba(7,136,249,0.45)] font-semibold'
                    : 'text-[#9BAFC8] hover:text-[#F5F8FF] hover:bg-[#102440]/80'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{t.nav[id]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Bottom Telemetry Card over Full-Height Truck Photo */}
      <div className="p-4 border-t border-[#243F60]/60">
        <div className="p-3 rounded-lg bg-[#0B1B32]/75 backdrop-blur-md border border-[#243F60]/80 text-xs text-[#D7E3FC] flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="font-semibold text-[#F5F8FF] truncate">{t.sidebarStatusTitle}</p>
            <p className="text-[10px] text-[#9BAFC8] mt-0.5 truncate">{t.sidebarStatusSub}</p>
          </div>
          <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00C875] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00C875]" />
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex overflow-hidden bg-[#071426] text-[#F5F8FF]">
      {/* Desktop Fixed Full-Height Sidebar with Truck Background */}
      <aside className="hidden lg:flex w-64 xl:w-[272px] flex-shrink-0 border-r border-[#243F60] flex-col justify-between relative z-20 overflow-hidden fura-sidebar-bg">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#071426]/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] h-full border-r border-[#243F60] fura-sidebar-bg z-10">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#071426]">
        {/* Top Header */}
        <header className="h-16 px-4 lg:px-6 border-b border-[#243F60] bg-[#0B1B32]/85 backdrop-blur-md flex items-center justify-between gap-3 z-10 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-[#102440] border border-[#243F60] text-[#F5F8FF]"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-between w-full max-w-md bg-[#071426] hover:border-[#0788F9] text-[#9BAFC8] text-xs rounded-lg px-3.5 py-2 border border-[#243F60] transition-colors"
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{t.header.searchPlaceholder}</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold bg-[#102440] text-[#9BAFC8] px-1.5 py-0.5 rounded border border-[#243F60] ml-2">
                Ctrl + K
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Instant UZ / RU Switcher */}
            <div className="flex items-center bg-[#071426] border border-[#243F60] rounded-lg p-0.5 text-xs font-bold">
              <button
                onClick={() => switchLanguage('uz')}
                className={`px-2.5 py-1 rounded-md transition ${
                  settings.language === 'uz'
                    ? 'bg-[#0788F9] text-white'
                    : 'text-[#9BAFC8] hover:text-white'
                }`}
              >
                UZ
              </button>
              <button
                onClick={() => switchLanguage('ru')}
                className={`px-2.5 py-1 rounded-md transition ${
                  settings.language === 'ru'
                    ? 'bg-[#0788F9] text-white'
                    : 'text-[#9BAFC8] hover:text-white'
                }`}
              >
                RU
              </button>
            </div>

            {/* Today's Date Pill */}
            <div className="hidden md:flex items-center gap-2 bg-[#102440] border border-[#243F60] px-3 py-1.5 rounded-lg text-xs text-[#D7E3FC] tabular-nums">
              <Calendar className="w-3.5 h-3.5 text-[#0788F9]" />
              <span>{formatDate(new Date())}</span>
            </div>

            {/* Notifications */}
            <button
              onClick={() => setActivePage('calendar')}
              className="relative p-2 text-[#9BAFC8] hover:text-white bg-[#102440] rounded-lg border border-[#243F60] hover:border-[#0788F9] transition"
              title={t.header.notifications}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-[#0788F9] text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                •
              </span>
            </button>

            {/* User Profile Pill */}
            <button
              onClick={() => setActivePage('settings')}
              className="flex items-center gap-2 bg-[#102440] hover:bg-[#142B49] border border-[#243F60] px-2.5 py-1.5 rounded-lg transition"
            >
              <div className="w-7 h-7 rounded-full bg-[#0788F9] flex items-center justify-center text-white font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-[#F5F8FF] leading-none">
                  {settings.ownerName}
                </p>
                <p className="text-[10px] text-[#9BAFC8] mt-0.5 leading-none">
                  {settings.roleTitle}
                </p>
              </div>
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => dismissToast(toast.id)}
            className={`cursor-pointer px-4 py-3 rounded-xl border text-xs font-semibold shadow-lg backdrop-blur-md transition-all ${
              toast.type === 'error'
                ? 'bg-[#EF4444]/20 border-[#EF4444]/50 text-[#F5F8FF]'
                : toast.type === 'info'
                  ? 'bg-[#0788F9]/20 border-[#0788F9]/50 text-[#F5F8FF]'
                  : 'bg-[#00C875]/20 border-[#00C875]/50 text-[#F5F8FF]'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};
