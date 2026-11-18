import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

router.get('/events', async (_req, res) => {
  try {
    const [trips, availableVehicles] = await Promise.all([
      prisma.trip.findMany({
        where: { status: { not: 'CANCELLED' } },
        include: {
          vehicle: { select: { plateNumber: true, model: true } },
          driver: { select: { fullName: true } },
          cargo: { select: { name: true } },
        },
        orderBy: { loadingDate: 'asc' },
      }),
      prisma.vehicle.findMany({
        where: { isDeleted: false, status: 'AVAILABLE' },
        select: { id: true, plateNumber: true, model: true, currentLocation: true },
      }),
    ]);

    const events: Array<{
      id: string;
      title: string;
      start: string;
      end?: string;
      color: string;
      category: 'ON_ROUTE' | 'AVAILABLE' | 'LOADING' | 'UNLOADING';
      meta: Record<string, unknown>;
    }> = [];

    for (const trip of trips) {
      const loadIso = trip.loadingDate.toISOString().split('T')[0];
      const unloadIso = trip.unloadingDate.toISOString().split('T')[0];

      // Loading milestone (Orange)
      events.push({
        id: `trip-load-${trip.id}`,
        title: `Yuklash: ${trip.vehicle.plateNumber} (${trip.origin})`,
        start: loadIso,
        color: '#FFA526',
        category: 'LOADING',
        meta: {
          tripId: trip.id,
          tripCode: trip.tripCode,
          vehicle: trip.vehicle.plateNumber,
          driver: trip.driver.fullName,
          route: `${trip.origin} → ${trip.destination}`,
          status: trip.status,
        },
      });

      // Active route span (Blue) or Completed span
      events.push({
        id: `trip-span-${trip.id}`,
        title: `${trip.vehicle.plateNumber}: ${trip.origin} → ${trip.destination}`,
        start: loadIso,
        end: unloadIso,
        color: trip.status === 'COMPLETED' ? '#00C875' : '#0788F9',
        category: trip.status === 'COMPLETED' ? 'AVAILABLE' : 'ON_ROUTE',
        meta: {
          tripId: trip.id,
          tripCode: trip.tripCode,
          vehicle: trip.vehicle.plateNumber,
          driver: trip.driver.fullName,
          cargo: trip.cargo?.name ?? '—',
          status: trip.status,
        },
      });

      // Unloading milestone (Purple)
      events.push({
        id: `trip-unload-${trip.id}`,
        title: `Tushirish: ${trip.vehicle.plateNumber} (${trip.destination})`,
        start: unloadIso,
        color: '#8055F5',
        category: 'UNLOADING',
        meta: {
          tripId: trip.id,
          tripCode: trip.tripCode,
          vehicle: trip.vehicle.plateNumber,
          driver: trip.driver.fullName,
          route: `${trip.origin} → ${trip.destination}`,
          status: trip.status,
        },
      });
    }

    // Today's available vehicles (Green)
    const todayIso = new Date().toISOString().split('T')[0];
    for (const v of availableVehicles) {
      events.push({
        id: `avail-${v.id}`,
        title: `Bo‘sh: ${v.plateNumber} (${v.model})`,
        start: todayIso,
        color: '#00C875',
        category: 'AVAILABLE',
        meta: {
          vehicleId: v.id,
          vehicle: v.plateNumber,
          location: v.currentLocation,
        },
      });
    }

    res.json(events);
  } catch (err) {
    console.error('GET /calendar/events error:', err);
    res.status(500).json({ error: 'Failed to generate calendar events' });
  }
});

export default router;
