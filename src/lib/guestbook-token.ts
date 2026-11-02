import { createHmac, timingSafeEqual } from 'node:crypto';

const GUESTBOOK_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;  // 7 days

interface GuestbookTokenPayload {
  sub: string;
  email: string;
  name: string | null;
  image: string | null;
  exp: number;
}

function getGuestbookSigningSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET?.trim();

  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is required to sign guestbook tokens.');
  }

  return secret;
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function sign(input: string): Buffer {
  return createHmac('sha256', getGuestbookSigningSecret()).update(input).digest();
}

export async function createGuestbookToken(input: {
  userId: string;
  email: string;
  name: string | null;
  image: string | null;
}): Promise<{ token: string; expiresAt: number }> {
  const expiresAt = Math.floor(Date.now() / 1000) + GUESTBOOK_TOKEN_TTL_SECONDS;
  const payload: GuestbookTokenPayload = {
    sub: input.userId,
    email: input.email,
    name: input.name,
    image: input.image,
    exp: expiresAt,
  };

  const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(`${header}.${body}`).toString('base64url');

  return {
    token: `${header}.${body}.${signature}`,
    expiresAt,
  };
}

export async function verifyGuestbookToken(token: string): Promise<GuestbookTokenPayload | null> {
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
    ) as GuestbookTokenPayload;
    if (
      typeof payload.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.exp !== 'number'
    ) {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: typeof payload.name === 'string' ? payload.name : null,
      image: typeof payload.image === 'string' ? payload.image : null,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
