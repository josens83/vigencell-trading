import { Skeleton } from '@/components/ui/skeleton';

export default function GameLoading() {
  return (
    <div className="min-h-screen bg-slate-900 p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full space-y-6">
        {/* 상단 정보 바 */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>

        {/* 메인 게임 카드 */}
        <div className="game-card p-6 space-y-6">
          {/* 날짜/이벤트 */}
          <div className="text-center space-y-2">
            <Skeleton className="h-6 w-40 mx-auto" />
            <Skeleton className="h-8 w-64 mx-auto" />
          </div>

          {/* 가격 정보 */}
          <div className="flex justify-center items-center gap-8">
            <div className="text-center">
              <Skeleton className="h-4 w-16 mx-auto mb-2" />
              <Skeleton className="h-10 w-32 mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton className="h-4 w-20 mx-auto mb-2" />
              <Skeleton className="h-8 w-24 mx-auto" />
            </div>
          </div>

          {/* 차트 영역 */}
          <Skeleton className="h-48 w-full rounded-lg" />

          {/* 포트폴리오 정보 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center p-3 bg-slate-800/50 rounded-lg">
                <Skeleton className="h-4 w-16 mx-auto mb-2" />
                <Skeleton className="h-6 w-24 mx-auto" />
              </div>
            ))}
          </div>

          {/* 멘탈 게이지 */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full rounded-full" />
          </div>

          {/* 거래 버튼 */}
          <div className="flex gap-4">
            <Skeleton className="h-12 flex-1 rounded-lg" />
            <Skeleton className="h-12 flex-1 rounded-lg" />
          </div>

          {/* 진행 버튼 */}
          <div className="flex gap-4 justify-center">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>

        {/* 하단 로그 */}
        <div className="game-card p-4">
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
