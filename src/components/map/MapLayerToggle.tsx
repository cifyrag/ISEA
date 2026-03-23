import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, ChevronDown, ChevronUp, Eye, EyeOff, Filter } from 'lucide-react';
import type { DiveSiteType } from '../../services/api/types';
import { SITE_TYPE_COLORS } from './markerIcons';
import { DIVE_SITE_TYPES } from '../../services/api/types';

export interface MapLayerVisibility {
  verified: boolean;
  unverified: boolean;
  saved: boolean;
}

export type SiteTypeVisibility = Record<DiveSiteType, boolean>;

export interface DepthRange {
  min: string;
  max: string;
}

interface MapLayerToggleProps {
  layers: MapLayerVisibility;
  onToggle: (layer: keyof MapLayerVisibility) => void;
  isAdmin: boolean;
  canAccessUnverified?: boolean;
  counts: { verified: number; unverified: number; saved: number };
  siteTypeVisibility: SiteTypeVisibility;
  onToggleSiteType: (type: DiveSiteType) => void;
  siteTypeCounts: Partial<Record<DiveSiteType, number>>;
  depthRange: DepthRange;
  onDepthRangeChange: (range: DepthRange) => void;
}

const LAYER_CONFIG: {
  key: keyof MapLayerVisibility;
  color: string;
  dotClass: string;
  adminOnly?: boolean;
}[] = [
  { key: 'verified', color: 'bg-cyan-500', dotClass: 'bg-cyan-500' },
  { key: 'unverified', color: 'bg-amber-400', dotClass: 'bg-amber-400', adminOnly: true },
  { key: 'saved', color: 'bg-violet-500', dotClass: 'bg-violet-500' },
];

export default function MapLayerToggle({
  layers,
  onToggle,
  isAdmin,
  canAccessUnverified,
  counts,
  siteTypeVisibility,
  onToggleSiteType,
  siteTypeCounts,
  depthRange,
  onDepthRangeChange,
}: MapLayerToggleProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const [typeFilterExpanded, setTypeFilterExpanded] = useState(false);

  const showUnverified = canAccessUnverified ?? isAdmin;
  const visibleLayers = LAYER_CONFIG.filter((l) => !l.adminOnly || showUnverified);

  const labelMap: Record<keyof MapLayerVisibility, string> = {
    verified: t('map.layers.verified'),
    unverified: t('map.layers.unverified'),
    saved: t('map.layers.saved'),
  };

  const allTypesVisible = DIVE_SITE_TYPES.every((t) => siteTypeVisibility[t]);
  const someTypesHidden = DIVE_SITE_TYPES.some((t) => !siteTypeVisibility[t]);

  const toggleAllTypes = () => {
    const newValue = !allTypesVisible;
    for (const type of DIVE_SITE_TYPES) {
      if (siteTypeVisibility[type] !== newValue) {
        onToggleSiteType(type);
      }
    }
  };

  return (
    <div className="absolute top-16 right-4 z-[1000]">
      <div className="glass rounded-xl shadow-lg border border-ocean-200 overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-abyss-700 hover:bg-ocean-50 transition-colors"
        >
          <Layers className="w-4 h-4 text-ocean-500" />
          {t('map.layers.title')}
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 ml-auto text-abyss-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 ml-auto text-abyss-400" />
          )}
        </button>

        {expanded && (
          <div className="border-t border-ocean-100 px-2 py-1.5 space-y-0.5">
            {visibleLayers.map(({ key, dotClass }) => {
              const visible = layers[key];
              return (
                <button
                  key={key}
                  onClick={() => onToggle(key)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${
                    visible
                      ? 'text-abyss-700 hover:bg-ocean-50'
                      : 'text-abyss-400 hover:bg-gray-50'
                  }`}
                >
                  {visible ? (
                    <Eye className="w-3.5 h-3.5 text-ocean-500 shrink-0" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-abyss-300 shrink-0" />
                  )}
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotClass} ${!visible ? 'opacity-30' : ''}`} />
                  <span className={`font-medium ${!visible ? 'line-through' : ''}`}>
                    {labelMap[key]}
                  </span>
                  <span className={`ml-auto text-[10px] tabular-nums ${visible ? 'text-abyss-500' : 'text-abyss-300'}`}>
                    {counts[key]}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {expanded && layers.verified && (
          <>
            <button
              onClick={() => setTypeFilterExpanded(!typeFilterExpanded)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-abyss-700 hover:bg-ocean-50 transition-colors border-t border-ocean-100"
            >
              <Filter className="w-4 h-4 text-ocean-500" />
              {t('map.layers.siteTypes')}
              {someTypesHidden && (
                <span className="w-2 h-2 rounded-full bg-coral-400 shrink-0" />
              )}
              {typeFilterExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 ml-auto text-abyss-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-auto text-abyss-400" />
              )}
            </button>

            {typeFilterExpanded && (
              <div className="border-t border-ocean-100 px-2 py-1.5 space-y-0.5">
                <button
                  onClick={toggleAllTypes}
                  className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-xs text-ocean-600 hover:bg-ocean-50 font-medium transition-all"
                >
                  {allTypesVisible ? (
                    <EyeOff className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                  )}
                  {allTypesVisible ? t('map.layers.hideAll') : t('map.layers.showAll')}
                </button>

                {DIVE_SITE_TYPES.map((type) => {
                  const visible = siteTypeVisibility[type];
                  const count = siteTypeCounts[type] ?? 0;
                  const colorInfo = SITE_TYPE_COLORS[type];
                  return (
                    <button
                      key={type}
                      onClick={() => onToggleSiteType(type)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${
                        visible
                          ? 'text-abyss-700 hover:bg-ocean-50'
                          : 'text-abyss-400 hover:bg-gray-50'
                      }`}
                    >
                      {visible ? (
                        <Eye className="w-3.5 h-3.5 text-ocean-500 shrink-0" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-abyss-300 shrink-0" />
                      )}
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${!visible ? 'opacity-30' : ''}`}
                        style={{ backgroundColor: colorInfo.fill }}
                      />
                      <span className={`font-medium ${!visible ? 'line-through' : ''}`}>
                        {t(`diveSites.siteTypes.${type}`)}
                      </span>
                      <span className={`ml-auto text-[10px] tabular-nums ${visible ? 'text-abyss-500' : 'text-abyss-300'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {expanded && layers.verified && (
          <div className="border-t border-ocean-100 px-3 py-2">
            <p className="text-xs font-semibold text-abyss-600 mb-1.5">{t('map.layers.depthRange')}</p>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="400"
                value={depthRange.min}
                onChange={(e) => onDepthRangeChange({ ...depthRange, min: e.target.value })}
                placeholder={t('diveSites.minDepth')}
                className="w-16 px-2 py-1 border border-ocean-200 rounded text-xs focus:ring-1 focus:ring-ocean-500 outline-none"
              />
              <span className="text-abyss-400 text-xs">–</span>
              <input
                type="number"
                min="0"
                max="400"
                value={depthRange.max}
                onChange={(e) => onDepthRangeChange({ ...depthRange, max: e.target.value })}
                placeholder={t('diveSites.maxDepth')}
                className="w-16 px-2 py-1 border border-ocean-200 rounded text-xs focus:ring-1 focus:ring-ocean-500 outline-none"
              />
              <span className="text-abyss-400 text-[10px]">m</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
