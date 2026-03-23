import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  weatherApi,
  locationsApi,
  diveSiteApi,
  type DiveConditions,
  type SavedLocation,
  type DiveSite,
  type DiveSiteMarker,
  type DiveSiteType,
  DIVE_SITE_TYPES,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import DiveConditionsPanel from '../components/DiveConditionsPanel';
import AIDiveConditionsLoader from '../components/AIDiveConditionsLoader';
import SavedLocationsPanel from '../components/SavedLocationsPanel';
import SaveLocationModal from '../components/SaveLocationModal';
import AdminDiveSitePanel from '../components/AdminDiveSitePanel';
import DiveSitesPanel from '../components/DiveSitesPanel';
import MapLayerSwitcher from '../components/MapLayerSwitcher';
import MapLayerToggle, { type MapLayerVisibility, type SiteTypeVisibility, type DepthRange } from '../components/map/MapLayerToggle';
import MapSearchBar, { type SearchResult, type NearbySite } from '../components/map/MapSearchBar';
import {
  VerifiedSitesLayer,
  UnverifiedSitesLayer,
  SavedLocationsLayer,
} from '../components/map/ClusteredMarkerLayer';
import {
  selectedMarkerIcon,
  waterLocationMarker,
  SITE_TYPE_COLORS,
} from '../components/map/markerIcons';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import {
  MapPin,
  Calendar,
  Clock,
  Loader2,
  Waves,
  X,
  Anchor,
  BookmarkPlus,
  Navigation2,
  Shield,
  Globe,
} from 'lucide-react';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface SelectedLocation {
  lat: number;
  lng: number;
}

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (location: SelectedLocation) => void;
}) {
  useMapEvents({
    click: (e) => {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 10, { duration: 1 });
  }, [lat, lng, map]);
  return null;
}

interface MapBounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

function MapBoundsTracker({
  onBoundsChange,
  onCenterChange,
}: {
  onBoundsChange: (bounds: MapBounds, zoom: number) => void;
  onCenterChange: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const initialFired = useRef(false);

  useEffect(() => {
    if (!initialFired.current) {
      initialFired.current = true;
      const b = map.getBounds();
      const c = map.getCenter();
      onCenterChange(c.lat, c.lng);
      onBoundsChange(
        { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() },
        map.getZoom(),
      );
    }
  }, [map, onBoundsChange, onCenterChange]);

  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      const b = e.target.getBounds();
      onCenterChange(center.lat, center.lng);
      onBoundsChange(
        { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() },
        e.target.getZoom(),
      );
    },
  });
  return null;
}

