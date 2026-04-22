import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Anchor, AlertCircle, Waves, User, Mail, Lock, Users } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Diver',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('register.errors.passwordMismatch'));
      return;
    }

    if (formData.password.length < 8) {
      setError(t('register.errors.passwordLength'));
      return;
    }

    setIsLoading(true);

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });
    if (result.ok) {
      navigate('/map');
    } else {
      setError(result.error || t('register.errors.defaultError'));
    }
    setIsLoading(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 ocean-gradient-light">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-ocean-600 to-sea-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Anchor className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-abyss-900">{t('register.title')}</h1>
          <p className="text-abyss-500 mt-2">{t('register.subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl border border-ocean-100">
          {error && (
            <div className="bg-coral-50 border border-coral-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-coral-500 flex-shrink-0 mt-0.5" />
              <p className="text-coral-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-abyss-700 mb-2">
                  <User className="w-4 h-4 inline mr-1.5 text-ocean-500" />
                  {t('register.firstNameLabel')}
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all text-abyss-800 bg-ocean-50/50 hover:border-ocean-300"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-abyss-700 mb-2">
                  {t('register.lastNameLabel')}
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all text-abyss-800 bg-ocean-50/50 hover:border-ocean-300"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-abyss-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1.5 text-ocean-500" />
                {t('register.emailLabel')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all text-abyss-800 bg-ocean-50/50 hover:border-ocean-300"
                placeholder={t('register.emailPlaceholder')}
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-abyss-700 mb-2">
                <Users className="w-4 h-4 inline mr-1.5 text-ocean-500" />
                {t('register.roleLabel')}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all bg-ocean-50/50 text-abyss-800 hover:border-ocean-300"
              >
                <option value="Diver">{t('register.roleOptions.diver')}</option>
                <option value="Trainer">{t('register.roleOptions.trainer')}</option>
                <option value="DiveCenter">{t('register.roleOptions.diveCenter')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-abyss-700 mb-2">
                <Lock className="w-4 h-4 inline mr-1.5 text-ocean-500" />
                {t('register.passwordLabel')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all text-abyss-800 bg-ocean-50/50 hover:border-ocean-300"
                placeholder={t('register.passwordPlaceholder')}
                required
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-abyss-700 mb-2">
                {t('register.confirmPasswordLabel')}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none transition-all text-abyss-800 bg-ocean-50/50 hover:border-ocean-300"
                placeholder={t('register.confirmPasswordPlaceholder')}
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
                  {t('register.submitting')}
                </span>
              ) : (
                <>
                  <Waves className="w-5 h-5" />
                  {t('register.submitButton')}
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-abyss-500 mt-8 text-sm">
          {t('register.hasAccount')}{' '}
          <Link to="/login" className="text-ocean-600 hover:text-ocean-700 font-semibold">
            {t('register.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
