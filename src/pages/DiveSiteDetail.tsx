import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Globe,
  Phone,
  CheckCircle,
  Clock,
  Loader2,
  ArrowLeft,
  Anchor,
  Shield,
  AlertTriangle,
  Navigation,
  Pencil,
  Trash2,
  Waves,
  Calendar,
} from 'lucide-react';
import { diveSiteApi, diveConditionsApi, type DiveSite, type DiveConditions } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DiveSiteFormModal from '../components/DiveSiteFormModal';
import DiveConditionsPanel from '../components/DiveConditionsPanel';
import { verifiedSiteMarker, unverifiedSiteMarker } from '../components/map/markerIcons';
import ReviewList from '../components/ReviewList';
import PrivateNotesSection from '../components/PrivateNotesSection';
import DiveSiteImageGallery from '../components/DiveSiteImageGallery';

export default function DiveSiteDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.roles?.includes('Admin') ?? false;

  const [site, setSite] = useState<DiveSite | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [conditions, setConditions] = useState<DiveConditions | null>(null);
  const [conditionsLoading, setConditionsLoading] = useState(false);
  const [conditionsError, setConditionsError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const fetchSite = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    const result = await diveSiteApi.getById(id);
    if (result.ok) {
      setSite(result.data);
    } else {
      setError(result.error || t('diveSiteDetail.fetchError'));
    }
    setIsLoading(false);
  }, [id, t]);

  const fetchConditions = useCallback(async (siteData: DiveSite, date?: string, time?: string) => {
    setConditionsLoading(true);
    setConditionsError(null);
    let dateTime: string | undefined;
    if (date) {
      dateTime = time ? `${date}T${time}` : date;
    }
    const result = await diveConditionsApi.getForSite(siteData, dateTime);
    if (result.ok) {
      setConditions(result.data);
    } else {
      setConditionsError(result.error);
    }
    setConditionsLoading(false);
  }, []);

  useEffect(() => {
    fetchSite();
  }, [fetchSite]);

  const handleToggleVerify = async () => {
    if (!site) return;
    setActionLoading(true);
    setActionError(null);
    const result = site.isVerified
      ? await diveSiteApi.unverify(site.id, site)
      : await diveSiteApi.verify(site.id);
    if (result.ok) {
      setSite((prev) => prev ? { ...prev, isVerified: !prev.isVerified } : prev);
    } else {
      setActionError(result.error);
    }
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!site) return;
    if (!window.confirm(t('diveSiteDetail.deleteConfirm'))) return;
    setActionLoading(true);
    setActionError(null);
    const result = await diveSiteApi.delete(site.id);
    if (result.ok) {
      navigate('/dive-sites');
    } else {
      setActionError(result.error);
      setActionLoading(false);
    }
  };

  const handleSaved = () => {
    fetchSite();
  };

  if (isLoading) {
    return (
      <div className="flex-1 ocean-gradient-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-ocean-500 animate-spin" />
              <p className="text-sm text-abyss-500">{t('common.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="flex-1 ocean-gradient-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/dive-sites"
            className="inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-800 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('diveSiteDetail.backToList')}
          </Link>
          <div className="bg-coral-50 border border-coral-200 rounded-xl p-6 flex items-center gap-3 text-coral-600">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <span>{error || t('diveSiteDetail.notFound')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 ocean-gradient-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dive-sites"
          className="inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-800 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('diveSiteDetail.backToList')}
        </Link>

        <div className="bg-white border border-ocean-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-ocean-100 bg-gradient-to-r from-ocean-50 to-sea-50">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  site.isVerified
                    ? 'bg-cyan-100 text-cyan-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}
              >
                <Anchor className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-abyss-900">{site.name}</h1>
                  {site.siteType && site.siteType !== 'Unknown' && (
                    <span className="inline-flex items-center gap-1 text-sm px-2.5 py-1 bg-sea-100 text-sea-700 rounded-full font-medium">
                      {t(`diveSites.siteTypes.${site.siteType}`)}
                    </span>
                  )}
                  {site.isVerified ? (
                    <span className="inline-flex items-center gap-1 text-sm px-2.5 py-1 bg-cyan-100 text-cyan-700 rounded-full font-medium">
                      <CheckCircle className="w-4 h-4" />
                      {t('diveSites.verified')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                      <Clock className="w-4 h-4" />
                      {t('diveSites.pending')}
                    </span>
                  )}
                </div>
                {(site.country || site.region) && (
                  <p className="text-abyss-500 mt-1">
                    {[site.country, site.region].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowEditModal(true)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-ocean-700 bg-ocean-50 hover:bg-ocean-100 rounded-xl transition-colors disabled:opacity-50"
                    title={t('diveSiteDetail.edit')}
                  >
                    <Pencil className="w-4 h-4" />
                    {t('diveSiteDetail.edit')}
                  </button>
                  <button
                    onClick={handleToggleVerify}
                    disabled={actionLoading}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 ${
                      site.isVerified
                        ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                    title={site.isVerified ? t('diveSiteDetail.unverify') : t('diveSiteDetail.verify')}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {site.isVerified ? t('diveSiteDetail.unverify') : t('diveSiteDetail.verify')}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-coral-700 bg-coral-50 hover:bg-coral-100 rounded-xl transition-colors disabled:opacity-50"
                    title={t('diveSiteDetail.delete')}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {t('diveSiteDetail.delete')}
                  </button>
                </div>
              )}
            </div>

            {actionError && (
              <div className="mt-4 bg-coral-50 border border-coral-200 rounded-xl p-3 flex items-center gap-2 text-coral-600 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {site.description && (
              <div>
                <h2 className="text-sm font-semibold text-abyss-500 uppercase tracking-wide mb-2">
                  {t('diveSiteDetail.description')}
                </h2>
                <p className="text-abyss-700 leading-relaxed">{site.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-abyss-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-ocean-500" />
                  <span className="text-sm font-semibold text-abyss-500">{t('diveSiteDetail.coordinates')}</span>
                </div>
                <p className="font-mono text-abyss-800">
                  {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                </p>
              </div>

              {site.siteType && site.siteType !== 'Unknown' && (
                <div className="bg-abyss-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Anchor className="w-4 h-4 text-ocean-500" />
                    <span className="text-sm font-semibold text-abyss-500">{t('diveSites.siteType')}</span>
                  </div>
                  <p className="text-abyss-800 text-lg font-semibold">{t(`diveSites.siteTypes.${site.siteType}`)}</p>
                </div>
              )}

              {site.maxDepthM != null && (
                <div className="bg-abyss-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-4 h-4 text-ocean-500" />
                    <span className="text-sm font-semibold text-abyss-500">{t('diveSiteDetail.maxDepth')}</span>
                  </div>
                  <p className="text-abyss-800 text-lg font-semibold">{site.maxDepthM}m</p>
                </div>
              )}

              {site.website && (
                <div className="bg-abyss-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-ocean-500" />
                    <span className="text-sm font-semibold text-abyss-500">{t('diveSites.website')}</span>
                  </div>
                  <a
                    href={site.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ocean-600 hover:text-ocean-800 underline break-all"
                  >
                    {site.website}
                  </a>
                </div>
              )}

              {site.phoneNumber && (
                <div className="bg-abyss-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-ocean-500" />
                    <span className="text-sm font-semibold text-abyss-500">{t('diveSiteDetail.phone')}</span>
                  </div>
                  <p className="text-abyss-800">{site.phoneNumber}</p>
                </div>
              )}
            </div>

            <DiveSiteImageGallery
              diveSiteId={site.id}
              images={site.images ?? []}
              canUpload={isAdmin}
              canDelete={isAdmin}
              onImagesChanged={fetchSite}
            />

            <div className="border-t border-ocean-100 pt-6">
              <h2 className="text-sm font-semibold text-abyss-500 uppercase tracking-wide mb-3">
                {t('diveSiteDetail.location')}
              </h2>
              <div className="rounded-xl overflow-hidden border border-ocean-100 h-[250px]">
                <MapContainer
                  center={[site.latitude, site.longitude]}
                  zoom={13}
                  scrollWheelZoom={true}
                  dragging={true}
                  doubleClickZoom={true}
                  zoomControl={true}
                  attributionControl={false}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Marker
                    position={[site.latitude, site.longitude]}
                    icon={site.isVerified ? verifiedSiteMarker : unverifiedSiteMarker}
                  />
                </MapContainer>
              </div>
            </div>

            <div className="border-t border-ocean-100 pt-6">
              <h2 className="text-sm font-semibold text-abyss-500 uppercase tracking-wide mb-4">
                {t('diveSiteDetail.diveConditions')}
              </h2>

              {!conditions && !conditionsLoading && !conditionsError && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-abyss-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-ocean-500" />
                        {t('map.diveDate')}
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={today}
                        className="w-full px-4 py-3 border border-ocean-200 rounded-xl text-sm focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none text-abyss-800 bg-white transition-all hover:border-ocean-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-abyss-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-ocean-500" />
                        {t('map.diveTime')}
                      </label>
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-4 py-3 border border-ocean-200 rounded-xl text-sm focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none text-abyss-800 bg-white transition-all hover:border-ocean-300"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => fetchConditions(site, selectedDate, selectedTime)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-ocean-500 to-sea-500 hover:from-ocean-600 hover:to-sea-600 text-white font-semibold rounded-xl shadow-md transition-all"
                  >
                    <Waves className="w-5 h-5" />
                    {t('diveSiteDetail.getConditions')}
                  </button>
                </div>
              )}

              {conditionsLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-ocean-500 animate-spin" />
                    <span className="text-sm text-abyss-500">{t('diveSiteDetail.loadingConditions')}</span>
                  </div>
                </div>
              )}

              {conditionsError && !conditions && (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm">
                    {conditionsError.startsWith('ACCESS_DENIED')
                      ? t('diveSiteDetail.conditionsUnavailable')
                      : t('diveSiteDetail.conditionsError')}
                  </div>
                  {!conditionsError.startsWith('ACCESS_DENIED') && (
                    <button
                      onClick={() => fetchConditions(site, selectedDate, selectedTime)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-ocean-50 hover:bg-ocean-100 text-ocean-700 font-medium rounded-xl transition-colors"
                    >
                      <Waves className="w-4 h-4" />
                      {t('diveSiteDetail.retryConditions')}
                    </button>
                  )}
                </div>
              )}

              {conditions && (
                <DiveConditionsPanel
                  conditions={conditions}
                  onClose={() => setConditions(null)}
                />
              )}
            </div>

            {isAdmin && (
              <div className="border-t border-ocean-100 pt-6">
                <h2 className="text-sm font-semibold text-abyss-500 uppercase tracking-wide mb-3">
                  {t('diveSiteDetail.adminInfo')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-abyss-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-abyss-400" />
                      <span className="text-sm font-semibold text-abyss-500">{t('diveSites.source')}</span>
                    </div>
                    <p className="text-abyss-800">{site.source}</p>
                  </div>
                  {site.osmId && (
                    <div className="bg-abyss-50 rounded-xl p-4">
                      <span className="text-sm font-semibold text-abyss-500">{t('diveSiteDetail.osmId')}</span>
                      <p className="text-abyss-800 font-mono mt-1">{site.osmId}</p>
                    </div>
                  )}
                  <div className="bg-abyss-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-abyss-400" />
                      <span className="text-sm font-semibold text-abyss-500">{t('diveSiteDetail.createdAt')}</span>
                    </div>
                    <p className="text-abyss-800">{new Date(site.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <ReviewList diveSiteId={site.id} />
        </div>

        {user && (
          <div className="mt-8">
            <PrivateNotesSection diveSiteId={site.id} />
          </div>
        )}
      </div>

      {showEditModal && (
        <DiveSiteFormModal
          site={site}
          onClose={() => setShowEditModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
