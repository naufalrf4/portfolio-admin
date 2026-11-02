export function ProjectEditLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center mb-6">
        <div className="h-10 w-40 bg-[var(--bg-elevated)] rounded-2xl shadow-surface-raised-sm animate-pulse" />
      </div>

      <div className="rounded-[var(--radius-container)] bg-[var(--bg-elevated)] p-8 shadow-surface-raised animate-pulse">
        <div className="h-8 bg-[var(--bg-elevated)] rounded-2xl w-96 mb-4 shadow-surface-raised" />
        <div className="h-5 bg-[var(--bg-elevated)] rounded-2xl w-72 mb-8 shadow-surface-raised" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-24 bg-[var(--bg-elevated)] rounded-xl shadow-surface-raised"
              />
            ))}
          </div>
          <div className="h-10 w-10 bg-[var(--bg-elevated)] rounded-xl shadow-surface-raised-sm" />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-[var(--bg-elevated)] p-4 h-48 shadow-surface-raised"
              />
            ))}
          </div>

          <div className="h-96 bg-[var(--bg-elevated)] rounded-2xl shadow-surface-raised" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return <ProjectEditLoading />;
}
