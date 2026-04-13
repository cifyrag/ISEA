import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Eye,
  Thermometer,
  Wind,
  Shield,
  Globe,
  Anchor,
  Clock,
  Sparkles,
  Satellite,
  Brain,
  Cpu,
  ShieldCheck,
  Layers,
  Activity,
  CheckCircle,
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('sessionExpired')) {
      setSessionExpired(true);
      localStorage.removeItem('sessionExpired');
    }
  }, []);

  const features = [
    { icon: Eye,         title: t('home.features.visibility.title'),   description: t('home.features.visibility.description') },
    { icon: Thermometer, title: t('home.features.temperature.title'),  description: t('home.features.temperature.description') },
    { icon: Wind,        title: t('home.features.currents.title'),     description: t('home.features.currents.description') },
    { icon: Shield,      title: t('home.features.safety.title'),       description: t('home.features.safety.description') },
  ];

  const stats = [
    { value: 'AI',     label: t('home.stats.aiPowered'),  sub: t('home.stats.aiPoweredSub') },
    { value: 'Global', label: t('home.stats.coverage'),   sub: t('home.stats.coverageSub') },
    { value: '24/7',   label: t('home.stats.realTime'),   sub: t('home.stats.realTimeSub') },
    { value: 'Free',   label: t('home.stats.free'),       sub: t('home.stats.freeSub') },
  ];

  const aiCapabilities = [
    { icon: Satellite, title: t('home.ai.capabilities.satellite.title'),   description: t('home.ai.capabilities.satellite.description') },
    { icon: Layers,    title: t('home.ai.capabilities.fusion.title'),      description: t('home.ai.capabilities.fusion.description') },
    { icon: Brain,     title: t('home.ai.capabilities.reasoning.title'),   description: t('home.ai.capabilities.reasoning.description') },
    { icon: Activity,  title: t('home.ai.capabilities.realtime.title'),    description: t('home.ai.capabilities.realtime.description') },
  ];

  return (
    <div className="flex-1">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 ocean-gradient-light" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M30%2030c0-11%209-20%2020-20s20%209%2020%2020-9%2020-20%2020-20-9-20-20z%22%20fill%3D%22%230ea5e9%22%20fill-opacity%3D%220.03%22%2F%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          {sessionExpired && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3 max-w-3xl">
              <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 text-sm">{t('session.expired')}</p>
            </div>
          )}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-ocean-100 text-ocean-700 rounded-full text-sm font-medium mb-6 border border-ocean-200">
              <Sparkles className="w-4 h-4" />
              {t('home.badge')}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-abyss-900 tracking-tight leading-[1.1] mb-6">
              {t('home.heroTitle')}{' '}
              <span className="gradient-text">{t('home.heroTitleHighlight')}</span>
            </h1>
            <p className="text-lg sm:text-xl text-abyss-600 leading-relaxed mb-8 max-w-2xl">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {isAuthenticated ? (
                <Link to="/map" className="btn-primary inline-flex items-center justify-center gap-2 text-white font-semibold px-6 py-3.5 rounded-xl">
                  {t('home.openDiveMap')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary inline-flex items-center justify-center gap-2 text-white font-semibold px-6 py-3.5 rounded-xl">
                    {t('home.getStarted')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-white hover:bg-ocean-50 text-ocean-800 font-semibold px-6 py-3.5 rounded-xl border border-ocean-200 transition-all hover:border-ocean-300 hover:shadow-md">
                    {t('home.logIn')}
                  </Link>
                </>
              )}
              <Link to="/how-it-works" className="inline-flex items-center justify-center gap-2 text-ocean-700 hover:text-ocean-900 font-medium px-6 py-3.5 rounded-xl hover:bg-white/50 transition-all">
                {t('home.howItWorksLink')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-abyss-500">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> {t('home.trust.satellite')}</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> {t('home.trust.research')}</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> {t('home.trust.free')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="ocean-gradient py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-ocean-100 text-sm sm:text-base font-medium">{stat.label}</div>
                <div className="text-ocean-300 text-xs mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-ocean-100 to-sea-100 text-ocean-800 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-ocean-200">
              <Brain className="w-3.5 h-3.5" />
              {t('home.ai.badge')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-abyss-900 mb-4">
              {t('home.ai.title')}
            </h2>
            <p className="text-lg text-abyss-500">
              {t('home.ai.subtitle')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aiCapabilities.map((cap, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-ocean-100 hover:border-ocean-300 bg-gradient-to-br from-white to-ocean-50/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-sea-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-ocean-500/20">
                  <cap.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-abyss-800 mb-2">{cap.title}</h3>
                <p className="text-abyss-500 text-sm leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-abyss-900 mb-4">{t('home.featuresSection.title')}</h2>
            <p className="text-lg text-abyss-500">{t('home.featuresSection.subtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="group p-6 rounded-2xl border border-ocean-100 hover:border-ocean-300 bg-gradient-to-br from-white to-ocean-50/50 transition-all duration-300 hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-sea-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-abyss-800 mb-2">{feature.title}</h3>
                <p className="text-abyss-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 ocean-gradient-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-abyss-900 mb-4">{t('home.howItWorks.title')}</h2>
            <p className="text-lg text-abyss-500">{t('home.howItWorks.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { step: '01', title: t('home.howItWorks.step01.title'), desc: t('home.howItWorks.step01.desc'), icon: Globe },
              { step: '02', title: t('home.howItWorks.step02.title'), desc: t('home.howItWorks.step02.desc'), icon: Cpu },
              { step: '03', title: t('home.howItWorks.step03.title'), desc: t('home.howItWorks.step03.desc'), icon: ShieldCheck },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-6 border border-ocean-100">
                  <item.icon className="w-7 h-7 text-ocean-600" />
                </div>
                <div className="text-sm font-bold text-ocean-500 mb-2">{t('home.howItWorks.step')} {item.step}</div>
                <h3 className="text-xl font-semibold text-abyss-900 mb-2">{item.title}</h3>
                <p className="text-abyss-500">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/how-it-works" className="btn-primary inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl">
              {t('home.howItWorks.cta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-amber-50 border-y border-amber-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 mb-1">{t('home.safetyBanner.title')}</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              {t('home.safetyBanner.body')}{' '}
              <Link to="/disclaimer" className="font-medium underline hover:text-amber-900">
                {t('home.safetyBanner.link')}
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="ocean-gradient rounded-3xl px-8 py-14 sm:px-12 sm:py-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2240%22%20fill%3D%22white%22%20fill-opacity%3D%220.05%22%2F%3E%3C%2Fsvg%3E')] opacity-30" />
            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center">
                  <Anchor className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">{t('home.cta.title')}</h2>
              <p className="text-ocean-200 mb-8 max-w-lg mx-auto text-lg">{t('home.cta.subtitle')}</p>
              {!isAuthenticated && (
                <Link to="/register" className="inline-flex items-center gap-2 bg-white hover:bg-ocean-50 text-ocean-900 font-semibold px-8 py-4 rounded-xl transition-all hover:shadow-lg">
                  {t('home.cta.button')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
