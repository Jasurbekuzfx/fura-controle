import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const [
      totalVehicles,
      onRouteVehicles,
      availableVehicles,
      busyVehicles,
      loadingVehicles,
      repairVehicles,
      totalCargos,
      activeTrips,
      completedTrips,
      recentTrips,
      upcomingLoading,
      upcomingUnloading,
      allTrips,
    ] = await Promise.all([
      prisma.vehicle.count({ where: { isDeleted: false } }),
      prisma.vehicle.count({ where: { isDeleted: false, status: 'ON_ROUTE' } }),
      prisma.vehicle.count({ where: { isDeleted: false, status: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { isDeleted: false, status: 'BUSY' } }),
      prisma.vehicle.count({ where: { isDeleted: false, status: 'LOADING' } }),
      prisma.vehicle.count({ where: { isDeleted: false, status: 'UNDER_REPAIR' } }),
      prisma.cargo.count(),
      prisma.trip.count({
        where: { status: { in: ['PLANNED', 'LOADING', 'ON_ROUTE'] } },
      }),
      prisma.trip.count({ where: { status: 'COMPLETED' } }),
      prisma.trip.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: { select: { id: true, plateNumber: true, model: true } },
          driver: { select: { id: true, fullName: true } },
          cargo: { select: { id: true, code: true, name: true } },
        },
      }),
      prisma.trip.findMany({
        where: {
          status: { in: ['PLANNED', 'LOADING'] },
          loadingDate: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1) },
        },
        orderBy: { loadingDate: 'asc' },
        take: 5,
        include: {
          vehicle: { select: { plateNumber: true } },
          cargo: { select: { name: true } },
        },
      }),
      prisma.trip.findMany({
        where: {
          status: { in: ['LOADING', 'ON_ROUTE'] },
          unloadingDate: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1) },
        },
        orderBy: { unloadingDate: 'asc' },
        take: 5,
        include: {
          vehicle: { select: { plateNumber: true } },
          cargo: { select: { name: true } },
        },
      }),
      prisma.trip.findMany({
        select: {
          id: true,
          tripCode: true,
          status: true,
          loadingDate: true,
          unloadingDate: true,
          origin: true,
          destination: true,
          freightPrice: true,
          distanceKm: true,
          vehicle: { select: { plateNumber: true } },
        },
      }),
    ]);

    const utilizationChart = [
      { key: 'ON_ROUTE', count: onRouteVehicles, color: '#0788F9' },
      { key: 'AVAILABLE', count: availableVehicles, color: '#00C875' },
      { key: 'LOADING', count: loadingVehicles, color: '#FFA526' },
      { key: 'BUSY', count: busyVehicles, color: '#8055F5' },
      { key: 'UNDER_REPAIR', count: repairVehicles, color: '#EF4444' },
    ];

    res.json({
      stats: {
        totalVehicles,
        onRouteVehicles,
        availableVehicles,
        busyVehicles: busyVehicles + loadingVehicles,
        loadingVehicles,
        repairVehicles,
        totalCargos,
        activeTrips,
        completedTrips,
      },
      utilizationChart,
      recentTrips,
      upcomingLoading,
      upcomingUnloading,
      calendarPreviewTrips: allTrips,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

export default router;
