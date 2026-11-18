import type {
  ApplicationSettings,
  BackupFile,
  Cargo,
  Driver,
  Trip,
  Vehicle,
} from '../types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const err = new Error(data.message || data.error || 'Request failed') as Error & {
      code?: string;
      status?: number;
    };
    err.code = data.error;
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export const api = {
  dashboard: () =>
    request<{
      stats: {
        totalVehicles: number;
        onRouteVehicles: number;
        availableVehicles: number;
        busyVehicles: number;
        loadingVehicles: number;
        repairVehicles: number;
        totalCargos: number;
        activeTrips: number;
        completedTrips: number;
      };
      utilizationChart: Array<{ key: string; count: number; color: string }>;
      recentTrips: Trip[];
      upcomingLoading: Array<{
        id: number;
        tripCode: string;
        loadingDate: string;
        origin: string;
        vehicle: { plateNumber: string };
        cargo: { name: string } | null;
      }>;
      upcomingUnloading: Array<{
        id: number;
        tripCode: string;
        unloadingDate: string;
        destination: string;
        vehicle: { plateNumber: string };
        cargo: { name: string } | null;
      }>;
      calendarPreviewTrips: Array<{
        id: number;
        tripCode: string;
        status: string;
        loadingDate: string;
        unloadingDate: string;
        origin: string;
        destination: string;
        vehicle: { plateNumber: string };
      }>;
    }>('/api/dashboard'),

  search: (q: string) =>
    request<{
      vehicles: Vehicle[];
      drivers: Driver[];
      cargos: Cargo[];
      trips: Trip[];
    }>(`/api/search?q=${encodeURIComponent(q)}`),

  vehicles: {
    list: (params?: { trash?: boolean; search?: string; type?: string; status?: string }) => {
      const sp = new URLSearchParams();
      if (params?.trash) sp.set('trash', 'true');
      if (params?.search) sp.set('search', params.search);
      if (params?.type && params.type !== 'ALL') sp.set('type', params.type);
      if (params?.status && params.status !== 'ALL') sp.set('status', params.status);
      return request<Vehicle[]>(`/api/vehicles?${sp.toString()}`);
    },
    create: (payload: Partial<Vehicle>) =>
      request<Vehicle>('/api/vehicles', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: number, payload: Partial<Vehicle>) =>
      request<Vehicle>(`/api/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    softDelete: (id: number) =>
      request<Vehicle>(`/api/vehicles/${id}`, { method: 'DELETE' }),
    restore: (id: number) =>
      request<Vehicle>(`/api/vehicles/${id}/restore`, { method: 'POST' }),
    permanentDelete: (id: number) =>
      request<{ success: boolean }>(`/api/vehicles/${id}/permanent`, { method: 'DELETE' }),
  },

  drivers: {
    list: (params?: { search?: string; category?: string; status?: string }) => {
      const sp = new URLSearchParams();
      if (params?.search) sp.set('search', params.search);
      if (params?.category && params.category !== 'ALL') sp.set('category', params.category);
      if (params?.status && params.status !== 'ALL') sp.set('status', params.status);
      return request<Driver[]>(`/api/drivers?${sp.toString()}`);
    },
    create: (payload: Partial<Driver> & { vehicleId?: number | null }) =>
      request<Driver>('/api/drivers', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: number, payload: Partial<Driver>) =>
      request<Driver>(`/api/drivers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    assignVehicle: (id: number, vehicleId: number | null) =>
      request<Driver>(`/api/drivers/${id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ vehicleId }),
      }),
    delete: (id: number) => request<{ success: boolean }>(`/api/drivers/${id}`, { method: 'DELETE' }),
  },

  cargos: {
    list: (params?: { search?: string; status?: string; cargoType?: string }) => {
      const sp = new URLSearchParams();
      if (params?.search) sp.set('search', params.search);
      if (params?.status && params.status !== 'ALL') sp.set('status', params.status);
      if (params?.cargoType && params.cargoType !== 'ALL') sp.set('cargoType', params.cargoType);
      return request<Cargo[]>(`/api/cargos?${sp.toString()}`);
    },
    create: (payload: Partial<Cargo>) =>
      request<Cargo>('/api/cargos', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: number, payload: Partial<Cargo>) =>
      request<Cargo>(`/api/cargos/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    delete: (id: number) => request<{ success: boolean }>(`/api/cargos/${id}`, { method: 'DELETE' }),
  },

  trips: {
    list: (params?: {
      search?: string;
      status?: string;
      archive?: boolean;
      from?: string;
      to?: string;
    }) => {
      const sp = new URLSearchParams();
      if (params?.search) sp.set('search', params.search);
      if (params?.status && params.status !== 'ALL') sp.set('status', params.status);
      if (params?.archive) sp.set('archive', 'true');
      if (params?.from) sp.set('from', params.from);
      if (params?.to) sp.set('to', params.to);
      return request<Trip[]>(`/api/trips?${sp.toString()}`);
    },
    create: (payload: Partial<Trip>) =>
      request<Trip>('/api/trips', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: number, payload: Partial<Trip>) =>
      request<Trip>(`/api/trips/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    complete: (id: number) =>
      request<Trip>(`/api/trips/${id}/complete`, { method: 'POST' }),
    cancel: (id: number) =>
      request<Trip>(`/api/trips/${id}/cancel`, { method: 'POST' }),
  },

  calendar: {
    events: () =>
      request<
        Array<{
          id: string;
          title: string;
          start: string;
          end?: string;
          color: string;
          category: 'ON_ROUTE' | 'AVAILABLE' | 'LOADING' | 'UNLOADING';
          meta: Record<string, unknown>;
        }>
      >('/api/calendar/events'),
  },

  reports: {
    get: () =>
      request<{
        summary: {
          completedTripsCount: number;
          activeTripsCount: number;
          totalTripsCount: number;
          totalCargoWeightTons: number;
          totalDistanceKm: number;
          completedDistanceKm: number;
          totalRevenue: number;
          vehicleUtilizationPct: number;
          totalVehicles: number;
        };
        monthlyStats: Array<{
          month: string;
          completed: number;
          active: number;
          revenue: number;
          distanceKm: number;
        }>;
        trips: Trip[];
      }>('/api/reports'),
  },

  settings: {
    get: () => request<ApplicationSettings>('/api/settings'),
    update: (payload: Partial<ApplicationSettings>) =>
      request<ApplicationSettings>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
  },

  backup: {
    list: () => request<BackupFile[]>('/api/backup'),
    create: () => request<BackupFile>('/api/backup', { method: 'POST' }),
    restore: (filename: string) =>
      request<{ success: boolean; restoredFrom: string }>('/api/backup/restore', {
        method: 'POST',
        body: JSON.stringify({ filename }),
      }),
  },
};