export default function DiveMap() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes('Admin') ?? false;
  const canAccessUnverified =
    isAdmin ||
    (user?.roles?.includes('Trainer') ?? false) ||
    (user?.roles?.includes('DiveCenter') ?? false);

  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [conditions, setConditions] = useState<DiveConditions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedDiveSite, setSelectedDiveSite] = useState<DiveSiteMarker | null>(null);
  const [isFromSavedLocation, setIsFromSavedLocation] = useState(false);

  const [diveSites, setDiveSites] = useState<DiveSite[]>([]);
  const [mapMarkers, setMapMarkers] = useState<DiveSiteMarker[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 20, lng: 0 });

  const [flyToCoords, setFlyToCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'conditions' | 'saved' | 'sites' | 'admin'>('conditions');
  const [adminAddCoords, setAdminAddCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [searchNearbySites, setSearchNearbySites] = useState<NearbySite[]>([]);

  const [layerVisibility, setLayerVisibility] = useState<MapLayerVisibility>({
    verified: true,
    unverified: true,
    saved: true,
  });

  const [siteTypeVisibility, setSiteTypeVisibility] = useState<SiteTypeVisibility>(
    () => Object.fromEntries([...DIVE_SITE_TYPES, 'Unknown'].map((t) => [t, true])) as SiteTypeVisibility,
  );

  const [depthRange, setDepthRange] = useState<DepthRange>({ min: '', max: '' });

  const [currentZoom, setCurrentZoom] = useState(3);
  const fetchedBoundsRef = useRef<Set<string>>(new Set());
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const toggleLayer = useCallback((layer: keyof MapLayerVisibility) => {
    setLayerVisibility((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  const toggleSiteType = useCallback((type: DiveSiteType) => {
    setSiteTypeVisibility((prev) => ({ ...prev, [type]: !prev[type] }));
  }, []);

  const verifiedSites = useMemo(() => mapMarkers.filter((s) => s.isVerified), [mapMarkers]);
  const unverifiedSites = useMemo(() => mapMarkers.filter((s) => !s.isVerified), [mapMarkers]);

  const filteredVerifiedSites = useMemo(() => {
    const minD = parseFloat(depthRange.min);
    const maxD = parseFloat(depthRange.max);
    return verifiedSites.filter((s) => {
      if (!siteTypeVisibility[s.siteType ?? 'Unknown']) return false;
      if (!isNaN(minD) && minD > 0 && (s.maxDepthM == null || s.maxDepthM < minD)) return false;
      if (!isNaN(maxD) && maxD > 0 && (s.maxDepthM == null || s.maxDepthM > maxD)) return false;
      return true;
    });
  }, [verifiedSites, siteTypeVisibility, depthRange]);

  const siteTypeCounts = useMemo(() => {
    const counts: Partial<Record<DiveSiteType, number>> = {};
    for (const site of verifiedSites) {
      const type: DiveSiteType = site.siteType ?? 'Unknown';
      counts[type] = (counts[type] ?? 0) + 1;
    }
    return counts;
  }, [verifiedSites]);

  const layerCounts = useMemo(
    () => ({
      verified: filteredVerifiedSites.length,
      unverified: unverifiedSites.length,
      saved: savedLocations.length,
    }),
    [filteredVerifiedSites.length, unverifiedSites.length, savedLocations.length],
  );

  useEffect(() => {
    if (user) {
      fetchSavedLocations();
    } else {
      setSavedLocations([]);
      setIsLoadingLocations(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isAdmin && activeTab === 'admin') setActiveTab('conditions');
    if (isAdmin && activeTab === 'saved') setActiveTab('conditions');
  }, [isAdmin]);

  useEffect(() => {
    fetchDiveSites();
  }, [canAccessUnverified]);

  const fetchSavedLocations = async () => {
    setIsLoadingLocations(true);
    const result = await locationsApi.getAll();
    if (result.ok) {
      setSavedLocations(result.data);
    }
    setIsLoadingLocations(false);
  };

  const fetchDiveSites = async () => {
    const markers = await diveSiteApi.getMarkers();
    if (markers.ok) {
      setMapMarkers(markers.data);
      return;
    }
    const filtered = await diveSiteApi.getFiltered({
      isVerified: canAccessUnverified ? undefined : true,
      pageSize: 100,
      sortBy: 'name',
    });
    if (filtered.ok) {
      const sites = Array.isArray(filtered.data)
        ? filtered.data
        : (filtered.data as any).items ?? filtered.data;
      const siteArray = Array.isArray(sites) ? sites : [];
      setDiveSites(siteArray);
      setMapMarkers(siteArray);
    }
  };

  const fetchSitesForBounds = useCallback(
    async (bounds: MapBounds, zoom: number) => {
      if (zoom < 7) return;

      const gridKey = `${Math.floor(bounds.south)},${Math.floor(bounds.west)},${Math.floor(bounds.north)},${Math.floor(bounds.east)},z${zoom}`;
      if (fetchedBoundsRef.current.has(gridKey)) return;
      fetchedBoundsRef.current.add(gridKey);

      const centerLat = (bounds.south + bounds.north) / 2;
      const centerLng = (bounds.west + bounds.east) / 2;

      const latSpan = bounds.north - bounds.south;
      const radiusKm = Math.min(Math.max((latSpan * 111) / 2, 10), 500);

      const result = canAccessUnverified
        ? await diveSiteApi.getAll(centerLat, centerLng, radiusKm)
        : await diveSiteApi.getVerified(centerLat, centerLng, radiusKm);

      if (result.ok && result.data.length > 0) {
        setMapMarkers((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const newSites = result.data.filter((s) => !existingIds.has(s.id));
          return newSites.length > 0 ? [...prev, ...newSites] : prev;
        });
      }
    },
    [canAccessUnverified],
  );

  const handleBoundsChange = useCallback(
    (bounds: MapBounds, zoom: number) => {
      setCurrentZoom(zoom);
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
      fetchTimerRef.current = setTimeout(() => fetchSitesForBounds(bounds, zoom), 400);
    },
    [fetchSitesForBounds],
  );

  const handleLocationSelect = (location: SelectedLocation) => {
    setConditions(null);
    setError(null);
    setSelectedLocation(location);
    setFlyToCoords(null);
    setIsFromSavedLocation(false);

    const nearbyThreshold = 0.005;
    let nearest: DiveSiteMarker | null = null;
    let nearestDist = Infinity;
    for (const site of mapMarkers) {
      if (!site.isVerified) continue;
      const dLat = site.latitude - location.lat;
      const dLng = site.longitude - location.lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < nearbyThreshold && dist < nearestDist) {
        nearest = site;
        nearestDist = dist;
      }
    }
    setSelectedDiveSite(nearest);

    if (nearest) {
      setSelectedLocation({ lat: nearest.latitude, lng: nearest.longitude });
    }
  };

  const clearLocation = () => {
    setSelectedLocation(null);
    setConditions(null);
    setError(null);
  };

  const conditionsRequestRef = useRef(0);

  const fetchConditions = async () => {
    if (!selectedLocation) return;

    if (!canAccessUnverified && !isFromSavedLocation && (!selectedDiveSite || !selectedDiveSite.isVerified)) {
      setError(t('map.verifiedSiteRequired'));
      return;
    }

    const requestId = ++conditionsRequestRef.current;
    setIsLoading(true);
    setError(null);

    let dateTime: string | undefined;
    if (selectedDate) {
      dateTime = selectedTime ? `${selectedDate}T${selectedTime}` : selectedDate;
    }

    const result = await weatherApi.getDiveConditions(
      selectedLocation.lat,
      selectedLocation.lng,
      dateTime
    );

    if (requestId !== conditionsRequestRef.current) return;

    if (result.ok) {
      setConditions(result.data);
    } else {
      setError(result.error || t('errors.fetchDiveConditions'));
    }
    setIsLoading(false);
  };

  const cancelConditionsRequest = () => {
    conditionsRequestRef.current++;
    setIsLoading(false);
  };

  const handleSavedLocationClick = (location: SavedLocation) => {
    setSelectedLocation({ lat: location.latitude, lng: location.longitude });
    setFlyToCoords({ lat: location.latitude, lng: location.longitude });
    setConditions(null);
    setError(null);
    setIsFromSavedLocation(true);
    setActiveTab('conditions');
  };

  const handleDiveSiteClick = (site: DiveSiteMarker) => {
    setSelectedLocation({ lat: site.latitude, lng: site.longitude });
    setSelectedDiveSite(site);
    setFlyToCoords({ lat: site.latitude, lng: site.longitude });
    setConditions(null);
    setError(null);
    setIsFromSavedLocation(false);
    setActiveTab('conditions');
  };

  const handleLocationSaved = () => {
    fetchSavedLocations();
  };

  const handleLocationDelete = (id: string) => {
    setSavedLocations((prev) => prev.filter((l) => l.id !== id));
  };

  const handleWeatherUpdate = (updatedLocation: SavedLocation) => {
    setSavedLocations((prev) =>
      prev.map((l) => (l.id === updatedLocation.id ? updatedLocation : l))
    );
  };

  const handleAddAsDiveSite = () => {
    if (!selectedLocation) return;
    setAdminAddCoords({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    setActiveTab('admin');
  };

  const handleSearchSelect = (result: SearchResult) => {
    setSelectedLocation({ lat: result.lat, lng: result.lng });
    setFlyToCoords({ lat: result.lat, lng: result.lng });
    setConditions(null);
    setError(null);
    setIsFromSavedLocation(false);

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const maxDistKm = 50;
    const nearby: NearbySite[] = [];
    let nearest: DiveSiteMarker | null = null;
    let nearestDist = Infinity;

    for (const site of mapMarkers) {
      const distKm = haversineKm(result.lat, result.lng, site.latitude, site.longitude);
      if (distKm <= maxDistKm) {
        nearby.push({
          id: site.id,
          name: site.name,
          latitude: site.latitude,
          longitude: site.longitude,
          isVerified: site.isVerified,
          distanceKm: distKm,
          country: site.country,
          maxDepthM: site.maxDepthM,
        });
      }
      if (site.isVerified && distKm < 0.5 && distKm < nearestDist) {
        nearest = site;
        nearestDist = distKm;
      }
    }

    nearby.sort((a, b) => a.distanceKm - b.distanceKm);
    setSearchNearbySites(nearby.slice(0, 8));

    setSelectedDiveSite(nearest);
    if (nearest) {
      setSelectedLocation({ lat: nearest.latitude, lng: nearest.longitude });
      setFlyToCoords({ lat: nearest.latitude, lng: nearest.longitude });
    }
  };

  const handleSearchNearbySiteClick = (site: NearbySite) => {
    setSelectedLocation({ lat: site.latitude, lng: site.longitude });
    setFlyToCoords({ lat: site.latitude, lng: site.longitude });
    setConditions(null);
    setError(null);
    setIsFromSavedLocation(false);

    const marker = mapMarkers.find((m) => m.id === site.id) ?? null;
    setSelectedDiveSite(marker);
    setSearchNearbySites([]);
    setActiveTab('conditions');
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex-1 flex">
      <AIDiveConditionsLoader active={isLoading} onCancel={cancelConditionsRequest} />

      <div className="flex-1 relative">
        <MapContainer
          center={[20, 0]}
          zoom={3}
          className="h-full w-full"
          style={{ background: '#bae6fd' }}
          attributionControl={false}
        >
          <MapLayerSwitcher />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          <MapBoundsTracker
            onBoundsChange={handleBoundsChange}
            onCenterChange={(lat, lng) => setMapCenter({ lat, lng })}
          />

          {layerVisibility.verified && (
            <VerifiedSitesLayer sites={filteredVerifiedSites} onSiteClick={handleDiveSiteClick} />
          )}
          {layerVisibility.unverified && canAccessUnverified && (
            <UnverifiedSitesLayer sites={unverifiedSites} onSiteClick={handleDiveSiteClick} />
          )}
          {layerVisibility.saved && (
            <SavedLocationsLayer locations={savedLocations} onLocationClick={handleSavedLocationClick} />
          )}

          {flyToCoords && <FlyToLocation lat={flyToCoords.lat} lng={flyToCoords.lng} />}

          {selectedLocation && (
            <Marker
              position={[selectedLocation.lat, selectedLocation.lng]}
              icon={selectedMarkerIcon}
            />
          )}

          {conditions?.waterLatitude && conditions?.waterLongitude && (
            <Marker
              position={[conditions.waterLatitude, conditions.waterLongitude]}
              icon={waterLocationMarker}
            />
          )}

          {conditions?.waterLatitude && conditions?.waterLongitude && selectedLocation && conditions.distanceToWaterKm && conditions.distanceToWaterKm > 0.1 && (
            <Polyline
              positions={[
                [selectedLocation.lat, selectedLocation.lng],
                [conditions.waterLatitude, conditions.waterLongitude],
              ]}
              pathOptions={{
                color: '#10b981',
                weight: 3,
                dashArray: '8, 12',
                opacity: 0.9,
              }}
            />
          )}
        </MapContainer>

        <MapLayerToggle
          layers={layerVisibility}
          onToggle={toggleLayer}
          isAdmin={isAdmin}
          canAccessUnverified={canAccessUnverified}
          counts={layerCounts}
          siteTypeVisibility={siteTypeVisibility}
          onToggleSiteType={toggleSiteType}
          siteTypeCounts={siteTypeCounts}
          depthRange={depthRange}
          onDepthRangeChange={setDepthRange}
        />

        <MapSearchBar
          onLocationSelect={handleSearchSelect}
          onNearbySiteClick={handleSearchNearbySiteClick}
          nearbySites={searchNearbySites}
        />

        <div className="absolute bottom-4 left-4 glass px-4 py-3 rounded-xl shadow-lg z-[1000] border border-ocean-200 max-h-[calc(100vh-8rem)] overflow-y-auto dive-scrollbar">
          <p className="text-xs font-semibold text-abyss-600 mb-2">{t('map.legend.markers')}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500" /> {t('map.legend.selected')}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-500" /> {t('map.legend.divePoint')}
            </div>
          </div>
          <p className="text-xs font-semibold text-abyss-600 mb-2 mt-2 pt-2 border-t border-ocean-200">{t('map.legend.diveSiteTypes')}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
            {DIVE_SITE_TYPES.map((type) => (
              <div key={type} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: SITE_TYPE_COLORS[type].fill }}
                />
                {t(`diveSites.siteTypes.${type}`)}
              </div>
            ))}
          </div>
          {canAccessUnverified && (
            <>
              <p className="text-xs font-semibold text-abyss-600 mb-2 mt-2 pt-2 border-t border-ocean-200">{t('map.legend.other')}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-yellow-400" /> {t('map.legend.unverifiedSite')}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="w-96 bg-white border-l border-ocean-200 flex flex-col shadow-xl">
        <div className="p-5 border-b border-ocean-100 bg-gradient-to-r from-ocean-50 to-sea-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-ocean-500 to-sea-500 rounded-xl flex items-center justify-center">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-abyss-900">{t('map.sidebarTitle')}</h2>
              <p className="text-xs text-abyss-500">{t('map.sidebarSubtitle')}</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('conditions')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'conditions'
                  ? 'bg-ocean-600 text-white'
                  : 'bg-white text-abyss-600 hover:bg-ocean-50'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Waves className="w-4 h-4" />
                {t('map.conditionsTab')}
              </span>
            </button>
            {!isAdmin && (
              <button
                onClick={() => setActiveTab('sites')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'sites'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white text-abyss-600 hover:bg-cyan-50'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Globe className="w-4 h-4" />
                  {t('map.sitesTab')} ({mapMarkers.length})
                </span>
              </button>
            )}
            {user && !isAdmin && (
              <button
                onClick={() => setActiveTab('saved')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'saved'
                    ? 'bg-ocean-600 text-white'
                    : 'bg-white text-abyss-600 hover:bg-ocean-50'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Anchor className="w-4 h-4" />
                  {t('map.savedTab')} ({savedLocations.length})
                </span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-abyss-700 text-white'
                    : 'bg-white text-abyss-600 hover:bg-abyss-50'
                }`}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  {t('map.adminTab')}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5 dive-scrollbar">
          {activeTab === 'sites' ? (
            <DiveSitesPanel
              diveSites={mapMarkers}
              onSiteClick={handleDiveSiteClick}
            />
          ) : activeTab === 'conditions' ? (
            <>
              {selectedLocation ? (
                <div className="bg-gradient-to-br from-ocean-50 to-sea-50 rounded-xl p-4 border border-ocean-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-ocean-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {t('map.selectedLocation')}
                      </p>
                      <p className="text-sm text-abyss-800 font-mono bg-white px-3 py-1.5 rounded-lg border border-ocean-100">
                        {selectedLocation.lat.toFixed(4)}°, {selectedLocation.lng.toFixed(4)}°
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {isAdmin && (
                        <button
                          onClick={handleAddAsDiveSite}
                          className="text-abyss-500 hover:text-abyss-700 p-1.5 hover:bg-abyss-100 rounded-lg transition-colors"
                          title={t('map.addAsDiveSite')}
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      {selectedDiveSite && selectedDiveSite.isVerified && user && (
                        <button
                          onClick={() => setShowSaveModal(true)}
                          className="text-ocean-500 hover:text-ocean-700 p-1.5 hover:bg-ocean-100 rounded-lg transition-colors"
                          title={t('map.saveThisLocation')}
                        >
                          <BookmarkPlus className="w-4 h-4" />
                        </button>
                      )}
                      {!selectedDiveSite && user && (
                        <span
                          className="text-abyss-300 p-1.5 cursor-not-allowed"
                          title={t('map.noNearbySiteToSave', 'Click on a dive site marker to save')}
                        >
                          <BookmarkPlus className="w-4 h-4" />
                        </span>
                      )}
                      <button
                        onClick={clearLocation}
                        className="text-abyss-400 hover:text-coral-500 p-1.5 hover:bg-coral-50 rounded-lg transition-colors"
                        title={t('map.clearSelection')}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {selectedDiveSite && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-700 bg-cyan-50 px-3 py-1.5 rounded-lg border border-cyan-100">
                      <Anchor className="w-3 h-3" />
                      <span className="font-medium">{selectedDiveSite.name}</span>
                    </div>
                  )}

                  {conditions?.waterLatitude && conditions?.waterLongitude && (
                    <div className="mt-3 pt-3 border-t border-ocean-200">
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Navigation2 className="w-3.5 h-3.5" />
                        {t('map.divePoint')}
                      </p>
                      <p className="text-sm text-abyss-800 font-mono bg-white px-3 py-1.5 rounded-lg border border-emerald-100">
                        {conditions.waterLatitude.toFixed(4)}°, {conditions.waterLongitude.toFixed(4)}°
                      </p>
                      {conditions.waterLocation && (
                        <p className="text-xs text-abyss-600 mt-2">
                          {conditions.waterLocation}
                        </p>
                      )}
                      {conditions.distanceToWaterKm && conditions.distanceToWaterKm > 0.1 && (
                        <p className="text-xs text-abyss-500 mt-2 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          {t('map.kmFromSelected', { distance: conditions.distanceToWaterKm.toFixed(2) })}
                        </p>
                      )}
                      {conditions.bathymetry?.isLand && (
                        <p className="text-xs text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded">
                          {t('map.onLand')}
                        </p>
                      )}
                      {conditions.bathymetry?.isShallowWater && (
                        <p className="text-xs text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded">
                          {t('map.tooShallow', { depth: conditions.bathymetry.originalDepthM?.toFixed(1) })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-ocean-50 rounded-xl p-6 text-center border border-dashed border-ocean-200">
                  <div className="w-14 h-14 bg-ocean-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-7 h-7 text-ocean-400" />
                  </div>
                  <p className="text-sm font-medium text-abyss-600">{t('map.noLocation')}</p>
                  <p className="text-xs text-abyss-400 mt-1">{t('map.noLocationHint')}</p>
                </div>
              )}

              <div className="space-y-4">
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
                onClick={fetchConditions}
                disabled={!selectedLocation || isLoading || (!canAccessUnverified && !isFromSavedLocation && (!selectedDiveSite || !selectedDiveSite.isVerified))}
                className="w-full btn-primary disabled:bg-abyss-200 disabled:text-abyss-400 disabled:transform-none disabled:shadow-none text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('map.analyzingConditions')}
                  </>
                ) : (
                  <>
                    <Waves className="w-5 h-5" />
                    {t('map.getConditions')}
                  </>
                )}
              </button>

              {!canAccessUnverified && !isFromSavedLocation && selectedLocation && (!selectedDiveSite || !selectedDiveSite.isVerified) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-amber-700 text-sm font-medium">{t('map.verifiedSiteRequired')}</p>
                </div>
              )}

              {error && (
                <div className="bg-coral-50 border border-coral-200 rounded-xl p-4">
                  <p className="text-coral-600 text-sm font-medium">{error}</p>
                </div>
              )}

              {conditions && (
                <DiveConditionsPanel
                  conditions={conditions}
                  onClose={() => setConditions(null)}
                />
              )}
            </>
          ) : activeTab === 'saved' ? (
            <>
              {isLoadingLocations ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-ocean-500 animate-spin" />
                </div>
              ) : (
                <SavedLocationsPanel
                  locations={savedLocations}
                  onLocationClick={handleSavedLocationClick}
                  onRefresh={fetchSavedLocations}
                  onDelete={handleLocationDelete}
                  onWeatherUpdate={handleWeatherUpdate}
                  onLocationUpdated={handleWeatherUpdate}
                />
              )}
            </>
          ) : (
            <AdminDiveSitePanel
              diveSites={diveSites}
              mapCenter={mapCenter}
              onSiteClick={handleDiveSiteClick}
              onRefresh={fetchDiveSites}
              initialCoords={adminAddCoords}
              onInitialCoordsConsumed={() => setAdminAddCoords(null)}
            />
          )}
        </div>
      </div>

      {showSaveModal && selectedDiveSite && (
        <SaveLocationModal
          diveSite={selectedDiveSite}
          onClose={() => setShowSaveModal(false)}
          onSaved={handleLocationSaved}
        />
      )}
    </div>
  );
}
