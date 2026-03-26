import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  RefreshCw,
  Trash2,
  Star,
  ChevronDown,
  ChevronUp,
  Loader2,
  Anchor,
  Clock,
  AlertTriangle,
  Edit2,
  X,
  ExternalLink,
} from 'lucide-react';
import { locationsApi, type SavedLocation, type UpdateLocationRequest } from '../services/api';
import StarRating from './StarRating';

const DIVE_TYPE_COLORS: Record<string, string> = {
  Shore: 'bg-blue-500',
  Boat: 'bg-teal-500',
  Reef: 'bg-green-500',
  Wreck: 'bg-orange-500',
  Cave: 'bg-purple-500',
};

const SAFETY_COLORS: Record<string, string> = {
  Excellent: 'bg-green-500',
  Good: 'bg-green-400',
  Fair: 'bg-yellow-500',
  Poor: 'bg-orange-500',
  'Not Recommended': 'bg-red-500',
};

interface SavedLocationsPanelProps {
  locations: SavedLocation[];
  onLocationClick: (location: SavedLocation) => void;
  onRefresh: () => void;
  onDelete: (id: string) => void;
  onWeatherUpdate: (location: SavedLocation) => void;
  onLocationUpdated?: (location: SavedLocation) => void;
}

export default function SavedLocationsPanel({
  locations,
  onLocationClick,
  onRefresh,
  onDelete,
  onWeatherUpdate,
  onLocationUpdated,
}: SavedLocationsPanelProps) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<SavedLocation | null>(null);
  const [editForm, setEditForm] = useState<UpdateLocationRequest>({ timesVisited: 0 });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const openEdit = (location: SavedLocation) => {
    setEditingLocation(location);
    setEditForm({
      notes: location.notes || '',
      personalRating: location.personalRating || undefined,
      photoUrls: location.photoUrls || [],
      lastDiveDate: location.lastDiveDate ? location.lastDiveDate.split('T')[0] : undefined,
      timesVisited: location.timesVisited,
    });
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingLocation) return;
    setIsSavingEdit(true);
    setEditError(null);
    const payload: UpdateLocationRequest = {
      ...editForm,
      lastDiveDate: editForm.lastDiveDate ? `${editForm.lastDiveDate}T00:00:00Z` : undefined,
    };
    const result = await locationsApi.update(editingLocation.id, payload);
    if (result.ok) {
      onLocationUpdated?.(result.data);
      setEditingLocation(null);
    } else {
      setEditError(result.error || t('savedLocations.editFailed'));
    }
    setIsSavingEdit(false);
  };

  const handleRefreshWeather = async (location: SavedLocation) => {
    setRefreshingId(location.id);
    setError(null);
    const result = await locationsApi.refreshWeather(location.id);
    if (result.ok) {
      onWeatherUpdate(result.data.location);
    } else {
      setError(result.error || t('errors.refreshWeather'));
    }
    setRefreshingId(null);
  };

  const handleRefreshAll = async () => {
    setRefreshingAll(true);
    setError(null);
    const result = await locationsApi.refreshAllWeather();
    if (result.ok) {
      const failed = result.data.results.filter(r => r.status === 'failed');
      if (failed.length > 0) {
        const names = failed.slice(0, 5).map(f => f.locationName).join(', ');
        const suffix = failed.length > 5 ? ` and ${failed.length - 5} more` : '';
        setError(`${failed.length} location(s) failed to refresh: ${names}${suffix}`);
      }
      onRefresh();
    } else {
      setError(result.error || t('errors.refreshAllWeather'));
    }
    setRefreshingAll(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('savedLocations.deleteConfirm'))) return;
    setDeletingId(id);
    setError(null);
    const result = await locationsApi.delete(id);
    if (result.ok) {
      onDelete(id);
    } else {
      setError(result.error || t('errors.deleteLocation'));
    }
    setDeletingId(null);
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return t('savedLocations.timeAgo.never');
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t('savedLocations.timeAgo.justNow');
    if (diffMins < 60) return t('savedLocations.timeAgo.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('savedLocations.timeAgo.hoursAgo', { count: diffHours });
    return t('savedLocations.timeAgo.daysAgo', { count: diffDays });
  };

  if (locations.length === 0) {
    return (
      <div className="bg-ocean-50 rounded-xl p-6 text-center border border-dashed border-ocean-200">
        <div className="w-14 h-14 bg-ocean-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Anchor className="w-7 h-7 text-ocean-400" />
        </div>
        <p className="text-sm font-medium text-abyss-600">{t('savedLocations.empty')}</p>
        <p className="text-xs text-abyss-400 mt-1">
          {t('savedLocations.emptyHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-abyss-700 flex items-center gap-2">
          <Anchor className="w-4 h-4 text-ocean-500" />
          {t('savedLocations.title')} {t('savedLocations.count', { count: locations.length })}
        </h3>
        <button
          onClick={handleRefreshAll}
          disabled={refreshingAll}
          className="text-xs text-ocean-600 hover:text-ocean-700 font-medium flex items-center gap-1 px-2 py-1 hover:bg-ocean-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshingAll ? 'animate-spin' : ''}`} />
          {t('savedLocations.refreshAll')}
        </button>
      </div>

      {error && (
        <div className="bg-coral-50 border border-coral-200 rounded-xl p-3 text-coral-600 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-2">
        {locations.map((location) => (
          <div
            key={location.id}
            className="bg-white border border-ocean-100 rounded-xl overflow-hidden hover:border-ocean-200 transition-colors"
          >
            <div
              className="p-3 cursor-pointer"
              onClick={() => onLocationClick(location)}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-2 h-full min-h-[40px] rounded-full ${
                    location.diveType ? DIVE_TYPE_COLORS[location.diveType] || 'bg-abyss-300' : 'bg-abyss-300'
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-abyss-900 truncate">{location.name}</h4>
                    {location.personalRating && (
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-abyss-500">{location.personalRating}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-abyss-500 font-mono">
                      {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
                    </p>
                    {location.diveType && (
                      <span className="text-xs px-1.5 py-0.5 bg-abyss-100 text-abyss-600 rounded">
                        {location.diveType}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  {location.lastWeatherStatus ? (
                    <>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full text-white font-medium ${
                          SAFETY_COLORS[location.lastWeatherStatus] || 'bg-abyss-400'
                        }`}
                      >
                        {location.lastWeatherStatus}
                      </span>
                      {location.lastSafetyScore !== undefined && (
                        <span className="text-xs text-abyss-500">
                          {t('savedLocations.score', { score: location.lastSafetyScore })}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-abyss-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {t('savedLocations.noData')}
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(expandedId === location.id ? null : location.id);
                  }}
                  className="p-1 hover:bg-ocean-50 rounded transition-colors"
                >
                  {expandedId === location.id ? (
                    <ChevronUp className="w-4 h-4 text-abyss-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-abyss-400" />
                  )}
                </button>
              </div>
            </div>

            {expandedId === location.id && (
              <div className="px-3 pb-3 pt-0 border-t border-ocean-50">
                <div className="mt-3 space-y-3">
                  {(location.description || location.notes) && (
                    <div className="text-sm text-abyss-600">
                      {location.description && <p>{location.description}</p>}
                      {location.notes && (
                        <p className="text-abyss-500 italic mt-1">{location.notes}</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {location.difficultyLevel && (
                      <div className="bg-abyss-50 rounded-lg px-2 py-1.5">
                        <span className="text-abyss-400">{t('savedLocations.difficulty')}</span>
                        <span className="ml-1 font-medium text-abyss-700">{location.difficultyLevel}</span>
                      </div>
                    )}
                    {location.maxDepthM && (
                      <div className="bg-abyss-50 rounded-lg px-2 py-1.5">
                        <span className="text-abyss-400">{t('savedLocations.maxDepth')}</span>
                        <span className="ml-1 font-medium text-abyss-700">{location.maxDepthM}m</span>
                      </div>
                    )}
                    {location.timesVisited > 0 && (
                      <div className="bg-abyss-50 rounded-lg px-2 py-1.5">
                        <span className="text-abyss-400">{t('savedLocations.visits')}</span>
                        <span className="ml-1 font-medium text-abyss-700">{location.timesVisited}</span>
                      </div>
                    )}
                    {location.lastWeatherCheck && (
                      <div className="bg-abyss-50 rounded-lg px-2 py-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-abyss-400" />
                        <span className="text-abyss-500">
                          {t('savedLocations.updated', { time: formatTimeAgo(location.lastWeatherCheck) })}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    {location.diveSiteId && (
                      <Link
                        to={`/dive-sites/${location.diveSiteId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {t('savedLocations.viewDiveSite')}
                      </Link>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRefreshWeather(location);
                      }}
                      disabled={refreshingId === location.id}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-ocean-50 hover:bg-ocean-100 text-ocean-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {refreshingId === location.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      {t('savedLocations.updateWeather')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(location);
                      }}
                      className="p-2 text-abyss-400 hover:text-ocean-600 hover:bg-ocean-50 rounded-lg transition-colors"
                      title={t('savedLocations.edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(location.id);
                      }}
                      disabled={deletingId === location.id}
                      className="p-2 text-abyss-400 hover:text-coral-500 hover:bg-coral-50 rounded-lg transition-colors disabled:opacity-50"
                      title={t('common.delete')}
                    >
                      {deletingId === location.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {editingLocation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-ocean-100 bg-gradient-to-r from-ocean-50 to-sea-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-abyss-900">{t('savedLocations.editTitle')}</h2>
                  <p className="text-xs text-abyss-500">{editingLocation.name}</p>
                </div>
                <button onClick={() => setEditingLocation(null)} className="p-2 hover:bg-ocean-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-abyss-400" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-abyss-600 mb-2">{t('savedLocations.ratingLabel')}</label>
                <StarRating value={editForm.personalRating} onChange={(r) => setEditForm(f => ({ ...f, personalRating: r }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('savedLocations.notesLabel')}</label>
                <textarea
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none resize-none"
                  placeholder={t('savedLocations.notesPlaceholder')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('savedLocations.timesVisitedLabel')}</label>
                  <input
                    type="number"
                    value={editForm.timesVisited}
                    onChange={(e) => setEditForm(f => ({ ...f, timesVisited: parseInt(e.target.value) || 0 }))}
                    min="0"
                    max="10000"
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-abyss-600 mb-1.5">{t('savedLocations.lastDiveDateLabel')}</label>
                  <input
                    type="date"
                    value={editForm.lastDiveDate?.split('T')[0] || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, lastDiveDate: e.target.value || undefined }))}
                    className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 outline-none"
                  />
                </div>
              </div>
              {editError && (
                <div className="bg-coral-50 border border-coral-200 rounded-xl p-3 text-coral-600 text-sm">{editError}</div>
              )}
            </div>
            <div className="p-5 border-t border-ocean-100 bg-abyss-50 flex gap-3 justify-end">
              <button
                onClick={() => setEditingLocation(null)}
                className="px-5 py-2.5 text-abyss-600 hover:bg-abyss-100 rounded-xl font-medium transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="btn-primary px-6 py-2.5 text-white font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                {isSavingEdit ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{t('savedLocations.saving')}</>
                ) : (
                  t('savedLocations.saveButton')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
