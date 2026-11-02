import { redirect } from 'next/navigation';
import { auth, isDemoAuthEnabled } from '@/lib/auth';
import { SignInForm } from './sign-in-form';

export const dynamic = 'force-dynamic';

interface SignInPageProps {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}

function normalizeAdminCallbackUrl(callbackUrl: string | undefined): string {
  return callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/dashboard';
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = normalizeAdminCallbackUrl(params.callbackUrl);

  if (session?.user) {
    if (session.user.role === 'ADMIN') {
      redirect(callbackUrl);
    }

    redirect('/unauthorized');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="panel-card p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="font-[family-name:var(--font-plus-jakarta)] text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in with your admin account to continue
            </p>
          </div>

          {params.error && (
            <div className="surface-sunken bg-destructive/10 text-destructive rounded-xl p-4 text-sm text-center">
              {params.error === 'access_denied' && 'Access denied. Admin privileges required.'}
              {params.error === 'unauthorized' && 'You do not have admin privileges.'}
              {params.error === 'OAuthAccountNotLinked' &&
                'Email already used with different provider.'}
              {params.error === 'CredentialsSignin' && 'Demo sign-in failed. Check email and password.'}
              {!['access_denied', 'unauthorized', 'OAuthAccountNotLinked', 'CredentialsSignin'].includes(params.error) &&
                'Authentication error occurred.'}
            </div>
          )}

          <SignInForm callbackUrl={callbackUrl} mode="admin" demoAuthEnabled={isDemoAuthEnabled()} />
        </div>
      </div>
    </div>
  );
}
