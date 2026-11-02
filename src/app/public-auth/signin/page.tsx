import { redirect } from 'next/navigation';
import { safeAuth, isDemoAuthEnabled } from '@/lib/auth';
import { SignInForm } from '@/app/auth/signin/sign-in-form';

export const dynamic = 'force-dynamic';

interface PublicGuestbookSignInPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

function normalizePublicCallbackUrl(callbackUrl: string | undefined): string {
  return callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/';
}

export default async function PublicGuestbookSignInPage({
  searchParams,
}: PublicGuestbookSignInPageProps) {
  const session = await safeAuth();
  const params = await searchParams;
  const callbackUrl = normalizePublicCallbackUrl(params.callbackUrl);

  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="panel-card p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="font-[family-name:var(--font-plus-jakarta)] text-3xl font-bold text-foreground">
              Guestbook Sign In
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in with Google to continue to the guestbook.
            </p>
          </div>

          <SignInForm callbackUrl={callbackUrl} mode="public" demoAuthEnabled={isDemoAuthEnabled()} />
        </div>
      </div>
    </div>
  );
}
