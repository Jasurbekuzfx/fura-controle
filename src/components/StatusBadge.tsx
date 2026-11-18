import React from 'react';
import { useApp } from '../context/AppContext';

const STATUS_STYLE: Record<
  string,
  { bg: string; border: string; text: string; dot: string; pulse?: boolean }
> = {
  ON_ROUTE: {
    bg: 'bg-[#0788F9]/15',
    border: 'border-[#0788F9]/30',
    text: 'text-[#0788F9]',
    dot: 'bg-[#0788F9]',
    pulse: true,
  },
  IN_TRANSIT: {
    bg: 'bg-[#0788F9]/15',
    border: 'border-[#0788F9]/30',
    text: 'text-[#0788F9]',
    dot: 'bg-[#0788F9]',
    pulse: true,
  },
  AVAILABLE: {
    bg: 'bg-[#00C875]/15',
    border: 'border-[#00C875]/30',
    text: 'text-[#00C875]',
    dot: 'bg-[#00C875]',
  },
  DELIVERED: {
    bg: 'bg-[#00C875]/15',
    border: 'border-[#00C875]/30',
    text: 'text-[#00C875]',
    dot: 'bg-[#00C875]',
  },
  COMPLETED: {
    bg: 'bg-[#00C875]/15',
    border: 'border-[#00C875]/30',
    text: 'text-[#00C875]',
    dot: 'bg-[#00C875]',
  },
  LOADING: {
    bg: 'bg-[#FFA526]/15',
    border: 'border-[#FFA526]/30',
    text: 'text-[#FFA526]',
    dot: 'bg-[#FFA526]',
  },
  PENDING: {
    bg: 'bg-[#FFA526]/15',
    border: 'border-[#FFA526]/30',
    text: 'text-[#FFA526]',
    dot: 'bg-[#FFA526]',
  },
  PLANNED: {
    bg: 'bg-[#FFA526]/15',
    border: 'border-[#FFA526]/30',
    text: 'text-[#FFA526]',
    dot: 'bg-[#FFA526]',
  },
  BUSY: {
    bg: 'bg-[#8055F5]/15',
    border: 'border-[#8055F5]/30',
    text: 'text-[#8055F5]',
    dot: 'bg-[#8055F5]',
  },
  RESTING: {
    bg: 'bg-[#8055F5]/15',
    border: 'border-[#8055F5]/30',
    text: 'text-[#8055F5]',
    dot: 'bg-[#8055F5]',
  },
  UNDER_REPAIR: {
    bg: 'bg-[#EF4444]/15',
    border: 'border-[#EF4444]/30',
    text: 'text-[#EF4444]',
    dot: 'bg-[#EF4444]',
  },
  CANCELLED: {
    bg: 'bg-[#EF4444]/15',
    border: 'border-[#EF4444]/30',
    text: 'text-[#EF4444]',
    dot: 'bg-[#EF4444]',
  },
  ON_LEAVE: {
    bg: 'bg-[#9BAFC8]/15',
    border: 'border-[#9BAFC8]/30',
    text: 'text-[#9BAFC8]',
    dot: 'bg-[#9BAFC8]',
  },
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useApp();
  const style = STATUS_STYLE[status] ?? {
    bg: 'bg-[#9BAFC8]/15',
    border: 'border-[#9BAFC8]/30',
    text: 'text-[#9BAFC8]',
    dot: 'bg-[#9BAFC8]',
  };
  const label = (t.statuses as Record<string, string>)[status] ?? status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${style.bg} ${style.border} ${style.text} whitespace-nowrap`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {style.pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${style.dot}`} />
      </span>
      {label}
    </span>
  );
};
