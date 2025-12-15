import { Skeleton } from '@/components/ui/skeleton';

export default function PricingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-6 w-48 mx-auto" />
        </div>

        {/* 가격 카드 */}
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="game-card p-6">
              <div className="text-center mb-6">
                <Skeleton className="h-6 w-24 mx-auto mb-2" />
                <Skeleton className="h-10 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
              <div className="space-y-3 mb-6">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ))}
        </div>

        {/* 하단 텍스트 */}
        <div className="mt-12 text-center">
          <Skeleton className="h-4 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}
