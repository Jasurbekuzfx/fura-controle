import { Router } from 'express';
import { prisma } from '../db.js';
import {
  CARGO_STATUSES,
  isEnumValue,
  parseDateInput,
  parseNonNegativeNumber,
  parsePositiveInt,
} from '../utils/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const search = String(req.query.search ?? '').trim().toLowerCase();
    const status = String(req.query.status ?? '').trim();
    const cargoType = String(req.query.cargoType ?? '').trim();

    const cargos = await prisma.cargo.findMany({
      where: {
        ...(status && status !== 'ALL' ? { status } : {}),
        ...(cargoType && cargoType !== 'ALL' ? { cargoType } : {}),
      },
      include: {
        vehicle: { select: { id: true, plateNumber: true, model: true } },
        driver: { select: { id: true, fullName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const filtered = search
      ? cargos.filter(
          (c) =>
            c.code.toLowerCase().includes(search) ||
            c.name.toLowerCase().includes(search) ||
            c.customerName.toLowerCase().includes(search) ||
            c.loadingAddress.toLowerCase().includes(search) ||
            c.destinationAddress.toLowerCase().includes(search)
        )
      : cargos;

    res.json(filtered);
  } catch (err) {
    console.error('GET /cargos error:', err);
    res.status(500).json({ error: 'Failed to fetch cargos' });
  }
});

router.post('/', async (req, res) => {
  try {
    const name = String(req.body.name ?? '').trim();
    const cargoType = String(req.body.cargoType ?? 'Sanoat mollari').trim();
    const loadingAddress = String(req.body.loadingAddress ?? '').trim();
    const destinationAddress = String(req.body.destinationAddress ?? '').trim();
    const customerName = String(req.body.customerName ?? '').trim();
    const weightTons = parseNonNegativeNumber(req.body.weightTons, 20);
    const volumeM3 = parseNonNegativeNumber(req.body.volumeM3, 82);
    const price = parseNonNegativeNumber(req.body.price, 0);
    const loadingDate = parseDateInput(req.body.loadingDate) ?? new Date();
    const unloadingDate = parseDateInput(req.body.unloadingDate) ?? new Date(Date.now() + 86400000 * 3);
    const status = String(req.body.status ?? 'PENDING').trim();

    if (!name || !loadingAddress || !destinationAddress || !customerName) {
      return res.status(400).json({ error: 'Name, addresses, and customer name are required' });
    }
    if (!isEnumValue(status, CARGO_STATUSES)) {
      return res.status(400).json({ error: 'Invalid cargo status' });
    }
    if (Number.isNaN(weightTons) || Number.isNaN(volumeM3) || Number.isNaN(price)) {
      return res.status(400).json({ error: 'Invalid numeric fields' });
    }

    const vehicleId = req.body.vehicleId ? parsePositiveInt(req.body.vehicleId) : null;
    const driverId = req.body.driverId ? parsePositiveInt(req.body.driverId) : null;

    const count = await prisma.cargo.count();
    const code =
      String(req.body.code ?? '').trim() || `#YK-${8820 + count + Math.floor(Math.random() * 90)}`;

    const created = await prisma.cargo.create({
      data: {
        code,
        name,
        cargoType,
        loadingAddress,
        destinationAddress,
        weightTons,
        volumeM3,
        loadingDate,
        unloadingDate,
        price,
        customerName,
        customerPhone: String(req.body.customerPhone ?? '').trim(),
        vehicleId,
        driverId,
        status,
        notes: String(req.body.notes ?? '').trim(),
      },
      include: {
        vehicle: { select: { id: true, plateNumber: true, model: true } },
        driver: { select: { id: true, fullName: true, phone: true } },
      },
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('POST /cargos error:', err);
    res.status(500).json({ error: 'Failed to create cargo' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid cargo ID' });

    const existing = await prisma.cargo.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Cargo not found' });

    const status = req.body.status ?? existing.status;
    if (!isEnumValue(status, CARGO_STATUSES)) {
      return res.status(400).json({ error: 'Invalid cargo status' });
    }

    const loadingDate = req.body.loadingDate
      ? parseDateInput(req.body.loadingDate) ?? existing.loadingDate
      : existing.loadingDate;
    const unloadingDate = req.body.unloadingDate
      ? parseDateInput(req.body.unloadingDate) ?? existing.unloadingDate
      : existing.unloadingDate;

    const updated = await prisma.cargo.update({
      where: { id },
      data: {
        name: req.body.name !== undefined ? String(req.body.name).trim() : existing.name,
        cargoType:
          req.body.cargoType !== undefined ? String(req.body.cargoType).trim() : existing.cargoType,
        loadingAddress:
          req.body.loadingAddress !== undefined
            ? String(req.body.loadingAddress).trim()
            : existing.loadingAddress,
        destinationAddress:
          req.body.destinationAddress !== undefined
            ? String(req.body.destinationAddress).trim()
            : existing.destinationAddress,
        weightTons:
          req.body.weightTons !== undefined
            ? parseNonNegativeNumber(req.body.weightTons, existing.weightTons)
            : existing.weightTons,
        volumeM3:
          req.body.volumeM3 !== undefined
            ? parseNonNegativeNumber(req.body.volumeM3, existing.volumeM3)
            : existing.volumeM3,
        price:
          req.body.price !== undefined
            ? parseNonNegativeNumber(req.body.price, existing.price)
            : existing.price,
        loadingDate,
        unloadingDate,
        customerName:
          req.body.customerName !== undefined
            ? String(req.body.customerName).trim()
            : existing.customerName,
        customerPhone:
          req.body.customerPhone !== undefined
            ? String(req.body.customerPhone).trim()
            : existing.customerPhone,
        vehicleId:
          req.body.vehicleId !== undefined
            ? req.body.vehicleId
              ? parsePositiveInt(req.body.vehicleId)
              : null
            : existing.vehicleId,
        driverId:
          req.body.driverId !== undefined
            ? req.body.driverId
              ? parsePositiveInt(req.body.driverId)
              : null
            : existing.driverId,
        status,
        notes: req.body.notes !== undefined ? String(req.body.notes).trim() : existing.notes,
      },
      include: {
        vehicle: { select: { id: true, plateNumber: true, model: true } },
        driver: { select: { id: true, fullName: true, phone: true } },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('PUT /cargos/:id error:', err);
    res.status(500).json({ error: 'Failed to update cargo' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid cargo ID' });

    await prisma.cargo.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /cargos/:id error:', err);
    res.status(500).json({ error: 'Failed to delete cargo' });
  }
});

export default router;
