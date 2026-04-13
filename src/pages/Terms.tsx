import { useTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import MarketingPage from '../components/MarketingPage';
import { FileText } from 'lucide-react';

const SECTIONS = [
  'acceptance',
  'eligibility',
  'account',
  'license',
  'restrictions',
  'userContent',
  'thirdParty',
  'disclaimerOfWarranties',
  'limitationOfLiability',
  'indemnification',
  'termination',
  'governingLaw',
  'changes',
  'contact',
];

export default function Terms() {
  const { t } = useTranslation();

  return (
    <MarketingPage
      eyebrow={t('terms.eyebrow')}
      icon={FileText}
      title={t('terms.title')}
      subtitle={t('terms.subtitle')}
      breadcrumbs={[{ label: t('terms.crumb') }]}
    >
      <div className="prose-like max-w-3xl mx-auto">
        <p className="text-sm text-abyss-500 mb-8 italic">{t('terms.lastUpdated', { date: 'May 2026' })}</p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-10">
          <p className="text-sm text-amber-800 leading-relaxed">
            <Trans
              i18nKey="terms.summary"
              components={{ disclaimerLink: <Link to="/disclaimer" className="underline font-medium" />, contactLink: <Link to="/" className="underline font-medium" /> }}
            />
          </p>
        </div>

        {SECTIONS.map((key, idx) => (
          <section key={key} className="mb-8">
            <h2 className="text-xl font-bold text-abyss-900 mb-3">
              {idx + 1}. {t(`terms.sections.${key}.title`)}
            </h2>
            <p className="text-abyss-600 text-sm leading-relaxed whitespace-pre-line">
              {t(`terms.sections.${key}.body`)}
            </p>
          </section>
        ))}
      </div>
    </MarketingPage>
  );
}
