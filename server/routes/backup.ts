import { Router } from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { prisma } from '../db.js';

const router = Router();
const BACKUPS_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'fura-backups')
  : path.resolve(process.cwd(), 'backups');

function ensureBackupsDir() {
  if (!fs.existsSync(BACKUPS_DIR)) {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  }
}

router.get('/', (_req, res) => {
  try {
    ensureBackupsDir();
    const files = fs
      .readdirSync(BACKUPS_DIR)
      .filter((f) => f.endsWith('.json'))
      .map((name) => {
        const full = path.join(BACKUPS_DIR, name);
        const stat = fs.statSync(full);
        return {
          name,
          sizeBytes: stat.size,
          createdAt: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    res.json(files);
  } catch (err) {
    console.error('GET /backup error:', err);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

router.post('/', async (_req, res) => {
  try {
    ensureBackupsDir();
    const [settings, drivers, vehicles, cargos, trips] = await Promise.all([
      prisma.applicationSettings.findMany(),
      prisma.driver.findMany(),
      prisma.vehicle.findMany(),
      prisma.cargo.findMany(),
      prisma.trip.findMany(),
    ]);

    const snapshot = {
      createdAt: new Date().toISOString(),
      settings,
      drivers,
      vehicles,
      cargos,
      trips,
    };

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `fura-backup-${stamp}.json`;
    const dest = path.join(BACKUPS_DIR, filename);

    fs.writeFileSync(dest, JSON.stringify(snapshot, null, 2), 'utf-8');
    const stat = fs.statSync(dest);

    res.status(201).json({
      name: filename,
      sizeBytes: stat.size,
      createdAt: stat.mtime.toISOString(),
    });
  } catch (err) {
    console.error('POST /backup error:', err);
    res.status(500).json({ error: 'Failed to create database backup' });
  }
});

router.post('/restore', async (req, res) => {
  try {
    ensureBackupsDir();
    const filename = path.basename(String(req.body.filename ?? ''));
    if (!filename || !filename.endsWith('.json')) {
      return res.status(400).json({ error: 'Invalid backup filename' });
    }

    const source = path.join(BACKUPS_DIR, filename);
    if (!fs.existsSync(source)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    const raw = fs.readFileSync(source, 'utf-8');
    const snapshot = JSON.parse(raw);

    await prisma.$transaction(async (tx) => {
      await tx.trip.deleteMany();
      await tx.cargo.deleteMany();
      await tx.vehicle.deleteMany();
      await tx.driver.deleteMany();
      await tx.applicationSettings.deleteMany();

      if (Array.isArray(snapshot.settings) && snapshot.settings.length > 0) {
        await tx.applicationSettings.createMany({ data: snapshot.settings });
      }
      if (Array.isArray(snapshot.drivers) && snapshot.drivers.length > 0) {
        await tx.driver.createMany({ data: snapshot.drivers });
      }
      if (Array.isArray(snapshot.vehicles) && snapshot.vehicles.length > 0) {
        await tx.vehicle.createMany({ data: snapshot.vehicles });
      }
      if (Array.isArray(snapshot.cargos) && snapshot.cargos.length > 0) {
        await tx.cargo.createMany({ data: snapshot.cargos });
      }
      if (Array.isArray(snapshot.trips) && snapshot.trips.length > 0) {
        await tx.trip.createMany({ data: snapshot.trips });
      }
    });

    res.json({ success: true, restoredFrom: filename });
  } catch (err) {
    console.error('POST /backup/restore error:', err);
    res.status(500).json({ error: 'Failed to restore database backup' });
  }
});

export default router;
