import L from 'leaflet';
import type { DiveSiteType } from '../../services/api/types';

function markerSvg(fill: string, stroke: string, w: number, h: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 25 41">
    <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    <circle cx="12.5" cy="12.5" r="5" fill="white" opacity="0.9"/>
  </svg>`;
}

function markerSvgWithSymbol(fill: string, stroke: string, w: number, h: number, symbol: string): string {
  const fontSize = w < 22 ? 7 : 8;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 25 41">
    <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
    <circle cx="12.5" cy="12.5" r="6.5" fill="white" opacity="0.9"/>
    <text x="12.5" y="15.5" text-anchor="middle" font-size="${fontSize}" font-weight="700" font-family="Arial,sans-serif" fill="${fill}">${symbol}</text>
  </svg>`;
}

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function createIcon(fill: string, stroke: string, size: [number, number] = [25, 41]): L.DivIcon {
  const svg = markerSvg(fill, stroke, size[0], size[1]);
  return L.divIcon({
    html: `<img src="${svgToDataUrl(svg)}" width="${size[0]}" height="${size[1]}" style="display:block" />`,
    className: '',
    iconSize: [size[0], size[1]],
    iconAnchor: [Math.floor(size[0] / 2), size[1]],
    popupAnchor: [1, -34],
  });
}

function createSmallIcon(fill: string, stroke: string): L.DivIcon {
  return createIcon(fill, stroke, [20, 33]);
}

function createTypedIcon(fill: string, stroke: string, symbol: string, size: [number, number] = [25, 41]): L.DivIcon {
  const svg = markerSvgWithSymbol(fill, stroke, size[0], size[1], symbol);
  return L.divIcon({
    html: `<img src="${svgToDataUrl(svg)}" width="${size[0]}" height="${size[1]}" style="display:block" />`,
    className: '',
    iconSize: [size[0], size[1]],
    iconAnchor: [Math.floor(size[0] / 2), size[1]],
    popupAnchor: [1, -34],
  });
}

function createSmallTypedIcon(fill: string, stroke: string, symbol: string): L.DivIcon {
  return createTypedIcon(fill, stroke, symbol, [20, 33]);
}

export const selectedMarkerIcon = createIcon('#2563eb', '#1d4ed8');

export const waterLocationMarker = createIcon('#16a34a', '#15803d');

export const verifiedSiteMarker = createIcon('#06b6d4', '#0891b2');

export const unverifiedSiteMarker = createIcon('#eab308', '#ca8a04');

export const defaultSavedMarker = createIcon('#8b5cf6', '#7c3aed');

export const DIVE_TYPE_MARKERS: Record<string, L.DivIcon> = {
  Shore: createIcon('#2563eb', '#1d4ed8'),
  Boat: createIcon('#8b5cf6', '#7c3aed'),
  Reef: createIcon('#16a34a', '#15803d'),
  Wreck: createIcon('#f97316', '#ea580c'),
  Cave: createIcon('#ef4444', '#dc2626'),
};

export const verifiedSiteSmallIcon = createSmallIcon('#06b6d4', '#0891b2');
export const unverifiedSiteSmallIcon = createSmallIcon('#eab308', '#ca8a04');

export const SITE_TYPE_COLORS: Record<DiveSiteType, { fill: string; stroke: string; tailwind: string }> = {
  Reef:     { fill: '#16a34a', stroke: '#15803d', tailwind: 'bg-green-600' },
  Wreck:    { fill: '#f97316', stroke: '#ea580c', tailwind: 'bg-orange-500' },
  Cave:     { fill: '#ef4444', stroke: '#dc2626', tailwind: 'bg-red-500' },
  Cavern:   { fill: '#f43f5e', stroke: '#e11d48', tailwind: 'bg-rose-500' },
  Wall:     { fill: '#6366f1', stroke: '#4f46e5', tailwind: 'bg-indigo-500' },
  Pinnacle: { fill: '#a855f7', stroke: '#9333ea', tailwind: 'bg-purple-500' },
  Drift:    { fill: '#14b8a6', stroke: '#0d9488', tailwind: 'bg-teal-500' },
  Lake:     { fill: '#0ea5e9', stroke: '#0284c7', tailwind: 'bg-sky-500' },
  Muck:     { fill: '#d97706', stroke: '#b45309', tailwind: 'bg-amber-600' },
  Pelagic:  { fill: '#3b82f6', stroke: '#2563eb', tailwind: 'bg-blue-500' },
  Plateau:  { fill: '#84cc16', stroke: '#65a30d', tailwind: 'bg-lime-500' },
  Unknown:  { fill: '#9ca3af', stroke: '#6b7280', tailwind: 'bg-gray-400' },
};

const SITE_TYPE_SYMBOLS: Record<DiveSiteType, string> = {
  Reef:     'Rf',
  Wreck:    'Wk',
  Cave:     'Cv',
  Cavern:   'Cn',
  Wall:     'Wl',
  Pinnacle: 'Pk',
  Drift:    'Dr',
  Lake:     'Lk',
  Muck:     'Mk',
  Pelagic:  'Pg',
  Plateau:  'Pl',
  Unknown:  '?',
};

export const SITE_TYPE_ICONS: Record<DiveSiteType, L.DivIcon> = {} as any;
export const SITE_TYPE_SMALL_ICONS: Record<DiveSiteType, L.DivIcon> = {} as any;

for (const siteType of Object.keys(SITE_TYPE_COLORS) as DiveSiteType[]) {
  const { fill, stroke } = SITE_TYPE_COLORS[siteType];
  const symbol = SITE_TYPE_SYMBOLS[siteType];
  SITE_TYPE_ICONS[siteType] = createTypedIcon(fill, stroke, symbol);
  SITE_TYPE_SMALL_ICONS[siteType] = createSmallTypedIcon(fill, stroke, symbol);
}

export function getSiteTypeIcon(siteType: DiveSiteType | undefined, small: boolean): L.DivIcon {
  const type = siteType ?? 'Unknown';
  return small
    ? (SITE_TYPE_SMALL_ICONS[type] ?? SITE_TYPE_SMALL_ICONS.Unknown)
    : (SITE_TYPE_ICONS[type] ?? SITE_TYPE_ICONS.Unknown);
}
