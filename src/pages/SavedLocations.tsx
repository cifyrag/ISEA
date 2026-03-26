import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Anchor, Loader2 } from 'lucide-react';
import { locationsApi, type SavedLocation } from '../services/api';
import SavedLocationsPanel from '../components/SavedLocationsPanel';

export default function SavedLocations() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLocations = useCallback(async () => {
    setIsLoading(true);
    const result = await locationsApi.getAll();
    if (result.ok) {
      setLocations(result.data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleDelete = (id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id));
  };

  const handleWeatherUpdate = (updated: SavedLocation) => {
    setLocations((prev) =>
      prev.map((l) => (l.id === updated.id ? updated : l))
    );
  };

  const handleLocationClick = (location: SavedLocation) => {
    if (location.diveSiteId) {
      navigate(`/dive-sites/${location.diveSiteId}`);
    }
  };

  return (
    <div className="flex-1 ocean-gradient-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-ocean-500 to-sea-500 rounded-xl flex items-center justify-center shadow-md">
            <Anchor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-abyss-900">{t('savedLocationsPage.title')}</h1>
            <p className="text-sm text-abyss-500">{t('savedLocationsPage.subtitle')}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-ocean-500 animate-spin" />
              <p className="text-sm text-abyss-500">{t('common.loading')}</p>
            </div>
          </div>
        ) : (
          <SavedLocationsPanel
            locations={locations}
            onLocationClick={handleLocationClick}
            onRefresh={fetchLocations}
            onDelete={handleDelete}
            onWeatherUpdate={handleWeatherUpdate}
            onLocationUpdated={handleWeatherUpdate}
          />
        )}
      </div>
    </div>
  );
}
