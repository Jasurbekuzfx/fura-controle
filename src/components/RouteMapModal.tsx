import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, Clock, MapPin, Navigation } from 'lucide-react';
import { Modal } from './Modal';
import { useApp } from '../context/AppContext';

interface RouteMapModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  origin: string;
  destination: string;
  plateNumber?: string;
  progressPct?: number;
}

const CITY_COORDS: Array<{ keywords: string[]; coords: [number, number] }> = [
  { keywords: ['toshkent', 'tashkent', 'sergeli', 'rohat', 'chilonzor'], coords: [41.2995, 69.2401] },
  { keywords: ['samarqand', 'samarkand'], coords: [39.6542, 66.9597] },
  { keywords: ['buxoro', 'bukhara'], coords: [39.7747, 64.4286] },
  { keywords: ['farg', 'fergana', 'namangan', 'andijon'], coords: [40.3864, 71.7864] },
  { keywords: ['moskva', 'moscow'], coords: [55.7558, 37.6173] },
  { keywords: ['novosibirsk'], coords: [55.0084, 82.9357] },
  { keywords: ['olmaota', 'almaty'], coords: [43.222, 76.8512] },
  { keywords: ['ostona', 'astana'], coords: [51.1694, 71.4491] },
  { keywords: ['minsk'], coords: [53.9006, 27.559] },
  { keywords: ['qozon', 'kazan'], coords: [55.7961, 49.1064] },
  { keywords: ['yekaterinburg'], coords: [56.8389, 60.6057] },
];

function resolveCoords(place: string, fallback: [number, number]): [number, number] {
  const low = place.toLowerCase();
  for (const item of CITY_COORDS) {
    if (item.keywords.some((k) => low.includes(k))) {
      return item.coords;
    }
  }
  return fallback;
}

const CUSTOMS_CHECKPOINTS = [
  { name: 'Yallama (UZ / KZ)', coords: [40.986, 68.724] as [number, number], wait: '2 soat / ч' },
  { name: 'Sagarchin (KZ / RU)', coords: [50.946, 55.611] as [number, number], wait: '4 soat / ч' },
  { name: 'Mashtakovo (KZ / RU)', coords: [51.541, 50.817] as [number, number], wait: '3 soat / ч' },
];

export const RouteMapModal: React.FC<RouteMapModalProps> = ({
  open,
  onClose,
  title,
  origin,
  destination,
  plateNumber,
  progressPct = 55,
}) => {
  const { t } = useApp();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!open || !mapContainerRef.current) return;

    const startCoords = resolveCoords(origin, [41.2995, 69.2401]);
    const endCoords = resolveCoords(destination, [55.7558, 37.6173]);

    // Pick relevant intermediate customs checkpoints
    const cp1 = CUSTOMS_CHECKPOINTS[0];
    const cp2 =
      destination.toLowerCase().includes('novosibirsk') || destination.toLowerCase().includes('olmaota')
        ? CUSTOMS_CHECKPOINTS[1]
        : CUSTOMS_CHECKPOINTS[2];

    const waypoints: [number, number][] = [startCoords, cp1.coords, cp2.coords, endCoords];
    const ratio = Math.min(0.95, Math.max(0.1, progressPct / 100));
    const truckLat = startCoords[0] + (endCoords[0] - startCoords[0]) * ratio;
    const truckLng = startCoords[1] + (endCoords[1] - startCoords[1]) * ratio;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 18,
    }).addTo(map);

    // Route polyline
    const polyline = L.polyline(waypoints, {
      color: '#0788F9',
      weight: 4,
      opacity: 0.9,
      dashArray: '8 6',
    }).addTo(map);

    const circleIcon = (color: string, label: string) =>
      L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid #F5F8FF;box-shadow:0 0 10px ${color};"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

    L.marker(startCoords, { icon: circleIcon('#00C875', origin) })
      .addTo(map)
      .bindPopup(`<b>${t.map.start}:</b> ${origin}`);

    L.marker(endCoords, { icon: circleIcon('#8055F5', destination) })
      .addTo(map)
      .bindPopup(`<b>${t.map.destination}:</b> ${destination}`);

    [cp1, cp2].forEach((cp) => {
      L.marker(cp.coords, { icon: circleIcon('#FFA526', cp.name) })
        .addTo(map)
        .bindPopup(`<b>${cp.name}</b><br/>${t.map.waitTime}: ${cp.wait}`);
    });

    // Current simulated truck marker
    const truckIcon = L.divIcon({
      className: 'custom-truck-pin',
      html: `<div style="padding:4px 8px;border-radius:8px;background:#0788F9;color:#F5F8FF;font-size:11px;font-weight:700;border:2px solid #F5F8FF;box-shadow:0 0 16px rgba(7,136,249,0.7);white-space:nowrap;">🚛 ${plateNumber || 'TRUCK'}</div>`,
      iconSize: [96, 28],
      iconAnchor: [48, 14],
    });
    L.marker([truckLat, truckLng], { icon: truckIcon })
      .addTo(map)
      .bindPopup(
        `<b>${t.map.currentTruck}</b><br/>${plateNumber ?? ''} (${progressPct}%)<br/>${truckLat.toFixed(4)}° N, ${truckLng.toFixed(4)}° E`
      );

    map.fitBounds(polyline.getBounds(), { padding: [36, 36] });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [open, origin, destination, plateNumber, progressPct, t]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || t.map.title}
      subtitle={`${origin} → ${destination}`}
      maxWidthClass="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Simulated GPS Disclaimer */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFA526]/10 border border-[#FFA526]/30 text-xs text-[#FFA526]">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{t.map.simulatedNotice}</span>
        </div>

        {/* Leaflet Map Container */}
        <div
          ref={mapContainerRef}
          className="w-full h-[360px] rounded-xl overflow-hidden border border-[#243F60]"
        />

        {/* Customs Checkpoints Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CUSTOMS_CHECKPOINTS.map((cp) => (
            <div
              key={cp.name}
              className="fura-card-inset p-3 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FFA526]" />
                <span className="font-semibold text-[#F5F8FF]">{cp.name}</span>
              </div>
              <span className="flex items-center gap-1 text-[#FFA526] font-semibold">
                <Clock className="w-3.5 h-3.5" />
                {cp.wait}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-[#9BAFC8] pt-1">
          <span className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#0788F9]" />
            {t.map.currentTruck}: {progressPct}%
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#142B49] border border-[#243F60] text-[#F5F8FF] hover:border-[#0788F9] transition font-semibold"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </Modal>
  );
};
