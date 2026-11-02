'use client';

import { useEffect, useState } from 'react';
import MapboxMap, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { InteractionLocationItem } from '../types/analytics.types';

interface LocationStat {
  countryCode: string;
  country: string;
  city?: string;
  count: number;
  lat: number;
  lng: number;
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
  MX: { lat: 23.6345, lng: -102.5528 },
  ZA: { lat: -30.5595, lng: 22.9375 },
  PH: { lat: 12.8797, lng: 121.774 },
  VN: { lat: 14.0583, lng: 108.2772 },
  TH: { lat: 15.87, lng: 100.9925 },
  NZ: { lat: -40.9006, lng: 174.886 },
};

export function InteractionLocationMap({
  items,
  loading,
}: {
  items: InteractionLocationItem[];
  loading: boolean;
}) {
  const [stats, setStats] = useState<LocationStat[]>([]);
  const [selected, setSelected] = useState<LocationStat | null>(null);
  const [viewState, setViewState] = useState({ longitude: 0, latitude: 20, zoom: 1.5 });
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    const statsMap = new globalThis.Map<string, LocationStat>();
    items.forEach((item) => {
      if (!item.countryCode || !item.country) return;
      const coords = countryCoordinates[item.countryCode];
      if (!coords) return;
      const existing = statsMap.get(item.countryCode);
      if (existing) {
        existing.count += 1;
        return;
      }
      statsMap.set(item.countryCode, {
        countryCode: item.countryCode,
        country: item.country,
        city: item.city || undefined,
        count: 1,
        lat: coords.lat,
        lng: coords.lng,
      });
    });
    setStats(Array.from(statsMap.values()).sort((a, b) => b.count - a.count));
  }, [items]);

  const topCount = Math.max(...stats.map((item) => item.count), 1);

  if (loading) {
    return (
      <Card className="p-6 space-y-4 bg-[var(--bg-elevated)]">
        <div className="h-6 w-48 rounded bg-line animate-pulse" />
        <div className="h-[420px] rounded-[28px] bg-line animate-pulse" />
      </Card>
    );
  }

  if (!mapboxToken) {
    return (
      <Card className="p-6 bg-[var(--bg-elevated)]">
        <div className="flex h-[420px] flex-col items-center justify-center gap-3 rounded-[28px] card-inset bg-[var(--bg-elevated)] p-8 text-center">
          <MapPin className="h-12 w-12 text-[var(--text-secondary)]" />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">Mapbox Access Token Required</p>
            <p className="text-xs text-[var(--text-secondary)]">
              Add `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` to view the interaction map.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-[var(--bg-elevated)] space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Interaction Map</h3>
          <p className="text-sm text-[var(--text-secondary)]">Submission origins grouped by country.</p>
        </div>
        <div className="rounded-full bg-[var(--bg-elevated)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] shadow-surface-raised">
          {items.length.toLocaleString()} submissions
        </div>
      </div>

      {stats.length === 0 ? (
        <div className="flex h-[420px] items-center justify-center rounded-[28px] card-inset bg-[var(--bg-elevated)] text-sm text-[var(--text-secondary)]">
          No submission location data yet.
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="relative overflow-hidden rounded-[28px] card-inset bg-[var(--bg-elevated)]">
            <div className="absolute right-4 top-4 z-10 rounded-full bg-[var(--bg-card)] border border-line-strong px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] shadow-sm">
              Country-level view
            </div>
            <MapboxMap
              {...viewState}
              onMove={(event: { viewState: typeof viewState }) => setViewState(event.viewState)}
              mapboxAccessToken={mapboxToken}
              mapStyle="mapbox://styles/mapbox/streets-v12"
              style={{ width: '100%', height: 420 }}
            >
              <NavigationControl position="top-right" />
              {stats.map((item) => {
                const size = 26 + (item.count / topCount) * 22;
                return (
                  <Marker
                    key={item.countryCode}
                    longitude={item.lng}
                    latitude={item.lat}
                    anchor="center"
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className={cn(
                        'rounded-full border-2 border-[var(--bg-card)] bg-accent text-accent-foreground shadow-lg transition-transform hover:scale-110',
                        'flex items-center justify-center font-bold'
                      )}
                      style={{ width: size, height: size }}
                    >
                      {item.count}
                    </button>
                  </Marker>
                );
              })}
              {selected && (
                <Popup
                  longitude={selected.lng}
                  latitude={selected.lat}
                  anchor="bottom"
                  onClose={() => setSelected(null)}
                  closeOnClick={false}
                >
                  <div className="p-1.5">
                    <p className="font-semibold text-[var(--text-primary)]">{selected.country}</p>
                    {selected.city && <p className="text-xs text-[var(--text-secondary)]">{selected.city}</p>}
                    <p className="mt-1 text-sm font-medium text-[var(--teal)]">
                      {selected.count} submissions
                    </p>
                  </div>
                </Popup>
              )}
            </MapboxMap>
          </div>

          <div className="space-y-3">
            {stats.slice(0, 6).map((item) => (
              <button
                key={item.countryCode}
                type="button"
                onClick={() => {
                  setSelected(item);
                  setViewState({ longitude: item.lng, latitude: item.lat, zoom: 4 });
                }}
                className="w-full rounded-2xl bg-[var(--bg-elevated)] p-4 text-left shadow-surface-raised transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{item.country}</p>
                    {item.city && <p className="text-xs text-[var(--text-secondary)]">{item.city}</p>}
                  </div>
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                    {item.count}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
