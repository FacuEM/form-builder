export default function FormLoading() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
      <div className="max-w-xl w-full">
        {/* Title skeleton */}
        <div className="h-10 w-3/4 animate-pulse bg-white/10 rounded-lg mb-4" />
        {/* Description skeleton — two lines */}
        <div className="flex flex-col gap-2 mb-10">
          <div className="h-5 w-full animate-pulse bg-white/10 rounded" />
          <div className="h-5 w-2/3 animate-pulse bg-white/10 rounded" />
        </div>
        {/* Start button skeleton */}
        <div className="mt-8 h-12 w-36 animate-pulse bg-white/10 rounded-lg" />
      </div>
    </div>
  )
}
