import { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/api/middleware/auth';
import { bookingSettingsService } from '@/lib/api/handlers/booking-settings.service';
import { serverErrorResponse, successResponse } from '@/lib/api/responses';

async function handlePost(_request: NextRequest) {
  try {
    const settings = await bookingSettingsService.updateInternal({
      googleCalendarRefreshToken: null,
      googleCalendarCalendarId: null,
      googleCalendarCalendarName: null,
      googleCalendarConnectedEmail: null,
      googleCalendarGrantedScopes: [],
      googleCalendarConnectedAt: null,
    });

    return successResponse(
      {
        ...settings,
        googleCalendarRefreshToken: undefined,
        googleCalendarConnected: false,
      },
      'Google Calendar disconnected'
    );
  } catch {
    return serverErrorResponse();
  }
}

export const POST = withAdminAuth(handlePost);
