import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';

import dashboardRoutes from './routes/dashboard.js';
import vehicleRoutes from './routes/vehicles.js';
import driverRoutes from './routes/drivers.js';
import cargoRoutes from './routes/cargos.js';
import tripRoutes from './routes/trips.js';
import calendarRoutes from './routes/calendar.js';
import reportRoutes from './routes/reports.js';
import settingsRoutes from './routes/settings.js';
import backupRoutes from './routes/backup.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'FURA CONTROL' });
});

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/cargos', cargoRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/backup', backupRoutes);

// Global search endpoint
import { prisma } from './db.js';
app.get('/api/search', async (req, res) => {
  try {
    const q = String(req.query.q ?? '').trim().toLowerCase();
    if (!q) return res.json({ vehicles: [], drivers: [], cargos: [], trips: [] });

    const [vehicles, drivers, cargos, trips] = await Promise.all([
      prisma.vehicle.findMany({ where: { isDeleted: false }, take: 50 }),
      prisma.driver.findMany({ take: 50 }),
      prisma.cargo.findMany({ take: 50 }),
      prisma.trip.findMany({
        include: { vehicle: { select: { plateNumber: true } }, driver: { select: { fullName: true } } },
        take: 50,
      }),
    ]);

    res.json({
      vehicles: vehicles
        .filter(
          (v) =>
            v.plateNumber.toLowerCase().includes(q) ||
            v.model.toLowerCase().includes(q) ||
            v.currentLocation.toLowerCase().includes(q)
        )
        .slice(0, 5),
      drivers: drivers
        .filter(
          (d) =>
            d.fullName.toLowerCase().includes(q) ||
            d.phone.toLowerCase().includes(q) ||
            d.licenseNumber.toLowerCase().includes(q)
        )
        .slice(0, 5),
      cargos: cargos
        .filter(
          (c) =>
            c.code.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q) ||
            c.customerName.toLowerCase().includes(q)
        )
        .slice(0, 5),
      trips: trips
        .filter(
          (t) =>
            t.tripCode.toLowerCase().includes(q) ||
            t.origin.toLowerCase().includes(q) ||
            t.destination.toLowerCase().includes(q) ||
            t.vehicle.plateNumber.toLowerCase().includes(q)
        )
        .slice(0, 5),
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Serve built frontend in production
const distDir = path.resolve(process.cwd(), 'dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`FURA CONTROL API server running on http://localhost:${PORT}`);
});
