import { useTranslation } from 'react-i18next';
import type { PersonalAssessment } from '../services/api';
import {
  UserCheck,
  CheckCircle,
  AlertTriangle,
  GraduationCap,
  TrendingDown,
  Thermometer,
  Award,
  Phone,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  personalAssessment: PersonalAssessment;
}

export default function PersonalAssessmentSection({ personalAssessment: pa }: Props) {
  const { t } = useTranslation();

  const checks: Array<{
    key: string;
    icon: React.ElementType;
    label: string;
    status: 'pass' | 'warn';
    detail: string;
  }> = [];

  if (pa.userCertification != null) {
    checks.push({
      key: 'certification',
      icon: GraduationCap,
      label: t('personalAssessment.checks.certification.label'),
      status: pa.isCertifiedForDive ? 'pass' : 'warn',
      detail: pa.isCertifiedForDive
        ? t('personalAssessment.checks.certification.pass', { cert: pa.userCertification })
        : pa.certificationGapWarning ?? t('personalAssessment.checks.certification.warnFallback'),
    });
  }

  if (pa.userPreferredMaxDepthM != null) {
    checks.push({
      key: 'depth',
      icon: TrendingDown,
      label: t('personalAssessment.checks.depth.label'),
      status: pa.isWithinPreferredDepth ? 'pass' : 'warn',
      detail: pa.isWithinPreferredDepth
        ? t('personalAssessment.checks.depth.pass', { max: pa.userPreferredMaxDepthM })
        : pa.depthWarning ?? t('personalAssessment.checks.depth.warnFallback'),
    });
  }

  if (pa.userPreferredSuit != null) {
    checks.push({
      key: 'suit',
      icon: Thermometer,
      label: t('personalAssessment.checks.suit.label'),
      status: pa.hasAppropriateSuit ? 'pass' : 'warn',
      detail: pa.hasAppropriateSuit
        ? t('personalAssessment.checks.suit.pass')
        : pa.suitUpgradeRecommendation ?? t('personalAssessment.checks.suit.warnFallback'),
    });
  }

  if (pa.userTotalDives != null && pa.experienceLevel !== 'Unknown') {
    checks.push({
      key: 'experience',
      icon: Award,
      label: t('personalAssessment.checks.experience.label'),
      status: 'pass',
      detail: t('personalAssessment.checks.experience.detail', {
        level: t(`personalAssessment.experienceLevels.${pa.experienceLevel}`),
        dives: pa.userTotalDives,
      }),
    });
  }

  checks.push({
    key: 'emergencyContact',
    icon: pa.hasEmergencyContact ? Phone : ShieldAlert,
    label: t('personalAssessment.checks.emergencyContact.label'),
    status: pa.hasEmergencyContact ? 'pass' : 'warn',
    detail: pa.hasEmergencyContact
      ? t('personalAssessment.checks.emergencyContact.pass', {
          name: pa.emergencyContactName ?? '',
          relation: pa.emergencyContactRelation ?? '',
        }).trim()
      : pa.missingEmergencyContactReminder ?? t('personalAssessment.checks.emergencyContact.warnFallback'),
  });

  const warnCount = checks.filter((c) => c.status === 'warn').length;
  const passCount = checks.length - warnCount;

  return (
    <div className="bg-white rounded-xl border border-ocean-100 overflow-hidden">
      <div className="bg-gradient-to-r from-ocean-50 to-sea-50 px-5 py-3.5 border-b border-ocean-100">
        <h3 className="font-semibold text-abyss-800 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-ocean-600" />
          {t('personalAssessment.title')}
          <span className="ml-auto text-xs font-medium text-abyss-500">
            {warnCount > 0
              ? t('personalAssessment.summaryWithWarnings', { passes: passCount, warnings: warnCount })
              : t('personalAssessment.summaryAllPass', { passes: passCount })}
          </span>
        </h3>
      </div>

      <ul className="p-2">
        {checks.map((check) => {
          const Icon = check.icon;
          const isPass = check.status === 'pass';
          return (
            <li
              key={check.key}
              className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isPass ? 'hover:bg-emerald-50/50' : 'bg-amber-50/40 hover:bg-amber-50/70'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isPass ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                }`}
              >
                {isPass ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <Icon className="w-3.5 h-3.5 text-abyss-400 flex-shrink-0" />
                  <p className="text-sm font-medium text-abyss-800">{check.label}</p>
                </div>
                <p className={`text-xs leading-relaxed ${isPass ? 'text-abyss-500' : 'text-amber-800'}`}>
                  {check.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {pa.hasEmergencyContact && (pa.emergencyContactName || pa.emergencyContactPhone) && (
        <div className="mx-3 mb-3 mt-1 p-3 bg-coral-50 border border-coral-200 rounded-lg">
          <p className="text-[10px] font-bold text-coral-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3 h-3" />
            {t('personalAssessment.emergencyContactCard.title')}
          </p>
          <div className="text-sm text-abyss-800">
            <p className="font-medium">{pa.emergencyContactName}</p>
            {pa.emergencyContactPhone && (
              <a
                href={`tel:${pa.emergencyContactPhone}`}
                className="font-mono text-coral-700 hover:text-coral-800 hover:underline"
              >
                {pa.emergencyContactPhone}
              </a>
            )}
            {pa.emergencyContactRelation && (
              <span className="text-abyss-500 text-xs ml-2">· {pa.emergencyContactRelation}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
