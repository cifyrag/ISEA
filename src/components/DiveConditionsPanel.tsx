import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type DiveConditions,
  DiveStatusLabels,
  CurrentStrengthLabels,
  WaveConditionLabels,
  WetsuitTypeLabels,
  BeginnerSuitabilityLabels,
} from '../services/api';
import { useTranslatedEnum } from '../hooks/useTranslatedEnum';
import { useUnitFormatter } from '../hooks/useUnitFormatter';
import {
  Eye,
  Thermometer,
  Wind,
  Waves,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Shield,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import DiveConditionsModal from './DiveConditionsModal';

interface Props {
  conditions: DiveConditions;
  onClose: () => void;
}

function getScoreColor(score: number) {
  if (score >= 80) return { bg: 'bg-safe', text: 'text-emerald-700', light: 'from-emerald-50 to-emerald-100', ring: 'ring-emerald-200' };
  if (score >= 60) return { bg: 'bg-caution', text: 'text-amber-700', light: 'from-amber-50 to-amber-100', ring: 'ring-amber-200' };
  if (score >= 40) return { bg: 'bg-warning', text: 'text-orange-700', light: 'from-orange-50 to-orange-100', ring: 'ring-orange-200' };
  return { bg: 'bg-danger', text: 'text-red-700', light: 'from-red-50 to-red-100', ring: 'ring-red-200' };
}

export default function DiveConditionsPanel({ conditions, onClose }: Props) {
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();
  const te = useTranslatedEnum();
  const { convert, unit } = useUnitFormatter();
  const scoreColors = getScoreColor(conditions.safetyScore);

  function getScoreLabel(score: number) {
    if (score >= 80) return t('conditions.excellent');
    if (score >= 60) return t('conditions.good');
    if (score >= 40) return t('conditions.fair');
    return t('conditions.poor');
  }

  return (
    <>
    <div className="border border-ocean-200 rounded-2xl overflow-hidden bg-white shadow-lg">
      <div className={`bg-gradient-to-br ${scoreColors.light} p-5`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {conditions.safetyScore >= 60 ? (
              <CheckCircle className={`w-5 h-5 ${scoreColors.text}`} />
            ) : (
              <AlertTriangle className={`w-5 h-5 ${scoreColors.text}`} />
            )}
            <span className={`font-semibold ${scoreColors.text}`}>{te(DiveStatusLabels, conditions.status)}</span>
          </div>
          <button onClick={onClose} className="text-abyss-400 hover:text-abyss-600 p-1 hover:bg-white/50 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className={`relative w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center ring-2 ${scoreColors.ring}`}>
            <div className="text-center">
              <div className={`text-2xl font-bold ${scoreColors.text}`}>
                {conditions.safetyScore}
              </div>
              <div className="text-[10px] text-abyss-500 font-medium">{getScoreLabel(conditions.safetyScore)}</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield className={`w-4 h-4 ${scoreColors.text}`} />
              <span className="text-xs font-semibold text-abyss-600 uppercase tracking-wider">{t('conditions.safetyScore')}</span>
            </div>
            <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-full ${scoreColors.bg} transition-all duration-500 rounded-full`}
                style={{ width: `${conditions.safetyScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-ocean-100">
        <div className="bg-white p-4">
          <div className="flex items-center gap-2 text-ocean-500 mb-2">
            <div className="w-7 h-7 bg-ocean-100 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-ocean-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide">{t('conditions.visibility')}</span>
          </div>
          <p className="text-xl font-bold text-abyss-800">
            {convert(conditions.visibility?.estimatedVisibilityM, 'depth')?.toFixed(0) || '—'}<span className="text-sm font-medium text-abyss-500 ml-1">{unit('depth')}</span>
          </p>
        </div>
        <div className="bg-white p-4">
          <div className="flex items-center gap-2 text-ocean-500 mb-2">
            <div className="w-7 h-7 bg-ocean-100 rounded-lg flex items-center justify-center">
              <Thermometer className="w-4 h-4 text-ocean-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide">{t('conditions.temperature')}</span>
          </div>
          <p className="text-xl font-bold text-abyss-800">
            {convert(conditions.waterPhysics?.surfaceTempC, 'temperature')?.toFixed(1) || '—'}<span className="text-sm font-medium text-abyss-500 ml-1">{unit('temperature')}</span>
          </p>
        </div>
        <div className="bg-white p-4">
          <div className="flex items-center gap-2 text-ocean-500 mb-2">
            <div className="w-7 h-7 bg-ocean-100 rounded-lg flex items-center justify-center">
              <Wind className="w-4 h-4 text-ocean-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide">{t('conditions.current')}</span>
          </div>
          <p className="text-xl font-bold text-abyss-800">
            {conditions.dynamics?.currentSpeedKnots?.toFixed(1) || '—'}<span className="text-sm font-medium text-abyss-500 ml-1">kn</span>
          </p>
          <p className="text-xs text-abyss-500 mt-0.5">{te(CurrentStrengthLabels, conditions.dynamics?.currentStrength)}</p>
        </div>
        <div className="bg-white p-4">
          <div className="flex items-center gap-2 text-ocean-500 mb-2">
            <div className="w-7 h-7 bg-ocean-100 rounded-lg flex items-center justify-center">
              <Waves className="w-4 h-4 text-ocean-600" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide">{t('conditions.waves')}</span>
          </div>
          <p className="text-xl font-bold text-abyss-800">
            {convert(conditions.weatherContext?.waveHeightM, 'waveHeight')?.toFixed(1) || '—'}<span className="text-sm font-medium text-abyss-500 ml-1">{unit('waveHeight')}</span>
          </p>
          <p className="text-xs text-abyss-500 mt-0.5">{te(WaveConditionLabels, conditions.weatherContext?.waveCondition)}</p>
        </div>
      </div>

      {conditions.bathymetry?.isUsingNearestWater && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-t border-amber-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">{t('conditions.locationAdjusted')}</p>
              <p className="text-sm text-amber-600">
                {conditions.bathymetry.isLand
                  ? t('conditions.onLandAdjusted', { distance: convert(conditions.distanceToWaterKm, 'distance')?.toFixed(1) })
                  : t('conditions.shallowAdjusted', { depth: convert(conditions.bathymetry.originalDepthM, 'depth')?.toFixed(1), distance: convert(conditions.distanceToWaterKm, 'distance')?.toFixed(1) })
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {conditions.safetyAssessment?.activeWarnings?.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-coral-50 to-red-50 border-t border-coral-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-coral-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-coral-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-coral-700 uppercase tracking-wider mb-1.5">{t('conditions.activeWarnings')}</p>
              <ul className="text-sm text-coral-600 space-y-1">
                {conditions.safetyAssessment.activeWarnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-coral-400 rounded-full mt-1.5 flex-shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {conditions.personalAssessment && (() => {
        const pa = conditions.personalAssessment;
        const warnings: string[] = [];
        if (pa.userCertification && !pa.isCertifiedForDive && pa.certificationGapWarning) warnings.push(pa.certificationGapWarning);
        if (pa.userPreferredMaxDepthM != null && !pa.isWithinPreferredDepth && pa.depthWarning) warnings.push(pa.depthWarning);
        if (pa.userPreferredSuit && !pa.hasAppropriateSuit && pa.suitUpgradeRecommendation) warnings.push(pa.suitUpgradeRecommendation);
        if (warnings.length === 0) return null;
        return (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-t border-amber-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5">{t('conditions.personalWarnings')}</p>
                <ul className="text-sm text-amber-700 space-y-1">
                  {warnings.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="p-4 border-t border-ocean-100 bg-gradient-to-r from-ocean-50/50 to-sea-50/50">
        <p className="text-xs font-bold text-abyss-700 uppercase tracking-wider mb-3">{t('conditions.recommendations')}</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-ocean-100">
            <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-ocean-600" />
            </div>
            <div>
              <span className="text-xs text-abyss-500 font-medium">{t('conditions.bestTime')}</span>
              <p className="text-sm font-semibold text-abyss-800">{conditions.recommendations?.bestTimeToday || t('common.na')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-ocean-100">
            <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Thermometer className="w-4 h-4 text-ocean-600" />
            </div>
            <div>
              <span className="text-xs text-abyss-500 font-medium">{t('conditions.recommendedSuit')}</span>
              <p className="text-sm font-semibold text-abyss-800">{te(WetsuitTypeLabels, conditions.recommendations?.recommendedExposureSuit)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl p-3 border border-ocean-100">
            <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 text-ocean-600" />
            </div>
            <div>
              <span className="text-xs text-abyss-500 font-medium">{t('conditions.suitableForBeginners')}</span>
              <p className="text-sm font-semibold text-abyss-800">{te(BeginnerSuitabilityLabels, conditions.recommendations?.suitableForBeginners)}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-ocean-100 hover:bg-ocean-200 text-ocean-700 font-medium rounded-xl transition-colors"
        >
          {t('conditions.viewFullDetails')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>

    {showModal && (
      <DiveConditionsModal conditions={conditions} onClose={() => setShowModal(false)} />
    )}
    </>
  );
}
