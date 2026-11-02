import { NextRequest, NextResponse } from 'next/server';
import { safeAuth } from '@/lib/auth';
import { forbiddenResponse, unauthorizedResponse } from '@/lib/api/responses';
import {
  normalizeGoogleCalendarReturnTo,
  verifyGoogleCalendarOAuthState,
} from '@/lib/google-calendar-oauth-state';
import { bookingSettingsService } from '@/lib/api/handlers/booking-settings.service';
import { googleCalendarService } from '@/lib/services/googleCalendarService';

export async function GET(request: NextRequest) {
  const session = await safeAuth();

  if (!session?.user) {
    return unauthorizedResponse();
  }

  if (session.user.role !== 'ADMIN') {
    return forbiddenResponse('Admin access required');
  }

  const stateToken = request.nextUrl.searchParams.get('state');
  const error = request.nextUrl.searchParams.get('error');
  const code = request.nextUrl.searchParams.get('code');
  const state = stateToken ? verifyGoogleCalendarOAuthState(stateToken) : null;
  const returnTo = normalizeGoogleCalendarReturnTo(state?.returnTo);
  const redirectUrl = new URL(returnTo, request.nextUrl.origin);

  if (!stateToken || !state) {
    redirectUrl.searchParams.set('googleCalendar', 'error');
    redirectUrl.searchParams.set('reason', 'invalid-state');
    return NextResponse.redirect(redirectUrl);
  }

  const sessionUserId = typeof session.user.id === 'string' ? session.user.id : session.user.email;
  if (!sessionUserId || sessionUserId !== state.sub) {
    redirectUrl.searchParams.set('googleCalendar', 'error');
    redirectUrl.searchParams.set('reason', 'session-mismatch');
    return NextResponse.redirect(redirectUrl);
  }

  if (error) {
    redirectUrl.searchParams.set('googleCalendar', 'error');
    redirectUrl.searchParams.set('reason', error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    redirectUrl.searchParams.set('googleCalendar', 'error');
    redirectUrl.searchParams.set('reason', 'missing-code');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const connection = await googleCalendarService.exchangeCode(code);
    await bookingSettingsService.updateInternal({
      googleCalendarRefreshToken: connection.encryptedRefreshToken,
      googleCalendarCalendarId: connection.defaultCalendarId,
      googleCalendarCalendarName: connection.defaultCalendarName,
      googleCalendarConnectedEmail: connection.connectedEmail,
      googleCalendarGrantedScopes: connection.grantedScopes,
      googleCalendarConnectedAt: new Date().toISOString(),
    });

    redirectUrl.searchParams.set('googleCalendar', 'connected');
    return NextResponse.redirect(redirectUrl);
  } catch (callbackError) {
    const reason = callbackError instanceof Error ? callbackError.message : 'oauth-callback-failed';
    redirectUrl.searchParams.set('googleCalendar', 'error');
    redirectUrl.searchParams.set('reason', reason);
    return NextResponse.redirect(redirectUrl);
  }
}
