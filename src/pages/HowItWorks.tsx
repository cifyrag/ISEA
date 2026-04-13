import { useTranslation } from 'react-i18next';
import MarketingPage, { SectionHeading, InfoCard } from '../components/MarketingPage';
import {
  Sparkles,
  MapPin,
  Mountain,
  CloudSun,
  Waves,
  Moon,
  Satellite,
  Eye,
  Wind,
  Shield,
  Brain,
  Clock,
  Layers,
} from 'lucide-react';

const PIPELINE = [
  { key: 'locate',     icon: MapPin },
  { key: 'bathymetry', icon: Mountain },
  { key: 'weather',    icon: CloudSun },
  { key: 'marine',     icon: Waves },
  { key: 'tides',      icon: Moon },
  { key: 'satellite',  icon: Satellite },
  { key: 'visibility', icon: Eye },
  { key: 'dynamics',   icon: Wind },
  { key: 'safety',     icon: Shield },
  { key: 'ai',         icon: Brain },
];

export default function HowItWorks() {
  const { t } = useTranslation();

  return (
    <MarketingPage
      eyebrow={t('howItWorks.eyebrow')}
      icon={Sparkles}
      title={t('howItWorks.title')}
      titleHighlight={t('howItWorks.titleHighlight')}
      subtitle={t('howItWorks.subtitle')}
      breadcrumbs={[{ label: t('howItWorks.crumb') }]}
    >
      <SectionHeading
        eyebrow={t('howItWorks.pipeline.eyebrow')}
        title={t('howItWorks.pipeline.title')}
        subtitle={t('howItWorks.pipeline.subtitle')}
      />

      <ol className="space-y-5 mb-16">
        {PIPELINE.map((stage, i) => {
          const Icon = stage.icon;
          const isLast = i === PIPELINE.length - 1;
          return (
            <li key={stage.key} className="relative flex gap-4 sm:gap-5 items-center">
              {!isLast && (
                <div
                  className="absolute left-[22px] top-1/2 w-0.5 bg-ocean-200 -translate-x-1/2"
                  style={{ height: 'calc(100% + 20px)' }}
                  aria-hidden="true"
                />
              )}
              <div className="w-11 h-11 bg-gradient-to-br from-ocean-500 to-sea-500 rounded-xl flex items-center justify-center shadow-md shadow-ocean-500/25 flex-shrink-0 relative z-10 ring-4 ring-white">
                <Icon className="w-5 h-5 text-white" />
              </div>

              <div className="flex-1 min-w-0 bg-white rounded-xl border border-ocean-100 pt-2.5 pb-4 px-5 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1.5">
                  <span className="text-xs font-bold text-ocean-500 uppercase tracking-wider">
                    {t('howItWorks.pipeline.stageLabel')} {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-lg font-semibold text-abyss-900">
                    {t(`howItWorks.pipeline.stages.${stage.key}.title`)}
                  </h3>
                </div>
                <p className="text-abyss-600 text-sm leading-relaxed">
                  {t(`howItWorks.pipeline.stages.${stage.key}.description`)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <SectionHeading title={t('howItWorks.latency.title')} subtitle={t('howItWorks.latency.subtitle')} />

      <div className="grid sm:grid-cols-3 gap-4 mb-16">
        <InfoCard icon={Clock} title={t('howItWorks.latency.fast.title')} accent="emerald">
          <p>{t('howItWorks.latency.fast.body')}</p>
          <p className="font-semibold text-emerald-700">~2 – 10s</p>
        </InfoCard>
        <InfoCard icon={Clock} title={t('howItWorks.latency.typical.title')} accent="ocean">
          <p>{t('howItWorks.latency.typical.body')}</p>
          <p className="font-semibold text-ocean-700">~30 – 90s</p>
        </InfoCard>
        <InfoCard icon={Clock} title={t('howItWorks.latency.cold.title')} accent="amber">
          <p>{t('howItWorks.latency.cold.body')}</p>
          <p className="font-semibold text-amber-700">~2 – 5 min</p>
        </InfoCard>
      </div>

      <SectionHeading title={t('howItWorks.resilience.title')} subtitle={t('howItWorks.resilience.subtitle')} />
      <InfoCard icon={Layers} title={t('howItWorks.resilience.cardTitle')} accent="ocean">
        <p>{t('howItWorks.resilience.body1')}</p>
        <p>{t('howItWorks.resilience.body2')}</p>
      </InfoCard>
    </MarketingPage>
  );
}
