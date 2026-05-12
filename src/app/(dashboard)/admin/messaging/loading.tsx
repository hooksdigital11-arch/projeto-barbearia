export default function Loading() {
  return (
    <div className="flex-1 p-4 md:p-8 pt-6 space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-white/5 rounded animate-pulse" />
          <div className="h-10 w-48 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-[320px,1fr] gap-0 rounded-2xl border border-white/5 bg-bg-surface overflow-hidden h-[500px]">
        <div className="border-r border-white/5 bg-white/2 animate-pulse" />
        <div className="bg-white/1 animate-pulse" />
      </div>
    </div>
  )
}
