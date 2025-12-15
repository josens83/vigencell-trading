'use client';

import { useState, useEffect } from 'react';
import { AccessibleModal } from '@/components/ui/accessible';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

interface GameSave {
  slotNumber: number;
  saveName?: string;
  portfolioValue?: number;
  totalReturn?: number;
  daysPlayed?: number;
  updatedAt?: string;
  empty?: boolean;
}

interface GameState {
  currentDay: number;
  currentEventIndex: number;
  cash: number;
  shares: number;
  averageCost: number;
  mentalState: number;
  totalTrades: number;
  wins: number;
  losses: number;
  maxProfit: number;
  maxLoss: number;
  currentStreak: number;
  achievements: string[];
  gameLog: Array<{
    day: number;
    action: string;
    price: number;
    amount?: number;
    result?: string;
  }>;
}

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load';
  currentGameState?: GameState;
  onLoad?: (gameState: GameState) => void;
  onSaveComplete?: () => void;
}

export function SaveLoadModal({
  isOpen,
  onClose,
  mode,
  currentGameState,
  onLoad,
  onSaveComplete,
}: SaveLoadModalProps) {
  const [saves, setSaves] = useState<GameSave[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingSlot, setLoadingSlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSaves();
    }
  }, [isOpen]);

  const fetchSaves = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/game/save');
      const data = await res.json();

      if (data.success) {
        setSaves(data.saves);
      } else {
        setError(data.error || '저장 데이터를 불러올 수 없습니다.');
      }
    } catch (err) {
      setError('저장 데이터를 불러오는 중 오류가 발생했습니다.');
      console.error('Fetch saves error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (slotNumber: number) => {
    if (!currentGameState) return;

    try {
      setSaving(true);
      setError(null);

      const res = await fetch('/api/game/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotNumber,
          saveName: saveName || `저장 ${slotNumber}`,
          gameState: currentGameState,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onSaveComplete?.();
        onClose();
      } else {
        setError(data.error || '저장에 실패했습니다.');
      }
    } catch (err) {
      setError('저장 중 오류가 발생했습니다.');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
      setSelectedSlot(null);
      setSaveName('');
    }
  };

  const handleLoad = async (slotNumber: number) => {
    try {
      setLoadingSlot(slotNumber);
      setError(null);

      const res = await fetch(`/api/game/load/${slotNumber}`);
      const data = await res.json();

      if (data.success && data.save?.gameState) {
        onLoad?.(data.save.gameState as GameState);
        onClose();
      } else {
        setError(data.error || '불러오기에 실패했습니다.');
      }
    } catch (err) {
      setError('불러오기 중 오류가 발생했습니다.');
      console.error('Load error:', err);
    } finally {
      setLoadingSlot(null);
    }
  };

  const handleDelete = async (slotNumber: number) => {
    if (!confirm('정말로 이 저장 데이터를 삭제하시겠습니까?')) return;

    try {
      const res = await fetch(`/api/game/load/${slotNumber}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchSaves();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'save' ? '게임 저장' : '게임 불러오기'}
      description={
        mode === 'save'
          ? '저장할 슬롯을 선택하세요.'
          : '불러올 저장 데이터를 선택하세요.'
      }
      size="lg"
    >
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-slate-800/50 rounded-lg">
              <Skeleton className="h-5 w-20 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {saves.map((save) => (
            <div
              key={save.slotNumber}
              className={`p-4 rounded-lg border transition-colors ${
                selectedSlot === save.slotNumber
                  ? 'bg-blue-500/20 border-blue-500'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">슬롯 {save.slotNumber}</h3>
                {!save.empty && (
                  <button
                    onClick={() => handleDelete(save.slotNumber)}
                    className="text-xs text-red-400 hover:text-red-300"
                    disabled={saving || loadingSlot !== null}
                  >
                    삭제
                  </button>
                )}
              </div>

              {save.empty ? (
                <p className="text-gray-500 text-sm">빈 슬롯</p>
              ) : (
                <div className="space-y-1 text-sm">
                  <p className="text-gray-400">{save.saveName}</p>
                  <div className="flex justify-between">
                    <span>자산:</span>
                    <span className="text-blue-400">
                      {formatCurrency(save.portfolioValue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>수익률:</span>
                    <span
                      className={
                        (save.totalReturn || 0) >= 0
                          ? 'text-red-400'
                          : 'text-blue-400'
                      }
                    >
                      {(save.totalReturn || 0) >= 0 ? '+' : ''}
                      {(save.totalReturn || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>진행:</span>
                    <span>{save.daysPlayed}일차</span>
                  </div>
                  {save.updatedAt && (
                    <p className="text-gray-500 text-xs mt-1">
                      {formatRelativeTime(save.updatedAt)}
                    </p>
                  )}
                </div>
              )}

              {/* 저장 모드 */}
              {mode === 'save' && (
                <div className="mt-3">
                  {selectedSlot === save.slotNumber ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={saveName}
                        onChange={(e) => setSaveName(e.target.value)}
                        placeholder="저장 이름 (선택)"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={50}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(save.slotNumber)}
                          disabled={saving}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm font-medium transition-colors"
                        >
                          {saving ? '저장 중...' : '저장'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSlot(null);
                            setSaveName('');
                          }}
                          disabled={saving}
                          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedSlot(save.slotNumber)}
                      className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors"
                    >
                      {save.empty ? '여기에 저장' : '덮어쓰기'}
                    </button>
                  )}
                </div>
              )}

              {/* 불러오기 모드 */}
              {mode === 'load' && !save.empty && (
                <button
                  onClick={() => handleLoad(save.slotNumber)}
                  disabled={loadingSlot !== null}
                  className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm font-medium transition-colors"
                >
                  {loadingSlot === save.slotNumber ? '불러오는 중...' : '불러오기'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm transition-colors"
        >
          닫기
        </button>
      </div>
    </AccessibleModal>
  );
}

export default SaveLoadModal;
