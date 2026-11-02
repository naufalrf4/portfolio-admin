'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { SUNKEN_SHADOW } from '../constants';
import { getJakartaHour } from '@/lib/utils/date';

export interface WelcomeCardProps {
  delay?: number;
  userName?: string | null;
}

export function WelcomeCard({ delay = 0, userName }: WelcomeCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const currentHour = getJakartaHour();
  const greeting =
    currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  const firstName = userName?.split(' ')[0] || 'Admin';

  return (
    <Card
      className={`p-8 relative overflow-hidden transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
        <Sparkles className="w-full h-full text-blue-500" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center tile-tint-blue"
            style={{ boxShadow: SUNKEN_SHADOW }}
          >
            <Sparkles className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] font-[family-name:var(--font-plus-jakarta)]">
            {greeting}, {firstName}!
          </h2>
        </div>
        <p className="text-[var(--text-secondary)] max-w-xl">
          Welcome back to your admin dashboard. Here&apos;s an overview of your portfolio activity
          and recent interactions.
        </p>
      </div>
    </Card>
  );
}
