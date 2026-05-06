'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="bg-[#0a0a0a] text-white flex flex-col items-center justify-center min-h-screen p-6">
        <h2 className="text-3xl font-bold font-syne mb-4">CRITICAL ERROR</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          {error.message || "A fatal error occurred in the application."}
        </p>
        <button
          onClick={() => reset()}
          className="px-8 py-3 rounded-xl bg-accent-cyan text-black font-bold uppercase tracking-wider"
        >
          Try Again
        </button>
      </body>
    </html>
  )
}
