import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, Anchor } from 'lucide-react';
import {
  diveSiteApi,
  type CreateDiveSiteRequest,
  type DiveSite,
  DIVE_SITE_TYPES,
  type DiveSiteType,
} from '../services/api';

interface DiveSiteFormModalProps {
  site?: DiveSite;
  onClose: () => void;
  onSaved: () => void;
}

export default function DiveSiteFormModal({ site, onClose, onSaved }: DiveSiteFormModalProps) {
  const { t } = useTranslation();
  const isEdit = !!site;
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateDiveSiteRequest>({
    name: site?.name ?? '',
    description: site?.description ?? '',
    latitude: site?.latitude ?? 0,
    longitude: site?.longitude ?? 0,
    maxDepthM: site?.maxDepthM ?? undefined,
    country: site?.country ?? '',
    region: site?.region ?? '',
    website: site?.website ?? '',
    phoneNumber: site?.phoneNumber ?? '',
    siteType: site?.siteType ?? undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError(t('adminDiveSites.form.nameRequired'));
      return;
    }

    setIsSaving(true);
    setError(null);

    const result = isEdit
      ? await diveSiteApi.update(site!.id, formData)
      : await diveSiteApi.create(formData);

    if (result.ok) {
      onSaved();
      onClose();
    } else {
      setError(result.error);
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="p-5 border-b border-ocean-100 bg-gradient-to-r from-ocean-50 to-sea-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-sea-500 rounded-xl flex items-center justify-center">
                <Anchor className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-abyss-900">
                  {isEdit ? t('adminDiveSites.form.editTitle') : t('adminDiveSites.form.createTitle')}
                </h2>
                <p className="text-xs text-abyss-500">{t('adminDiveSites.form.subtitle')}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-ocean-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-abyss-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto max-h-[calc(90vh-140px)] dive-scrollbar">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-abyss-600 mb-1.5">
                {t('adminDiveSites.form.name')} <span className="text-coral-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                placeholder={t('adminDiveSites.form.namePlaceholder')}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('adminDiveSites.form.description')}</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('adminDiveSites.form.latitude')}</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData((prev) => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('adminDiveSites.form.longitude')}</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData((prev) => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('adminDiveSites.form.maxDepth')}</label>
              <input
                type="number"
                value={formData.maxDepthM ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, maxDepthM: e.target.value ? parseInt(e.target.value) : undefined }))
                }
                min="0"
                max="500"
                className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                placeholder={t('saveLocationModal.maxDepthPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('diveSites.siteType')}</label>
              <select
                value={formData.siteType ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, siteType: (e.target.value || undefined) as DiveSiteType | undefined }))
                }
                className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none bg-white"
              >
                <option value="">{t('diveSites.siteTypeSelect')}</option>
                {DIVE_SITE_TYPES.map((type) => (
                  <option key={type} value={type}>{t(`diveSites.siteTypes.${type}`)}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('adminDiveSites.form.country')}</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
                  className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('adminDiveSites.form.region')}</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
                  className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('adminSites.form.website')}</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('adminSites.form.phone')}</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            {error && (
              <div className="bg-coral-50 border border-coral-200 rounded-xl p-3 text-coral-600 text-sm">{error}</div>
            )}
          </div>
        </form>

        <div className="p-5 border-t border-ocean-100 bg-abyss-50 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-abyss-600 hover:bg-abyss-100 rounded-xl font-medium transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || !formData.name.trim()}
            className="btn-primary px-6 py-2.5 text-white font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              <>
                <Anchor className="w-4 h-4" />
                {isEdit ? t('common.save') : t('adminDiveSites.addSite')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
