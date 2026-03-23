import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X, MapPin, Loader2, AlertCircle, Anchor, ChevronRight } from 'lucide-react';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

export interface SearchResult {
  lat: number;
  lng: number;
  displayName: string;
}

export interface NearbySite {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isVerified: boolean;
  distanceKm: number;
  country?: string;
  maxDepthM?: number;
}

interface MapSearchBarProps {
  onLocationSelect: (result: SearchResult) => void;
  onNearbySiteClick: (site: NearbySite) => void;
  nearbySites: NearbySite[];
}

export default function MapSearchBar({ onLocationSelect, onNearbySiteClick, nearbySites }: MapSearchBarProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showNearbySites, setShowNearbySites] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowNearbySites(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (nearbySites.length > 0 && !isOpen) {
      setShowNearbySites(true);
    }
  }, [nearbySites, isOpen]);

  const parseCoordinates = (input: string): { lat: number; lng: number } | null => {
    const match = input.match(/^\s*(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)\s*$/);
    if (!match) return null;
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
    return null;
  };

  const searchNominatim = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setError(null);
      setHasSearched(false);
      return;
    }

    const coords = parseCoordinates(searchQuery);
    if (coords) {
      setSuggestions([{
        place_id: 0,
        display_name: `${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°`,
        lat: coords.lat.toString(),
        lon: coords.lng.toString(),
        type: 'coordinate',
      }]);
      setIsOpen(true);
      setShowNearbySites(false);
      setError(null);
      setHasSearched(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        format: 'json',
        addressdetails: '1',
        limit: '5',
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          headers: {
            'Accept-Language': navigator.language || 'en',
          },
        },
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: NominatimResult[] = await response.json();
      setSuggestions(data);
      setIsOpen(true);
      setShowNearbySites(false);
      setHasSearched(true);

      if (data.length === 0) {
        setError(t('map.search.noResults'));
      }
    } catch {
      setError(t('map.search.error'));
      setSuggestions([]);
      setIsOpen(true);
      setShowNearbySites(false);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setError(null);
    setShowNearbySites(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setHasSearched(false);
      return;
    }

    debounceRef.current = setTimeout(() => searchNominatim(value), 400);
  };

  const handleSelect = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    onLocationSelect({
      lat,
      lng,
      displayName: result.display_name,
    });

    setQuery(result.display_name);
    setIsOpen(false);
    setSuggestions([]);
    setError(null);
  };

  const handleNearbySiteSelect = (site: NearbySite) => {
    onNearbySiteClick(site);
    setShowNearbySites(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim().length >= 2) {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      searchNominatim(query);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      setShowNearbySites(false);
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setShowNearbySites(false);
    setError(null);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  const formatDistance = (km: number): string => {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
  };

  return (
    <div ref={containerRef} className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[420px] max-w-[calc(100vw-2rem)]">
      <div className="glass rounded-2xl shadow-lg border border-ocean-200 overflow-hidden">
        <div className="flex items-center px-4 py-2.5 gap-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-ocean-500 animate-spin shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-ocean-500 shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0 || (hasSearched && error)) setIsOpen(true);
            }}
            placeholder={t('map.search.placeholder')}
            className="flex-1 bg-transparent text-sm text-abyss-800 placeholder-abyss-400 outline-none"
          />
          {query && (
            <button
              onClick={handleClear}
              className="text-abyss-400 hover:text-abyss-600 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (suggestions.length > 0 || error) && (
        <div className="mt-2 glass rounded-xl shadow-lg border border-ocean-200 overflow-hidden max-h-72 overflow-y-auto">
          {error && suggestions.length === 0 && (
            <div className="px-4 py-3 flex items-center gap-2 text-sm text-coral-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          {suggestions.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 flex items-start gap-3 hover:bg-ocean-50 transition-colors text-left border-b border-ocean-100 last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-ocean-500 mt-0.5 shrink-0" />
              <span className="text-sm text-abyss-700 leading-snug line-clamp-2">
                {result.display_name}
              </span>
            </button>
          ))}
        </div>
      )}

      {showNearbySites && nearbySites.length > 0 && !isOpen && (
        <div className="mt-2 glass rounded-xl shadow-lg border border-ocean-200 overflow-hidden max-h-80 overflow-y-auto">
          <div className="px-4 py-2.5 border-b border-ocean-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-ocean-600 uppercase tracking-wider flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5" />
              {t('map.search.nearbySites', { count: nearbySites.length })}
            </span>
            <button
              onClick={() => setShowNearbySites(false)}
              className="text-abyss-400 hover:text-abyss-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {nearbySites.map((site) => (
            <button
              key={site.id}
              onClick={() => handleNearbySiteSelect(site)}
              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-ocean-50 transition-colors text-left border-b border-ocean-100 last:border-b-0 group"
            >
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${site.isVerified ? 'bg-cyan-500' : 'bg-yellow-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-abyss-700 font-medium truncate">{site.name}</p>
                <p className="text-xs text-abyss-400 flex items-center gap-2">
                  <span>{formatDistance(site.distanceKm)}</span>
                  {site.country && (
                    <>
                      <span className="text-abyss-200">·</span>
                      <span>{site.country}</span>
                    </>
                  )}
                  {site.maxDepthM != null && (
                    <>
                      <span className="text-abyss-200">·</span>
                      <span>{site.maxDepthM}m</span>
                    </>
                  )}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-abyss-300 group-hover:text-ocean-500 transition-colors shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
