import { Router } from 'express';
import { prisma } from '../db.js';
import {
  TRIP_STATUSES,
  isEnumValue,
  parseDateInput,
  parseNonNegativeNumber,
  parsePositiveInt,
} from '../utils/validation.js';

const router = Router();
const ACTIVE_TRIP_STATUSES = ['PLANNED', 'LOADING', 'ON_ROUTE'];

async function hasOverlappingActiveTrip(
  vehicleId: number,
  loadingDate: Date,
  unloadingDate: Date,
  excludeTripId?: number
) {
  const overlapping = await prisma.trip.findFirst({
    where: {
      vehicleId,
      status: { in: ACTIVE_TRIP_STATUSES },
      ...(excludeTripId ? { id: { not: excludeTripId } } : {}),
      loadingDate: { lte: unloadingDate },
      unloadingDate: { gte: loadingDate },
    },
  });
  return overlapping;
}

router.get('/', async (req, res) => {
  try {
    const search = String(req.query.search ?? '').trim().toLowerCase();
    const status = String(req.query.status ?? '').trim();
    const archiveOnly = req.query.archive === 'true';
    const fromDate = parseDateInput(req.query.from);
    const toDate = parseDateInput(req.query.to);

    const trips = await prisma.trip.findMany({
      where: {
        ...(archiveOnly
          ? { status: 'COMPLETED' }
          : status && status !== 'ALL'
            ? { status }
            : {}),
        ...(fromDate ? { loadingDate: { gte: fromDate } } : {}),
        ...(toDate ? { unloadingDate: { lte: toDate } } : {}),
      },
      include: {
        vehicle: { select: { id: true, plateNumber: true, model: true, vehicleType: true } },
        driver: { select: { id: true, fullName: true, phone: true } },
        cargo: { select: { id: true, code: true, name: true, weightTons: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const filtered = search
      ? trips.filter(
          (t) =>
            t.tripCode.toLowerCase().includes(search) ||
            t.origin.toLowerCase().includes(search) ||
            t.destination.toLowerCase().includes(search) ||
            t.vehicle.plateNumber.toLowerCase().includes(search) ||
            t.driver.fullName.toLowerCase().includes(search) ||
            (t.cargo?.name.toLowerCase().includes(search) ?? false)
        )
      : trips;

    res.json(filtered);
  } catch (err) {
    console.error('GET /trips error:', err);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

router.post('/', async (req, res) => {
  try {
    const vehicleId = parsePositiveInt(req.body.vehicleId);
    const driverId = parsePositiveInt(req.body.driverId);
    const cargoId = req.body.cargoId ? parsePositiveInt(req.body.cargoId) : null;
    const origin = String(req.body.origin ?? '').trim();
    const destination = String(req.body.destination ?? '').trim();
    const loadingDate = parseDateInput(req.body.loadingDate);
    const unloadingDate = parseDateInput(req.body.unloadingDate);
    const freightPrice = parseNonNegativeNumber(req.body.freightPrice, 0);
    const distanceKm = parseNonNegativeNumber(req.body.distanceKm, 0);
    const status = String(req.body.status ?? 'PLANNED').trim();

    if (!vehicleId || !driverId || !origin || !destination || !loadingDate || !unloadingDate) {
      return res.status(400).json({
        error: 'Vehicle, driver, origin, destination, loading date and unloading date are required',
      });
    }
    if (unloadingDate < loadingDate) {
      return res.status(400).json({ error: 'Unloading date cannot be earlier than loading date' });
    }
    if (!isEnumValue(status, TRIP_STATUSES)) {
      return res.status(400).json({ error: 'Invalid trip status' });
    }

    if (ACTIVE_TRIP_STATUSES.includes(status)) {
      const overlap = await hasOverlappingActiveTrip(vehicleId, loadingDate, unloadingDate);
      if (overlap) {
        return res.status(409).json({
          error: 'OVERLAPPING_TRIP',
          message: `Vehicle already has an active trip (${overlap.tripCode}) during these dates`,
        });
      }
    }

    const count = await prisma.trip.count();
    const tripCode =
      String(req.body.tripCode ?? '').trim() || `#RS-2026-${100 + count + 1}`;

    const created = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          tripCode,
          vehicleId,
          driverId,
          cargoId,
          origin,
          destination,
          loadingDate,
          unloadingDate,
          freightPrice,
          distanceKm,
          status,
          progressPct: status === 'COMPLETED' ? 100 : status === 'ON_ROUTE' ? 35 : 0,
          completedAt: status === 'COMPLETED' ? new Date() : null,
          notes: String(req.body.notes ?? '').trim(),
        },
        include: {
          vehicle: true,
          driver: true,
          cargo: true,
        },
      });

      if (status === 'ON_ROUTE' || status === 'LOADING') {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: { status, destination },
        });
        await tx.driver.update({
          where: { id: driverId },
          data: { status: 'ON_ROUTE' },
        });
      }
      if (cargoId) {
        await tx.cargo.update({
          where: { id: cargoId },
          data: {
            vehicleId,
            driverId,
            status: status === 'ON_ROUTE' ? 'IN_TRANSIT' : status === 'LOADING' ? 'LOADING' : 'PENDING',
          },
        });
      }

      return trip;
    });

    res.status(201).json(created);
  } catch (err) {
    console.error('POST /trips error:', err);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid trip ID' });

    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Trip not found' });

    const vehicleId = req.body.vehicleId ? parsePositiveInt(req.body.vehicleId)! : existing.vehicleId;
    const driverId = req.body.driverId ? parsePositiveInt(req.body.driverId)! : existing.driverId;
    const loadingDate = req.body.loadingDate
      ? parseDateInput(req.body.loadingDate) ?? existing.loadingDate
      : existing.loadingDate;
    const unloadingDate = req.body.unloadingDate
      ? parseDateInput(req.body.unloadingDate) ?? existing.unloadingDate
      : existing.unloadingDate;
    const status = req.body.status ?? existing.status;

    if (!isEnumValue(status, TRIP_STATUSES)) {
      return res.status(400).json({ error: 'Invalid trip status' });
    }
    if (unloadingDate < loadingDate) {
      return res.status(400).json({ error: 'Unloading date cannot be earlier than loading date' });
    }

    if (ACTIVE_TRIP_STATUSES.includes(status)) {
      const overlap = await hasOverlappingActiveTrip(vehicleId, loadingDate, unloadingDate, id);
      if (overlap) {
        return res.status(409).json({
          error: 'OVERLAPPING_TRIP',
          message: `Vehicle already has an active trip (${overlap.tripCode}) during these dates`,
        });
      }
    }

    const updated = await prisma.trip.update({
      where: { id },
      data: {
        vehicleId,
        driverId,
        cargoId:
          req.body.cargoId !== undefined
            ? req.body.cargoId
              ? parsePositiveInt(req.body.cargoId)
              : null
            : existing.cargoId,
        origin: req.body.origin !== undefined ? String(req.body.origin).trim() : existing.origin,
        destination:
          req.body.destination !== undefined
            ? String(req.body.destination).trim()
            : existing.destination,
        loadingDate,
        unloadingDate,
        freightPrice:
          req.body.freightPrice !== undefined
            ? parseNonNegativeNumber(req.body.freightPrice, existing.freightPrice)
            : existing.freightPrice,
        distanceKm:
          req.body.distanceKm !== undefined
            ? parseNonNegativeNumber(req.body.distanceKm, existing.distanceKm)
            : existing.distanceKm,
        status,
        progressPct:
          req.body.progressPct !== undefined
            ? Math.min(100, Math.max(0, Math.round(Number(req.body.progressPct))))
            : existing.progressPct,
        notes: req.body.notes !== undefined ? String(req.body.notes).trim() : existing.notes,
        completedAt: status === 'COMPLETED' ? existing.completedAt ?? new Date() : null,
      },
      include: { vehicle: true, driver: true, cargo: true },
    });

    res.json(updated);
  } catch (err) {
    console.error('PUT /trips/:id error:', err);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

router.post('/:id/complete', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid trip ID' });

    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Trip not found' });

    const updated = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.update({
        where: { id },
        data: { status: 'COMPLETED', progressPct: 100, completedAt: new Date() },
        include: { vehicle: true, driver: true, cargo: true },
      });

      await tx.vehicle.update({
        where: { id: existing.vehicleId },
        data: { status: 'AVAILABLE', destination: '—' },
      });
      await tx.driver.update({
        where: { id: existing.driverId },
        data: { status: 'AVAILABLE' },
      });
      if (existing.cargoId) {
        await tx.cargo.update({
          where: { id: existing.cargoId },
          data: { status: 'DELIVERED' },
        });
      }

      return trip;
    });

    res.json(updated);
  } catch (err) {
    console.error('POST /trips/:id/complete error:', err);
    res.status(500).json({ error: 'Failed to complete trip' });
  }
});

router.post('/:id/cancel', async (req, res) => {
  try {
    const id = parsePositiveInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid trip ID' });

    const existing = await prisma.trip.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Trip not found' });

    const updated = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: { vehicle: true, driver: true, cargo: true },
      });
      await tx.vehicle.update({
        where: { id: existing.vehicleId },
        data: { status: 'AVAILABLE', destination: '—' },
      });
      if (existing.cargoId) {
        await tx.cargo.update({
          where: { id: existing.cargoId },
          data: { status: 'CANCELLED' },
        });
      }
      return trip;
    });

    res.json(updated);
  } catch (err) {
    console.error('POST /trips/:id/cancel error:', err);
    res.status(500).json({ error: 'Failed to cancel trip' });
  }
});

export default router;
