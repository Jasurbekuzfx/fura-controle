import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, FileSpreadsheet, FileText, Navigation, Weight } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api } from '../api/client';
import { useApp } from '../context/AppContext';
import { KpiCard } from '../components/KpiCard';

export const ReportsPage: React.FC = () => {
  const { t, notify } = useApp();
  const [data, setData] = useState<Awaited<ReturnType<typeof api.reports.get>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.reports
      .get()
      .then(setData)
      .catch(() => notify('Error loading reports', 'error'))
      .finally(() => setLoading(false));
  }, [notify]);

  const triggerDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      notify('Export failed', 'error');
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-[#9BAFC8] text-sm">
        {t.common.loading}
      </div>
    );
  }

  const { summary, monthlyStats } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-extrabold text-[#F5F8FF]">{t.reports.title}</h2>
          <p className="text-xs text-[#9BAFC8] mt-0.5">{t.reports.subtitle}</p>
        </div>

        {/* Real Downloadable File Exports */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => triggerDownload('/api/reports/export/pdf', 'fura-control-report.pdf')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/40 hover:bg-[#EF4444]/25 text-[#F5F8FF] text-xs font-bold transition"
          >
            <FileText className="w-4 h-4 text-[#EF4444]" />
            {t.reports.exportPdf}
          </button>
          <button
            onClick={() => triggerDownload('/api/reports/export/xlsx', 'fura-control-report.xlsx')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#00C875]/15 border border-[#00C875]/40 hover:bg-[#00C875]/25 text-[#F5F8FF] text-xs font-bold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#00C875]" />
            {t.reports.exportXlsx}
          </button>
          <button
            onClick={() => triggerDownload('/api/reports/export/csv', 'fura-control-report.csv')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0788F9]/15 border border-[#0788F9]/40 hover:bg-[#0788F9]/25 text-[#F5F8FF] text-xs font-bold transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#0788F9]" />
            {t.reports.exportCsv}
          </button>
        </div>
      </div>

      {/* Real DB KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title={t.reports.completedTrips}
          value={summary.completedTripsCount}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="green"
        />
        <KpiCard
          title={t.reports.totalWeight}
          value={`${summary.totalCargoWeightTons} ${t.common.tons}`}
          icon={<Weight className="w-5 h-5" />}
          accentColor="orange"
        />
        <KpiCard
          title={t.reports.totalDistance}
          value={`${summary.totalDistanceKm.toLocaleString()} ${t.common.km}`}
          icon={<Navigation className="w-5 h-5" />}
          accentColor="blue"
        />
        <KpiCard
          title={t.reports.utilization}
          value={`${summary.vehicleUtilizationPct}%`}
          icon={<BarChart3 className="w-5 h-5" />}
          accentColor="purple"
        />
      </div>

      {/* Monthly Trip Statistics Chart */}
      <div className="fura-card p-5">
        <h3 className="text-base font-bold text-[#F5F8FF] mb-4">{t.reports.monthlyStats}</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243F60" />
              <XAxis dataKey="month" stroke="#9BAFC8" fontSize={12} />
              <YAxis stroke="#9BAFC8" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B1B32',
                  borderColor: '#243F60',
                  borderRadius: '8px',
                  color: '#F5F8FF',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Bar
                dataKey="completed"
                name={t.statuses.COMPLETED}
                fill="#00C875"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="active"
                name={t.dashboard.activeTrips}
                fill="#0788F9"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
