import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { safeAuth } from '@/lib/auth';
import { UnauthorizedPageContent } from '@/app/(dashboard)/unauthorized/UnauthorizedPageContent';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Access Denied',
  description: 'You do not have permission to access this application',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UnauthorizedPage() {
  const session = await safeAuth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return <UnauthorizedPageContent userEmail={session.user.email || 'Unknown'} />;
}
