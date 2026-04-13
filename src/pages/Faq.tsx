import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MarketingPage from '../components/MarketingPage';
import { HelpCircle, ChevronDown } from 'lucide-react';

const QUESTIONS = [
  'whatIsIsea',
  'isItAi',
  'whyFiveMinutes',
  'accuracy',
  'offlineUse',
  'replaceInstructor',
  'safetyScore',
  'coldOpen',
  'lakes',
  'cost',
  'data',
];

function FaqItem({ qKey }: { qKey: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-ocean-100 last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left hover:bg-ocean-50/50 transition-colors px-1 rounded-lg"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-abyss-900 flex-1">
          {t(`faq.questions.${qKey}.q`)}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-ocean-500 flex-shrink-0 mt-0.5 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="pb-5 px-1 text-sm text-abyss-600 leading-relaxed">
          {t(`faq.questions.${qKey}.a`)}
        </div>
      )}
    </div>
  );
}

export default function Faq() {
  const { t } = useTranslation();
  return (
    <MarketingPage
      eyebrow={t('faq.eyebrow')}
      icon={HelpCircle}
      title={t('faq.title')}
      titleHighlight={t('faq.titleHighlight')}
      subtitle={t('faq.subtitle')}
      breadcrumbs={[{ label: t('faq.crumb') }]}
    >
      <div className="bg-white rounded-2xl border border-ocean-100 p-6 sm:p-8">
        {QUESTIONS.map((qKey) => (
          <FaqItem key={qKey} qKey={qKey} />
        ))}
      </div>
    </MarketingPage>
  );
}
