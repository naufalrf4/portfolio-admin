'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Link2, Mail, MessageSquare, RefreshCcw, Save, Unlink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContactSettings } from '../hooks/useContacts';
import { useBookingSettings } from '@/features/bookings/hooks';
import { TagInput } from './TagInput';
import type { ContactSettingsForm } from '../types/contacts.types';

const contactSettingsSchema = z.object({
  notificationEmail: z
    .string()
    .email('Please enter a valid email address')
    .nullable()
    .or(z.literal('')),
  blockedKeywords: z.array(z.string()),
});

export function SettingsTab() {
  const { settings, loading, saving, updateSettings } = useContactSettings();
  const {
    settings: bookingSettings,
    calendars,
    loading: bookingLoading,
    saving: bookingSaving,
    calendarsLoading,
    updateSettings: updateBookingSettings,
    refetchCalendars,
    disconnectGoogleCalendar,
  } = useBookingSettings();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const form = useForm<ContactSettingsForm>({
    resolver: zodResolver(contactSettingsSchema as never) as never,
    defaultValues: {
      notificationEmail: settings?.notificationEmail || '',
      blockedKeywords: settings?.blockedKeywords || [],
    },
    values: settings
      ? {
          notificationEmail: settings.notificationEmail || '',
          blockedKeywords: settings.blockedKeywords || [],
        }
      : undefined,
  });

  async function handleSaveSettings(formData: ContactSettingsForm) {
    await updateSettings({
      notificationEmail: formData.notificationEmail || null,
      blockedKeywords: formData.blockedKeywords,
    });
  }

  useEffect(() => {
    const status = searchParams.get('googleCalendar');
    if (!status) {
      return;
    }

    const reason = searchParams.get('reason');
    if (status === 'connected') {
      toast.success('Google Calendar connected successfully');
    } else if (status === 'error') {
      const reasonLabel =
        reason === 'missing-client-credentials'
          ? 'Google client credentials are missing.'
          : reason === 'invalid-state'
            ? 'Google connect session expired. Please try again.'
            : reason === 'session-mismatch'
              ? 'Google connect session does not match the current admin login.'
              : reason === 'access_denied'
                ? 'Google Calendar access was cancelled.'
                : 'Failed to connect Google Calendar.';
      toast.error(reasonLabel);
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('googleCalendar');
    nextParams.delete('reason');
    const nextUrl = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  async function handleCalendarChange(calendarId: string) {
    const selectedCalendar = calendars.find((calendar) => calendar.id === calendarId);
    await updateBookingSettings(
      {
        googleCalendarCalendarId: calendarId,
        googleCalendarCalendarName: selectedCalendar?.summary ?? null,
      },
      { silent: true }
    );
    toast.success('Default Google Calendar updated');
  }

  function handleConnectGoogleCalendar() {
    const returnTo = '/contacts?tab=settings';
    window.location.assign(
      `/api/v1/admin/booking-settings/google/connect?returnTo=${encodeURIComponent(returnTo)}`
    );
  }

  const blockedKeywords = form.watch('blockedKeywords');

  if (loading || bookingLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--text-secondary)]">Loading settings...</div>
      </div>
    );
  }

  if (!settings || !bookingSettings) {
    return <div className="text-center text-[var(--text-secondary)]">Failed to load settings</div>;
  }

  const isGoogleConnected = Boolean(bookingSettings.googleCalendarConnected);
  const isGoogleBusy = bookingSaving || calendarsLoading;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Form Settings</CardTitle>
          <CardDescription>Configure notification preferences and spam protection</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSaveSettings as never)} className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'var(--bg-elevated)',
                    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <Mail className="h-5 w-5 text-[var(--teal)]" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="notificationEmail">Notification Email</Label>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Email address to receive form submission notifications
                  </p>
                  <Input
                    id="notificationEmail"
                    type="email"
                    {...form.register('notificationEmail')}
                    placeholder="your@email.com"
                  />
                  {form.formState.errors.notificationEmail && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.notificationEmail.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'var(--bg-elevated)',
                    boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <MessageSquare className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="blockedKeywords">Blocked Keywords</Label>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Messages containing these keywords will be blocked (spam filter)
                  </p>
                  <TagInput
                    tags={blockedKeywords}
                    onTagsChange={(value: string[]) => form.setValue('blockedKeywords', value)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-line/20">
              <Button variant="primary" type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google Calendar & Meet</CardTitle>
          <CardDescription>
            Reconnect Google from inside Admin, choose the writable calendar, and use it for booking
            approvals with Google Meet links.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-line bg-bg-elevated p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                  <Calendar className="h-4 w-4 text-[var(--teal)]" />
                  <span className="font-medium">Connection status</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 font-medium ${
                      isGoogleConnected
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {isGoogleConnected ? 'Connected' : 'Not connected'}
                  </span>
                  {bookingSettings.googleCalendarConnectedEmail && (
                    <span className="text-[var(--text-secondary)]">
                      {bookingSettings.googleCalendarConnectedEmail}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                  {isGoogleConnected
                    ? 'Approved bookings will create Calendar events and Google Meet links on the selected calendar.'
                    : 'Connect a Google account to enable automatic Calendar events and Google Meet links.'}
                </p>
                {bookingSettings.googleCalendarConnectedAt && (
                  <p className="text-xs text-[var(--text-secondary)]">
                    Connected at{' '}
                    {new Date(bookingSettings.googleCalendarConnectedAt).toLocaleString('en-US', {
                      timeZone: 'Asia/Jakarta',
                    })}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  onClick={handleConnectGoogleCalendar}
                  disabled={isGoogleBusy}
                >
                  <Link2 className="h-4 w-4" />
                  {isGoogleConnected ? 'Reconnect Google' : 'Connect Google'}
                </Button>
                {isGoogleConnected && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => void refetchCalendars()}
                      disabled={isGoogleBusy}
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Refresh calendars
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => void disconnectGoogleCalendar()}
                      disabled={isGoogleBusy}
                    >
                      <Unlink className="h-4 w-4" />
                      Disconnect
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="googleCalendarCalendarId">Default writable calendar</Label>
            <Select
              value={bookingSettings.googleCalendarCalendarId ?? undefined}
              onValueChange={(value) => void handleCalendarChange(value)}
              disabled={
                !isGoogleConnected || calendarsLoading || bookingSaving || calendars.length === 0
              }
            >
              <SelectTrigger id="googleCalendarCalendarId">
                <SelectValue
                  placeholder={
                    !isGoogleConnected
                      ? 'Connect Google Calendar first'
                      : calendarsLoading
                        ? 'Loading calendars...'
                        : calendars.length === 0
                          ? 'No writable calendars found'
                          : 'Select a calendar'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {calendars.map((calendar) => (
                  <SelectItem key={calendar.id} value={calendar.id}>
                    {calendar.summary}
                    {calendar.primary ? ' (Primary)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-[var(--text-secondary)]">
              The selected calendar is used when an admin confirms a booking and generates a Meet
              link.
            </p>
            {bookingSettings.googleCalendarCalendarName && (
              <p className="text-xs text-[var(--text-secondary)]">
                Current selection: {bookingSettings.googleCalendarCalendarName}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
