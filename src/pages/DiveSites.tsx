import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Globe,
  Phone,
  CheckCircle,
  Clock,
  Search,
  Loader2,
  Plus,
  X,
  Anchor,
  Shield,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { diveSiteApi, type DiveSite, type CreateDiveSiteRequest, DIVE_SITE_TYPES, type DiveSiteType, type DiveSiteSortBy } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SITE_TYPE_COLORS } from '../components/map/markerIcons';

const DEBOUNCE_MS = 400;

export default function DiveSites() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const isAdmin = user?.roles?.includes('Admin') ?? false;
  const canSuggest =
    user?.roles?.some((r) => ['DiveCenter', 'Trainer'].includes(r)) ?? false;

  const [sites, setSites] = useState<DiveSite[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [filterType, setFilterType] = useState<DiveSiteType | ''>('');
  const [verifiedFilter, setVerifiedFilter] = useState<'' | 'true' | 'false'>('');
  const [minDepth, setMinDepth] = useState('');
  const [maxDepth, setMaxDepth] = useState('');
  const [appliedMinDepth, setAppliedMinDepth] = useState('');
  const [appliedMaxDepth, setAppliedMaxDepth] = useState('');
  const [sortBy, setSortBy] = useState<DiveSiteSortBy>('name');
  const [sortDesc, setSortDesc] = useState(false);

  const [showSuggest, setShowSuggest] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestSuccess, setSuggestSuccess] = useState(false);
  const [suggestForm, setSuggestForm] = useState<CreateDiveSiteRequest>({
    name: '',
    latitude: 0,
    longitude: 0,
    description: '',
    country: '',
    region: '',
    maxDepthM: undefined,
    website: '',
    phoneNumber: '',
    siteType: undefined,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setAppliedSearch(searchQuery.trim());
      setAppliedMinDepth(minDepth);
      setAppliedMaxDepth(maxDepth);
      setPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, minDepth, maxDepth]);

  const fetchSites = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const parsedMin = parseFloat(appliedMinDepth);
    const parsedMax = parseFloat(appliedMaxDepth);
    const result = await diveSiteApi.getFiltered({
      search: appliedSearch || undefined,
      siteType: filterType || undefined,
      isVerified: verifiedFilter === '' ? undefined : verifiedFilter === 'true',
      minDepthM: !isNaN(parsedMin) && parsedMin > 0 ? parsedMin : undefined,
      maxDepthM: !isNaN(parsedMax) && parsedMax > 0 ? parsedMax : undefined,
      sortBy,
      sortDesc,
      page,
      pageSize,
    });
    if (result.ok) {
      setSites(result.data.items);
      setTotalCount(result.data.totalCount);
    } else {
      setError(result.error || t('diveSites.fetchError'));
    }
    setIsLoading(false);
  }, [appliedSearch, filterType, verifiedFilter, appliedMinDepth, appliedMaxDepth, sortBy, sortDesc, page, t]);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestForm.name.trim()) {
      setSuggestError(t('adminDiveSites.form.nameRequired'));
      return;
    }
    setIsSuggesting(true);
    setSuggestError(null);
    const result = await diveSiteApi.suggest(suggestForm);
    if (result.ok) {
      setSuggestSuccess(true);
      setSuggestForm({
        name: '',
        latitude: 0,
        longitude: 0,
        description: '',
        country: '',
        region: '',
        maxDepthM: undefined,
        website: '',
        phoneNumber: '',
        siteType: undefined,
      });
      setTimeout(() => {
        setShowSuggest(false);
        setSuggestSuccess(false);
      }, 2000);
    } else {
      setSuggestError(result.error || t('diveSites.suggestError'));
    }
    setIsSuggesting(false);
  };

  return (
    <div className="flex-1 ocean-gradient-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-sea-500 rounded-xl flex items-center justify-center shadow-md">
              <Anchor className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-abyss-900">{t('diveSites.title')}</h1>
              <p className="text-sm text-abyss-500">
                {isAdmin
                  ? t('diveSites.subtitleAdmin')
                  : t('diveSites.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {canSuggest && (
              <button
                onClick={() => setShowSuggest(true)}
                className="btn-primary px-5 py-2.5 text-white font-medium rounded-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t('diveSites.suggestSite')}
              </button>
            )}
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-abyss-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('diveSites.searchPlaceholder')}
            className="w-full pl-11 pr-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none bg-white text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-abyss-400" />
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as DiveSiteType | '');
                setPage(1);
              }}
              className="px-3 py-2 border border-ocean-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
            >
              <option value="">{t('adminDiveSites.filters.allTypes')}</option>
              {DIVE_SITE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`diveSites.siteTypes.${type}`)}
                </option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <select
              value={verifiedFilter}
              onChange={(e) => {
                setVerifiedFilter(e.target.value as '' | 'true' | 'false');
                setPage(1);
              }}
              className="px-3 py-2 border border-ocean-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
            >
              <option value="">{t('adminDiveSites.filters.all')}</option>
              <option value="true">{t('adminDiveSites.filters.verifiedOnly')}</option>
              <option value="false">{t('adminDiveSites.filters.unverifiedOnly')}</option>
            </select>
          )}

          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0"
              max="400"
              value={minDepth}
              onChange={(e) => setMinDepth(e.target.value)}
              placeholder={t('diveSites.minDepth')}
              className="w-24 px-3 py-2 border border-ocean-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
            />
            <span className="text-abyss-400 text-xs">–</span>
            <input
              type="number"
              min="0"
              max="400"
              value={maxDepth}
              onChange={(e) => setMaxDepth(e.target.value)}
              placeholder={t('diveSites.maxDepth')}
              className="w-24 px-3 py-2 border border-ocean-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
            />
            <span className="text-abyss-400 text-xs">m</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <ArrowUpDown className="w-4 h-4 text-abyss-400" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as DiveSiteSortBy);
                setPage(1);
              }}
              className="px-3 py-2 border border-ocean-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
            >
              <option value="name">{t('adminDiveSites.filters.sortName')}</option>
              <option value="createdAt">{t('adminDiveSites.filters.sortCreatedAt')}</option>
            </select>
            <button
              onClick={() => {
                setSortDesc((d) => !d);
                setPage(1);
              }}
              className={`px-3 py-2 border border-ocean-200 rounded-lg text-sm bg-white hover:bg-ocean-50 transition-colors ${
                sortDesc ? 'text-ocean-600' : 'text-abyss-500'
              }`}
              title={sortDesc ? t('adminDiveSites.filters.descending') : t('adminDiveSites.filters.ascending')}
            >
              {sortDesc ? t('adminDiveSites.filters.descending') : t('adminDiveSites.filters.ascending')}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-coral-50 border border-coral-200 rounded-xl p-4 mb-6 flex items-center gap-2 text-coral-600">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-ocean-500 animate-spin" />
              <p className="text-sm text-abyss-500">{t('common.loading')}</p>
            </div>
          </div>
        ) : sites.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-abyss-300" />
            <p className="text-abyss-500 font-medium">
              {searchQuery ? t('diveSites.noResults') : t('diveSites.empty')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map((site) => (
              <Link
                key={site.id}
                to={`/dive-sites/${site.id}`}
                className="bg-white border border-ocean-100 rounded-xl p-4 hover:border-ocean-300 hover:shadow-md transition-all block"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      site.isVerified
                        ? 'bg-cyan-100 text-cyan-600'
                        : 'bg-yellow-100 text-yellow-600'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-abyss-900 truncate">{site.name}</h3>
                      {site.isVerified ? (
                        <CheckCircle className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                      ) : (
                        <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded font-medium flex-shrink-0">
                          {t('diveSites.pending')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-abyss-500 mt-0.5 font-mono">
                      {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                    </p>
                    {(site.country || site.region) && (
                      <p className="text-xs text-abyss-500 mt-0.5">
                        {[site.country, site.region].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>

                {site.description && (
                  <p className="text-sm text-abyss-600 mt-3 line-clamp-2">{site.description}</p>
                )}

                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {site.siteType && site.siteType !== 'Unknown' && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1.5 bg-abyss-50 text-abyss-700">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: SITE_TYPE_COLORS[site.siteType]?.fill }}
                      />
                      {t(`diveSites.siteTypes.${site.siteType}`)}
                    </span>
                  )}
                  {site.maxDepthM != null && (
                    <span className="text-xs text-ocean-600 font-medium bg-ocean-50 px-2 py-0.5 rounded">
                      {site.maxDepthM}m
                    </span>
                  )}
                  {site.website && (
                    <a
                      href={site.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-ocean-500 hover:text-ocean-700 flex items-center gap-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Globe className="w-3 h-3" />
                      {t('diveSites.website')}
                    </a>
                  )}
                  {site.phoneNumber && (
                    <span className="text-xs text-abyss-400 flex items-center gap-0.5">
                      <Phone className="w-3 h-3" />
                      {site.phoneNumber}
                    </span>
                  )}
                  {isAdmin && (
                    <span className="text-xs text-abyss-400 flex items-center gap-0.5 ml-auto">
                      <Clock className="w-3 h-3" />
                      {new Date(site.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {isAdmin && !site.isVerified && (
                  <div className="mt-3 pt-3 border-t border-ocean-100 flex items-center gap-2">
                    <span className="text-xs text-abyss-400 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {t('diveSites.source')}: {site.source}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {!isLoading && sites.length > 0 && (() => {
          const totalPages = Math.ceil(totalCount / pageSize);
          return (
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-sm text-abyss-400">
                {t('diveSites.showing', { count: sites.length, total: totalCount })}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-ocean-200 bg-white text-abyss-600 hover:bg-ocean-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t('adminDiveSites.pagination.previous')}
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1]) > 1) acc.push('ellipsis');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === 'ellipsis' ? (
                          <span key={`e-${idx}`} className="px-2 text-abyss-400 text-sm">...</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setPage(item)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                              page === item
                                ? 'bg-ocean-600 text-white shadow-sm'
                                : 'bg-white border border-ocean-200 text-abyss-600 hover:bg-ocean-50'
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-ocean-200 bg-white text-abyss-600 hover:bg-ocean-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {t('adminDiveSites.pagination.next')}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {showSuggest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="p-5 border-b border-ocean-100 bg-gradient-to-r from-ocean-50 to-sea-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-sea-500 rounded-xl flex items-center justify-center">
                    <Anchor className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-abyss-900">{t('diveSites.suggestTitle')}</h2>
                    <p className="text-xs text-abyss-500">{t('diveSites.suggestSubtitle')}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSuggest(false);
                    setSuggestError(null);
                    setSuggestSuccess(false);
                  }}
                  className="p-2 hover:bg-ocean-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-abyss-400" />
                </button>
              </div>
            </div>

            {suggestSuccess ? (
              <div className="p-10 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-abyss-900">{t('diveSites.suggestSuccess')}</p>
                <p className="text-sm text-abyss-500 mt-1">{t('diveSites.suggestSuccessHint')}</p>
              </div>
            ) : (
              <form onSubmit={handleSuggest} className="p-5 overflow-y-auto max-h-[calc(90vh-140px)] dive-scrollbar">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-abyss-600 mb-1.5">
                      {t('adminDiveSites.form.name')} <span className="text-coral-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={suggestForm.name}
                      onChange={(e) => setSuggestForm((p) => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                      placeholder={t('adminDiveSites.form.namePlaceholder')}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('adminDiveSites.form.description')}</label>
                    <textarea
                      value={suggestForm.description}
                      onChange={(e) => setSuggestForm((p) => ({ ...p, description: e.target.value }))}
                      rows={2}
                      className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-abyss-600 mb-1.5">
                        {t('adminDiveSites.form.latitude')} <span className="text-coral-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={suggestForm.latitude}
                        onChange={(e) => setSuggestForm((p) => ({ ...p, latitude: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-abyss-600 mb-1.5">
                        {t('adminDiveSites.form.longitude')} <span className="text-coral-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={suggestForm.longitude}
                        onChange={(e) => setSuggestForm((p) => ({ ...p, longitude: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('adminDiveSites.form.maxDepth')}</label>
                    <input
                      type="number"
                      value={suggestForm.maxDepthM ?? ''}
                      onChange={(e) =>
                        setSuggestForm((p) => ({ ...p, maxDepthM: e.target.value ? parseInt(e.target.value) : undefined }))
                      }
                      min="0"
                      max="500"
                      className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('diveSites.siteType')}</label>
                    <select
                      value={suggestForm.siteType ?? ''}
                      onChange={(e) =>
                        setSuggestForm((p) => ({ ...p, siteType: (e.target.value || undefined) as DiveSiteType | undefined }))
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
                        value={suggestForm.country}
                        onChange={(e) => setSuggestForm((p) => ({ ...p, country: e.target.value }))}
                        className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('adminDiveSites.form.region')}</label>
                      <input
                        type="text"
                        value={suggestForm.region}
                        onChange={(e) => setSuggestForm((p) => ({ ...p, region: e.target.value }))}
                        className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                      />
                    </div>
                  </div>
                  {suggestError && (
                    <div className="bg-coral-50 border border-coral-200 rounded-xl p-3 text-coral-600 text-sm">{suggestError}</div>
                  )}
                </div>
              </form>
            )}

            {!suggestSuccess && (
              <div className="p-5 border-t border-ocean-100 bg-abyss-50 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowSuggest(false)}
                  className="px-5 py-2.5 text-abyss-600 hover:bg-abyss-100 rounded-xl font-medium transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSuggest}
                  disabled={isSuggesting || !suggestForm.name.trim()}
                  className="btn-primary px-6 py-2.5 text-white font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSuggesting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      {t('diveSites.suggestSubmit')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
