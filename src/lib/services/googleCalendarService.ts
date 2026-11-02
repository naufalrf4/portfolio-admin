import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { google } from 'googleapis';
import type { BookingSettings } from '@/features/bookings/types/bookings.types';
import { instantToJakartaWallClock, jakartaWallClockToInstant } from '@/lib/utils/date';

const DEFAULT_TIMEZONE = 'Asia/Jakarta';
const GOOGLE_CALENDAR_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar',
] as const;

type BookingCalendarEventInput = {
  booking: {
    id: string;
    name: string;
    email: string;
    notes?: string | null;
    metadata?: unknown;
  };
  slot: {
    date: string;
    time: string;
    duration: number;
  };
  message?: string;
  settings: BookingSettings;
};

export type BookingCalendarEventResult = {
  eventId: string;
  calendarUrl: string | null;
  meetUrl: string | null;
};

export type GoogleCalendarOption = {
  id: string;
  summary: string;
  primary: boolean;
  accessRole: string | null;
};

export type GoogleCalendarConnectionResult = {
  encryptedRefreshToken: string;
  connectedEmail: string | null;
  grantedScopes: string[];
  calendars: GoogleCalendarOption[];
  defaultCalendarId: string | null;
  defaultCalendarName: string | null;
};

export class GoogleCalendarAuthError extends Error {
  constructor(message = 'Google Calendar authorization has been revoked or expired.') {
    super(message);
    this.name = 'GoogleCalendarAuthError';
  }
}

function isGoogleAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const response = (error as { response?: { status?: number; data?: { error?: string } } })
    .response;
  const code = (error as { code?: number | string }).code;

  if (response?.status === 401 || response?.status === 403) {
    return true;
  }

  if (code === 401 || code === 403 || code === '401' || code === '403') {
    return true;
  }

  return response?.data?.error === 'invalid_grant';
}

function getOAuthSecret() {
  const secret = process.env.NEXTAUTH_SECRET?.trim();

  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is required for Google Calendar encryption.');
  }

  return createHash('sha256').update(secret).digest();
}

function encryptRefreshToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', getOAuthSecret(), iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${authTag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

function decryptRefreshToken(payload: string | null | undefined) {
  if (!payload) {
    return null;
  }

  const [ivPart, tagPart, encryptedPart] = payload.split('.');
  if (!ivPart || !tagPart || !encryptedPart) {
    return null;
  }

  try {
    const decipher = createDecipheriv(
      'aes-256-gcm',
      getOAuthSecret(),
      Buffer.from(ivPart, 'base64url')
    );
    decipher.setAuthTag(Buffer.from(tagPart, 'base64url'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedPart, 'base64url')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  } catch {
    return null;
  }
}

function readEventTimezone(settings: BookingSettings) {
  const configured = settings.timezone?.trim();
  return configured ? configured : DEFAULT_TIMEZONE;
}

function getGoogleClientCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return null;
  }

  return { clientId, clientSecret };
}

function getPublicOrigin() {
  const publicUrl = process.env.NEXTAUTH_URL?.trim();

  if (!publicUrl) {
    throw new Error('NEXTAUTH_URL is required to build the Google OAuth redirect URI.');
  }

  return new URL(publicUrl).origin;
}

function buildCallbackUrl() {
  return new URL(
    '/api/v1/admin/booking-settings/google/callback',
    getPublicOrigin()
  ).toString();
}

function createOAuthClient() {
  const credentials = getGoogleClientCredentials();
  if (!credentials) {
    return null;
  }

  return new google.auth.OAuth2(credentials.clientId, credentials.clientSecret, buildCallbackUrl());
}

async function listCalendarsWithAuth(auth: InstanceType<typeof google.auth.OAuth2>) {
  let response;
  try {
    response = await google.calendar({ version: 'v3', auth }).calendarList.list({
      minAccessRole: 'writer',
      showDeleted: false,
      showHidden: false,
    });
  } catch (error) {
    if (isGoogleAuthError(error)) {
      throw new GoogleCalendarAuthError();
    }
    throw error;
  }

  const items = response.data.items ?? [];

  return items
    .filter((item) => Boolean(item.id) && Boolean(item.summary))
    .map((item) => ({
      id: item.id!,
      summary: item.summary!,
      primary: Boolean(item.primary),
      accessRole: item.accessRole ?? null,
    }))
    .sort((left, right) => Number(right.primary) - Number(left.primary));
}

function getConfiguredCalendarId(settings: BookingSettings) {
  const configured = settings.googleCalendarCalendarId?.trim();
  return configured ? configured : null;
}

function getConfiguredRefreshToken(settings: BookingSettings) {
  return decryptRefreshToken(settings.googleCalendarRefreshToken ?? null);
}

