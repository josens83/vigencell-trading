'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  finalPortfolio: number;
  totalReturn: number;
  totalTrades: number;
  winRate: number;
  achievementCount: number;
  isCurrentUser: boolean;
}

interface UserEntry {
  rank: number;
  totalReturn: number;
  finalPortfolio: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userEntry, setUserEntry] = useState<UserEntry | null>(null);
  const [period, setPeriod] = useState<string>(getCurrentPeriod());
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/game/leaderboard?period=${period}&limit=50`);
      const data = await res.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
        setUserEntry(data.userEntry);
        setTotalCount(data.totalCount);
      } else {
        setError(data.error || '리더보드를 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('리더보드를 불러오는 중 오류가 발생했습니다.');
      console.error('Leaderboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
      options.push({ value, label });
    }
    return options;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR');
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 border-yellow-500/50';
    if (rank === 2) return 'bg-gray-400/20 border-gray-400/50';
    if (rank === 3) return 'bg-orange-600/20 border-orange-600/50';
    return 'bg-slate-800/50 border-slate-700/50';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* 헤더 */}
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text">
            바이젠셀 투자 마스터
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/game" className="text-gray-400 hover:text-white transition-colors">
              게임
            </Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              대시보드
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* 타이틀 & 기간 선택 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">리더보드</h1>
            <p className="text-gray-400 mt-1">최고의 투자자들과 경쟁하세요!</p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="기간 선택"
          >
            {getPeriodOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 내 순위 (로그인한 경우) */}
        {userEntry && (
          <div className="mb-8 p-6 game-card border-2 border-blue-500/50 bg-blue-500/10">
            <h2 className="text-lg font-semibold mb-4">내 순위</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-blue-400">
                  #{userEntry.rank}
                </span>
                <div>
                  <p className="text-sm text-gray-400">총 {totalCount}명 중</p>
                  <p className="text-lg font-semibold">
                    수익률:{' '}
                    <span className={userEntry.totalReturn >= 0 ? 'text-red-400' : 'text-blue-400'}>
                      {userEntry.totalReturn >= 0 ? '+' : ''}
                      {userEntry.totalReturn.toFixed(2)}%
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">최종 자산</p>
                <p className="text-xl font-bold">
                  {formatNumber(userEntry.finalPortfolio)}원
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 리더보드 테이블 */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-400">{error}</p>
            <button
              onClick={fetchLeaderboard}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16 game-card">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-xl font-bold mb-2">아직 참가자가 없습니다</h2>
            <p className="text-gray-400 mb-6">첫 번째 참가자가 되어보세요!</p>
            <Link href="/game" className="btn-primary inline-block">
              게임 시작하기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {/* 테이블 헤더 (데스크톱) */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-sm text-gray-400">
              <div className="col-span-1">순위</div>
              <div className="col-span-3">이름</div>
              <div className="col-span-2 text-right">수익률</div>
              <div className="col-span-3 text-right">최종 자산</div>
              <div className="col-span-1 text-right">거래</div>
              <div className="col-span-1 text-right">승률</div>
              <div className="col-span-1 text-right">업적</div>
            </div>

            {/* 리더보드 항목 */}
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`game-card border ${getRankClass(entry.rank)} ${
                  entry.isCurrentUser ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* 데스크톱 뷰 */}
                <div className="hidden sm:grid grid-cols-12 gap-4 items-center p-4">
                  <div className="col-span-1 text-lg font-bold">
                    {getRankBadge(entry.rank)}
                  </div>
                  <div className="col-span-3">
                    <span className={entry.isCurrentUser ? 'text-blue-400' : ''}>
                      {entry.userName}
                    </span>
                    {entry.isCurrentUser && (
                      <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                        나
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    <span
                      className={`font-semibold ${
                        entry.totalReturn >= 0 ? 'text-red-400' : 'text-blue-400'
                      }`}
                    >
                      {entry.totalReturn >= 0 ? '+' : ''}
                      {entry.totalReturn.toFixed(2)}%
                    </span>
                  </div>
                  <div className="col-span-3 text-right font-medium">
                    {formatNumber(entry.finalPortfolio)}원
                  </div>
                  <div className="col-span-1 text-right text-gray-400">
                    {entry.totalTrades}
                  </div>
                  <div className="col-span-1 text-right text-gray-400">
                    {entry.winRate.toFixed(0)}%
                  </div>
                  <div className="col-span-1 text-right text-gray-400">
                    {entry.achievementCount}
                  </div>
                </div>

                {/* 모바일 뷰 */}
                <div className="sm:hidden p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold">{getRankBadge(entry.rank)}</span>
                      <span className={entry.isCurrentUser ? 'text-blue-400 font-medium' : ''}>
                        {entry.userName}
                      </span>
                    </div>
                    <span
                      className={`text-lg font-bold ${
                        entry.totalReturn >= 0 ? 'text-red-400' : 'text-blue-400'
                      }`}
                    >
                      {entry.totalReturn >= 0 ? '+' : ''}
                      {entry.totalReturn.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{formatNumber(entry.finalPortfolio)}원</span>
                    <span>
                      거래 {entry.totalTrades} | 승률 {entry.winRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 더보기 (페이지네이션 placeholder) */}
        {leaderboard.length > 0 && totalCount > leaderboard.length && (
          <div className="text-center mt-8">
            <p className="text-gray-400 mb-4">
              {leaderboard.length}명 / {totalCount}명 표시 중
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
