import { useTranslation } from 'react-i18next';
import {
  DiveStatusLabels,
  CurrentStrengthLabels,
  TidePhaseLabels,
  WaveConditionLabels,
  RiskLevelLabels,
  WetsuitTypeLabels,
  BeginnerSuitabilityLabels,
  SkyConditionLabels,
  SurgeIntensityLabels,
  SeasonLabels,
  CertificationLevelLabels,
  PlanktonLevelLabels,
  SedimentLevelLabels,
  WindTypeLabels,
  PrecipitationTypeLabels,
  DifficultyLevelLabels,
  BoatConditionLabels,
  BottomCompositionLabels,
  DiveTypeLabels,
  PhotoConditionsLabels,
  BeaufortScaleLabels,
} from '../services/api';

const LABELS_TO_PREFIX = new Map<Record<number, string>, string>([
  [DiveStatusLabels, 'enums.diveStatus'],
  [CurrentStrengthLabels, 'enums.currentStrength'],
  [TidePhaseLabels, 'enums.tidePhase'],
  [WaveConditionLabels, 'enums.waveCondition'],
  [RiskLevelLabels, 'enums.riskLevel'],
  [WetsuitTypeLabels, 'enums.wetsuitType'],
  [BeginnerSuitabilityLabels, 'enums.beginnerSuitability'],
  [SkyConditionLabels, 'enums.skyCondition'],
  [SurgeIntensityLabels, 'enums.surgeIntensity'],
  [SeasonLabels, 'enums.season'],
  [CertificationLevelLabels, 'enums.certificationLevel'],
  [PlanktonLevelLabels, 'enums.planktonLevel'],
  [SedimentLevelLabels, 'enums.sedimentLevel'],
  [WindTypeLabels, 'enums.windType'],
  [PrecipitationTypeLabels, 'enums.precipitationType'],
  [DifficultyLevelLabels, 'enums.difficultyLevel'],
  [BoatConditionLabels, 'enums.boatCondition'],
  [BottomCompositionLabels, 'enums.bottomComposition'],
  [DiveTypeLabels, 'enums.diveType'],
  [PhotoConditionsLabels, 'enums.photoConditions'],
  [BeaufortScaleLabels, 'enums.beaufortScale'],
]);

export function useTranslatedEnum() {
  const { t } = useTranslation();

  return function te(labels: Record<number, string>, value: number | string | undefined): string {
    if (value === undefined || value === null) return t('common.na');

    const prefix = LABELS_TO_PREFIX.get(labels);

    if (typeof value === 'number') {
      if (prefix) {
        return t(`${prefix}.${value}`, { defaultValue: labels[value] ?? t('common.unknown') });
      }
      return labels[value] ?? t('common.unknown');
    }

    if (typeof value === 'string') {
      if (prefix) {
        const entry = Object.entries(labels).find(([, v]) => v === value);
        if (entry) {
          return t(`${prefix}.${entry[0]}`, { defaultValue: value });
        }
        const humanReadable = value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
        const entryByHuman = Object.entries(labels).find(([, v]) => v === humanReadable);
        if (entryByHuman) {
          return t(`${prefix}.${entryByHuman[0]}`, { defaultValue: humanReadable });
        }
      }
      const values = Object.values(labels);
      if (values.includes(value)) return value;
      return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
    }

    return t('common.unknown');
  };
}
