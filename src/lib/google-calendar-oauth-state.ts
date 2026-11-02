import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const GOOGLE_CALENDAR_STATE_TTL_SECONDS = 10 * 60;

type GoogleCalendarOAuthStatePayload = {
  sub: string;
  returnTo: string;
  nonce: string;
  exp: number;
};

function getStateSecret() {
  const secret = process.env.NEXTAUTH_SECRET?.trim();

  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is required to sign Google Calendar OAuth state.');
  }

  return secret;
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function sign(input: string) {
  return createHmac('sha256', getStateSecret()).update(input).digest();
}

export function createGoogleCalendarOAuthState(input: { userId: string; returnTo: string }) {
  const payload: GoogleCalendarOAuthStatePayload = {
    sub: input.userId,
    returnTo: input.returnTo,
    nonce: randomBytes(12).toString('base64url'),
    exp: Math.floor(Date.now() / 1000) + GOOGLE_CALENDAR_STATE_TTL_SECONDS,
  };

  const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(`${header}.${body}`).toString('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyGoogleCalendarOAuthState(token: string) {
  const parts = token.split('.');

  if (parts.length !== 3) {
    return null;
  }

  const [header, body, signature] = parts;
  if (!header || !body || !signature) {
    return null;
  }

  const expectedSignature = sign(`${header}.${body}`);
  const providedSignature = Buffer.from(signature, 'base64url');

  if (
    expectedSignature.length !== providedSignature.length ||
    !timingSafeEqual(expectedSignature, providedSignature)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, 'base64url').toString('utf8')
    ) as GoogleCalendarOAuthStatePayload;

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.returnTo !== 'string' ||
      typeof payload.exp !== 'number' ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function normalizeGoogleCalendarReturnTo(value: string | null | undefined) {
  if (!value || !value.startsWith('/')) {
    return '/contacts?tab=settings';
  }

  return value;
}
