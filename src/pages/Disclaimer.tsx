import { useTranslation } from 'react-i18next';
import MarketingPage from '../components/MarketingPage';
import { AlertTriangle, ShieldAlert, LifeBuoy, GraduationCap, Stethoscope } from 'lucide-react';

const POINTS = [
  { key: 'noSubstitute',  icon: GraduationCap },
  { key: 'estimates',     icon: AlertTriangle },
  { key: 'localConditions', icon: ShieldAlert },
  { key: 'medical',       icon: Stethoscope },
  { key: 'emergency',     icon: LifeBuoy },
];

export default function Disclaimer() {
  const { t } = useTranslation();

  return (
    <MarketingPage
      eyebrow={t('disclaimer.eyebrow')}
      icon={ShieldAlert}
      title={t('disclaimer.title')}
      titleHighlight={t('disclaimer.titleHighlight')}
      subtitle={t('disclaimer.subtitle')}
      breadcrumbs={[{ label: t('disclaimer.crumb') }]}
    >
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-10 flex items-start gap-4">
        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-amber-900 mb-1">{t('disclaimer.bigWarning.headline')}</p>
          <p className="text-sm text-amber-800 leading-relaxed">{t('disclaimer.bigWarning.body')}</p>
        </div>
      </div>

      <div className="space-y-4">
        {POINTS.map((p) => {
          const Icon = p.icon;
          return (
            <div key={p.key} className="bg-white rounded-2xl border border-ocean-100 p-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-coral-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-coral-600" />
              </div>
              <div>
                <h3 className="font-semibold text-abyss-900 mb-2">{t(`disclaimer.points.${p.key}.title`)}</h3>
                <p className="text-sm text-abyss-600 leading-relaxed">{t(`disclaimer.points.${p.key}.body`)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 bg-abyss-900 text-white rounded-2xl p-6 text-center">
        <p className="text-sm leading-relaxed">{t('disclaimer.acknowledgement')}</p>
      </div>
    </MarketingPage>
  );
}
