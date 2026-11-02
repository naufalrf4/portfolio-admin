'use client';

import Link from 'next/link';
import { SearchX, LayoutDashboard, ArrowLeft } from 'lucide-react';

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-20 w-40 h-40 bg-accent-secondary/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative w-full max-w-xl">
        <div className="surface-raised shape-container p-8 md:p-12 space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-center">
            <div className="surface-sunken-deep shape-base p-6 w-24 h-24 flex items-center justify-center">
              <div className="surface-raised-sm rounded-xl p-3">
                <SearchX className="w-10 h-10 text-accent" strokeWidth={2} />
              </div>
            </div>
          </div>

          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-8xl md:text-9xl font-extrabold text-accent-solid leading-none tracking-tight">
                404
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                Page Not Found
              </h2>
            </div>

            <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
              The dashboard page you&apos;re looking for doesn&apos;t exist or has been moved to a
              different location.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl font-medium text-on-accent fill-accent surface-raised-sm hover:-translate-y-[1px] hover:surface-raised-hover active:translate-y-[0.5px] active:surface-sunken transition-all duration-200 w-full sm:w-auto"
            >
              <LayoutDashboard className="w-4 h-4" strokeWidth={2.5} />
              Go to Dashboard
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl font-medium text-foreground bg-background surface-raised-sm hover:-translate-y-[1px] hover:surface-raised-hover active:translate-y-[0.5px] active:surface-sunken transition-all duration-200 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
