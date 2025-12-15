import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full game-card p-8 space-y-6">
        {/* 로고/타이틀 */}
        <div className="text-center space-y-2">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-5 w-32 mx-auto" />
        </div>

        {/* 폼 필드 */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

        {/* 버튼 */}
        <Skeleton className="h-12 w-full rounded-lg" />

        {/* 링크 */}
        <div className="text-center">
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    </div>
  );
}
