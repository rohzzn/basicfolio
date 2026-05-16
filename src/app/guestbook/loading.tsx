export default function GuestbookLoading() {
  return (
    <div style={{ maxWidth: "75ch" }}>
      <div className="h-6 w-28 bg-zinc-100 dark:bg-zinc-800 rounded mb-2 animate-pulse" />
      <div className="h-4 w-64 bg-zinc-100 dark:bg-zinc-800 rounded mb-8 animate-pulse" />
      <div className="flex flex-col gap-3 mb-10">
        <div className="h-9 w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
        <div className="h-20 w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
        <div className="h-9 w-28 bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
      </div>
      <div className="relative w-full rounded-xl overflow-hidden" style={{ height: "500px" }}>
        {[
          { l: "8%",  t: "6%",  r: "-4deg" },
          { l: "34%", t: "10%", r: "2deg"  },
          { l: "62%", t: "4%",  r: "-2deg" },
          { l: "18%", t: "45%", r: "5deg"  },
          { l: "50%", t: "50%", r: "-3deg" },
        ].map((s, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: s.l, top: s.t,
              width: "clamp(130px, 16vw, 175px)",
              transform: `rotate(${s.r})`,
            }}
          >
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-sm" style={{ padding: "10px 10px 32px 10px" }}>
              <div className="bg-zinc-200 dark:bg-zinc-700 rounded-sm" style={{ aspectRatio: "1", width: "100%" }} />
              <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded mt-2 mx-auto w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
