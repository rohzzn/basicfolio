export default function MusicLoading() {
  return (
    <div style={{ maxWidth: '75ch' }} className="animate-pulse">
      <div className="h-6 w-16 bg-zinc-100 dark:bg-zinc-800 rounded mb-8" />

      {/* Tab bar */}
      <div className="flex gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 w-16 bg-zinc-100 dark:bg-zinc-800 rounded" />
        ))}
      </div>

      {/* Track rows */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 py-2.5 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
        >
          <div className="w-10 h-10 rounded bg-zinc-100 dark:bg-zinc-800 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-zinc-100 dark:bg-zinc-800 rounded" style={{ width: `${50 + (i % 4) * 10}%` }} />
            <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
          </div>
          <div className="h-3 w-10 bg-zinc-100 dark:bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );
}
