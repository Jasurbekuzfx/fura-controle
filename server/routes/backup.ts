import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../db.js';

const router = Router();
const BACKUPS_DIR = path.resolve(process.cwd(), 'backups');

function getDbFilePath(): string {
  const prismaDb = path.resolve(process.cwd(), 'prisma', 'dev.db');
  if (fs.existsSync(prismaDb)) return prismaDb;
  const rootDb = path.resolve(process.cwd(), 'dev.db');
  return rootDb;
}

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
      .filter((f) => f.endsWith('.db'))
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
    const dbPath = getDbFilePath();
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Database file not found' });
    }

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `fura-backup-${stamp}.db`;
    const dest = path.join(BACKUPS_DIR, filename);

    // Flush WAL if SQLite is in WAL mode
    await prisma.$queryRawUnsafe('PRAGMA wal_checkpoint(TRUNCATE);').catch(() => {});
    fs.copyFileSync(dbPath, dest);

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
    if (!filename || !filename.endsWith('.db')) {
      return res.status(400).json({ error: 'Invalid backup filename' });
    }

    const source = path.join(BACKUPS_DIR, filename);
    if (!fs.existsSync(source)) {
      return res.status(404).json({ error: 'Backup file not found' });
    }

    const dbPath = getDbFilePath();
    // Never overwrite the only state without saving a pre-restore safety snapshot
    if (fs.existsSync(dbPath)) {
      const safetyStamp = new Date().toISOString().replace(/[:.]/g, '-');
      const safetyName = `pre-restore-${safetyStamp}.db`;
      fs.copyFileSync(dbPath, path.join(BACKUPS_DIR, safetyName));
    }

    await prisma.$disconnect();
    fs.copyFileSync(source, dbPath);
    await prisma.$connect();

    res.json({ success: true, restoredFrom: filename });
  } catch (err) {
    console.error('POST /backup/restore error:', err);
    res.status(500).json({ error: 'Failed to restore database backup' });
  }
});

export default router;
