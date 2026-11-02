'use client';

import { useEffect, useState, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Loader2 } from 'lucide-react';
import type { AnonymousMessage } from '../types/messages.types';

interface LocationStat {
  countryCode: string;
  country: string;
  city?: string;
  count: number;
  lat: number;
  lng: number;
}

interface LocationMapProps {
  messages: AnonymousMessage[];
  onCountrySelect?: (countryCode: string | null) => void;
  selectedCountry?: string | null;
  height?: string;
}

const countryCoordinates: Record<string, { lat: number; lng: number }> = {
  US: { lat: 37.0902, lng: -95.7129 },
  GB: { lat: 55.3781, lng: -3.436 },
  ID: { lat: -0.7893, lng: 113.9213 },
  AU: { lat: -25.2744, lng: 133.7751 },
  CA: { lat: 56.1304, lng: -106.3468 },
  DE: { lat: 51.1657, lng: 10.4515 },
  FR: { lat: 46.2276, lng: 2.2137 },
  JP: { lat: 36.2048, lng: 138.2529 },
  KR: { lat: 35.9078, lng: 127.7669 },
  CN: { lat: 35.8617, lng: 104.1954 },
  BR: { lat: -14.235, lng: -51.9253 },
  IN: { lat: 20.5937, lng: 78.9629 },
  MY: { lat: 4.2105, lng: 101.9758 },
  SG: { lat: 1.3521, lng: 103.8198 },
  NL: { lat: 52.1326, lng: 5.2913 },
  ES: { lat: 40.4637, lng: -3.7492 },
  IT: { lat: 41.8719, lng: 12.5674 },
  RU: { lat: 61.524, lng: 105.3188 },
  MX: { lat: 23.6345, lng: -102.5528 },
  ZA: { lat: -30.5595, lng: 22.9375 },
  PH: { lat: 12.8797, lng: 121.774 },
  VN: { lat: 14.0583, lng: 108.2772 },
  TH: { lat: 15.87, lng: 100.9925 },
  NZ: { lat: -40.9006, lng: 174.886 },
};

const flagMap: Record<string, string> = {
  US: '🇺🇸',
  GB: '🇬🇧',
  ID: '🇮🇩',
  AU: '🇦🇺',
  CA: '🇨🇦',
  DE: '🇩🇪',
  FR: '🇫🇷',
  JP: '🇯🇵',
  KR: '🇰🇷',
  CN: '🇨🇳',
  BR: '🇧🇷',
  IN: '🇮🇳',
  MY: '🇲🇾',
  SG: '🇸🇬',
  NL: '🇳🇱',
  ES: '🇪🇸',
  IT: '🇮🇹',
  RU: '🇷🇺',
  MX: '🇲🇽',
  ZA: '🇿🇦',
  PH: '🇵🇭',
  VN: '🇻🇳',
  TH: '🇹🇭',
  NZ: '🇳🇿',
};

