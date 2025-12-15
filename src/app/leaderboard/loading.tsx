import { Skeleton, LeaderboardSkeleton } from '@/components/ui/skeleton';

export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* 헤더 */}
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 타이틀 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-9 w-32 mb-2" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>

        {/* 리더보드 */}
        <LeaderboardSkeleton />
      </main>
    </div>
  );
}
