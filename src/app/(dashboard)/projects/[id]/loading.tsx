export function ProjectDetailLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="rounded-[var(--radius-container)] bg-[var(--bg-elevated)] p-8 shadow-surface-raised animate-pulse">
        <div className="h-8 bg-[var(--bg-elevated)] rounded-2xl w-64 mb-6 shadow-surface-raised" />

        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 bg-[var(--bg-elevated)] rounded-xl w-32 shadow-surface-raised" />
              <div className="h-12 bg-[var(--bg-elevated)] rounded-2xl w-full shadow-surface-raised" />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="h-12 w-32 bg-[var(--bg-elevated)] rounded-2xl shadow-surface-raised-sm"
            />
          ))}
        </div>
      </div>

      <div className="rounded-[var(--radius-container)] bg-[var(--bg-elevated)] p-8 shadow-surface-raised animate-pulse">
        <div className="h-7 bg-[var(--bg-elevated)] rounded-2xl w-48 mb-6 shadow-surface-raised" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-[var(--bg-elevated)] rounded-2xl shadow-surface-raised"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return <ProjectDetailLoading />;
}
