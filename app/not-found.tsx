import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-6">
      <div className="w-full max-w-sm text-center flex flex-col gap-6">
        <p className="text-white/30 text-sm uppercase tracking-widest">Form Builder</p>
        <h1 className="text-white text-3xl font-light">Page not found</h1>
        <p className="text-white/40 text-sm">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-2 mx-auto px-6 py-3 bg-white text-black text-sm font-medium rounded-lg hover:bg-white/90 transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
