import React from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
}

const ACCENT_MAP = {
  blue: 'text-[#0788F9] bg-[#0788F9]/15 border-[#0788F9]/25',
  green: 'text-[#00C875] bg-[#00C875]/15 border-[#00C875]/25',
  orange: 'text-[#FFA526] bg-[#FFA526]/15 border-[#FFA526]/25',
  purple: 'text-[#8055F5] bg-[#8055F5]/15 border-[#8055F5]/25',
  red: 'text-[#EF4444] bg-[#EF4444]/15 border-[#EF4444]/25',
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = 'blue',
}) => {
  return (
    <div className="fura-card relative overflow-hidden p-5 hover:bg-[#142B49] transition-colors">
      <div className="flex items-start gap-3.5 relative z-10">
        <div
          className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${ACCENT_MAP[accentColor]}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#9BAFC8] truncate">
            {title}
          </p>
          <p className="text-2xl font-extrabold text-[#F5F8FF] tabular-nums mt-1 leading-none">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[#9BAFC8] mt-1.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Stitch Watermark Truck Silhouette */}
      <svg
        className="w-24 h-16 absolute -right-2 -bottom-2 text-[#F5F8FF]/[0.05] pointer-events-none"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
      </svg>
    </div>
  );
};
