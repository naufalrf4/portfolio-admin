import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createGuestbookToken } from '@/lib/guestbook-token';

function buildSignInUrl(request: NextRequest, returnTo: string) {
  const signInUrl = new URL('/auth/signin', request.url);
  signInUrl.searchParams.set(
    'callbackUrl',
    `/api/v1/public/auth/complete?returnTo=${encodeURIComponent(returnTo)}`
  );
  return signInUrl;
}

export async function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get('returnTo');

  if (!returnTo) {
    return NextResponse.redirect(new URL('/auth/signin?error=missing_return_to', request.url));
  }

  const session = await auth();

  if (!session?.user?.email || !session.user.id) {
    return NextResponse.redirect(buildSignInUrl(request, returnTo));
  }

  try {
    const { token } = await createGuestbookToken({
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    });
    const redirectUrl = new URL(returnTo);
    redirectUrl.searchParams.set('guestbook_sync', '1');
    redirectUrl.searchParams.set('guestbook_email', session.user.email);
    redirectUrl.searchParams.set('guestbook_token', token);

    if (session.user.name) {
      redirectUrl.searchParams.set('guestbook_name', session.user.name);
    }

    if (session.user.image) {
      redirectUrl.searchParams.set('guestbook_image', session.user.image);
    }

    return NextResponse.redirect(redirectUrl);
  } catch {
    return NextResponse.redirect(new URL('/auth/signin?error=invalid_return_to', request.url));
  }
}
