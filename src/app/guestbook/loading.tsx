export default function GuestbookLoading() {
  return (
    <div style={{ maxWidth: "75ch" }}>
      <div className="h-6 w-28 bg-zinc-100 dark:bg-neutral-800 rounded mb-2 animate-pulse" />
      <div className="h-4 w-64 bg-zinc-100 dark:bg-neutral-800 rounded mb-8 animate-pulse" />
      <div className="flex flex-col gap-3 mb-10">
        <div className="h-9 w-full bg-zinc-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
        <div className="h-20 w-full bg-zinc-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-zinc-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
          <div className="h-9 w-36 bg-zinc-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="space-y-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 py-4 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-neutral-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-zinc-100 dark:bg-neutral-800 rounded" />
              <div className="h-3 w-full bg-zinc-100 dark:bg-neutral-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
