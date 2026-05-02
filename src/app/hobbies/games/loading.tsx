export default function GamesLoading() {
  return (
    <div style={{ maxWidth: '75ch' }} className="animate-pulse">
      <div className="h-6 w-16 bg-zinc-100 dark:bg-zinc-800 rounded mb-8" />

      {/* Profile card skeleton */}
      <div className="flex items-center gap-4 mb-8 p-4 border border-zinc-100 dark:border-zinc-800 rounded-lg">
        <div className="w-14 h-14 rounded-full bg-zinc-100 dark:bg-zinc-800 flex-shrink-0" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded" />
          <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg space-y-2">
            <div className="h-5 w-12 bg-zinc-100 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800 rounded" />
          </div>
        ))}
      </div>

      {/* Game rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
        >
          <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 flex-shrink-0" />
          <div className="flex-1 h-3.5 bg-zinc-100 dark:bg-zinc-800 rounded" />
          <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );
}
