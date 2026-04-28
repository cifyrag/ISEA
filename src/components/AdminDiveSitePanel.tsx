import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  Loader2,
  ChevronDown,
  ChevronUp,
  Edit2,
  Globe,
  Phone,
  MapPin,
} from 'lucide-react';
import {
  diveSiteApi,
  type DiveSite,
  type CreateDiveSiteRequest,
  type UpdateDiveSiteRequest,
} from '../services/api';

interface AdminDiveSitePanelProps {
  diveSites: DiveSite[];
  mapCenter: { lat: number; lng: number };
  onSiteClick: (site: DiveSite) => void;
  onRefresh: () => void;
  initialCoords?: { lat: number; lng: number } | null;
  onInitialCoordsConsumed?: () => void;
}

interface SiteFormData {
  name: string;
  latitude: string;
  longitude: string;
  description: string;
  country: string;
  region: string;
  maxDepthM: string;
  website: string;
  phoneNumber: string;
}

const emptyForm = (): SiteFormData => ({
  name: '',
  latitude: '',
  longitude: '',
  description: '',
  country: '',
  region: '',
  maxDepthM: '',
  website: '',
  phoneNumber: '',
});

export default function AdminDiveSitePanel({
  diveSites,
  mapCenter,
  onSiteClick,
  onRefresh,
  initialCoords,
  onInitialCoordsConsumed,
}: AdminDiveSitePanelProps) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<SiteFormData>(emptyForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importRadius, setImportRadius] = useState('10');

  useEffect(() => {
    if (initialCoords) {
      setFormData({
        ...emptyForm(),
        latitude: initialCoords.lat.toFixed(6),
        longitude: initialCoords.lng.toFixed(6),
      });
      setEditingId(null);
      setFormError(null);
      setShowAddForm(true);
      onInitialCoordsConsumed?.();
    }
  }, [initialCoords]);

  const handleVerify = async (site: DiveSite) => {
    setVerifyingId(site.id);
    const result = await diveSiteApi.verify(site.id);
    if (result.ok) {
      onRefresh();
    }
    setVerifyingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('adminSites.deleteConfirm'))) return;
    setDeletingId(id);
    const result = await diveSiteApi.delete(id);
    if (result.ok) {
      onRefresh();
    }
    setDeletingId(null);
  };

  const openAddForm = () => {
    setFormData({ ...emptyForm(), latitude: mapCenter.lat.toFixed(6), longitude: mapCenter.lng.toFixed(6) });
    setEditingId(null);
    setFormError(null);
    setShowAddForm(true);
  };

  const openEditForm = (site: DiveSite) => {
    setFormData({
      name: site.name,
      latitude: site.latitude.toString(),
      longitude: site.longitude.toString(),
      description: site.description ?? '',
      country: site.country ?? '',
      region: site.region ?? '',
      maxDepthM: site.maxDepthM?.toString() ?? '',
      website: site.website ?? '',
      phoneNumber: site.phoneNumber ?? '',
    });
    setEditingId(site.id);
    setFormError(null);
    setShowAddForm(true);
  };

  const cancelForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormError(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setFormError(t('adminSites.form.nameRequired'));
      return;
    }
    const lat = parseFloat(formData.latitude);
    const lon = parseFloat(formData.longitude);
    if (isNaN(lat) || isNaN(lon)) {
      setFormError(t('adminSites.form.invalidCoords'));
      return;
    }

    const payload: CreateDiveSiteRequest | UpdateDiveSiteRequest = {
      name: formData.name.trim(),
      latitude: lat,
      longitude: lon,
      description: formData.description || undefined,
      country: formData.country || undefined,
      region: formData.region || undefined,
      maxDepthM: formData.maxDepthM ? parseFloat(formData.maxDepthM) : undefined,
      website: formData.website || undefined,
      phoneNumber: formData.phoneNumber || undefined,
    };

    setIsSaving(true);
    setFormError(null);
    const result = editingId
      ? await diveSiteApi.update(editingId, payload as UpdateDiveSiteRequest)
      : await diveSiteApi.create(payload as CreateDiveSiteRequest);
    if (result.ok) {
      cancelForm();
      onRefresh();
    } else {
      setFormError(result.error || t('adminSites.form.saveFailed'));
    }
    setIsSaving(false);
  };

  const handleImport = async () => {
    const radius = parseFloat(importRadius);
    if (isNaN(radius) || radius <= 0) return;
    setIsImporting(true);
    const result = await diveSiteApi.importFromOsm(mapCenter.lat, mapCenter.lng, radius);
    if (result.ok) {
      onRefresh();
    }
    setIsImporting(false);
  };

  const verified = diveSites.filter((s) => s.isVerified);
  const unverified = diveSites.filter((s) => !s.isVerified);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={openAddForm}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-ocean-600 text-white rounded-lg text-sm font-medium hover:bg-ocean-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('adminSites.addSite')}
        </button>
      </div>

      <div className="bg-abyss-50 border border-abyss-200 rounded-xl p-3 space-y-2">
        <p className="text-xs font-semibold text-abyss-600 uppercase tracking-wider flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" />
          {t('adminSites.importOsm')}
        </p>
        <p className="text-xs text-abyss-500">{t('adminSites.importOsmHint')}</p>
        <div className="flex gap-2">
          <input
            type="number"
            value={importRadius}
            onChange={(e) => setImportRadius(e.target.value)}
            min="1"
            max="50"
            className="w-24 px-2 py-1.5 border border-abyss-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
            placeholder="km"
          />
          <span className="text-xs text-abyss-500 self-center">km {t('adminSites.radius')}</span>
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-abyss-600 text-white rounded-lg text-sm font-medium hover:bg-abyss-700 disabled:opacity-50 transition-colors"
          >
            {isImporting ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{t('adminSites.importing')}</>
            ) : (
              <><Download className="w-4 h-4" />{t('adminSites.import')}</>
            )}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-ocean-50 border border-ocean-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-abyss-800">
            {editingId ? t('adminSites.form.editTitle') : t('adminSites.form.addTitle')}
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="text-xs text-abyss-600 font-medium">{t('adminSites.form.name')} *</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="w-full mt-0.5 px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none"
                placeholder={t('adminSites.form.namePlaceholder')}
              />
            </div>
            <div>
              <label className="text-xs text-abyss-600 font-medium">{t('adminSites.form.latitude')} *</label>
              <input
                value={formData.latitude}
                onChange={(e) => setFormData((p) => ({ ...p, latitude: e.target.value }))}
                className="w-full mt-0.5 px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none"
                placeholder="e.g. 36.1234"
              />
            </div>
            <div>
              <label className="text-xs text-abyss-600 font-medium">{t('adminSites.form.longitude')} *</label>
              <input
                value={formData.longitude}
                onChange={(e) => setFormData((p) => ({ ...p, longitude: e.target.value }))}
                className="w-full mt-0.5 px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none"
                placeholder="e.g. 14.5678"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-abyss-600 font-medium">{t('adminSites.form.description')}</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                rows={2}
                className="w-full mt-0.5 px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none resize-none"
                placeholder={t('adminSites.form.descriptionPlaceholder')}
              />
            </div>
            <div>
              <label className="text-xs text-abyss-600 font-medium">{t('adminSites.form.country')}</label>
              <input
                value={formData.country}
                onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
                className="w-full mt-0.5 px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none"
                placeholder="e.g. Greece"
              />
            </div>
            <div>
              <label className="text-xs text-abyss-600 font-medium">{t('adminSites.form.region')}</label>
              <input
                value={formData.region}
                onChange={(e) => setFormData((p) => ({ ...p, region: e.target.value }))}
                className="w-full mt-0.5 px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none"
                placeholder="e.g. Aegean"
              />
            </div>
            <div>
              <label className="text-xs text-abyss-600 font-medium">{t('adminSites.form.maxDepth')}</label>
              <input
                type="number"
                value={formData.maxDepthM}
                onChange={(e) => setFormData((p) => ({ ...p, maxDepthM: e.target.value }))}
                min="0"
                max="400"
                className="w-full mt-0.5 px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none"
                placeholder="m"
              />
            </div>
            <div>
              <label className="text-xs text-abyss-600 font-medium">{t('adminSites.form.phone')}</label>
              <input
                value={formData.phoneNumber}
                onChange={(e) => setFormData((p) => ({ ...p, phoneNumber: e.target.value }))}
                className="w-full mt-0.5 px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none"
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-abyss-600 font-medium">{t('adminSites.form.website')}</label>
              <input
                value={formData.website}
                onChange={(e) => setFormData((p) => ({ ...p, website: e.target.value }))}
                className="w-full mt-0.5 px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none"
                placeholder="https://..."
              />
            </div>
          </div>

          {formError && (
            <p className="text-xs text-coral-600 bg-coral-50 border border-coral-200 px-3 py-2 rounded-lg">{formError}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={cancelForm}
              className="flex-1 py-2 px-3 border border-abyss-200 rounded-lg text-sm text-abyss-600 hover:bg-abyss-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-1 py-2 px-3 bg-ocean-600 text-white rounded-lg text-sm font-medium hover:bg-ocean-700 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-colors"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" />{t('adminSites.form.saving')}</>
              ) : (
                t('common.save')
              )}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-green-700">{verified.length}</p>
          <p className="text-xs text-green-600">{t('adminSites.verified')}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-amber-700">{unverified.length}</p>
          <p className="text-xs text-amber-600">{t('adminSites.unverified')}</p>
        </div>
      </div>

      {unverified.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5" />
            {t('adminSites.pendingReview')}
          </p>
          <div className="space-y-2">
            {unverified.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                expanded={expandedId === site.id}
                onToggle={() => setExpandedId(expandedId === site.id ? null : site.id)}
                onSelect={() => onSiteClick(site)}
                onVerify={() => handleVerify(site)}
                onEdit={() => openEditForm(site)}
                onDelete={() => handleDelete(site.id)}
                verifying={verifyingId === site.id}
                deleting={deletingId === site.id}
                t={t}
              />
            ))}
          </div>
        </div>
      )}

      {verified.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            {t('adminSites.verifiedSites')}
          </p>
          <div className="space-y-2">
            {verified.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                expanded={expandedId === site.id}
                onToggle={() => setExpandedId(expandedId === site.id ? null : site.id)}
                onSelect={() => onSiteClick(site)}
                onVerify={() => handleVerify(site)}
                onEdit={() => openEditForm(site)}
                onDelete={() => handleDelete(site.id)}
                verifying={verifyingId === site.id}
                deleting={deletingId === site.id}
                t={t}
              />
            ))}
          </div>
        </div>
      )}

      {diveSites.length === 0 && (
        <div className="text-center py-8 text-abyss-400">
          <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">{t('adminSites.empty')}</p>
          <p className="text-xs mt-1">{t('adminSites.emptyHint')}</p>
        </div>
      )}
    </div>
  );
}

