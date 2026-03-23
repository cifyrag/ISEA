import { useMemo } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import type { DiveSiteMarker, DiveSiteType, SavedLocation } from '../../services/api';
import {
  unverifiedSiteSmallIcon,
  unverifiedSiteMarker,
  defaultSavedMarker,
  DIVE_TYPE_MARKERS,
  getSiteTypeIcon,
  SITE_TYPE_COLORS,
} from './markerIcons';

function createClusterIcon(color: string) {
  return (cluster: L.MarkerCluster) => {
    const count = cluster.getChildCount();
    const size = count < 10 ? 36 : count < 50 ? 44 : 52;
    return L.divIcon({
      html: `<div style="
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 700;
        font-size: ${size < 40 ? 12 : 14}px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 3px solid rgba(255,255,255,0.8);
      ">${count}</div>`,
      className: '',
      iconSize: L.point(size, size),
    });
  };
}

const CLUSTER_COLORS = {
  verified: '#06b6d4',
  unverified: '#fbbf24',
  saved: '#8b5cf6',
};

interface VerifiedLayerProps {
  sites: DiveSiteMarker[];
  onSiteClick?: (site: DiveSiteMarker) => void;
}

export function VerifiedSitesLayer({ sites, onSiteClick }: VerifiedLayerProps) {
  const { t } = useTranslation();
  const map = useMap();
  const zoom = map.getZoom();
  const useSmall = zoom < 10;

  const sitesByType = useMemo(() => {
    const groups: Partial<Record<DiveSiteType, DiveSiteMarker[]>> = {};
    for (const site of sites) {
      const type: DiveSiteType = site.siteType ?? 'Unknown';
      if (!groups[type]) groups[type] = [];
      groups[type]!.push(site);
    }
    return groups;
  }, [sites]);

  if (sites.length === 0) return null;

  return (
    <>
      {(Object.entries(sitesByType) as [DiveSiteType, DiveSiteMarker[]][]).map(([type, typeSites]) => {
        const color = SITE_TYPE_COLORS[type]?.fill ?? CLUSTER_COLORS.verified;
        return (
          <MarkerClusterGroup
            key={type}
            chunkedLoading
            maxClusterRadius={60}
            disableClusteringAtZoom={14}
            spiderfyOnMaxZoom
            iconCreateFunction={createClusterIcon(color)}
          >
            {typeSites.map((site) => (
              <Marker
                key={site.id}
                position={[site.latitude, site.longitude]}
                icon={getSiteTypeIcon(site.siteType, useSmall)}
                eventHandlers={onSiteClick ? { click: () => onSiteClick(site) } : undefined}
              >
                <Popup>
                  <SitePopup site={site} t={t} />
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        );
      })}
    </>
  );
}


interface UnverifiedLayerProps {
  sites: DiveSiteMarker[];
  onSiteClick?: (site: DiveSiteMarker) => void;
}

export function UnverifiedSitesLayer({ sites, onSiteClick }: UnverifiedLayerProps) {
  const { t } = useTranslation();
  const map = useMap();
  const zoom = map.getZoom();
  const useSmall = zoom < 10;

  const clusterCreator = useMemo(() => createClusterIcon(CLUSTER_COLORS.unverified), []);

  if (sites.length === 0) return null;

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={60}
      disableClusteringAtZoom={14}
      spiderfyOnMaxZoom
      iconCreateFunction={clusterCreator}
    >
      {sites.map((site) => (
        <Marker
          key={site.id}
          position={[site.latitude, site.longitude]}
          icon={useSmall ? unverifiedSiteSmallIcon : unverifiedSiteMarker}
          eventHandlers={onSiteClick ? { click: () => onSiteClick(site) } : undefined}
        >
          <Popup>
            <SitePopup site={site} t={t} showUnverified />
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}


interface SavedLayerProps {
  locations: SavedLocation[];
  onLocationClick?: (location: SavedLocation) => void;
}

export function SavedLocationsLayer({ locations, onLocationClick }: SavedLayerProps) {
  const clusterCreator = useMemo(() => createClusterIcon(CLUSTER_COLORS.saved), []);

  if (locations.length === 0) return null;

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={50}
      disableClusteringAtZoom={12}
      spiderfyOnMaxZoom
      iconCreateFunction={clusterCreator}
    >
      {locations.map((loc) => {
        const icon =
          loc.diveType && DIVE_TYPE_MARKERS[loc.diveType]
            ? DIVE_TYPE_MARKERS[loc.diveType]
            : defaultSavedMarker;
        return (
          <Marker
            key={loc.id}
            position={[loc.latitude, loc.longitude]}
            icon={icon}
            eventHandlers={onLocationClick ? { click: () => onLocationClick(loc) } : undefined}
          />
        );
      })}
    </MarkerClusterGroup>
  );
}


function SitePopup({
  site,
  t,
  showUnverified,
}: {
  site: DiveSiteMarker;
  t: (key: string) => string;
  showUnverified?: boolean;
}) {
  return (
    <div className="min-w-[180px]">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-sm text-abyss-900">{site.name}</span>
        {showUnverified && (
          <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
            {t('diveSites.unverified')}
          </span>
        )}
      </div>
      {site.siteType && site.siteType !== 'Unknown' && (
        <p className="text-xs text-abyss-600">
          {t('diveSites.siteType')}: {t(`diveSites.siteTypes.${site.siteType}`)}
        </p>
      )}
      {site.maxDepthM != null && (
        <p className="text-xs text-abyss-600">
          {t('diveSites.depth')}: {site.maxDepthM}m
        </p>
      )}
      {site.country && (
        <p className="text-xs text-abyss-600">
          {t('diveSites.country')}: {site.country}
        </p>
      )}
      {site.region && (
        <p className="text-xs text-abyss-600">
          {t('adminSites.region')}: {site.region}
        </p>
      )}
      <Link
        to={`/dive-sites/${site.id}`}
        className="inline-block mt-2 text-xs font-medium text-ocean-600 hover:text-ocean-800 transition-colors"
      >
        {t('diveSites.viewDetails')} →
      </Link>
    </div>
  );
}
