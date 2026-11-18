export type Language = 'uz' | 'ru';

export type PageId =
  | 'dashboard'
  | 'vehicles'
  | 'cargos'
  | 'drivers'
  | 'trips'
  | 'calendar'
  | 'archive'
  | 'reports'
  | 'settings';

export type VehicleType = 'TENT' | 'REF' | 'MEGA' | 'KONT';
export type VehicleStatus =
  | 'AVAILABLE'
  | 'ON_ROUTE'
  | 'LOADING'
  | 'BUSY'
  | 'UNDER_REPAIR';

export type DriverStatus = 'AVAILABLE' | 'ON_ROUTE' | 'RESTING' | 'ON_LEAVE';
export type CargoStatus = 'PENDING' | 'LOADING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
export type TripStatus = 'PLANNED' | 'LOADING' | 'ON_ROUTE' | 'COMPLETED' | 'CANCELLED';

export interface Driver {
  id: number;
  fullName: string;
  phone: string;
  licenseNumber: string;
  licenseCategories: string;
  experienceYears: number;
  status: DriverStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: {
    id: number;
    plateNumber: string;
    model: string;
    status: VehicleStatus;
  } | null;
}

export interface Vehicle {
  id: number;
  plateNumber: string;
  model: string;
  vehicleType: VehicleType;
  driverId: number | null;
  driver?: {
    id: number;
    fullName: string;
    phone: string;
    licenseNumber: string;
  } | null;
  phone: string;
  capacityTons: number;
  volumeM3: number;
  currentLocation: string;
  destination: string;
  status: VehicleStatus;
  notes: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Cargo {
  id: number;
  code: string;
  name: string;
  cargoType: string;
  loadingAddress: string;
  destinationAddress: string;
  weightTons: number;
  volumeM3: number;
  loadingDate: string;
  unloadingDate: string;
  price: number;
  customerName: string;
  customerPhone: string;
  vehicleId: number | null;
  vehicle?: { id: number; plateNumber: string; model: string } | null;
  driverId: number | null;
  driver?: { id: number; fullName: string; phone: string } | null;
  status: CargoStatus;
  notes: string;
  createdAt: string;
}

export interface Trip {
  id: number;
  tripCode: string;
  vehicleId: number;
  vehicle: { id: number; plateNumber: string; model: string; vehicleType?: string };
  driverId: number;
  driver: { id: number; fullName: string; phone: string };
  cargoId: number | null;
  cargo?: { id: number; code: string; name: string; weightTons?: number } | null;
  origin: string;
  destination: string;
  loadingDate: string;
  unloadingDate: string;
  freightPrice: number;
  distanceKm: number;
  status: TripStatus;
  progressPct: number;
  notes: string;
  completedAt: string | null;
  createdAt: string;
}

export interface ApplicationSettings {
  id: number;
  ownerName: string;
  companyName: string;
  roleTitle: string;
  phone: string;
  email: string;
  language: Language;
  dateFormat: 'DD.MM.YYYY' | 'YYYY-MM-DD' | 'DD/MM/YYYY';
  currency: 'USD' | 'UZS' | 'RUB';
  sidebarCompact: boolean;
  showSimulatedGps: boolean;
}

export interface BackupFile {
  name: string;
  sizeBytes: number;
  createdAt: string;
}
