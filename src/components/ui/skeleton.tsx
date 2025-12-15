'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * 기본 스켈레톤 컴포넌트
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-slate-700/50',
        className
      )}
      {...props}
    />
  );
}

/**
 * 텍스트 스켈레톤
 */
export function SkeletonText({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

/**
 * 카드 스켈레톤
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('game-card p-6 space-y-4', className)}>
      <Skeleton className="h-6 w-1/3" />
      <SkeletonText lines={3} />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

/**
 * 아바타 스켈레톤
 */
export function SkeletonAvatar({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <Skeleton className={cn('rounded-full', sizes[size], className)} />
  );
}

/**
 * 게임 저장 슬롯 스켈레톤
 */
export function SkeletonGameSlot() {
  return (
    <div className="game-card p-6 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

/**
 * 리더보드 항목 스켈레톤
 */
export function SkeletonLeaderboardItem() {
  return (
    <div className="game-card p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

/**
 * 대시보드 통계 카드 스켈레톤
 */
export function SkeletonStatCard() {
  return (
    <div className="game-card p-6">
      <Skeleton className="h-4 w-20 mb-2" />
      <Skeleton className="h-8 w-24 mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

/**
 * 업적 그리드 스켈레톤
 */
export function SkeletonAchievements({ count = 7 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="game-card p-4 text-center">
          <Skeleton className="h-10 w-10 mx-auto mb-2 rounded-full" />
          <Skeleton className="h-3 w-16 mx-auto mb-1" />
          <Skeleton className="h-3 w-8 mx-auto" />
        </div>
      ))}
    </div>
  );
}

/**
 * 전체 페이지 스켈레톤
 */
export function SkeletonPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-4">
      {/* 헤더 */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex justify-between items-center py-4 border-b border-slate-700">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-7xl mx-auto">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

/**
 * 대시보드 로딩 스켈레톤
 */
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* 헤더 */}
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-9 w-32 mb-8" />

        {/* 상단 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>

        {/* 저장된 게임 */}
        <section className="mb-8">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonGameSlot />
            <SkeletonGameSlot />
            <SkeletonGameSlot />
          </div>
        </section>

        {/* 업적 */}
        <section className="mb-8">
          <Skeleton className="h-6 w-20 mb-4" />
          <SkeletonAchievements />
        </section>
      </main>
    </div>
  );
}

/**
 * 리더보드 로딩 스켈레톤
 */
export function LeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <SkeletonLeaderboardItem key={i} />
      ))}
    </div>
  );
}