interface SiteCardProps {
  site: DiveSite;
  expanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onVerify: () => void;
  onEdit: () => void;
  onDelete: () => void;
  verifying: boolean;
  deleting: boolean;
  t: (key: string) => string;
}

function SiteCard({ site, expanded, onToggle, onSelect, onVerify, onEdit, onDelete, verifying, deleting, t }: SiteCardProps) {
  return (
    <div className={`rounded-xl border transition-all ${site.isVerified ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
      <div
        className="flex items-center gap-2 p-3 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {site.isVerified ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            )}
            <p className="text-sm font-semibold text-abyss-800 truncate">{site.name}</p>
          </div>
          <p className="text-xs text-abyss-500 mt-0.5 ml-5">
            {site.latitude.toFixed(4)}°, {site.longitude.toFixed(4)}°
            {site.country && ` · ${site.country}`}
          </p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-abyss-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-abyss-400 flex-shrink-0" />}
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-current border-opacity-10">
          <div className="pt-2 space-y-1">
            {site.description && (
              <p className="text-xs text-abyss-600">{site.description}</p>
            )}
            {site.region && (
              <p className="text-xs text-abyss-500">{t('adminSites.region')}: {site.region}</p>
            )}
            {site.maxDepthM != null && (
              <p className="text-xs text-abyss-500">{t('adminSites.maxDepth')}: {site.maxDepthM}m</p>
            )}
            {site.website && (
              <p className="text-xs text-ocean-600 flex items-center gap-1">
                <Globe className="w-3 h-3" />
                <span className="truncate">{site.website}</span>
              </p>
            )}
            {site.phoneNumber && (
              <p className="text-xs text-abyss-500 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {site.phoneNumber}
              </p>
            )}
            <p className="text-xs text-abyss-400">
              {t('adminSites.source')}: {site.source === 'Overpass' ? t('adminSites.sourceOverpass') : site.source === 'ApiImport' ? t('adminSites.sourceApi') : t('adminSites.sourceManual')}
              {site.osmId && ` · OSM: ${site.osmId}`}
            </p>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className="flex items-center gap-1 px-2 py-1 bg-ocean-600 text-white rounded-md text-xs hover:bg-ocean-700 transition-colors"
            >
              <MapPin className="w-3 h-3" />
              {t('adminSites.checkConditions')}
            </button>
            {!site.isVerified && (
              <button
                onClick={(e) => { e.stopPropagation(); onVerify(); }}
                disabled={verifying}
                className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {verifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                {t('adminSites.verify')}
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="flex items-center gap-1 px-2 py-1 bg-abyss-100 text-abyss-700 rounded-md text-xs hover:bg-abyss-200 transition-colors"
            >
              <Edit2 className="w-3 h-3" />
              {t('adminSites.edit')}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              disabled={deleting}
              className="flex items-center gap-1 px-2 py-1 bg-coral-100 text-coral-700 rounded-md text-xs hover:bg-coral-200 disabled:opacity-50 transition-colors"
            >
              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              {t('common.delete')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
