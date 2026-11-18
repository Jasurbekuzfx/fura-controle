import { Router } from 'express';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { prisma } from '../db.js';

const router = Router();

async function buildReportData() {
  const [trips, vehicles, cargos] = await Promise.all([
    prisma.trip.findMany({
      include: {
        vehicle: { select: { plateNumber: true, model: true } },
        driver: { select: { fullName: true } },
        cargo: { select: { name: true, weightTons: true } },
      },
      orderBy: { loadingDate: 'desc' },
    }),
    prisma.vehicle.findMany({ where: { isDeleted: false } }),
    prisma.cargo.findMany(),
  ]);

  const completedTrips = trips.filter((t) => t.status === 'COMPLETED');
  const activeTrips = trips.filter((t) => ['PLANNED', 'LOADING', 'ON_ROUTE'].includes(t.status));
  const totalDistanceKm = trips.reduce((sum, t) => sum + (t.distanceKm || 0), 0);
  const completedDistanceKm = completedTrips.reduce((sum, t) => sum + (t.distanceKm || 0), 0);
  const totalRevenue = trips
    .filter((t) => t.status !== 'CANCELLED')
    .reduce((sum, t) => sum + (t.freightPrice || 0), 0);
  const totalCargoWeightTons = cargos
    .filter((c) => c.status !== 'CANCELLED')
    .reduce((sum, c) => sum + (c.weightTons || 0), 0);

  const busyOrRouteCount = vehicles.filter((v) =>
    ['ON_ROUTE', 'LOADING', 'BUSY'].includes(v.status)
  ).length;
  const vehicleUtilizationPct =
    vehicles.length > 0 ? Math.round((busyOrRouteCount / vehicles.length) * 100) : 0;

  // Group monthly trip stats
  const monthMap = new Map<
    string,
    { month: string; completed: number; active: number; revenue: number; distanceKm: number }
  >();
  for (const t of trips) {
    const key = t.loadingDate.toISOString().slice(0, 7); // YYYY-MM
    const entry = monthMap.get(key) ?? {
      month: key,
      completed: 0,
      active: 0,
      revenue: 0,
      distanceKm: 0,
    };
    if (t.status === 'COMPLETED') entry.completed += 1;
    else if (t.status !== 'CANCELLED') entry.active += 1;
    if (t.status !== 'CANCELLED') {
      entry.revenue += t.freightPrice || 0;
      entry.distanceKm += t.distanceKm || 0;
    }
    monthMap.set(key, entry);
  }

  const monthlyStats = Array.from(monthMap.values()).sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  return {
    summary: {
      completedTripsCount: completedTrips.length,
      activeTripsCount: activeTrips.length,
      totalTripsCount: trips.length,
      totalCargoWeightTons: Number(totalCargoWeightTons.toFixed(1)),
      totalDistanceKm: Math.round(totalDistanceKm),
      completedDistanceKm: Math.round(completedDistanceKm),
      totalRevenue: Math.round(totalRevenue),
      vehicleUtilizationPct,
      totalVehicles: vehicles.length,
    },
    monthlyStats,
    trips,
  };
}

router.get('/', async (_req, res) => {
  try {
    const data = await buildReportData();
    res.json(data);
  } catch (err) {
    console.error('GET /reports error:', err);
    res.status(500).json({ error: 'Failed to generate report data' });
  }
});

