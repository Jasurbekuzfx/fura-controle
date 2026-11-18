import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    let settings = await prisma.applicationSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.applicationSettings.create({ data: { id: 1 } });
    }
    res.json(settings);
  } catch (err) {
    console.error('GET /settings error:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/', async (req, res) => {
  try {
    const language = req.body.language === 'ru' ? 'ru' : 'uz';
    const currency = ['USD', 'UZS', 'RUB'].includes(req.body.currency)
      ? req.body.currency
      : 'USD';
    const dateFormat = ['DD.MM.YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY'].includes(req.body.dateFormat)
      ? req.body.dateFormat
      : 'DD.MM.YYYY';

    const updated = await prisma.applicationSettings.upsert({
      where: { id: 1 },
      update: {
        ownerName: req.body.ownerName !== undefined ? String(req.body.ownerName).trim() : undefined,
        companyName:
          req.body.companyName !== undefined ? String(req.body.companyName).trim() : undefined,
        roleTitle: req.body.roleTitle !== undefined ? String(req.body.roleTitle).trim() : undefined,
        phone: req.body.phone !== undefined ? String(req.body.phone).trim() : undefined,
        email: req.body.email !== undefined ? String(req.body.email).trim() : undefined,
        language,
        dateFormat,
        currency,
        sidebarCompact:
          req.body.sidebarCompact !== undefined ? Boolean(req.body.sidebarCompact) : undefined,
        showSimulatedGps:
          req.body.showSimulatedGps !== undefined ? Boolean(req.body.showSimulatedGps) : undefined,
      },
      create: {
        id: 1,
        ownerName: String(req.body.ownerName ?? 'Jasurbek').trim(),
        companyName: String(req.body.companyName ?? 'FURA CONTROL').trim(),
        roleTitle: String(req.body.roleTitle ?? 'Bosh dispetcher').trim(),
        phone: String(req.body.phone ?? '+998 90 123 45 67').trim(),
        email: String(req.body.email ?? 'dispatch@furacontrol.uz').trim(),
        language,
        dateFormat,
        currency,
        sidebarCompact: Boolean(req.body.sidebarCompact ?? false),
        showSimulatedGps: Boolean(req.body.showSimulatedGps ?? true),
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('PUT /settings error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
