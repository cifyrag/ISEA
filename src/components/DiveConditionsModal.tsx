import { useTranslation } from 'react-i18next';
import PersonalAssessmentSection from './PersonalAssessmentSection';
import {
  type DiveConditions,
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
import { useTranslatedEnum } from '../hooks/useTranslatedEnum';
import { useUnitFormatter } from '../hooks/useUnitFormatter';
import {
  X,
  Eye,
  Thermometer,
  Waves,
  AlertTriangle,
  CheckCircle,
  Shield,
  Anchor,
  CloudRain,
  Navigation,
  Camera,
  Fish,
  Info,
  TrendingDown,
} from 'lucide-react';

interface Props {
  conditions: DiveConditions;
  onClose: () => void;
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-ocean-100 overflow-hidden">
      <div className="bg-gradient-to-r from-ocean-50 to-sea-50 px-5 py-3.5 border-b border-ocean-100">
        <h3 className="font-semibold text-abyss-800 flex items-center gap-2">
          <Icon className="w-4 h-4 text-ocean-600" />
          {title}
        </h3>
      </div>
      <div className="p-5 space-y-1">{children}</div>
    </div>
  );
}

function DataRow({ label, value, note, warning }: { label: string; value: React.ReactNode; note?: string; warning?: boolean }) {
  return (
    <div className="py-2.5 border-b border-ocean-50 last:border-0">
      <div className="flex justify-between items-start gap-4">
        <span className="text-sm text-abyss-500">{label}</span>
        <span className={`text-sm font-medium text-right ${warning ? 'text-coral-600' : 'text-abyss-800'}`}>{value ?? 'N/A'}</span>
      </div>
      {note && <p className="text-xs text-abyss-400 mt-1.5 italic">{note}</p>}
    </div>
  );
}

