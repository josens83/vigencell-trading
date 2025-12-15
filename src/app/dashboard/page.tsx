'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserData {
  name: string;
  email: string;
  subscription: {
    plan: 'FREE' | 'BASIC' | 'PREMIUM';
    status: string;
    currentPeriodEnd?: string;
  };
}

interface GameSave {
  slotNumber: number;
  saveName?: string;
  portfolioValue?: number;
  totalReturn?: number;
  daysPlayed?: number;
  updatedAt?: string;
  empty?: boolean;
}

interface Achievement {
  code: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
}

interface LeaderboardEntry {
  rank: number;
  totalReturn: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [saves, setSaves] = useState<GameSave[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboardRank, setLeaderboardRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 사용자 정보 조회
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      // 게임 저장 목록 조회
      const savesRes = await fetch('/api/game/save');
      if (savesRes.ok) {
        const savesData = await savesRes.json();
        setSaves(savesData.saves || []);
      }

      // 업적 조회
      const achievementsRes = await fetch('/api/game/achievements');
      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json();
        setAchievements(achievementsData.achievements || []);
      }

      // 리더보드 순위 조회
      const leaderboardRes = await fetch('/api/game/leaderboard');
      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        if (leaderboardData.userEntry) {
          setLeaderboardRank(leaderboardData.userEntry);
        }
      }
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const handleLoadGame = (slotNumber: number) => {
    router.push(`/game?load=${slotNumber}`);
  };

  const handleDeleteSave = async (slotNumber: number) => {
    if (!confirm('정말로 이 저장 데이터를 삭제하시겠습니까?')) return;

    const res = await fetch(`/api/game/load/${slotNumber}`, { method: 'DELETE' });
    if (res.ok) {
      fetchDashboardData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  const planNames = {
    FREE: '무료',
    BASIC: '베이직',
    PREMIUM: '프리미엄',
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalPoints = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* 헤더 */}
      <header className="border-b border-slate-700 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text">
            바이젠셀 투자 마스터
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">대시보드</h1>

        {/* 상단 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 구독 상태 */}
          <div className="game-card p-6">
            <h3 className="text-gray-400 text-sm mb-2">구독 플랜</h3>
            <p className="text-2xl font-bold text-blue-400">
              {planNames[user?.subscription?.plan || 'FREE']}
            </p>
            {user?.subscription?.plan === 'FREE' && (
              <Link
                href="/pricing"
                className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300"
              >
                업그레이드 →
              </Link>
            )}
          </div>

          {/* 리더보드 순위 */}
          <div className="game-card p-6">
            <h3 className="text-gray-400 text-sm mb-2">이번 달 순위</h3>
            <p className="text-2xl font-bold text-yellow-400">
              {leaderboardRank ? `#${leaderboardRank.rank}` : '-'}
            </p>
            {leaderboardRank && (
              <p className="text-sm text-gray-400 mt-1">
                수익률: {leaderboardRank.totalReturn.toFixed(2)}%
              </p>
            )}
          </div>

          {/* 해금된 업적 */}
          <div className="game-card p-6">
            <h3 className="text-gray-400 text-sm mb-2">해금된 업적</h3>
            <p className="text-2xl font-bold text-green-400">
              {unlockedCount} / {achievements.length}
            </p>
            <p className="text-sm text-gray-400 mt-1">{totalPoints} 포인트</p>
          </div>

          {/* 빠른 시작 */}
          <div className="game-card p-6 flex flex-col justify-between">
            <h3 className="text-gray-400 text-sm mb-2">게임</h3>
            <Link
              href="/game"
              className="btn-primary text-center mt-2"
            >
              새 게임 시작
            </Link>
          </div>
        </div>

        {/* 저장된 게임 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">저장된 게임</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {saves.map((save) => (
              <div key={save.slotNumber} className="game-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold">슬롯 {save.slotNumber}</h3>
                  {!save.empty && (
                    <button
                      onClick={() => handleDeleteSave(save.slotNumber)}
                      className="text-red-400 hover:text-red-300 text-sm"
                      aria-label={`슬롯 ${save.slotNumber} 삭제`}
                    >
                      삭제
                    </button>
                  )}
                </div>

                {save.empty ? (
                  <p className="text-gray-500">비어있음</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-400 mb-2">
                      {save.saveName || `저장 ${save.slotNumber}`}
                    </p>
                    <div className="space-y-1 text-sm mb-4">
                      <p>
                        자산:{' '}
                        <span className="text-blue-400">
                          {save.portfolioValue?.toLocaleString()}원
                        </span>
                      </p>
                      <p>
                        수익률:{' '}
                        <span
                          className={
                            (save.totalReturn || 0) >= 0
                              ? 'text-red-400'
                              : 'text-blue-400'
                          }
                        >
                          {(save.totalReturn || 0).toFixed(2)}%
                        </span>
                      </p>
                      <p>
                        진행:{' '}
                        <span className="text-gray-300">
                          {save.daysPlayed}일차
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleLoadGame(save.slotNumber)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm"
                    >
                      이어하기
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 업적 */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">업적</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.code}
                className={`game-card p-4 text-center transition-all ${
                  achievement.unlocked
                    ? 'border-yellow-500/50'
                    : 'opacity-50 grayscale'
                }`}
                title={achievement.description}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <p className="text-xs font-medium truncate">{achievement.name}</p>
                <p className="text-xs text-gray-500">{achievement.points}P</p>
              </div>
            ))}
          </div>
        </section>

        {/* 리더보드 링크 */}
        <section>
          <div className="game-card p-6 text-center">
            <h2 className="text-xl font-bold mb-2">전체 리더보드</h2>
            <p className="text-gray-400 mb-4">
              다른 투자자들과 실력을 겨뤄보세요!
            </p>
            <Link
              href="/leaderboard"
              className="btn-secondary inline-block"
            >
              리더보드 보기
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
