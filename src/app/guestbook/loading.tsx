export default function GuestbookLoading() {
  return (
    <div style={{ maxWidth: '75ch' }} className="animate-pulse">
      <div className="h-6 w-24 bg-zinc-100 dark:bg-zinc-800 rounded mb-8" />

      {/* Input skeleton */}
      <div className="mb-8 space-y-3">
        <div className="h-9 bg-zinc-100 dark:bg-zinc-800 rounded" />
        <div className="h-9 bg-zinc-100 dark:bg-zinc-800 rounded" />
        <div className="h-9 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
      </div>

      {/* Comment rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-3 py-3 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0"
        >
          <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
            <div className="h-3.5 bg-zinc-100 dark:bg-zinc-800 rounded" style={{ width: `${60 + (i % 3) * 15}%` }} />
          </div>
          <div className="h-3 w-14 bg-zinc-100 dark:bg-zinc-800 rounded flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}