export function LocationMap({
  messages,
  onCountrySelect,
  selectedCountry,
  height = '400px',
}: LocationMapProps) {
  const [loading, setLoading] = useState(true);
  const [locationStats, setLocationStats] = useState<LocationStat[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationStat | null>(null);
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
  });

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    const statsMap: Record<string, LocationStat> = {};

    messages.forEach((msg) => {
      if (msg.countryCode && msg.country) {
        const coords = countryCoordinates[msg.countryCode];
        if (coords) {
          const existing = statsMap[msg.countryCode];
          if (existing) {
            existing.count++;
          } else {
            statsMap[msg.countryCode] = {
              countryCode: msg.countryCode,
              country: msg.country,
              city: msg.city ?? undefined,
              count: 1,
              lat: coords.lat,
              lng: coords.lng,
            };
          }
        }
      }
    });

    const sortedStats = Object.values(statsMap).sort((a, b) => b.count - a.count);
    setLocationStats(sortedStats);
    setLoading(false);
  }, [messages]);

  const getFlagEmoji = (countryCode: string) => {
    return flagMap[countryCode] || '🌍';
  };

  const getMarkerSize = useCallback(
    (count: number) => {
      const maxCount = Math.max(...locationStats.map((s) => s.count), 1);
      const normalized = count / maxCount;
      const minSize = 24;
      const maxSize = 48;
      return minSize + normalized * (maxSize - minSize);
    },
    [locationStats]
  );

  const handleMarkerClick = (stat: LocationStat) => {
    setSelectedLocation(stat);
    onCountrySelect?.(stat.countryCode === selectedCountry ? null : stat.countryCode);

    setViewState({
      longitude: stat.lng,
      latitude: stat.lat,
      zoom: 4,
    });
  };

  const handleClearFilter = () => {
    onCountrySelect?.(null);
    setSelectedLocation(null);

    setViewState({
      longitude: 0,
      latitude: 20,
      zoom: 1.5,
    });
  };

  if (!mapboxToken) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Message Locations
          </h3>
          {selectedCountry && (
            <button onClick={handleClearFilter} className="text-sm text-[var(--teal)] hover:underline">
              Clear Filter
            </button>
          )}
        </div>
        <div
          className="surface-sunken rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center"
          style={{ height }}
        >
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <MapPin className="h-12 w-12 text-[var(--text-secondary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                Mapbox Access Token Required
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your environment variables
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Message Locations
        </h3>
        {selectedCountry && (
          <button onClick={handleClearFilter} className="text-sm text-[var(--teal)] hover:underline">
            Clear Filter
          </button>
        )}
      </div>

      {loading ? (
        <div
          className="surface-sunken rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center"
          style={{ height }}
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--teal)]" />
            <span className="text-sm text-[var(--text-secondary)]">Loading map...</span>
          </div>
        </div>
      ) : (
        <div
          className="relative surface-sunken rounded-2xl overflow-hidden bg-[var(--bg-elevated)]"
          style={{ height }}
        >
          <Map
            {...viewState}
            onMove={(evt: { viewState: typeof viewState }) => setViewState(evt.viewState)}
            mapboxAccessToken={mapboxToken}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            style={{ width: '100%', height: '100%' }}
          >
            <NavigationControl position="top-right" />

            {locationStats.map((stat) => (
              <Marker
                key={stat.countryCode}
                longitude={stat.lng}
                latitude={stat.lat}
                anchor="center"
                onClick={(e: { originalEvent: MouseEvent }) => {
                  e.originalEvent.stopPropagation();
                  handleMarkerClick(stat);
                }}
              >
                <div
                  className="cursor-pointer transform transition-transform hover:scale-110 rounded-full bg-[var(--teal)] flex items-center justify-center text-on-accent text-xs font-bold shadow-lg border-2 border-bg"
                  style={{
                    width: `${getMarkerSize(stat.count)}px`,
                    height: `${getMarkerSize(stat.count)}px`,
                  }}
                >
                  <span className="text-sm">{getFlagEmoji(stat.countryCode)}</span>
                </div>
              </Marker>
            ))}

            {selectedLocation && (
              <Popup
                longitude={selectedLocation.lng}
                latitude={selectedLocation.lat}
                anchor="bottom"
                onClose={() => setSelectedLocation(null)}
                closeOnClick={false}
              >
                <div className="p-2">
                  <p className="font-semibold text-[var(--text-primary)]">
                    {getFlagEmoji(selectedLocation.countryCode)} {selectedLocation.country}
                  </p>
                  {selectedLocation.city && (
                    <p className="text-xs text-[var(--text-secondary)]">{selectedLocation.city}</p>
                  )}
                  <p className="text-sm text-[var(--teal)] font-medium mt-1">
                    {selectedLocation.count} message{selectedLocation.count !== 1 ? 's' : ''}
                  </p>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      )}

      {locationStats.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[var(--text-primary)]">Top Locations</h4>
          <div className="space-y-2">
            {locationStats.slice(0, 5).map((stat) => (
              <button
                key={stat.countryCode}
                onClick={() => handleMarkerClick(stat)}
                className={`w-full surface-raised rounded-xl p-3 flex items-center gap-3 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-surface-raised ${
                  selectedCountry === stat.countryCode ? 'ring-2 ring-[var(--teal)]' : ''
                }`}
              >
                <span className="text-xl">{getFlagEmoji(stat.countryCode)}</span>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-[var(--text-primary)]">{stat.country}</div>
                  {stat.city && <div className="text-xs text-[var(--text-secondary)]">{stat.city}</div>}
                </div>
                <div className="rounded-full bg-[var(--teal)] text-on-accent text-xs font-bold px-3 py-1">
                  {stat.count}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
