import { useTranslation } from 'react-i18next';
import { MapPin, CheckCircle } from 'lucide-react';
import type { DiveSiteMarker } from '../services/api';

interface DiveSitesPanelProps {
  diveSites: DiveSiteMarker[];
  onSiteClick: (site: DiveSiteMarker) => void;
}

export default function DiveSitesPanel({ diveSites, onSiteClick }: DiveSitesPanelProps) {
  const { t } = useTranslation();

  if (diveSites.length === 0) {
    return (
      <div className="text-center py-8 text-abyss-400">
        <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">{t('adminSites.empty')}</p>
        <p className="text-xs mt-1 text-abyss-400">{t('map.noLocationHint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-abyss-500 uppercase tracking-wider flex items-center gap-1.5 mb-3">
        <CheckCircle className="w-3.5 h-3.5 text-cyan-500" />
        {t('adminSites.verifiedSites')} ({diveSites.length})
      </p>
      {diveSites.map((site) => (
        <button
          key={site.id}
          onClick={() => onSiteClick(site)}
          className="w-full text-left rounded-xl border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 active:bg-cyan-200 transition-all p-3"
        >
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-abyss-800 truncate">{site.name}</p>
              <p className="text-xs text-abyss-500 mt-0.5">
                {site.latitude.toFixed(4)}°, {site.longitude.toFixed(4)}°
                {site.country && ` · ${site.country}`}
              </p>
              {site.region && (
                <p className="text-xs text-abyss-400">{t('adminSites.region')}: {site.region}</p>
              )}
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {site.maxDepthM != null && (
                  <span className="text-xs text-ocean-600 font-medium">
                    ↓ {site.maxDepthM}m {t('adminSites.maxDepth').toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
