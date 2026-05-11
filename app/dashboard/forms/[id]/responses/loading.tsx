export default function ResponsesLoading() {
  // Column width percentages to vary the skeleton cells and look natural
  const colWidths = [28, 18, 55, 40, 65]

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Header bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="h-4 w-24 animate-pulse bg-white/10 rounded" />
          <div className="h-4 w-px bg-white/10" />
          <div className="h-4 w-36 animate-pulse bg-white/10 rounded" />
          <div className="h-4 w-px bg-white/10" />
          <div className="h-4 w-20 animate-pulse bg-white/10 rounded" />
        </div>
        <div className="h-4 w-16 animate-pulse bg-white/10 rounded" />
      </header>

      <div className="px-6 py-8 max-w-5xl mx-auto">
        {/* Subheader: count + actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-3.5 w-20 animate-pulse bg-white/10 rounded" />
          <div className="h-7 w-28 animate-pulse bg-white/10 rounded-lg" />
        </div>

        {/* Table skeleton */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {colWidths.map((w, i) => (
                  <th key={i} className="text-left py-3 pr-6">
                    <div
                      className="h-3.5 animate-pulse bg-white/10 rounded"
                      style={{ width: `${w}%`, minWidth: 40 }}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [55, 30, 80, 60, 45],
                [55, 30, 55, 85, 70],
                [55, 30, 70, 40, 90],
                [55, 30, 40, 70, 55],
              ].map((row, ri) => (
                <tr key={ri} className="border-b border-white/5">
                  {row.map((w, ci) => (
                    <td key={ci} className="py-3 pr-6">
                      <div
                        className="h-3.5 animate-pulse bg-white/10 rounded"
                        style={{ width: `${w}%`, minWidth: 32 }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
