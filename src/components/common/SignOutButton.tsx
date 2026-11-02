'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

const surfaceStyles = {
  background: 'var(--bg-elevated)',
  foreground: 'var(--text-primary)',
  blue: 'var(--teal)',
  extruded: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
};

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full flex items-center justify-center gap-3 rounded-2xl px-6 py-4 text-base font-semibold transition-all duration-200 hover:scale-[0.98] active:scale-[0.96] touch-manipulation"
      style={{
        background: surfaceStyles.blue,
        color: 'var(--on-accent)',
        boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
      }}
    >
      <LogOut className="h-5 w-5" />
      <span>Sign Out</span>
    </button>
  );
}
