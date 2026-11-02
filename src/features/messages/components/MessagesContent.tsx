'use client';

import { useState } from 'react';
import { List, MapPin } from 'lucide-react';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { MessageList } from './MessageList';
import { LocationMap } from './LocationMap';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AnonymousMessage, FilterTab } from '../types/messages.types';

interface MessagesContentProps {
  loading: boolean;
  messages: AnonymousMessage[];
  activeTab: FilterTab;
  onSelect: (message: AnonymousMessage) => void;
  onToggleRead: (id: string, read: boolean) => void;
  onDelete: (id: string) => void;
}

type ViewMode = 'list' | 'map';

export function MessagesContent({
  loading,
  messages,
  activeTab,
  onSelect,
  onToggleRead,
  onDelete,
}: MessagesContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const filteredMessages = selectedCountry
    ? messages.filter((msg) => msg.countryCode === selectedCountry)
    : messages;

  const countries = Array.from(
    new Set(messages.filter((m) => m.countryCode).map((m) => m.countryCode!))
  )
    .map((code) => ({
      code,
      name: messages.find((m) => m.countryCode === code)?.country || code,
      count: messages.filter((m) => m.countryCode === code).length,
    }))
    .sort((a, b) => b.count - a.count);

  if (loading) {
    return <LoadingState />;
  }

  if (messages.length === 0) {
    return <EmptyState activeTab={activeTab} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            onClick={() => setViewMode('list')}
            className="h-10 px-4"
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'map' ? 'primary' : 'outline'}
            onClick={() => setViewMode('map')}
            className="h-10 px-4"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Map
          </Button>
        </div>

        {countries.length > 0 && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-sm text-[var(--text-secondary)] whitespace-nowrap">Filter by country:</span>
            <Select
              value={selectedCountry || 'all'}
              onValueChange={(value) => setSelectedCountry(value === 'all' ? null : value)}
            >
              <SelectTrigger className="w-full sm:w-[200px]" size="sm">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <span className="flex items-center gap-2">
                      {country.code === 'US'
                        ? '🇺🇸'
                        : country.code === 'GB'
                          ? '🇬🇧'
                          : country.code === 'ID'
                            ? '🇮🇩'
                            : country.code === 'AU'
                              ? '🇦🇺'
                              : country.code === 'CA'
                                ? '🇨🇦'
                                : country.code === 'DE'
                                  ? '🇩🇪'
                                  : country.code === 'FR'
                                    ? '🇫🇷'
                                    : country.code === 'JP'
                                      ? '🇯🇵'
                                      : country.code === 'KR'
                                        ? '🇰🇷'
                                        : country.code === 'CN'
                                          ? '🇨🇳'
                                          : country.code === 'BR'
                                            ? '🇧🇷'
                                            : country.code === 'IN'
                                              ? '🇮🇳'
                                              : country.code === 'MY'
                                                ? '🇲🇾'
                                                : country.code === 'SG'
                                                  ? '🇸🇬'
                                                  : country.code === 'NL'
                                                    ? '🇳🇱'
                                                    : country.code === 'ES'
                                                      ? '🇪🇸'
                                                      : country.code === 'IT'
                                                        ? '🇮🇹'
                                                        : country.code === 'RU'
                                                          ? '🇷🇺'
                                                          : country.code === 'MX'
                                                            ? '🇲🇽'
                                                            : country.code === 'ZA'
                                                              ? '🇿🇦'
                                                              : country.code === 'PH'
                                                                ? '🇵🇭'
                                                                : country.code === 'VN'
                                                                  ? '🇻🇳'
                                                                  : country.code === 'TH'
                                                                    ? '🇹🇭'
                                                                    : country.code === 'NZ'
                                                                      ? '🇳🇿'
                                                                      : '🌍'}
                      <span>{country.name}</span>
                      <span className="text-xs text-[var(--text-secondary)] ml-1">({country.count})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {viewMode === 'map' ? (
        <LocationMap
          messages={filteredMessages}
          onCountrySelect={setSelectedCountry}
          selectedCountry={selectedCountry}
        />
      ) : (
        <MessageList
          messages={filteredMessages}
          onSelect={onSelect}
          onToggleRead={onToggleRead}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
