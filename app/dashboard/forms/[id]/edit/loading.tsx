export default function EditLoading() {
  return (
    <div className="min-h-screen bg-[#080808] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-4 w-24 animate-pulse bg-white/10 rounded" />
          <div className="hidden sm:block h-4 w-px bg-white/10" />
          <div className="hidden sm:block h-4 w-40 animate-pulse bg-white/10 rounded" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-4 w-16 animate-pulse bg-white/10 rounded" />
          <div className="h-4 w-16 animate-pulse bg-white/10 rounded" />
          <div className="h-4 w-14 animate-pulse bg-white/10 rounded" />
          <div className="h-4 w-14 animate-pulse bg-white/10 rounded" />
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 md:overflow-hidden">
        {/* Left sidebar */}
        <aside className="md:w-64 md:border-r border-white/10 flex flex-col">
          {/* Tab bar */}
          <div className="flex border-b border-white/10">
            <div className="flex-1 py-3 flex justify-center">
              <div className="h-4 w-20 animate-pulse bg-white/10 rounded" />
            </div>
            <div className="flex-1 py-3 flex justify-center">
              <div className="h-4 w-16 animate-pulse bg-white/10 rounded" />
            </div>
          </div>

          {/* Question item skeletons */}
          <div className="flex-1 p-3 flex flex-col gap-2">
            {[55, 75, 40, 65].map((w, i) => (
              <div
                key={i}
                className="px-3 py-2.5 rounded-lg border border-white/5 flex flex-col gap-1.5"
              >
                <div
                  className="h-3.5 animate-pulse bg-white/10 rounded"
                  style={{ width: `${w}%` }}
                />
                <div className="h-3 w-12 animate-pulse bg-white/10 rounded" />
              </div>
            ))}
            {/* Add question button placeholder */}
            <div className="mt-1 h-9 w-full animate-pulse bg-white/5 border border-dashed border-white/10 rounded-lg" />
          </div>
        </aside>

        {/* Main editor area */}
        <main className="flex-1 md:overflow-y-auto">
          <div className="mx-auto max-w-2xl px-6 sm:px-8 py-8 sm:py-12 flex flex-col gap-8">
            {/* Question label + input */}
            <div className="flex flex-col gap-3">
              <div className="h-3.5 w-24 animate-pulse bg-white/10 rounded" />
              <div className="h-10 w-full animate-pulse bg-white/10 rounded-lg" />
            </div>
            {/* Description field */}
            <div className="flex flex-col gap-3">
              <div className="h-3.5 w-28 animate-pulse bg-white/10 rounded" />
              <div className="h-10 w-full animate-pulse bg-white/10 rounded-lg" />
            </div>
            {/* Type selector placeholder */}
            <div className="flex flex-col gap-3">
              <div className="h-3.5 w-20 animate-pulse bg-white/10 rounded" />
              <div className="h-10 w-48 animate-pulse bg-white/10 rounded-lg" />
            </div>
            {/* Choice list placeholder */}
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 w-full animate-pulse bg-white/10 rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
