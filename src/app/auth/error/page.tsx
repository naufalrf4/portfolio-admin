import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface AuthErrorPageProps {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const nextParams = new URLSearchParams();

  if (params.error) {
    nextParams.set('error', params.error);
  }

  if (params.callbackUrl) {
    nextParams.set('callbackUrl', params.callbackUrl);
  }

  const query = nextParams.toString();
  redirect(query ? `/auth/signin?${query}` : '/auth/signin');
}
