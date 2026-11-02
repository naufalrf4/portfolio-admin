'use client';

import { Save, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BookingSettings } from '../types/bookings.types';
import { COMMON_TIMEZONES, REMINDER_DAYS, SURFACE_STYLES } from '../constants';

interface SettingsCardProps {
  settings: BookingSettings;
  onChange: (settings: BookingSettings) => void;
  onSave: () => void;
  saving: boolean;
}

export function SettingsCard({ settings, onChange, onSave, saving }: SettingsCardProps) {
  return (
    <div className="rounded-[var(--radius-container)] p-6 bg-[var(--bg-elevated)]" style={SURFACE_STYLES.card}>
      <div className="flex items-center gap-3 mb-6">
        <div
          className="p-3 rounded-2xl bg-[var(--bg-elevated)] text-[var(--teal)]"
          style={SURFACE_STYLES.iconContainer}
        >
          <SettingsIcon className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Booking Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="space-y-2">
          <Label htmlFor="notificationEmail">Notification Email</Label>
          <Input
            id="notificationEmail"
            type="email"
            placeholder="admin@example.com"
            value={settings.notificationEmail || ''}
            onChange={(e) => onChange({ ...settings, notificationEmail: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminderDay">Reminder Day</Label>
          <Select
            value={settings.reminderDay?.toString() || '6'}
            onValueChange={(value) => onChange({ ...settings, reminderDay: parseInt(value, 10) })}
          >
            <SelectTrigger id="reminderDay">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {REMINDER_DAYS.map((day) => (
                <SelectItem key={day.value} value={day.value.toString()}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reminderTime">Reminder Time</Label>
          <Input
            id="reminderTime"
            type="time"
            value={settings.reminderTime || '09:00'}
            onChange={(e) => onChange({ ...settings, reminderTime: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            value={settings.timezone}
            onValueChange={(value) => onChange({ ...settings, timezone: value })}
          >
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" onClick={onSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
