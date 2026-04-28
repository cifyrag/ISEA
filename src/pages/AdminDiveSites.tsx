import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Anchor, Plus, Pencil, CheckCircle, Trash2, ChevronUp, ChevronDown, X, Filter } from 'lucide-react';
import { diveSiteApi } from '../services/api';
import type { DiveSiteWithDistance, DiveSiteFilterRequest, DiveSiteSource, DiveSiteSortBy, DiveSiteType } from '../services/api/types';
import { DIVE_SITE_TYPES } from '../services/api/types';
import DiveSiteFormModal from '../components/DiveSiteFormModal';
import DiveSiteImportPanel from '../components/DiveSiteImportPanel';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
const DEBOUNCE_MS = 400;

export default function AdminDiveSites() {
  const { t } = useTranslation();

  const [searchText, setSearchText] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [filterLat, setFilterLat] = useState('');
  const [filterLon, setFilterLon] = useState('');

  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedCountry, setAppliedCountry] = useState('');
  const [appliedRegion, setAppliedRegion] = useState('');
  const [appliedLat, setAppliedLat] = useState('');
  const [appliedLon, setAppliedLon] = useState('');

  const [verifiedFilter, setVerifiedFilter] = useState<'' | 'true' | 'false'>('');
  const [sourceFilter, setSourceFilter] = useState<DiveSiteSource | ''>('');
  const [siteTypeFilter, setSiteTypeFilter] = useState<DiveSiteType | ''>('');

  const [sortBy, setSortBy] = useState<DiveSiteSortBy>('name');
  const [sortDesc, setSortDesc] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [sites, setSites] = useState<DiveSiteWithDistance[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSite, setEditingSite] = useState<DiveSiteWithDistance | undefined>(undefined);

  const [showFilters, setShowFilters] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setAppliedSearch(searchText.trim());
      setAppliedCountry(countryFilter.trim());
      setAppliedRegion(regionFilter.trim());
      setAppliedLat(filterLat);
      setAppliedLon(filterLon);
      setPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [searchText, countryFilter, regionFilter, filterLat, filterLon]);

  const buildFilterRequest = useCallback((): DiveSiteFilterRequest => {
    const req: DiveSiteFilterRequest = {
      sortBy,
      sortDesc,
      page,
      pageSize,
    };
    if (appliedSearch) req.search = appliedSearch;
    if (verifiedFilter !== '') req.isVerified = verifiedFilter === 'true';
    if (sourceFilter) req.source = sourceFilter;
    if (siteTypeFilter) req.siteType = siteTypeFilter;
    if (appliedCountry) req.country = appliedCountry;
    if (appliedRegion) req.region = appliedRegion;
    const lat = parseFloat(appliedLat);
    const lon = parseFloat(appliedLon);
    if (!isNaN(lat) && !isNaN(lon)) {
      req.latitude = lat;
      req.longitude = lon;
    }
    return req;
  }, [appliedSearch, verifiedFilter, sourceFilter, siteTypeFilter, appliedCountry, appliedRegion, appliedLat, appliedLon, sortBy, sortDesc, page, pageSize]);

  const fetchSites = useCallback(async () => {
    setLoading(true);
    const result = await diveSiteApi.getFiltered(buildFilterRequest());
    if (result.ok) {
      setSites(result.data.items);
      setTotalCount(result.data.totalCount);
      setError('');
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, [buildFilterRequest]);

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  const applyTextFiltersNow = () => {
    clearTimeout(debounceRef.current);
    setAppliedSearch(searchText.trim());
    setAppliedCountry(countryFilter.trim());
    setAppliedRegion(regionFilter.trim());
    setAppliedLat(filterLat);
    setAppliedLon(filterLon);
    setPage(1);
  };

  const handleResetFilters = () => {
    clearTimeout(debounceRef.current);
    setSearchText('');
    setCountryFilter('');
    setRegionFilter('');
    setFilterLat('');
    setFilterLon('');
    setAppliedSearch('');
    setAppliedCountry('');
    setAppliedRegion('');
    setAppliedLat('');
    setAppliedLon('');
    setVerifiedFilter('');
    setSourceFilter('');
    setSiteTypeFilter('');
    setSortBy('name');
    setSortDesc(false);
    setPage(1);
    setPageSize(20);
  };

  const handleDelete = async (site: DiveSiteWithDistance) => {
    if (!window.confirm(t('adminDiveSites.confirmDelete'))) return;
    setActionLoading(site.id);
    const result = await diveSiteApi.delete(site.id);
    if (result.ok) {
      fetchSites();
    } else {
      alert(result.error);
    }
    setActionLoading(null);
  };

  const handleVerify = async (site: DiveSiteWithDistance) => {
    setActionLoading(site.id);
    const result = await diveSiteApi.verify(site.id);
    if (result.ok) {
      setSites((prev) => prev.map((s) => (s.id === site.id ? { ...s, isVerified: true } : s)));
    } else {
      alert(result.error);
    }
    setActionLoading(null);
  };

  const openCreate = () => {
    setEditingSite(undefined);
    setShowFormModal(true);
  };

  const openEdit = (site: DiveSiteWithDistance) => {
    setEditingSite(site);
    setShowFormModal(true);
  };

  const handleSaved = () => {
    fetchSites();
  };

  const handleColumnSort = (column: DiveSiteSortBy) => {
    if (sortBy === column) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(column);
      setSortDesc(false);
    }
    setPage(1);
  };

  const SortIcon = ({ column }: { column: DiveSiteSortBy }) => {
    if (sortBy !== column) return null;
    return sortDesc
      ? <ChevronDown className="w-3.5 h-3.5 inline ml-1" />
      : <ChevronUp className="w-3.5 h-3.5 inline ml-1" />;
  };

  const hasCoordinates = !isNaN(parseFloat(appliedLat)) && !isNaN(parseFloat(appliedLon));

  return (
    <div className="flex-1 ocean-gradient-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-ocean-600 to-sea-500 rounded-xl flex items-center justify-center shadow-md">
              <Anchor className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-abyss-900">{t('adminDiveSites.title')}</h1>
              <p className="text-abyss-500 text-sm">
                {t('adminDiveSites.subtitle')} ({totalCount})
              </p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="btn-primary px-4 py-2.5 text-white font-semibold rounded-xl flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('adminDiveSites.addSite')}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-soft border border-ocean-100 p-4 mb-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-abyss-600 mb-1">
                {t('adminDiveSites.filters.search')}
              </label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyTextFiltersNow()}
                className="w-full px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none"
                placeholder={t('adminDiveSites.filters.searchPlaceholder')}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                showFilters ? 'bg-ocean-100 text-ocean-700' : 'bg-ocean-50 text-abyss-600 hover:bg-ocean-100'
              }`}
            >
              <Filter className="w-4 h-4" />
              {t('adminDiveSites.filters.title')}
            </button>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-abyss-500 hover:text-abyss-700 hover:bg-abyss-50 rounded-lg text-sm transition-colors"
            >
              <X className="w-4 h-4" />
              {t('adminDiveSites.resetFilters')}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-ocean-100 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-abyss-600 mb-1">
                  {t('adminDiveSites.filters.verified')}
                </label>
                <select
                  value={verifiedFilter}
                  onChange={(e) => { setVerifiedFilter(e.target.value as '' | 'true' | 'false'); setPage(1); }}
                  className="w-full px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none bg-white"
                >
                  <option value="">{t('adminDiveSites.filters.all')}</option>
                  <option value="true">{t('adminDiveSites.filters.verifiedOnly')}</option>
                  <option value="false">{t('adminDiveSites.filters.unverifiedOnly')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-abyss-600 mb-1">
                  {t('adminDiveSites.filters.source')}
                </label>
                <select
                  value={sourceFilter}
                  onChange={(e) => { setSourceFilter(e.target.value as DiveSiteSource | ''); setPage(1); }}
                  className="w-full px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none bg-white"
                >
                  <option value="">{t('adminDiveSites.filters.allSources')}</option>
                  <option value="Manual">{t('adminDiveSites.sourceManual')}</option>
                  <option value="ApiImport">{t('adminDiveSites.sourceApi')}</option>
                  <option value="Overpass">{t('adminDiveSites.sourceOverpass')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-abyss-600 mb-1">
                  {t('diveSites.siteType')}
                </label>
                <select
                  value={siteTypeFilter}
                  onChange={(e) => { setSiteTypeFilter(e.target.value as DiveSiteType | ''); setPage(1); }}
                  className="w-full px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none bg-white"
                >
                  <option value="">{t('adminDiveSites.filters.allTypes')}</option>
                  {DIVE_SITE_TYPES.map((type) => (
                    <option key={type} value={type}>{t(`diveSites.siteTypes.${type}`)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-abyss-600 mb-1">
                  {t('adminDiveSites.filters.country')}
                </label>
                <input
                  type="text"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyTextFiltersNow()}
                  className="w-full px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none"
                  placeholder={t('adminDiveSites.filters.countryPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-abyss-600 mb-1">
                  {t('adminDiveSites.filters.region')}
                </label>
                <input
                  type="text"
                  value={regionFilter}
                  onChange={(e) => setRegionFilter(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && applyTextFiltersNow()}
                  className="w-full px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none"
                  placeholder={t('adminDiveSites.filters.regionPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-abyss-600 mb-1">
                  {t('adminDiveSites.searchLat')}
                </label>
                <input
                  type="number"
                  step="any"
                  value={filterLat}
                  onChange={(e) => setFilterLat(e.target.value)}
                  className="w-full px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-abyss-600 mb-1">
                  {t('adminDiveSites.searchLon')}
                </label>
                <input
                  type="number"
                  step="any"
                  value={filterLon}
                  onChange={(e) => setFilterLon(e.target.value)}
                  className="w-full px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-abyss-600 mb-1">
                  {t('adminDiveSites.filters.sortBy')}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as DiveSiteSortBy); setPage(1); }}
                  className="w-full px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none bg-white"
                >
                  <option value="name">{t('adminDiveSites.filters.sortName')}</option>
                  <option value="distance" disabled={!hasCoordinates}>{t('adminDiveSites.filters.sortDistance')}</option>
                  <option value="createdAt">{t('adminDiveSites.filters.sortCreatedAt')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-abyss-600 mb-1">
                  {t('adminDiveSites.filters.pageSize')}
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="w-full px-3 py-2 border border-ocean-200 rounded-lg text-sm focus:ring-2 focus:ring-ocean-500 outline-none bg-white"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <DiveSiteImportPanel
            mapCenter={{ lat: parseFloat(filterLat) || 0, lng: parseFloat(filterLon) || 0 }}
            onImported={() => fetchSites()}
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-coral-50 border border-coral-200 rounded-xl text-coral-700">{error}</div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-ocean-200 border-t-ocean-500 rounded-full animate-spin" />
          </div>
        )}

        {!loading && sites.length === 0 ? (
          <div className="text-center py-16 text-abyss-400">{t('adminDiveSites.noSites')}</div>
        ) : !loading && sites.length > 0 ? (
          <>
            <div className="bg-white rounded-2xl shadow-soft border border-ocean-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-ocean-100 bg-ocean-50/50">
                      <th
                        className="text-left px-6 py-4 text-xs font-semibold text-abyss-500 uppercase tracking-wider cursor-pointer hover:text-ocean-700 select-none"
                        onClick={() => handleColumnSort('name')}
                      >
                        {t('adminDiveSites.table.name')}
                        <SortIcon column="name" />
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-abyss-500 uppercase tracking-wider">
                        {t('adminDiveSites.table.type')}
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-abyss-500 uppercase tracking-wider">
                        {t('adminDiveSites.table.location')}
                      </th>
                      {hasCoordinates && (
                        <th
                          className="text-left px-6 py-4 text-xs font-semibold text-abyss-500 uppercase tracking-wider cursor-pointer hover:text-ocean-700 select-none"
                          onClick={() => handleColumnSort('distance')}
                        >
                          {t('adminDiveSites.table.distance')}
                          <SortIcon column="distance" />
                        </th>
                      )}
                      <th className="text-left px-6 py-4 text-xs font-semibold text-abyss-500 uppercase tracking-wider">
                        {t('adminDiveSites.table.depth')}
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-abyss-500 uppercase tracking-wider">
                        {t('adminDiveSites.table.verified')}
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-abyss-500 uppercase tracking-wider">
                        {t('adminDiveSites.table.source')}
                      </th>
                      <th
                        className="text-left px-6 py-4 text-xs font-semibold text-abyss-500 uppercase tracking-wider cursor-pointer hover:text-ocean-700 select-none"
                        onClick={() => handleColumnSort('createdAt')}
                      >
                        {t('adminDiveSites.table.createdAt')}
                        <SortIcon column="createdAt" />
                      </th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-abyss-500 uppercase tracking-wider">
                        {t('admin.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ocean-100">
                    {sites.map((site) => (
                      <tr key={site.id} className="hover:bg-ocean-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            to={`/dive-sites/${site.id}`}
                            className="font-medium text-ocean-700 hover:text-ocean-900 hover:underline"
                          >
                            {site.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-abyss-600">
                          {site.siteType && site.siteType !== 'Unknown'
                            ? <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-sea-50 text-sea-700">{t(`diveSites.siteTypes.${site.siteType}`)}</span>
                            : <span className="text-abyss-300">-</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-abyss-600">
                          <div>{site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}</div>
                          {site.country && (
                            <div className="text-xs text-abyss-400">{site.country}{site.region ? `, ${site.region}` : ''}</div>
                          )}
                        </td>
                        {hasCoordinates && (
                          <td className="px-6 py-4 text-sm text-abyss-600">
                            {site.distanceKm != null ? `${site.distanceKm} km` : '-'}
                          </td>
                        )}
                        <td className="px-6 py-4 text-sm text-abyss-600">
                          {site.maxDepthM != null ? `${site.maxDepthM}m` : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                              site.isVerified
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${site.isVerified ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            />
                            {site.isVerified ? t('diveSites.verified') : t('diveSites.unverified')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-abyss-600">
                          {site.source === 'Overpass'
                            ? t('adminDiveSites.sourceOverpass')
                            : site.source === 'ApiImport'
                              ? t('adminDiveSites.sourceApi')
                              : t('adminDiveSites.sourceManual')}
                        </td>
                        <td className="px-6 py-4 text-sm text-abyss-600">
                          {new Date(site.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(site)}
                              disabled={actionLoading === site.id}
                              className="p-1.5 text-abyss-400 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors disabled:opacity-50"
                              title={t('adminDiveSites.edit')}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            {!site.isVerified && (
                              <button
                                onClick={() => handleVerify(site)}
                                disabled={actionLoading === site.id}
                                className="p-1.5 text-abyss-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                title={t('adminDiveSites.verify')}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(site)}
                              disabled={actionLoading === site.id}
                              className="p-1.5 text-abyss-400 hover:text-coral-600 hover:bg-coral-50 rounded-lg transition-colors disabled:opacity-50"
                              title={t('common.delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-abyss-500">
                {t('admin.showing')} {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} {t('admin.of')} {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-ocean-200 text-abyss-600 hover:bg-ocean-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('adminDiveSites.pagination.previous')}
                </button>
                <span className="text-sm text-abyss-600">
                  {t('adminDiveSites.pagination.page', { current: page, total: totalPages })}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-ocean-200 text-abyss-600 hover:bg-ocean-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('adminDiveSites.pagination.next')}
                </button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {showFormModal && (
        <DiveSiteFormModal
          site={editingSite}
          onClose={() => setShowFormModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
