import { Router } from 'express';
import * as XLSX from 'xlsx';
import { prisma } from '../db.js';
import {
  DRIVER_STATUSES,
  isEnumValue,
  parseNonNegativeNumber,
  parsePositiveInt,
} from '../utils/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const search = String(req.query.search ?? '').trim().toLowerCase();
    const category = String(req.query.category ?? '').trim().toUpperCase();
    const status = String(req.query.status ?? '').trim();

    const drivers = await prisma.driver.findMany({
      where: {
        ...(status && status !== 'ALL' ? { status } : {}),
      },
      include: {
        vehicle: {
          where: { isDeleted: false },
          select: { id: true, plateNumber: true, model: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const filtered = drivers.filter((d) => {
      const matchesSearch =
        !search ||
        d.fullName.toLowerCase().includes(search) ||
        d.phone.toLowerCase().includes(search) ||
        d.licenseNumber.toLowerCase().includes(search) ||
        (d.vehicle?.plateNumber.toLowerCase().includes(search) ?? false);

      const matchesCategory =
        !category ||
        category === 'ALL' ||
        d.licenseCategories
          .split(',')
          .map((c) => c.trim().toUpperCase())
          .includes(category);

      return matchesSearch && matchesCategory;
    });

    res.json(filtered);
  } catch (err) {
    console.error('GET /drivers error:', err);
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});

router.get('/export/xlsx', async (_req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      include: { vehicle: { where: { isDeleted: false } } },
      orderBy: { createdAt: 'desc' },
    });

    const rows = drivers.map((d) => ({
      ID: d.id,
      'F.I.Sh': d.fullName,
      Telefon: d.phone,
      'Guvohnoma raqami': d.licenseNumber,
      Toifalar: d.licenseCategories,
      'Tajriba (yil)': d.experienceYears,
      'Biriktirilgan fura': d.vehicle ? `${d.vehicle.plateNumber} (${d.vehicle.model})` : 'Yo‘q',
      Holati: d.status,
      Izoh: d.notes,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Haydovchilar');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="fura-control-drivers.xlsx"'
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.send(buf);
  } catch (err) {
    console.error('Export drivers error:', err);
    res.status(500).json({ error: 'Failed to export drivers' });
  }
});

router.post('/', async (req, res) => {
  try {
    const fullName = String(req.body.fullName ?? '').trim();
    const phone = String(req.body.phone ?? '').trim();
    const licenseNumber = String(req.body.licenseNumber ?? '').trim().toUpperCase();
    const licenseCategories = String(req.body.licenseCategories ?? 'B,C,E')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter((s) => ['B', 'C', 'D', 'E'].includes(s))
      .join(',');
    const experienceYears = Math.round(parseNonNegativeNumber(req.body.experienceYears, 1));
    const status = String(req.body.status ?? 'AVAILABLE').trim();
    const vehicleId = req.body.vehicleId ? parsePositiveInt(req.body.vehicleId) : null;

    if (!fullName || !phone || !licenseNumber) {
      return res.status(400).json({ error: 'Full name, phone, and license number are required' });
    }
    if (!isEnumValue(status, DRIVER_STATUSES)) {
      return res.status(400).json({ error: 'Invalid driver status' });
    }

    const dup = await prisma.driver.findUnique({ where: { licenseNumber } });
    if (dup) {
      return res.status(409).json({ error: 'DUPLICATE_LICENSE', message: 'License number already exists' });
    }

    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle || vehicle.isDeleted) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      if (vehicle.driverId) {
        return res.status(409).json({
          error: 'VEHICLE_ALREADY_HAS_DRIVER',
          message: 'This vehicle already has an assigned driver',
        });
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const driver = await tx.driver.create({
        data: {
          fullName,
          phone,
          licenseNumber,
          licenseCategories: licenseCategories || 'C,E',
          experienceYears: Number.isNaN(experienceYears) ? 1 : experienceYears,
          status,
          notes: String(req.body.notes ?? '').trim(),
        },
      });
      if (vehicleId) {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { driverId: driver.id, phone: driver.phone },
        });
      }
      return tx.driver.findUnique({
        where: { id: driver.id },
        include: { vehicle: { where: { isDeleted: false } } },
      });
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('POST /drivers error:', err);
    res.status(500).json({ error: 'Failed to create driver' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid driver ID' });

    const existing = await prisma.driver.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Driver not found' });

    const fullName = req.body.fullName !== undefined ? String(req.body.fullName).trim() : existing.fullName;
    const phone = req.body.phone !== undefined ? String(req.body.phone).trim() : existing.phone;
    const licenseNumber = req.body.licenseNumber
      ? String(req.body.licenseNumber).trim().toUpperCase()
      : existing.licenseNumber;
    const status = req.body.status ?? existing.status;

    if (!fullName || !phone || !licenseNumber) {
      return res.status(400).json({ error: 'Full name, phone, and license number are required' });
    }
    if (!isEnumValue(status, DRIVER_STATUSES)) {
      return res.status(400).json({ error: 'Invalid driver status' });
    }

    if (licenseNumber !== existing.licenseNumber) {
      const dup = await prisma.driver.findUnique({ where: { licenseNumber } });
      if (dup) {
        return res.status(409).json({ error: 'DUPLICATE_LICENSE', message: 'License number already exists' });
      }
    }

    const licenseCategories =
      req.body.licenseCategories !== undefined
        ? String(req.body.licenseCategories)
            .split(',')
            .map((s) => s.trim().toUpperCase())
            .filter((s) => ['B', 'C', 'D', 'E'].includes(s))
            .join(',')
        : existing.licenseCategories;

    const experienceYears =
      req.body.experienceYears !== undefined
        ? Math.round(parseNonNegativeNumber(req.body.experienceYears, existing.experienceYears))
        : existing.experienceYears;

    const updated = await prisma.driver.update({
      where: { id },
      data: {
        fullName,
        phone,
        licenseNumber,
        licenseCategories: licenseCategories || existing.licenseCategories,
        experienceYears: Number.isNaN(experienceYears) ? existing.experienceYears : experienceYears,
        status,
        notes: req.body.notes !== undefined ? String(req.body.notes).trim() : existing.notes,
      },
      include: { vehicle: { where: { isDeleted: false } } },
    });

    res.json(updated);
  } catch (err) {
    console.error('PUT /drivers/:id error:', err);
    res.status(500).json({ error: 'Failed to update driver' });
  }
});

// Assign or unassign driver to a vehicle (enforcing 1-to-1 active assignment)
router.post('/:id/assign', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid driver ID' });

    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });

    const vehicleId = req.body.vehicleId ? parsePositiveInt(req.body.vehicleId) : null;

    await prisma.$transaction(async (tx) => {
      // Unassign driver from any currently assigned vehicle first
      await tx.vehicle.updateMany({
        where: { driverId: id },
        data: { driverId: null },
      });

      if (vehicleId) {
        const target = await tx.vehicle.findUnique({ where: { id: vehicleId } });
        if (!target || target.isDeleted) {
          throw new Error('VEHICLE_NOT_FOUND');
        }
        if (target.driverId && target.driverId !== id) {
          throw new Error('VEHICLE_ALREADY_HAS_DRIVER');
        }
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { driverId: id, phone: driver.phone },
        });
      }
    });

    const updated = await prisma.driver.findUnique({
      where: { id },
      include: { vehicle: { where: { isDeleted: false } } },
    });
    res.json(updated);
  } catch (err: any) {
    if (err?.message === 'VEHICLE_NOT_FOUND') {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    if (err?.message === 'VEHICLE_ALREADY_HAS_DRIVER') {
      return res.status(409).json({
        error: 'VEHICLE_ALREADY_HAS_DRIVER',
        message: 'This vehicle already has an assigned driver',
      });
    }
    console.error('POST /drivers/:id/assign error:', err);
    res.status(500).json({ error: 'Failed to assign driver' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid driver ID' });

    const tripCount = await prisma.trip.count({ where: { driverId: id } });
    if (tripCount > 0) {
      return res.status(409).json({
        error: 'DRIVER_HAS_TRIPS',
        message: 'Cannot delete a driver with trip history',
      });
    }

    await prisma.$transaction([
      prisma.vehicle.updateMany({ where: { driverId: id }, data: { driverId: null } }),
      prisma.driver.delete({ where: { id } }),
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /drivers/:id error:', err);
    res.status(500).json({ error: 'Failed to delete driver' });
  }
});

export default router;
