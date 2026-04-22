import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useUnitPreferences } from '../context/UnitPreferencesContext';
import { type UnitSystem, type TemperatureUnit } from '../services/unitConversions';
import { userApi, type UserProfile, type UpdateProfileRequest } from '../services/api';
import {
  User,
  Mail,
  Award,
  Heart,
  Settings,
  Save,
  Loader2,
  ChevronLeft,
  Shield,
  AlertCircle,
  Check,
  Lock,
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { setUnitSystem, setTemperatureUnit } = useUnitPreferences();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const CERTIFICATION_LEVELS = [
    { value: 'Open Water', label: t('profile.diver.certificationLevels.openWater') },
    { value: 'Advanced Open Water', label: t('profile.diver.certificationLevels.advancedOpenWater') },
    { value: 'Rescue Diver', label: t('profile.diver.certificationLevels.rescueDiver') },
    { value: 'Divemaster', label: t('profile.diver.certificationLevels.divemaster') },
    { value: 'Instructor', label: t('profile.diver.certificationLevels.instructor') },
  ];

  const SUIT_TYPES = [
    { value: 'Wetsuit 3mm', label: t('profile.preferences.suitTypes.wetsuit3mm') },
    { value: 'Wetsuit 5mm', label: t('profile.preferences.suitTypes.wetsuit5mm') },
    { value: 'Wetsuit 7mm', label: t('profile.preferences.suitTypes.wetsuit7mm') },
    { value: 'Drysuit', label: t('profile.preferences.suitTypes.drysuit') },
    { value: 'Shorty', label: t('profile.preferences.suitTypes.shorty') },
  ];

  const DIVE_TYPES = [
    { value: 'Shore', label: t('profile.preferences.diveTypes.shore') },
    { value: 'Boat', label: t('profile.preferences.diveTypes.boat') },
    { value: 'Night', label: t('profile.preferences.diveTypes.night') },
    { value: 'Wreck', label: t('profile.preferences.diveTypes.wreck') },
    { value: 'Drift', label: t('profile.preferences.diveTypes.drift') },
    { value: 'Deep', label: t('profile.preferences.diveTypes.deep') },
  ];

  const [formData, setFormData] = useState<UpdateProfileRequest>({
    firstName: '',
    lastName: '',
    certificationLevel: '',
    totalDives: 0,
    bio: '',
    profilePictureUrl: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    preferredSuitType: '',
    preferredDiveType: '',
    preferredMaxDepthM: undefined,
    unitSystem: 'Metric',
    temperatureUnit: 'Celsius',
    preferredLanguage: 'En',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    const result = await userApi.getProfile();
    if (result.ok) {
      setProfile(result.data);
      setFormData({
        firstName: result.data.firstName,
        lastName: result.data.lastName,
        certificationLevel: result.data.certificationLevel || '',
        totalDives: result.data.totalDives,
        bio: result.data.bio || '',
        profilePictureUrl: result.data.profilePictureUrl || '',
        emergencyContactName: result.data.emergencyContactName || '',
        emergencyContactPhone: result.data.emergencyContactPhone || '',
        emergencyContactRelation: result.data.emergencyContactRelation || '',
        preferredSuitType: result.data.preferredSuitType || '',
        preferredDiveType: result.data.preferredDiveType || '',
        preferredMaxDepthM: result.data.preferredMaxDepthM,
        unitSystem: result.data.unitSystem || 'Metric',
        temperatureUnit: result.data.temperatureUnit || 'Celsius',
        preferredLanguage: result.data.preferredLanguage || 'En',
      });
      setUnitSystem((result.data.unitSystem as UnitSystem) || 'Metric');
      setTemperatureUnit((result.data.temperatureUnit as TemperatureUnit) || 'Celsius');
    } else {
      setError(result.error || t('profile.failedToLoad'));
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    const result = await userApi.updateProfile(formData);
    if (result.ok) {
      setProfile(result.data);
      setUnitSystem((formData.unitSystem as UnitSystem) || 'Metric');
      setTemperatureUnit((formData.temperatureUnit as TemperatureUnit) || 'Celsius');
      setSuccess(t('profile.profileUpdated'));
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || t('profile.failedToUpdate'));
    }
    setIsSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(t('profile.password.errors.mismatch'));
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setError(t('profile.password.errors.length'));
      return;
    }

    setIsChangingPassword(true);
    setError(null);
    setSuccess(null);

    const result = await userApi.changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
    if (result.ok) {
      setSuccess(t('profile.password.changed'));
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || t('profile.password.failedToChange'));
    }
    setIsChangingPassword(false);
  };

  const handleInputChange = (field: keyof UpdateProfileRequest, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center ocean-gradient-light">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-ocean-500 animate-spin" />
          <p className="text-abyss-500 font-medium">{t('profile.loadingProfile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 ocean-gradient-light py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-ocean-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-abyss-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-abyss-900">{t('profile.title')}</h1>
            <p className="text-abyss-500">{t('profile.subtitle')}</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-ocean-500 to-sea-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">
              {formData.firstName?.charAt(0) || user?.firstName?.charAt(0)}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-ocean-600 text-white'
                : 'bg-white text-abyss-600 hover:bg-ocean-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {t('profile.tabs.profile')}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              activeTab === 'password'
                ? 'bg-ocean-600 text-white'
                : 'bg-white text-abyss-600 hover:bg-ocean-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              {t('profile.tabs.password')}
            </span>
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-coral-50 border border-coral-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-coral-500 flex-shrink-0" />
            <p className="text-coral-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {activeTab === 'profile' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-ocean-100">
              <h2 className="text-lg font-semibold text-abyss-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-ocean-500" />
                {t('profile.personal.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.personal.firstName')}</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.personal.lastName')}</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.personal.email')}</label>
                  <div className="flex items-center gap-2 px-4 py-3 bg-abyss-50 border border-ocean-200 rounded-xl text-abyss-500">
                    <Mail className="w-4 h-4" />
                    {profile?.email}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.personal.bio')}</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none resize-none"
                    placeholder={t('profile.personal.bioPlaceholder')}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-ocean-100">
              <h2 className="text-lg font-semibold text-abyss-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-ocean-500" />
                {t('profile.diver.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.diver.certificationLevel')}</label>
                  <select
                    value={formData.certificationLevel}
                    onChange={(e) => handleInputChange('certificationLevel', e.target.value)}
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none bg-white"
                  >
                    <option value="">{t('profile.diver.selectCertification')}</option>
                    {CERTIFICATION_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.diver.totalDives')}</label>
                  <input
                    type="number"
                    value={formData.totalDives}
                    onChange={(e) => handleInputChange('totalDives', parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-ocean-100">
              <h2 className="text-lg font-semibold text-abyss-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-coral-500" />
                {t('profile.emergency.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.emergency.contactName')}</label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                    placeholder={t('profile.emergency.contactNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.emergency.phone')}</label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                    placeholder={t('profile.emergency.phonePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.emergency.relationship')}</label>
                  <input
                    type="text"
                    value={formData.emergencyContactRelation}
                    onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                    placeholder={t('profile.emergency.relationshipPlaceholder')}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-ocean-100">
              <h2 className="text-lg font-semibold text-abyss-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-ocean-500" />
                {t('profile.preferences.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.preferences.unitSystem')}</label>
                  <select
                    value={formData.unitSystem}
                    onChange={(e) => handleInputChange('unitSystem', e.target.value)}
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none bg-white"
                  >
                    <option value="Metric">{t('profile.preferences.metric')}</option>
                    <option value="Imperial">{t('profile.preferences.imperial')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.preferences.temperatureUnit')}</label>
                  <select
                    value={formData.temperatureUnit}
                    onChange={(e) => handleInputChange('temperatureUnit', e.target.value)}
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none bg-white"
                  >
                    <option value="Celsius">{t('profile.preferences.celsius')}</option>
                    <option value="Fahrenheit">{t('profile.preferences.fahrenheit')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.preferences.preferredSuit')}</label>
                  <select
                    value={formData.preferredSuitType}
                    onChange={(e) => handleInputChange('preferredSuitType', e.target.value)}
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none bg-white"
                  >
                    <option value="">{t('profile.preferences.selectSuit')}</option>
                    {SUIT_TYPES.map((suit) => (
                      <option key={suit.value} value={suit.value}>
                        {suit.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.preferences.preferredDiveType')}</label>
                  <select
                    value={formData.preferredDiveType}
                    onChange={(e) => handleInputChange('preferredDiveType', e.target.value)}
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none bg-white"
                  >
                    <option value="">{t('profile.preferences.selectDiveType')}</option>
                    {DIVE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.preferences.maxDepth')}</label>
                  <input
                    type="number"
                    value={formData.preferredMaxDepthM || ''}
                    onChange={(e) =>
                      handleInputChange('preferredMaxDepthM', e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    min="0"
                    max="300"
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                    placeholder="40"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary px-8 py-3 text-white font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('profile.saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('profile.saveChanges')}
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-ocean-100">
              <h2 className="text-lg font-semibold text-abyss-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-ocean-500" />
                {t('profile.password.title')}
              </h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.password.currentPassword')}</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.password.newPassword')}</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                    minLength={8}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1">{t('profile.password.confirmNewPassword')}</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                    minLength={8}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="btn-primary px-6 py-3 text-white font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('profile.password.changing')}
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      {t('profile.password.changeButton')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
