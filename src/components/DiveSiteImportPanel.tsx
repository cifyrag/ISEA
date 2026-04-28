import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { diveSiteApi, type ImportResult } from '../services/api';

interface DiveSiteImportPanelProps {
  mapCenter: { lat: number; lng: number };
  onImported: () => void;
}

export default function DiveSiteImportPanel({ mapCenter, onImported }: DiveSiteImportPanelProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [radiusKm, setRadiusKm] = useState('10');

  const handleImport = async () => {
    const radius = parseFloat(radiusKm);
    if (isNaN(radius) || radius <= 0) {
      setError(t('adminDiveSites.import.invalidCoords'));
      return;
    }

    setIsImporting(true);
    setError(null);
    setResult(null);

    const res = await diveSiteApi.importFromOsm(mapCenter.lat, mapCenter.lng, radius);
    if (res.ok) {
      setResult(res.data);
      onImported();
    } else {
      setError(res.error);
    }
    setIsImporting(false);
  };

  return (
    <div className="bg-ocean-50 rounded-xl border border-ocean-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-abyss-700 hover:bg-ocean-100 rounded-xl transition-colors"
      >
        <span className="flex items-center gap-2">
          <Download className="w-4 h-4 text-ocean-500" />
          {t('adminDiveSites.import.title')}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-abyss-500">{t('adminDiveSites.import.description')}</p>

          <div className="space-y-2">
            <div className="bg-white rounded-lg p-2 text-xs text-abyss-600">
              <span className="font-medium">{t('adminDiveSites.import.center')}:</span>{' '}
              {mapCenter.lat.toFixed(4)}°, {mapCenter.lng.toFixed(4)}°
            </div>
            <div>
              <label className="block text-xs font-medium text-abyss-600 mb-1">{t('adminDiveSites.import.radius')}</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="any"
                  min="1"
                  max="50"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(e.target.value)}
                  className="w-full px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                  placeholder="10"
                />
                <span className="text-xs text-abyss-500 whitespace-nowrap">km</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full btn-primary py-2.5 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('adminDiveSites.import.importing')}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {t('adminDiveSites.import.button')}
              </>
            )}
          </button>

          {result && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700">
              <p>{t('adminDiveSites.import.imported')}: {result.imported}</p>
            </div>
          )}

          {error && (
            <div className="bg-coral-50 border border-coral-200 rounded-lg p-3 text-sm text-coral-600">{error}</div>
          )}
        </div>
      )}
    </div>
  );
}
