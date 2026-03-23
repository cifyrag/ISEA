import { Marker, Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import type { DiveSite } from '../services/api';
import { verifiedSiteSmallIcon, unverifiedSiteSmallIcon } from './map/markerIcons';

interface DiveSiteMarkersProps {
  sites: DiveSite[];
  isAdmin: boolean;
  onSiteClick?: (site: DiveSite) => void;
}

export default function DiveSiteMarkers({ sites, isAdmin, onSiteClick }: DiveSiteMarkersProps) {
  const { t } = useTranslation();

  return (
    <>
      {sites.map((site) => (
        <Marker
          key={site.id}
          position={[site.latitude, site.longitude]}
          icon={site.isVerified ? verifiedSiteSmallIcon : unverifiedSiteSmallIcon}
          eventHandlers={onSiteClick ? { click: () => onSiteClick(site) } : undefined}
        >
          <Popup>
            <div className="min-w-[180px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-abyss-900">{site.name}</span>
                {isAdmin && !site.isVerified && (
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
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
