import { NextRequest, NextResponse } from 'next/server';
import { safeAuth } from '@/lib/auth';
import { forbiddenResponse, unauthorizedResponse } from '@/lib/api/responses';
import {
  createGoogleCalendarOAuthState,
  normalizeGoogleCalendarReturnTo,
} from '@/lib/google-calendar-oauth-state';
import { googleCalendarService } from '@/lib/services/googleCalendarService';

export async function GET(request: NextRequest) {
  const session = await safeAuth();

  if (!session?.user) {
    return unauthorizedResponse();
  }

  if (session.user.role !== 'ADMIN') {
    return forbiddenResponse('Admin access required');
  }

  const returnTo = normalizeGoogleCalendarReturnTo(request.nextUrl.searchParams.get('returnTo'));
  const redirectUrl = new URL(returnTo, request.nextUrl.origin);

  if (!googleCalendarService.hasClientCredentials()) {
    redirectUrl.searchParams.set('googleCalendar', 'error');
    redirectUrl.searchParams.set('reason', 'missing-client-credentials');
    return NextResponse.redirect(redirectUrl);
  }

  const userId = typeof session.user.id === 'string' ? session.user.id : session.user.email;
  if (!userId) {
    return forbiddenResponse('Unable to determine admin identity');
  }

  const state = createGoogleCalendarOAuthState({ userId, returnTo });
  const authorizationUrl = googleCalendarService.buildAuthorizationUrl(state);
  return NextResponse.redirect(authorizationUrl);
}
