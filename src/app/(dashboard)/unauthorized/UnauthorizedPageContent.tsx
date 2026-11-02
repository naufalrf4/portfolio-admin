'use client';

import { signOut } from 'next-auth/react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnauthorizedPageContentProps {
  userEmail: string;
}

export function UnauthorizedPageContent({ userEmail }: UnauthorizedPageContentProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-elevated)]">
      <div
        className={cn(
          'max-w-lg w-full p-8 rounded-3xl',
          'bg-[var(--bg-elevated)]',
          'shadow-surface-raised'
        )}
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div
            className={cn(
              'flex h-20 w-20 items-center justify-center rounded-full',
              'bg-[var(--bg-elevated)]',
              'shadow-surface-raised'
            )}
          >
            <Lock className="h-10 w-10 text-destructive" />
          </div>

          <div className="space-y-2">
            <h1 className="font-[family-name:var(--font-plus-jakarta)] text-3xl font-bold text-[var(--text-primary)]">
              Access Denied
            </h1>
            <p className="text-[var(--text-secondary)] text-base leading-relaxed">
              This account does not have access to NaufalRF Portfolio Admin.
              <br />
              Please contact the administrator.
            </p>
          </div>

          <div
            className={cn(
              'w-full p-4 rounded-2xl',
              'bg-[var(--bg-elevated)]',
              'shadow-surface-raised'
            )}
          >
            <p className="text-sm text-[var(--text-secondary)]">Account email:</p>
            <p className="text-base font-semibold text-[var(--text-primary)] mt-1 break-all">{userEmail}</p>
          </div>

          <button
            onClick={handleSignOut}
            type="button"
            className={cn(
              'w-full py-3 px-6 rounded-2xl',
              'bg-[var(--bg-elevated)] text-destructive font-semibold',
              'transition-all duration-300 ease-out',
              'shadow-surface-raised',
              'hover:shadow-surface-raised',
              'hover:scale-[1.02]',
              'active:shadow-surface-raised',
              'active:scale-[0.98]'
            )}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
