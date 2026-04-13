import { useTranslation } from 'react-i18next';
import MarketingPage, { SectionHeading, InfoCard } from '../components/MarketingPage';
import { ShieldCheck, Brain, Activity, AlertOctagon, Sparkles } from 'lucide-react';

const BANDS: Array<{ key: 'low' | 'moderate' | 'high' | 'extreme'; bgClass: string; textClass: string }> = [
  { key: 'low',      bgClass: 'bg-emerald-500', textClass: 'text-emerald-700' },
  { key: 'moderate', bgClass: 'bg-amber-500',   textClass: 'text-amber-700' },
  { key: 'high',     bgClass: 'bg-orange-500',  textClass: 'text-orange-700' },
  { key: 'extreme',  bgClass: 'bg-red-500',     textClass: 'text-red-700' },
];

export default function SafetyScoring() {
  const { t } = useTranslation();

  return (
    <MarketingPage
      eyebrow={t('safetyScoring.eyebrow')}
      icon={ShieldCheck}
      title={t('safetyScoring.title')}
      titleHighlight={t('safetyScoring.titleHighlight')}
      subtitle={t('safetyScoring.subtitle')}
      breadcrumbs={[{ label: t('safetyScoring.crumb') }]}
    >
      <SectionHeading
        eyebrow={t('safetyScoring.intro.eyebrow')}
        title={t('safetyScoring.intro.title')}
        subtitle={t('safetyScoring.intro.subtitle')}
      />
      <div className="grid sm:grid-cols-2 gap-5 mb-16">
        <InfoCard icon={Brain} title={t('safetyScoring.intro.cards.intelligence.title')} accent="ocean">
          <p>{t('safetyScoring.intro.cards.intelligence.body')}</p>
        </InfoCard>
        <InfoCard icon={Sparkles} title={t('safetyScoring.intro.cards.realtime.title')} accent="ocean">
          <p>{t('safetyScoring.intro.cards.realtime.body')}</p>
        </InfoCard>
      </div>

      <SectionHeading title={t('safetyScoring.bands.title')} subtitle={t('safetyScoring.bands.subtitle')} />
      <div className="grid sm:grid-cols-2 gap-4 mb-16">
        {BANDS.map((b) => (
          <div key={b.key} className="bg-white rounded-2xl border border-ocean-100 p-5 flex items-center gap-4">
            <div className={`w-16 h-16 ${b.bgClass} rounded-2xl flex items-center justify-center text-white flex-shrink-0`}>
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-base font-bold ${b.textClass}`}>{t(`safetyScoring.bands.${b.key}.label`)}</p>
              <p className="text-sm text-abyss-500 mt-0.5">{t(`safetyScoring.bands.${b.key}.description`)}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionHeading title={t('safetyScoring.overrides.title')} subtitle={t('safetyScoring.overrides.subtitle')} />
      <InfoCard icon={AlertOctagon} title={t('safetyScoring.overrides.cardTitle')} accent="coral">
        <p>{t('safetyScoring.overrides.body')}</p>
      </InfoCard>

      <div className="mt-16">
        <InfoCard icon={ShieldCheck} title={t('safetyScoring.disclaimer.title')} accent="amber">
          <p>{t('safetyScoring.disclaimer.body')}</p>
        </InfoCard>
      </div>
    </MarketingPage>
  );
}
