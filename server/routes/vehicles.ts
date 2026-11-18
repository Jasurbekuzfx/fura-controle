import { Router } from 'express';
import * as XLSX from 'xlsx';
import { prisma } from '../db.js';
import {
  VEHICLE_STATUSES,
  VEHICLE_TYPES,
  isEnumValue,
  normalizePlate,
  parseNonNegativeNumber,
  parsePositiveInt,
} from '../utils/validation.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const trash = req.query.trash === 'true';
    const search = String(req.query.search ?? '').trim().toLowerCase();
    const type = String(req.query.type ?? '').trim();
    const status = String(req.query.status ?? '').trim();

    const vehicles = await prisma.vehicle.findMany({
      where: {
        isDeleted: trash,
        ...(type && type !== 'ALL' ? { vehicleType: type } : {}),
        ...(status && status !== 'ALL' ? { status } : {}),
      },
      include: {
        driver: { select: { id: true, fullName: true, phone: true, licenseNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const filtered = search
      ? vehicles.filter(
          (v) =>
            v.plateNumber.toLowerCase().includes(search) ||
            v.model.toLowerCase().includes(search) ||
            v.currentLocation.toLowerCase().includes(search) ||
            v.destination.toLowerCase().includes(search) ||
            (v.driver?.fullName.toLowerCase().includes(search) ?? false)
        )
      : vehicles;

    res.json(filtered);
  } catch (err) {
    console.error('GET /vehicles error:', err);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

router.get('/export/xlsx', async (_req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { isDeleted: false },
      include: { driver: true },
      orderBy: { createdAt: 'desc' },
    });

    const rows = vehicles.map((v) => ({
      ID: v.id,
      'Davlat raqami': v.plateNumber,
      Model: v.model,
      Turi: v.vehicleType,
      Haydovchi: v.driver?.fullName ?? 'Biriktirilmagan',
      Telefon: v.phone || v.driver?.phone || '',
      'Sig‘im (tonna)': v.capacityTons,
      'Hajm (m3)': v.volumeM3,
      'Joriy joylashuv': v.currentLocation,
      Manzil: v.destination,
      Holati: v.status,
      Izoh: v.notes,
      'Yaratilgan sana': v.createdAt.toISOString().split('T')[0],
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Furalar');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="fura-control-vehicles.xlsx"'
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.send(buf);
  } catch (err) {
    console.error('Export vehicles error:', err);
    res.status(500).json({ error: 'Failed to export vehicles' });
  }
});

router.post('/', async (req, res) => {
  try {
    const rawPlate = String(req.body.plateNumber ?? '');
    const plateNumber = normalizePlate(rawPlate);
    const model = String(req.body.model ?? '').trim();
    const vehicleType = String(req.body.vehicleType ?? 'TENT').trim();
    const status = String(req.body.status ?? 'AVAILABLE').trim();
    const capacityTons = parseNonNegativeNumber(req.body.capacityTons, 22);
    const volumeM3 = parseNonNegativeNumber(req.body.volumeM3, 92);
    const driverId = req.body.driverId ? parsePositiveInt(req.body.driverId) : null;

    if (!plateNumber || !model) {
      return res.status(400).json({ error: 'Plate number and model are required' });
    }
    if (!isEnumValue(vehicleType, VEHICLE_TYPES)) {
      return res.status(400).json({ error: 'Invalid vehicle type' });
    }
    if (!isEnumValue(status, VEHICLE_STATUSES)) {
      return res.status(400).json({ error: 'Invalid vehicle status' });
    }
    if (Number.isNaN(capacityTons) || Number.isNaN(volumeM3)) {
      return res.status(400).json({ error: 'Invalid capacity or volume' });
    }

    const duplicate = await prisma.vehicle.findUnique({ where: { plateNumber } });
    if (duplicate) {
      return res.status(409).json({
        error: duplicate.isDeleted
          ? 'DUPLICATE_PLATE_TRASH'
          : 'DUPLICATE_PLATE',
        message: `Vehicle with plate ${plateNumber} already exists`,
      });
    }

    if (driverId) {
      const assigned = await prisma.vehicle.findFirst({
        where: { driverId, isDeleted: false },
      });
      if (assigned) {
        return res.status(409).json({
          error: 'DRIVER_ALREADY_ASSIGNED',
          message: 'This driver is already assigned to another active vehicle',
        });
      }
    }

    const created = await prisma.vehicle.create({
      data: {
        plateNumber,
        model,
        vehicleType,
        driverId,
        phone: String(req.body.phone ?? '').trim(),
        capacityTons,
        volumeM3,
        currentLocation: String(req.body.currentLocation ?? '').trim(),
        destination: String(req.body.destination ?? '').trim(),
        status,
        notes: String(req.body.notes ?? '').trim(),
      },
      include: { driver: true },
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('POST /vehicles error:', err);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid vehicle ID' });

    const existing = await prisma.vehicle.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Vehicle not found' });

    const plateNumber = req.body.plateNumber
      ? normalizePlate(String(req.body.plateNumber))
      : existing.plateNumber;
    const model = req.body.model !== undefined ? String(req.body.model).trim() : existing.model;
    const vehicleType = req.body.vehicleType ?? existing.vehicleType;
    const status = req.body.status ?? existing.status;

    if (!plateNumber || !model) {
      return res.status(400).json({ error: 'Plate number and model are required' });
    }
    if (!isEnumValue(vehicleType, VEHICLE_TYPES)) {
      return res.status(400).json({ error: 'Invalid vehicle type' });
    }
    if (!isEnumValue(status, VEHICLE_STATUSES)) {
      return res.status(400).json({ error: 'Invalid vehicle status' });
    }

    if (plateNumber !== existing.plateNumber) {
      const duplicate = await prisma.vehicle.findUnique({ where: { plateNumber } });
      if (duplicate) {
        return res.status(409).json({
          error: 'DUPLICATE_PLATE',
          message: `Vehicle with plate ${plateNumber} already exists`,
        });
      }
    }

    let driverId = existing.driverId;
    if (req.body.driverId !== undefined) {
      driverId = req.body.driverId ? parsePositiveInt(req.body.driverId) : null;
      if (driverId) {
        const assigned = await prisma.vehicle.findFirst({
          where: { driverId, isDeleted: false, id: { not: id } },
        });
        if (assigned) {
          return res.status(409).json({
            error: 'DRIVER_ALREADY_ASSIGNED',
            message: 'This driver is already assigned to another active vehicle',
          });
        }
      }
    }

    const capacityTons =
      req.body.capacityTons !== undefined
        ? parseNonNegativeNumber(req.body.capacityTons, existing.capacityTons)
        : existing.capacityTons;
    const volumeM3 =
      req.body.volumeM3 !== undefined
        ? parseNonNegativeNumber(req.body.volumeM3, existing.volumeM3)
        : existing.volumeM3;

    if (Number.isNaN(capacityTons) || Number.isNaN(volumeM3)) {
      return res.status(400).json({ error: 'Invalid capacity or volume' });
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: {
        plateNumber,
        model,
        vehicleType,
        driverId,
        phone: req.body.phone !== undefined ? String(req.body.phone).trim() : existing.phone,
        capacityTons,
        volumeM3,
        currentLocation:
          req.body.currentLocation !== undefined
            ? String(req.body.currentLocation).trim()
            : existing.currentLocation,
        destination:
          req.body.destination !== undefined
            ? String(req.body.destination).trim()
            : existing.destination,
        status,
        notes: req.body.notes !== undefined ? String(req.body.notes).trim() : existing.notes,
      },
      include: { driver: true },
    });

    res.json(updated);
  } catch (err) {
    console.error('PUT /vehicles/:id error:', err);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Soft delete -> Trash
router.delete('/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid vehicle ID' });

    const activeTrips = await prisma.trip.count({
      where: { vehicleId: id, status: { in: ['PLANNED', 'LOADING', 'ON_ROUTE'] } },
    });
    if (activeTrips > 0) {
      return res.status(409).json({
        error: 'VEHICLE_HAS_ACTIVE_TRIPS',
        message: 'Cannot delete a vehicle with active trips',
      });
    }

    const updated = await prisma.vehicle.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), driverId: null },
    });
    res.json(updated);
  } catch (err) {
    console.error('DELETE /vehicles/:id error:', err);
    res.status(500).json({ error: 'Failed to move vehicle to trash' });
  }
});

// Restore from Trash
router.post('/:id/restore', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid vehicle ID' });

    const updated = await prisma.vehicle.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
      include: { driver: true },
    });
    res.json(updated);
  } catch (err) {
    console.error('POST /vehicles/:id/restore error:', err);
    res.status(500).json({ error: 'Failed to restore vehicle' });
  }
});

// Permanent delete
router.delete('/:id/permanent', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid vehicle ID' });

    const tripCount = await prisma.trip.count({ where: { vehicleId: id } });
    if (tripCount > 0) {
      return res.status(409).json({
        error: 'VEHICLE_HAS_TRIP_HISTORY',
        message: 'Cannot permanently delete a vehicle referenced by trip history',
      });
    }

    await prisma.vehicle.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /vehicles/:id/permanent error:', err);
    res.status(500).json({ error: 'Failed to permanently delete vehicle' });
  }
});

export default router;
