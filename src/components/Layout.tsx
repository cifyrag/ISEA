import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  Anchor, LogOut, Map, Waves, Users, Bookmark,
  Sparkles, ShieldCheck, HelpCircle, Menu, X,
} from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

const PUBLIC_TABS = [
  { to: '/how-it-works',   icon: Sparkles,    labelKey: 'nav.howItWorks' },
  { to: '/safety-scoring', icon: ShieldCheck, labelKey: 'nav.safetyScoring' },
  { to: '/faq',            icon: HelpCircle,  labelKey: 'nav.faq' },
];

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isMapPage = location.pathname === '/map';
  const isAdmin = user?.roles.includes('Admin');

  const authNav = isAuthenticated
    ? [
        { to: '/map',              icon: Map,      labelKey: 'nav.diveMap',         show: true },
        { to: '/dive-sites',       icon: Anchor,   labelKey: 'nav.diveSites',       show: true },
        { to: '/saved-locations',  icon: Bookmark, labelKey: 'nav.savedLocations',  show: !isAdmin },
        { to: '/admin/users',      icon: Users,    labelKey: 'nav.adminUsers',      show: !!isAdmin },
      ].filter(item => item.show)
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <nav className={`${isMapPage ? 'bg-white/95 backdrop-blur-sm border-b border-ocean-200' : 'glass border-b border-ocean-100'} sticky top-0 z-[1100]`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-2 sm:gap-4">

            <div className="flex items-center gap-6 min-w-0">
              <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-ocean-600 to-sea-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <Anchor className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-abyss-900 tracking-tight">iSea</span>
              </Link>

              <div className="hidden xl:flex items-center gap-1 pl-6 border-l border-ocean-100">
                {PUBLIC_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = location.pathname === tab.to;
                  return (
                    <Link
                      key={tab.to}
                      to={tab.to}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-ocean-100 text-ocean-700 font-medium'
                          : 'text-abyss-600 hover:bg-ocean-50 hover:text-ocean-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-medium">{t(tab.labelKey)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <LanguageSwitcher />

              {isAuthenticated && (
                <div className="hidden md:flex items-center gap-0.5">
                  {authNav.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        title={t(item.labelKey)}
                        aria-label={t(item.labelKey)}
                        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                          isActive
                            ? 'bg-ocean-100 text-ocean-700'
                            : 'text-abyss-600 hover:bg-ocean-50 hover:text-ocean-700'
                        }`}
                      >
                        <Icon className="w-[18px] h-[18px]" />
                      </Link>
                    );
                  })}
                  <div className="h-6 w-px bg-ocean-200 mx-1" />
                  <Link
                    to="/profile"
                    className="w-9 h-9 bg-gradient-to-br from-ocean-500 to-sea-500 rounded-full flex items-center justify-center shadow-sm hover:shadow-md hover:scale-105 transition-all flex-shrink-0"
                    title={t('nav.accountSettings')}
                  >
                    <span className="text-sm font-semibold text-white">
                      {user?.firstName?.charAt(0)}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-abyss-400 hover:text-coral-500 transition-colors p-2 rounded-lg hover:bg-coral-50 flex-shrink-0"
                    title={t('nav.logOut')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 sm:px-4 py-2 text-abyss-600 hover:text-ocean-700 font-medium transition-colors rounded-lg hover:bg-ocean-50 whitespace-nowrap"
                  >
                    {t('nav.logIn')}
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary px-4 sm:px-5 py-2.5 text-white font-medium rounded-xl whitespace-nowrap"
                  >
                    {t('nav.signUp')}
                  </Link>
                </div>
              )}

              <div className="relative xl:hidden" ref={mobileMenuRef}>
                <button
                  onClick={() => setMobileMenuOpen((o) => !o)}
                  className="p-2 rounded-lg text-abyss-600 hover:bg-ocean-50 hover:text-ocean-700 transition-colors"
                  aria-label="Menu"
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                {mobileMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-ocean-200 py-2 z-[2000] min-w-[240px] max-w-[calc(100vw-2rem)]">
                    <div className="px-2 pb-2 mb-1 border-b border-ocean-100">
                      <p className="text-[10px] font-bold text-abyss-400 uppercase tracking-wider px-3 pb-1">
                        {t('footer.resources')}
                      </p>
                      {PUBLIC_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = location.pathname === tab.to;
                        return (
                          <Link
                            key={tab.to}
                            to={tab.to}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive
                                ? 'bg-ocean-50 text-ocean-700 font-medium'
                                : 'text-abyss-700 hover:bg-ocean-50'
                            }`}
                          >
                            <Icon className="w-4 h-4 text-ocean-500 flex-shrink-0" />
                            <span>{t(tab.labelKey)}</span>
                          </Link>
                        );
                      })}
                    </div>

                    {isAuthenticated && (
                      <div className="md:hidden px-2 pb-2 mb-1 border-b border-ocean-100">
                        <p className="text-[10px] font-bold text-abyss-400 uppercase tracking-wider px-3 pb-1">
                          {t('footer.product')}
                        </p>
                        {authNav.map((item) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.to;
                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive
                                  ? 'bg-ocean-50 text-ocean-700 font-medium'
                                  : 'text-abyss-700 hover:bg-ocean-50'
                              }`}
                            >
                              <Icon className="w-4 h-4 text-ocean-500 flex-shrink-0" />
                              <span>{t(item.labelKey)}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {isAuthenticated && (
                      <div className="md:hidden px-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-abyss-700 hover:bg-ocean-50 transition-colors"
                        >
                          <div className="w-6 h-6 bg-gradient-to-br from-ocean-500 to-sea-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-semibold text-white">
                              {user?.firstName?.charAt(0)}
                            </span>
                          </div>
                          <span>{t('nav.accountSettings')}</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-coral-600 hover:bg-coral-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 flex-shrink-0" />
                          <span>{t('nav.logOut')}</span>
                        </button>
                      </div>
                    )}

                    {!isAuthenticated && (
                      <div className="sm:hidden px-2 flex flex-col gap-1">
                        <Link
                          to="/login"
                          className="px-3 py-2 rounded-lg text-sm text-abyss-700 hover:bg-ocean-50 transition-colors"
                        >
                          {t('nav.logIn')}
                        </Link>
                        <Link
                          to="/register"
                          className="btn-primary px-3 py-2 rounded-lg text-sm text-white text-center font-medium"
                        >
                          {t('nav.signUp')}
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {!isMapPage && (
        <footer className="bg-abyss-900 pt-14 pb-8 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-ocean-500 to-sea-500 rounded-lg flex items-center justify-center">
                    <Waves className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-semibold text-lg">iSea</span>
                </div>
                <p className="text-abyss-400 text-sm leading-relaxed">{t('footer.tagline')}</p>
              </div>

              <div>
                <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
                  {t('footer.product')}
                </h4>
                <ul className="space-y-2 text-sm">
                  {isAuthenticated && (
                    <li><Link to="/map" className="text-abyss-400 hover:text-white transition-colors">{t('nav.diveMap')}</Link></li>
                  )}
                  <li><Link to="/dive-sites" className="text-abyss-400 hover:text-white transition-colors">{t('nav.diveSites')}</Link></li>
                  <li><Link to="/how-it-works" className="text-abyss-400 hover:text-white transition-colors">{t('footer.howItWorks')}</Link></li>
                  <li><Link to="/safety-scoring" className="text-abyss-400 hover:text-white transition-colors">{t('footer.safetyScoring')}</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
                  {t('footer.resources')}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/faq" className="text-abyss-400 hover:text-white transition-colors">{t('footer.faq')}</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-3">
                  {t('footer.legal')}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><Link to="/disclaimer" className="text-abyss-400 hover:text-white transition-colors">{t('footer.disclaimer')}</Link></li>
                  <li><Link to="/terms" className="text-abyss-400 hover:text-white transition-colors">{t('footer.terms')}</Link></li>
                  <li><Link to="/privacy" className="text-abyss-400 hover:text-white transition-colors">{t('footer.privacy')}</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-abyss-800 pt-6 text-sm">
              <p className="text-abyss-500">
                &copy; {new Date().getFullYear()} iSea. {t('footer.copyright')}
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