router.get('/export/xlsx', async (_req, res) => {
  try {
    const { trips, summary } = await buildReportData();

    const rows = trips.map((t) => ({
      'Reys ID': t.tripCode,
      Fura: `${t.vehicle.plateNumber} (${t.vehicle.model})`,
      Haydovchi: t.driver.fullName,
      Yuk: t.cargo?.name ?? '—',
      "Yo'nalish": `${t.origin} -> ${t.destination}`,
      'Yuklash sanasi': t.loadingDate.toISOString().split('T')[0],
      'Tushirish sanasi': t.unloadingDate.toISOString().split('T')[0],
      'Masofa (km)': t.distanceKm,
      'Narxi ($)': t.freightPrice,
      Holati: t.status,
    }));

    const summaryRows = [
      { "Ko'rsatkich": 'Tugallangan reyslar', Qiymat: summary.completedTripsCount },
      { "Ko'rsatkich": 'Faol reyslar', Qiymat: summary.activeTripsCount },
      { "Ko'rsatkich": "Jami yuk og'irligi (tonna)", Qiymat: summary.totalCargoWeightTons },
      { "Ko'rsatkich": 'Jami masofa (km)', Qiymat: summary.totalDistanceKm },
      { "Ko'rsatkich": 'Jami tushum ($)', Qiymat: summary.totalRevenue },
      { "Ko'rsatkich": 'Avtopark bandligi (%)', Qiymat: summary.vehicleUtilizationPct },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'Umumiy');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Reyslar');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="fura-control-report.xlsx"');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.send(buf);
  } catch (err) {
    console.error('Export XLSX error:', err);
    res.status(500).json({ error: 'Failed to export XLSX' });
  }
});

router.get('/export/csv', async (_req, res) => {
  try {
    const { trips } = await buildReportData();

    const rows = trips.map((t) => ({
      TripCode: t.tripCode,
      Vehicle: t.vehicle.plateNumber,
      Driver: t.driver.fullName,
      Cargo: t.cargo?.name ?? '-',
      Origin: t.origin,
      Destination: t.destination,
      LoadingDate: t.loadingDate.toISOString().split('T')[0],
      UnloadingDate: t.unloadingDate.toISOString().split('T')[0],
      DistanceKm: t.distanceKm,
      FreightPrice: t.freightPrice,
      Status: t.status,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);

    res.setHeader('Content-Disposition', 'attachment; filename="fura-control-report.csv"');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.send('\uFEFF' + csv);
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

router.get('/export/pdf', async (_req, res) => {
  try {
    const { trips, summary } = await buildReportData();

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Disposition', 'attachment; filename="fura-control-report.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(20).fillColor('#071426').text('FURA CONTROL — Fleet & Logistics Report');
    doc
      .fontSize(10)
      .fillColor('#475569')
      .text(`Generated: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`);
    doc.moveDown();

    doc.fontSize(13).fillColor('#071426').text('Executive Summary');
    doc.moveDown(0.4);
    doc.fontSize(10).fillColor('#1e293b');
    doc.text(`Completed Trips: ${summary.completedTripsCount}`);
    doc.text(`Active Trips: ${summary.activeTripsCount}`);
    doc.text(`Total Cargo Weight: ${summary.totalCargoWeightTons} tons`);
    doc.text(`Total Distance: ${summary.totalDistanceKm} km`);
    doc.text(`Total Revenue: $${summary.totalRevenue}`);
    doc.text(`Fleet Utilization: ${summary.vehicleUtilizationPct}%`);
    doc.moveDown();

    doc.fontSize(13).fillColor('#071426').text('Trips Breakdown');
    doc.moveDown(0.5);

    for (const t of trips.slice(0, 30)) {
      doc
        .fontSize(9.5)
        .fillColor('#0f172a')
        .text(
          `${t.tripCode} | ${t.vehicle.plateNumber} | ${t.driver.fullName} | ${t.origin} -> ${t.destination}`
        );
      doc
        .fontSize(8.5)
        .fillColor('#475569')
        .text(
          `   Status: ${t.status} | Distance: ${t.distanceKm} km | Price: $${t.freightPrice} | Dates: ${t.loadingDate.toISOString().split('T')[0]} to ${t.unloadingDate.toISOString().split('T')[0]}`
        );
      doc.moveDown(0.35);
    }

    doc.end();
  } catch (err) {
    console.error('Export PDF error:', err);
    res.status(500).json({ error: 'Failed to export PDF' });
  }
});

export default router;
