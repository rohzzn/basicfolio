export default function GuestbookLoading() {
  return (
    <div className="relative -mx-4 w-[calc(100%+2rem)] max-w-none animate-pulse sm:-mx-6 sm:w-[calc(100%+3rem)] md:-mx-8 md:w-[calc(100%+4rem)] lg:-mx-10 lg:w-[calc(100%+5rem)]">
      <div
        className="relative min-h-[70dvh] rounded-2xl border border-[#0f3530]/80 bg-[#1e4d42]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(rgba(0,0,0,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px, 40px 40px, 10px 10px, 10px 10px",
        }}
      >
        <div className="relative z-[1] px-3 pb-12 pt-[3.25rem] sm:px-5 lg:px-8">
          <div className="mx-auto mb-8 max-w-2xl space-y-3">
            <div className="mx-auto h-3 w-28 rounded bg-white/15" />
            <div className="mx-auto h-8 max-w-xs rounded-lg bg-white/10" />
            <div className="mx-auto h-4 max-w-md rounded bg-white/10" />
          </div>

          <div className="mx-auto mb-10 max-w-xl rounded-xl border border-[#2d6b5e]/60 bg-[#f4f7f5]/90 p-5 dark:bg-[#152824]/85">
            <div className="space-y-3">
              <div className="h-10 rounded-lg bg-black/[0.06] dark:bg-white/[0.06]" />
              <div className="h-24 rounded-lg bg-black/[0.06] dark:bg-white/[0.06]" />
              <div className="h-9 w-28 rounded-lg bg-black/[0.08] dark:bg-white/[0.08]" />
            </div>
          </div>

          <div className="mx-auto mb-4 h-5 max-w-[120px] rounded bg-white/12" />

          <div className="mx-auto rounded-xl border border-[#2d6b5e]/45 bg-[#0f2924]/35 p-6">
            <div className="relative mx-auto min-h-[280px] max-w-lg md:min-h-[360px]">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute h-[120px] w-[46%] rounded-md border border-black/10 bg-[#faf3d9]/90 shadow-lg md:h-[132px]"
                  style={{
                    left: `${12 + i * 22}%`,
                    top: `${18 + (i % 2) * 28}%`,
                    transform: `rotate(${(-3 + i * 3).toFixed(1)}deg)`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
