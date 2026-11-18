export const VEHICLE_TYPES = ['TENT', 'REF', 'MEGA', 'KONT'] as const;
export const VEHICLE_STATUSES = [
  'AVAILABLE',
  'ON_ROUTE',
  'LOADING',
  'BUSY',
  'UNDER_REPAIR',
] as const;

export const DRIVER_STATUSES = ['AVAILABLE', 'ON_ROUTE', 'RESTING', 'ON_LEAVE'] as const;
export const CARGO_STATUSES = [
  'PENDING',
  'LOADING',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
] as const;
export const TRIP_STATUSES = [
  'PLANNED',
  'LOADING',
  'ON_ROUTE',
  'COMPLETED',
  'CANCELLED',
] as const;

export function parsePositiveInt(value: unknown, fallback?: number): number | null {
  if (value === undefined || value === null || value === '') {
    return fallback ?? null;
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

export function parseNonNegativeNumber(value: unknown, fallback = 0): number {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return NaN;
  return n;
}

export function parseDateInput(value: unknown): Date | null {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function normalizePlate(plate: string): string {
  return plate.trim().toUpperCase().replace(/\s+/g, ' ');
}

export function isEnumValue<T extends readonly string[]>(
  val: unknown,
  allowed: T
): val is T[number] {
  return typeof val === 'string' && (allowed as readonly string[]).includes(val);
}
