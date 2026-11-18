import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  maxWidthClass = 'max-w-xl',
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#071426]/80 backdrop-blur-sm">
      <div
        className={`w-full ${maxWidthClass} bg-[#102440] border border-[#243F60] rounded-2xl shadow-[0_20px_48px_rgba(0,0,0,0.65)] overflow-hidden max-h-[90vh] flex flex-col`}
      >
        <div className="h-0.5 w-full bg-[#0788F9]" />
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#243F60]">
          <div>
            <h3 className="text-lg font-bold text-[#F5F8FF]">{title}</h3>
            {subtitle && <p className="text-xs text-[#9BAFC8] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9BAFC8] hover:text-[#F5F8FF] hover:bg-[#142B49] transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