function NoteBox({ children, type = 'info' }: { children: React.ReactNode; type?: 'info' | 'warning' | 'success' }) {
  const styles = {
    info: 'bg-ocean-50 border-ocean-200 text-ocean-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };
  return (
    <div className={`text-sm p-3.5 mt-2 rounded-lg border ${styles[type]} flex items-start gap-2.5 leading-relaxed`}>
      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

export default function DiveConditionsModal({ conditions, onClose }: Props) {
  const { t } = useTranslation();
  const te = useTranslatedEnum();
  const { convert, unit } = useUnitFormatter();
  const { visibility, waterPhysics, dynamics, weatherContext, surfaceConditions, safetyAssessment, recommendations, bathymetry } = conditions;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4" onClick={onClose}>
      <div
        className="bg-ocean-50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-ocean-600 to-sea-600 text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{t('conditionsModal.title')}</h2>
            <p className="text-ocean-100 text-sm mt-1">{conditions.location}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold">{conditions.safetyScore}</div>
              <div className="text-xs text-ocean-200">{t('conditionsModal.safetyScore')}</div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 dive-scrollbar">
          {conditions.personalAssessment && (
            <PersonalAssessmentSection personalAssessment={conditions.personalAssessment} />
          )}

          {(safetyAssessment?.activeWarnings?.length > 0 || safetyAssessment?.advisories?.length > 0) && (
            <Section title={t('conditionsModal.warningsTitle')} icon={AlertTriangle}>
              {safetyAssessment.activeWarnings?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-coral-600 uppercase mb-2">{t('conditionsModal.activeWarnings')}</p>
                  <ul className="space-y-1">
                    {safetyAssessment.activeWarnings.map((w, i) => (
                      <li key={i} className="text-sm text-coral-700 bg-coral-50 px-3 py-2 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {safetyAssessment.advisories?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-600 uppercase mb-2">{t('conditionsModal.advisories')}</p>
                  <ul className="space-y-1">
                    {safetyAssessment.advisories.map((a, i) => (
                      <li key={i} className="text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Section title={t('conditionsModal.visibility.title')} icon={Eye}>
              <DataRow label={t('conditionsModal.visibility.estimated')} value={`${convert(visibility?.estimatedVisibilityM, 'depth')?.toFixed(1)} ${unit('depth')}`} />
              <DataRow label={t('conditionsModal.visibility.base')} value={`${convert(visibility?.baseVisibilityM, 'depth')?.toFixed(1)} ${unit('depth')}`} />
              {visibility?.secchiDepthM != null && <DataRow label={t('conditionsModal.visibility.secchiDepth')} value={`${convert(visibility.secchiDepthM, 'depth')?.toFixed(1)} ${unit('depth')}`} />}
              {visibility?.kd490 != null && <DataRow label={t('conditionsModal.visibility.kd490')} value={visibility.kd490.toFixed(3)} />}
              {visibility?.chlorophyllMgM3 != null && <DataRow label={t('conditionsModal.visibility.chlorophyll')} value={`${visibility.chlorophyllMgM3.toFixed(2)} mg/m³`} />}
              <DataRow label={t('conditionsModal.visibility.planktonLevel')} value={te(PlanktonLevelLabels, visibility?.planktonLevel)} />
              <DataRow label={t('conditionsModal.visibility.sedimentLevel')} value={te(SedimentLevelLabels, visibility?.sedimentLevel)} />
              {visibility?.runoffPenalty > 0 && <DataRow label={t('conditionsModal.visibility.runoffPenalty')} value={`-${convert(visibility.runoffPenalty, 'depth')?.toFixed(1)} ${unit('depth')}`} warning />}
              {visibility?.wavePenalty > 0 && <DataRow label={t('conditionsModal.visibility.wavePenalty')} value={`-${convert(visibility.wavePenalty, 'depth')?.toFixed(1)} ${unit('depth')}`} warning />}
              {visibility?.visibilityNote && <NoteBox>{visibility.visibilityNote}</NoteBox>}
              {visibility?.warning && <NoteBox type="warning">{visibility.warning}</NoteBox>}
            </Section>

            <Section title={t('conditionsModal.waterTemp.title')} icon={Thermometer}>
              <DataRow label={t('conditionsModal.waterTemp.surface')} value={`${convert(waterPhysics?.surfaceTempC, 'temperature')?.toFixed(1)}${unit('temperature')}`} />
              <DataRow label={t('conditionsModal.waterTemp.estimatedBottom')} value={`${convert(waterPhysics?.estimatedBottomTempC, 'temperature')?.toFixed(1)}${unit('temperature')}`} />
              <DataRow label={t('conditionsModal.waterTemp.plannedDepth')} value={`${convert(waterPhysics?.plannedDepthM, 'depth')?.toFixed(0)} ${unit('depth')}`} />
              {waterPhysics?.thermoclineDepthM != null && (
                <DataRow label={t('conditionsModal.waterTemp.thermoclineDepth')} value={`${convert(waterPhysics.thermoclineDepthM, 'depth')?.toFixed(0)} ${unit('depth')}`} />
              )}
              {waterPhysics?.thermoclineStrengthCPerM != null && (
                <DataRow label={t('conditionsModal.waterTemp.thermoclineStrength')} value={`${convert(waterPhysics.thermoclineStrengthCPerM, 'thermocline')?.toFixed(2)}${unit('thermocline')}`} />
              )}
              <DataRow label={t('conditionsModal.waterTemp.season')} value={te(SeasonLabels, waterPhysics?.season)} />
              <DataRow label={t('conditionsModal.waterTemp.recommendedSuit')} value={te(WetsuitTypeLabels, waterPhysics?.recommendedSuit)} />
              {waterPhysics?.thermoclineNote && <NoteBox>{waterPhysics.thermoclineNote}</NoteBox>}
              {waterPhysics?.thermalProtectionNotes && <NoteBox>{waterPhysics.thermalProtectionNotes}</NoteBox>}
            </Section>

            <Section title={t('conditionsModal.currents.title')} icon={Navigation}>
              <DataRow label={t('conditionsModal.currents.currentSpeed')} value={`${dynamics?.currentSpeedKnots?.toFixed(1)} kn (${convert(dynamics?.currentSpeedMs, 'speed')?.toFixed(2)} ${unit('speed')})`} />
              <DataRow label={t('conditionsModal.currents.currentStrength')} value={te(CurrentStrengthLabels, dynamics?.currentStrength)} />
              <DataRow label={t('conditionsModal.currents.currentDirection')} value={`${dynamics?.currentDirection} (${dynamics?.currentDirectionDegrees}°)`} />
              <DataRow label={t('conditionsModal.currents.tidePhase')} value={te(TidePhaseLabels, dynamics?.tidePhase)} />
              {dynamics?.tideHeightM != null && <DataRow label={t('conditionsModal.currents.tideHeight')} value={`${convert(dynamics.tideHeightM, 'depth')?.toFixed(2)} ${unit('depth')}`} />}
              {dynamics?.tidalRangeM != null && <DataRow label={t('conditionsModal.currents.tidalRange')} value={`${convert(dynamics.tidalRangeM, 'depth')?.toFixed(2)} ${unit('depth')}`} />}
              {dynamics?.nextHighTide && <DataRow label={t('conditionsModal.currents.nextHighTide')} value={new Date(dynamics.nextHighTide).toLocaleTimeString()} />}
              {dynamics?.nextLowTide && <DataRow label={t('conditionsModal.currents.nextLowTide')} value={new Date(dynamics.nextLowTide).toLocaleTimeString()} />}
              {dynamics?.nextSlackTide && <DataRow label={t('conditionsModal.currents.nextSlackTide')} value={new Date(dynamics.nextSlackTide).toLocaleTimeString()} />}
              {dynamics?.timeToSlack && <DataRow label={t('conditionsModal.currents.timeToSlack')} value={dynamics.timeToSlack} />}
              <DataRow label={t('conditionsModal.currents.slackWindow')} value={dynamics?.isSlackWindow ? t('common.yes') : t('common.no')} />
              <DataRow label={t('conditionsModal.currents.driftDiving')} value={dynamics?.isDriftDivingPossible ? t('common.yes') : t('common.no')} />
              {dynamics?.currentNote && <NoteBox>{dynamics.currentNote}</NoteBox>}
              {dynamics?.safetyNote && <NoteBox type="warning">{dynamics.safetyNote}</NoteBox>}
            </Section>

            <Section title={t('conditionsModal.surge.title')} icon={Waves}>
              <DataRow label={t('conditionsModal.surge.waveHeight')} value={`${convert(weatherContext?.waveHeightM, 'waveHeight')?.toFixed(1)} ${unit('waveHeight')}`} />
              <DataRow label={t('conditionsModal.surge.wavePeriod')} value={`${weatherContext?.wavePeriodS?.toFixed(1)} s`} />
              <DataRow label={t('conditionsModal.surge.waveCondition')} value={te(WaveConditionLabels, weatherContext?.waveCondition)} />
              {weatherContext?.waveDirection && <DataRow label={t('conditionsModal.surge.waveDirection')} value={`${weatherContext.waveDirection} (${weatherContext.waveDirectionDegrees}°)`} />}
              {weatherContext?.swellHeightM != null && <DataRow label={t('conditionsModal.surge.swellHeight')} value={`${convert(weatherContext.swellHeightM, 'waveHeight')?.toFixed(1)} ${unit('waveHeight')}`} />}
              {weatherContext?.swellPeriodS != null && <DataRow label={t('conditionsModal.surge.swellPeriod')} value={`${weatherContext.swellPeriodS.toFixed(1)} s`} />}
              {weatherContext?.swellDirection && <DataRow label={t('conditionsModal.surge.swellDirection')} value={weatherContext.swellDirection} />}
              <DataRow label={t('conditionsModal.surge.waveEnergy')} value={`${dynamics?.waveEnergy?.toFixed(0)} J/m²`} />
              <DataRow label={t('conditionsModal.surge.surgeIntensity')} value={te(SurgeIntensityLabels, dynamics?.surgeIntensity)} />
              <DataRow label={t('conditionsModal.surge.surgeDepth')} value={`${convert(dynamics?.surgeDepthPenetrationM, 'depth')?.toFixed(1)} ${unit('depth')}`} />
              {dynamics?.surgeNote && <NoteBox>{dynamics.surgeNote}</NoteBox>}
            </Section>

            <Section title={t('conditionsModal.weather.title')} icon={CloudRain}>
              <DataRow label={t('conditionsModal.weather.windSpeed')} value={`${weatherContext?.windSpeedKnots?.toFixed(1)} kn (${convert(weatherContext?.windSpeedMs, 'speed')?.toFixed(1)} ${unit('speed')})`} />
              <DataRow label={t('conditionsModal.weather.windGusts')} value={`${weatherContext?.windGustKnots?.toFixed(1)} kn`} />
              <DataRow label={t('conditionsModal.weather.windDirection')} value={`${weatherContext?.windDirection} (${weatherContext?.windDirectionDegrees}°)`} />
              <DataRow label={t('conditionsModal.weather.beaufortScale')} value={te(BeaufortScaleLabels, weatherContext?.beaufortScale)} />
              <DataRow label={t('conditionsModal.weather.windType')} value={te(WindTypeLabels, weatherContext?.windType)} />
              {weatherContext?.airTempC != null && <DataRow label={t('conditionsModal.weather.airTemp')} value={`${convert(weatherContext.airTempC, 'temperature')?.toFixed(1)}${unit('temperature')}`} />}
              <DataRow label={t('conditionsModal.weather.sky')} value={te(SkyConditionLabels, weatherContext?.sky)} />
              <DataRow label={t('conditionsModal.weather.cloudCover')} value={`${weatherContext?.cloudCoverPercent}%`} />
              <DataRow label={t('conditionsModal.weather.precipitation')} value={`${convert(weatherContext?.precipitationMm, 'precipitation')?.toFixed(1)} ${unit('precipitation')} (${weatherContext?.precipitationProbabilityPercent}%)`} />
              <DataRow label={t('conditionsModal.weather.precipitationType')} value={te(PrecipitationTypeLabels, weatherContext?.precipitationType)} />
              <DataRow label={t('conditionsModal.weather.thunderstormRisk')} value={weatherContext?.isThunderstorm ? t('common.yes') : t('common.no')} warning={weatherContext?.isThunderstorm} />
              {weatherContext?.windTypeNote && <NoteBox>{weatherContext.windTypeNote}</NoteBox>}
            </Section>

            <Section title={t('conditionsModal.surface.title')} icon={Anchor}>
              <DataRow label={t('conditionsModal.surface.entryDifficulty')} value={te(DifficultyLevelLabels, surfaceConditions?.entryDifficulty)} />
              <DataRow label={t('conditionsModal.surface.exitDifficulty')} value={te(DifficultyLevelLabels, surfaceConditions?.exitDifficulty)} />
              <DataRow label={t('conditionsModal.surface.shoreDive')} value={surfaceConditions?.isShoreDivePossible ? t('common.yes') : t('common.no')} />
              <DataRow label={t('conditionsModal.surface.boatDive')} value={surfaceConditions?.isBoatDiveRecommended ? t('common.yes') : t('common.no')} />
              <DataRow label={t('conditionsModal.surface.boatConditions')} value={te(BoatConditionLabels, surfaceConditions?.boatConditions)} />
              <DataRow label={t('conditionsModal.surface.anchoring')} value={surfaceConditions?.isAnchoringDifficult ? t('common.yes') : t('common.no')} />
              <DataRow label={t('conditionsModal.surface.surfaceCurrents')} value={surfaceConditions?.hasStrongSurfaceCurrents ? t('common.yes') : t('common.no')} warning={surfaceConditions?.hasStrongSurfaceCurrents} />
              <DataRow label={t('conditionsModal.surface.breakingWaves')} value={surfaceConditions?.hasBreakingWaves ? t('common.yes') : t('common.no')} warning={surfaceConditions?.hasBreakingWaves} />
              <DataRow label={t('conditionsModal.surface.ripCurrent')} value={surfaceConditions?.hasRipCurrentRisk ? t('common.yes') : t('common.no')} warning={surfaceConditions?.hasRipCurrentRisk} />
              {surfaceConditions?.surfaceNotes && <NoteBox>{surfaceConditions.surfaceNotes}</NoteBox>}
            </Section>

            <Section title={t('conditionsModal.safety.title')} icon={Shield}>
              <DataRow label={t('conditionsModal.safety.overallRisk')} value={te(RiskLevelLabels, safetyAssessment?.riskLevel)} />
              <DataRow label={t('conditionsModal.safety.overallScore')} value={safetyAssessment?.overallSafetyScore} />
              <div className="grid grid-cols-2 gap-2 my-3">
                <div className="bg-ocean-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-ocean-700">{safetyAssessment?.waveScore}</div>
                  <div className="text-xs text-abyss-500">{t('conditionsModal.safety.waveScore')}</div>
                </div>
                <div className="bg-ocean-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-ocean-700">{safetyAssessment?.currentScore}</div>
                  <div className="text-xs text-abyss-500">{t('conditionsModal.safety.currentScore')}</div>
                </div>
                <div className="bg-ocean-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-ocean-700">{safetyAssessment?.visibilityScore}</div>
                  <div className="text-xs text-abyss-500">{t('conditionsModal.safety.visibilityScore')}</div>
                </div>
                <div className="bg-ocean-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-ocean-700">{safetyAssessment?.weatherScore}</div>
                  <div className="text-xs text-abyss-500">{t('conditionsModal.safety.weatherScore')}</div>
                </div>
                <div className="bg-ocean-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-ocean-700">{safetyAssessment?.temperatureScore}</div>
                  <div className="text-xs text-abyss-500">{t('conditionsModal.safety.temperatureScore')}</div>
                </div>
                <div className="bg-ocean-50 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold text-ocean-700">{safetyAssessment?.surgeScore}</div>
                  <div className="text-xs text-abyss-500">{t('conditionsModal.safety.surgeScore')}</div>
                </div>
              </div>
              <DataRow label={t('conditionsModal.safety.minCertification')} value={te(CertificationLevelLabels, safetyAssessment?.minimumCertificationLevel)} />
              <DataRow label={t('conditionsModal.safety.requiresGuide')} value={safetyAssessment?.requiresLocalGuide ? t('common.yes') : t('common.no')} />
              <DataRow label={t('conditionsModal.safety.requiresEquipment')} value={safetyAssessment?.requiresSpecialEquipment ? t('common.yes') : t('common.no')} />
              {safetyAssessment?.requiredEquipment?.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-abyss-600 mb-1">{t('conditionsModal.safety.requiredEquipment')}</p>
                  <div className="flex flex-wrap gap-1">
                    {safetyAssessment.requiredEquipment.map((eq, i) => (
                      <span key={i} className="text-xs bg-ocean-100 text-ocean-700 px-2 py-1 rounded">{eq}</span>
                    ))}
                  </div>
                </div>
              )}
              {safetyAssessment?.shouldPostponeDive && (
                <NoteBox type="warning">
                  {t('conditionsModal.safety.postponeRecommended', { reason: safetyAssessment.postponeReason })}
                  {safetyAssessment.nextSafeWindow && t('conditionsModal.safety.nextSafeWindow', { window: safetyAssessment.nextSafeWindow })}
                </NoteBox>
              )}
            </Section>

            <Section title={t('conditionsModal.bathymetry.title')} icon={TrendingDown}>
              {bathymetry?.isUsingNearestWater && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700 font-medium">
                    {bathymetry.isLand
                      ? t('conditionsModal.bathymetry.onLand')
                      : t('conditionsModal.bathymetry.tooShallow', { depth: convert(bathymetry.originalDepthM, 'depth')?.toFixed(1) })
                    }
                  </p>
                  {conditions.distanceToWaterKm && conditions.distanceToWaterKm > 0 && (
                    <p className="text-xs text-amber-600 mt-1">{t('conditionsModal.bathymetry.distance', { distance: convert(conditions.distanceToWaterKm, 'distance')?.toFixed(2) })}</p>
                  )}
                </div>
              )}
              {bathymetry?.depthM != null && <DataRow label={t('conditionsModal.bathymetry.depthAtSite')} value={`${convert(bathymetry.depthM, 'depth')?.toFixed(1)} ${unit('depth')}`} />}
              {bathymetry?.originalDepthM != null && <DataRow label={t('conditionsModal.bathymetry.originalDepth')} value={`${convert(bathymetry.originalDepthM, 'depth')?.toFixed(1)} ${unit('depth')} ${t('conditionsModal.bathymetry.tooShallowSuffix')}`} />}
              {bathymetry?.maxDiveDepthM != null && <DataRow label={t('conditionsModal.bathymetry.maxDiveDepth')} value={`${convert(bathymetry.maxDiveDepthM, 'depth')?.toFixed(1)} ${unit('depth')}`} />}
              {bathymetry?.beginnerDepthM != null && <DataRow label={t('conditionsModal.bathymetry.beginnerDepth')} value={`${convert(bathymetry.beginnerDepthM, 'depth')?.toFixed(1)} ${unit('depth')}`} />}
              {bathymetry?.minDepthInAreaM != null && <DataRow label={t('conditionsModal.bathymetry.minDepthArea')} value={`${convert(bathymetry.minDepthInAreaM, 'depth')?.toFixed(1)} ${unit('depth')}`} />}
              {bathymetry?.maxDepthInAreaM != null && <DataRow label={t('conditionsModal.bathymetry.maxDepthArea')} value={`${convert(bathymetry.maxDepthInAreaM, 'depth')?.toFixed(1)} ${unit('depth')}`} />}
              {bathymetry?.slopePercent != null && <DataRow label={t('conditionsModal.bathymetry.slope')} value={`${bathymetry.slopePercent.toFixed(1)}%`} />}
              {bathymetry?.terrainType && <DataRow label={t('conditionsModal.bathymetry.terrainType')} value={bathymetry.terrainType} />}
              {bathymetry?.inferredBottomComposition && <DataRow label={t('conditionsModal.bathymetry.bottomComposition')} value={te(BottomCompositionLabels, bathymetry.inferredBottomComposition)} />}
              {bathymetry?.offshoreDirection && <DataRow label={t('conditionsModal.bathymetry.offshoreDirection')} value={`${bathymetry.offshoreDirection} (${bathymetry.offshoreDirectionDegrees}°)`} />}
              {bathymetry?.note && <NoteBox>{bathymetry.note}</NoteBox>}
            </Section>

            <Section title={t('conditionsModal.recommendations.title')} icon={CheckCircle}>
              <DataRow label={t('conditionsModal.recommendations.bestTime')} value={recommendations?.bestTimeToday} />
              {recommendations?.optimalSlackTide && <DataRow label={t('conditionsModal.recommendations.optimalSlack')} value={recommendations.optimalSlackTide} />}
              <DataRow label={t('conditionsModal.recommendations.recommendedSuit')} value={te(WetsuitTypeLabels, recommendations?.recommendedExposureSuit)} />
              <DataRow label={t('conditionsModal.recommendations.needsHood')} value={recommendations?.needsHood ? t('common.yes') : t('common.no')} />
              <DataRow label={t('conditionsModal.recommendations.needsGloves')} value={recommendations?.needsGloves ? t('common.yes') : t('common.no')} />
              <DataRow label={t('conditionsModal.recommendations.needsBoots')} value={recommendations?.needsBoots ? t('common.yes') : t('common.no')} />
              <DataRow label={t('conditionsModal.recommendations.diveType')} value={te(DiveTypeLabels, recommendations?.diveTypeRecommendation)} />
              <DataRow label={t('conditionsModal.recommendations.suitableForBeginners')} value={te(BeginnerSuitabilityLabels, recommendations?.suitableForBeginners)} />
              <DataRow label={t('conditionsModal.recommendations.idealExperience')} value={te(CertificationLevelLabels, recommendations?.idealExperienceLevel)} />
              {recommendations?.specialConsiderations?.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-abyss-600 mb-1">{t('conditionsModal.recommendations.specialConsiderations')}</p>
                  <ul className="space-y-1">
                    {recommendations.specialConsiderations.map((c, i) => (
                      <li key={i} className="text-sm text-abyss-600 bg-ocean-50 px-3 py-2 rounded-lg">{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>

            <Section title={t('conditionsModal.marinLife.title')} icon={Camera}>
              <DataRow label={t('conditionsModal.marinLife.photoConditions')} value={te(PhotoConditionsLabels, recommendations?.photoConditions)} />
              {recommendations?.photoNotes && <NoteBox>{recommendations.photoNotes}</NoteBox>}
              {recommendations?.marineLifeAlerts?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-abyss-600 mb-2 flex items-center gap-1">
                    <Fish className="w-3 h-3" /> {t('conditionsModal.marinLife.marineLifeAlerts')}
                  </p>
                  <ul className="space-y-1">
                    {recommendations.marineLifeAlerts.map((alert, i) => (
                      <li key={i} className="text-sm text-abyss-600 bg-amber-50 px-3 py-2 rounded-lg">{alert}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>
          </div>

          <div className="text-xs text-abyss-400 text-center pt-4 border-t border-ocean-200">
            <p>{t('conditionsModal.dataSources', { sources: [visibility?.dataSource, waterPhysics?.dataSource, dynamics?.dataSource, weatherContext?.dataSource].filter(Boolean).join(', ') || t('common.na') })}</p>
            <p className="mt-1">{t('conditionsModal.requested', { time: new Date(conditions.requestTime).toLocaleString() })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
