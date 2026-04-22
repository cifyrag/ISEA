import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Anchor, AlertCircle, Waves, Clock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (localStorage.getItem('sessionExpired')) {
      setSessionExpired(true);
      localStorage.removeItem('sessionExpired');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login({ email, password });
    if (result.ok) {
      navigate('/map');
    } else {
      setError(result.error || t('login.defaultError'));
    }
    setIsLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 ocean-gradient-light">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-ocean-600 to-sea-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Anchor className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-abyss-900">{t('login.title')}</h1>
          <p className="text-abyss-500 mt-2">{t('login.subtitle')}</p>
        </div>

        {sessionExpired && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-amber-700 text-sm">{t('session.expired')}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-8 shadow-xl border border-ocean-100">
          {error && (
            <div className="bg-coral-50 border border-coral-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-coral-500 flex-shrink-0 mt-0.5" />
              <p className="text-coral-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-abyss-700 mb-2">
                {t('login.emailLabel')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all text-abyss-800 bg-ocean-50/50 hover:border-ocean-300"
                placeholder={t('login.emailPlaceholder')}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-abyss-700 mb-2">
                {t('login.passwordLabel')}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all text-abyss-800 bg-ocean-50/50 hover:border-ocean-300"
                placeholder={t('login.passwordPlaceholder')}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:bg-abyss-200 disabled:transform-none disabled:shadow-none text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('login.submitting')}
                </span>
              ) : (
                <>
                  <Waves className="w-5 h-5" />
                  {t('login.submitButton')}
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-abyss-500 mt-8 text-sm">
          {t('login.noAccount')}{' '}
          <Link to="/register" className="text-ocean-600 hover:text-ocean-700 font-semibold">
            {t('login.createOne')}
          </Link>
        </p>
      </div>
    </div>
  );
}
