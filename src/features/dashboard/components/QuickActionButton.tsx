'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { BUTTON_SHADOW, BUTTON_PRESSED } from '../constants';

interface QuickActionButtonProps {
  icon: ReactNode;
  label: string;
  href: string;
  delay?: number;
}

export function QuickActionButton({ icon, label, href, delay = 0 }: QuickActionButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium text-sm transition-all duration-300 ease-out hover:-translate-y-0.5 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        boxShadow: isPressed ? BUTTON_PRESSED : BUTTON_SHADOW,
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      <span className="text-[var(--text-secondary)] group-hover:text-blue-500 transition-colors duration-300">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}
