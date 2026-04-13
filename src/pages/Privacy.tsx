import { useTranslation } from 'react-i18next';
import MarketingPage from '../components/MarketingPage';
import { Lock } from 'lucide-react';

const SECTIONS = [
  'whatWeCollect',
  'howWeUse',
  'legalBasis',
  'sharing',
  'thirdPartyApis',
  'cookies',
  'retention',
  'security',
  'yourRights',
  'children',
  'transfers',
  'changes',
  'contact',
];

export default function Privacy() {
  const { t } = useTranslation();

  return (
    <MarketingPage
      eyebrow={t('privacy.eyebrow')}
      icon={Lock}
      title={t('privacy.title')}
      subtitle={t('privacy.subtitle')}
      breadcrumbs={[{ label: t('privacy.crumb') }]}
    >
      <div className="prose-like max-w-3xl mx-auto">
        <p className="text-sm text-abyss-500 mb-8 italic">{t('privacy.lastUpdated', { date: 'May 2026' })}</p>

        <div className="bg-ocean-50 border border-ocean-200 rounded-xl p-4 mb-10">
          <p className="text-sm text-ocean-800 leading-relaxed">{t('privacy.summary')}</p>
        </div>

        {SECTIONS.map((key, idx) => (
          <section key={key} className="mb-8">
            <h2 className="text-xl font-bold text-abyss-900 mb-3">
              {idx + 1}. {t(`privacy.sections.${key}.title`)}
            </h2>
            <p className="text-abyss-600 text-sm leading-relaxed whitespace-pre-line">
              {t(`privacy.sections.${key}.body`)}
            </p>
          </section>
        ))}
      </div>
    </MarketingPage>
  );
}