export const googleCalendarService = {
  scopes: GOOGLE_CALENDAR_SCOPES,

  hasClientCredentials() {
    return getGoogleClientCredentials() !== null;
  },

  isConnected(settings: BookingSettings) {
    return Boolean(getConfiguredRefreshToken(settings));
  },

  buildAuthorizationUrl(state: string) {
    const client = createOAuthClient();
    if (!client) {
      throw new Error('Google OAuth credentials are not configured.');
    }

    return client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: true,
      response_type: 'code',
      scope: [...GOOGLE_CALENDAR_SCOPES],
      state,
    });
  },

  async exchangeCode(code: string): Promise<GoogleCalendarConnectionResult> {
    const client = createOAuthClient();
    if (!client) {
      throw new Error('Google OAuth credentials are not configured.');
    }

    const { tokens } = await client.getToken(code);
    const refreshToken = tokens.refresh_token?.trim();

    if (!refreshToken) {
      throw new Error(
        'Google did not return a refresh token. Try reconnecting again and approve consent.'
      );
    }

    client.setCredentials({ refresh_token: refreshToken });

    const calendars = await listCalendarsWithAuth(client);
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const profile = await oauth2.userinfo.get();
    const defaultCalendar = calendars.find((item) => item.primary) ?? calendars[0] ?? null;

    return {
      encryptedRefreshToken: encryptRefreshToken(refreshToken),
      connectedEmail: profile.data.email ?? null,
      grantedScopes: tokens.scope?.split(' ').filter(Boolean) ?? [],
      calendars,
      defaultCalendarId: defaultCalendar?.id ?? null,
      defaultCalendarName: defaultCalendar?.summary ?? null,
    };
  },

  async listCalendars(settings: BookingSettings) {
    const client = createOAuthClient();
    const refreshToken = getConfiguredRefreshToken(settings);

    if (!client || !refreshToken) {
      return [] as GoogleCalendarOption[];
    }

    client.setCredentials({ refresh_token: refreshToken });
    return listCalendarsWithAuth(client);
  },

  async createBookingEvent({ booking, slot, message, settings }: BookingCalendarEventInput) {
    const client = createOAuthClient();
    const refreshToken = getConfiguredRefreshToken(settings);
    const calendarId = getConfiguredCalendarId(settings);

    if (!client || !refreshToken || !calendarId) {
      return null;
    }

    client.setCredentials({ refresh_token: refreshToken });

    const calendar = google.calendar({ version: 'v3', auth: client });
    const timezone = readEventTimezone(settings);
    const start = jakartaWallClockToInstant(slot.date, slot.time);
    const end = new Date(start.getTime() + slot.duration * 60 * 1000);

    let response;
    try {
      response = await calendar.events.insert({
        calendarId,
        conferenceDataVersion: 1,
        sendUpdates: 'all',
        requestBody: {
          summary: `Call with ${booking.name}`,
          description: [
            'Booking approved via NaufalRF Portfolio Admin.',
            `Booking reference: ${booking.id}`,
            booking.notes ? `Original notes: ${booking.notes}` : null,
            message ? `Approval note: ${message}` : null,
          ]
            .filter(Boolean)
            .join('\n\n'),
          start: {
            dateTime: instantToJakartaWallClock(start),
            timeZone: timezone,
          },
          end: {
            dateTime: instantToJakartaWallClock(end),
            timeZone: timezone,
          },
          attendees: [{ email: booking.email, displayName: booking.name }],
          conferenceData: {
            createRequest: {
              requestId: `booking-${booking.id}`,
              conferenceSolutionKey: {
                type: 'hangoutsMeet',
              },
            },
          },
        },
      });
    } catch (error) {
      if (isGoogleAuthError(error)) {
        throw new GoogleCalendarAuthError();
      }
      throw error;
    }

    return {
      eventId: response.data.id || booking.id,
      calendarUrl: response.data.htmlLink || null,
      meetUrl: response.data.hangoutLink || null,
    } satisfies BookingCalendarEventResult;
  },

  async cancelBookingEvent(eventId: string, settings: BookingSettings) {
    const client = createOAuthClient();
    const refreshToken = getConfiguredRefreshToken(settings);
    const calendarId = getConfiguredCalendarId(settings);

    if (!client || !refreshToken || !calendarId) {
      return;
    }

    client.setCredentials({ refresh_token: refreshToken });

    try {
      await google.calendar({ version: 'v3', auth: client }).events.patch({
        calendarId,
        eventId,
        sendUpdates: 'all',
        requestBody: {
          status: 'cancelled',
        },
      });
    } catch (error) {
      if (isGoogleAuthError(error)) {
        throw new GoogleCalendarAuthError();
      }
      throw error;
    }
  },
};
