export function ProjectsLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="rounded-[var(--radius-container)] bg-[var(--bg-elevated)] p-8 shadow-surface-raised animate-pulse">
        <div className="h-8 bg-[var(--bg-elevated)] rounded-2xl w-48 mb-4 shadow-surface-raised" />
        <div className="h-4 bg-[var(--bg-elevated)] rounded-2xl w-64 shadow-surface-raised" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-[var(--bg-elevated)] rounded-2xl shadow-surface-raised"
            />
          ))}
        </div>
      </div>

      <div className="flex gap-4 items-center mb-6">
        <div className="h-12 bg-[var(--bg-elevated)] rounded-2xl w-64 shadow-surface-raised animate-pulse" />
        <div className="flex gap-2 ml-auto">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-12 w-24 bg-[var(--bg-elevated)] rounded-2xl shadow-surface-raised animate-pulse"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-[var(--radius-container)] bg-[var(--bg-elevated)] p-8 shadow-surface-raised animate-pulse"
          >
            <div className="h-48 bg-[var(--bg-elevated)] rounded-2xl mb-6 shadow-surface-raised" />
            <div className="h-6 bg-[var(--bg-elevated)] rounded-2xl w-3/4 mb-3 shadow-surface-raised" />
            <div className="h-4 bg-[var(--bg-elevated)] rounded-2xl w-full mb-2 shadow-surface-raised" />
            <div className="h-4 bg-[var(--bg-elevated)] rounded-2xl w-5/6 shadow-surface-raised" />

            <div className="flex gap-2 mt-6">
              {[...Array(3)].map((_, j) => (
                <div
                  key={j}
                  className="h-8 w-20 bg-[var(--bg-elevated)] rounded-xl shadow-surface-raised"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return <ProjectsLoading />;
}
