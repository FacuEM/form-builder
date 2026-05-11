export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#080808] px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div className="h-7 w-32 animate-pulse bg-white/10 rounded-md" />
          <div className="flex items-center gap-3">
            <div className="h-9 w-28 animate-pulse bg-white/10 rounded-lg" />
            <div className="h-9 w-20 animate-pulse bg-white/10 rounded-lg" />
          </div>
        </div>

        {/* Form row skeletons */}
        <div className="flex flex-col gap-2">
          {[72, 48, 60, 52].map((titleWidth, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl border border-white/10"
            >
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <div
                  className="h-4 animate-pulse bg-white/10 rounded"
                  style={{ width: `${titleWidth}%` }}
                />
                <div className="h-3 w-32 animate-pulse bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
