'use client';

import React, { useState, useEffect, useCallback } from 'react';

// 타입 정의
interface HistoricalEvent {
  date: string;
  type: string;
  title: string;
  description: string;
  priceTarget: number | null;
  impact: string;
  volatility: number;
}

interface Trade {
  type: 'BUY' | 'SELL';
  date: string;
  price: number;
  amount: number;
  total: number;
  profit?: number;
}

interface News {
  date: string;
  text: string;
  type: string;
}

interface Notification {
  id: number;
  message: string;
}

interface Stats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  maxProfit: number;
  maxLoss: number;
  daysPlayed: number;
}

interface MentalState {
  emoji: string;
  text: string;
  color: string;
}

interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

// 실제 바이젠셀 주가 데이터 기반 시뮬레이션
const HISTORICAL_EVENTS: HistoricalEvent[] = [
  { date: '2021-08-25', type: 'IPO', title: '바이젠셀 코스닥 상장', description: '공모가 52,700원, 기술특례상장. 약 994억원 조달.', priceTarget: 39078, impact: 'neutral', volatility: 0.15 },
  { date: '2021-09-15', type: 'NEWS', title: 'VT-EBV-N 임상 2상 진행', description: '서울성모병원 등 13개 기관에서 임상 2상 환자 등록 시작.', priceTarget: 35000, impact: 'positive', volatility: 0.08 },
  { date: '2022-03-01', type: 'MARKET', title: '바이오 섹터 약세장 진입', description: '금리 인상 우려로 성장주 전반 하락. 바이오 투자심리 위축.', priceTarget: 25000, impact: 'negative', volatility: 0.12 },
  { date: '2022-08-15', type: 'EARNINGS', title: '2022년 반기 실적 발표', description: '매출 0원, 영업손실 -67억원. 현금 소진 지속.', priceTarget: 18000, impact: 'negative', volatility: 0.1 },
  { date: '2023-03-20', type: 'NEWS', title: '임상 2상 환자 등록 완료', description: '목표 48명 환자 등록 완료. 추적 관찰 진행 중.', priceTarget: 12000, impact: 'neutral', volatility: 0.06 },
  { date: '2023-06-15', type: 'MARKET', title: '바이오 투자심리 바닥', description: '코스닥 바이오지수 52주 신저가. 투매 지속.', priceTarget: 6000, impact: 'negative', volatility: 0.15 },
  { date: '2023-10-01', type: 'NEWS', title: 'EMA 희귀의약품 지정', description: 'VT-EBV-N 유럽 희귀의약품 지정 획득.', priceTarget: 4500, impact: 'positive', volatility: 0.08 },
  { date: '2023-12-23', type: 'BOTTOM', title: '역사적 최저점 도달', description: '주가 2,305원. 공모가 대비 -95.6%. 거래량 급감.', priceTarget: 2305, impact: 'negative', volatility: 0.05 },
  { date: '2024-06-01', type: 'NEWS', title: '바닥권 횡보', description: '2,500~4,500원 박스권. 일부 저점 매수세 유입.', priceTarget: 3500, impact: 'neutral', volatility: 0.04 },
  { date: '2025-01-23', type: 'MAJOR', title: '최대주주 변경', description: '가은글로벌이 보령으로부터 지분 11.37% 인수. 테라베스트 그룹 편입.', priceTarget: 4200, impact: 'positive', volatility: 0.1 },
  { date: '2025-06-01', type: 'NEWS', title: '테라베스트 협력 계약', description: 'TB-420 기술도입 100억원, CDMO 계약 52억원 등 총 182억원 계약.', priceTarget: 4800, impact: 'positive', volatility: 0.08 },
  { date: '2025-11-21', type: 'CALM', title: '임상 결과 발표 임박', description: '시장에서 임상 2상 결과 발표 루머. 거래량 소폭 증가.', priceTarget: 3070, impact: 'neutral', volatility: 0.06 },
  { date: '2025-11-26', type: 'CATALYST', title: '⭐ VT-EBV-N 임상 2상 성공!', description: '2년 DFS 95% vs 77.58%, p=0.0347 통계적 유의성 달성! 중대이상반응 0건!', priceTarget: 8500, impact: 'very_positive', volatility: 0.3 },
  { date: '2025-11-27', type: 'SURGE', title: '상한가 행진 시작', description: '임상 성공 소식에 연속 상한가. 거래량 폭발.', priceTarget: 11000, impact: 'very_positive', volatility: 0.3 },
  { date: '2025-12-02', type: 'SURGE', title: '5연속 상한가 달성', description: '개인 투자자 매수세 집중. 시가총액 2,000억원 돌파.', priceTarget: 15800, impact: 'positive', volatility: 0.25 },
  { date: '2025-12-11', type: 'PEAK', title: '단기 고점 형성', description: '17,360원 기록 후 차익실현 매물 출현. 조정 시작.', priceTarget: 17360, impact: 'neutral', volatility: 0.2 },
  { date: '2025-12-13', type: 'CORRECTION', title: '급등 후 조정', description: '고점 대비 -26% 조정. 12,820원. 과열 해소 중.', priceTarget: 12820, impact: 'negative', volatility: 0.15 },
  { date: '2026-02-01', type: 'MILESTONE', title: '조건부허가 신청', description: 'VT-EBV-N 식약처 조건부허가 및 신속심사 신청.', priceTarget: 16000, impact: 'positive', volatility: 0.12 },
  { date: '2026-06-01', type: 'REVIEW', title: '식약처 심사 진행', description: '심사 중 추가 자료 요청. 정상적 심사 과정.', priceTarget: 14500, impact: 'neutral', volatility: 0.08 },
  { date: '2026-09-01', type: 'DECISION', title: '⭐ 조건부허가 결정', description: '운명의 날. 허가 승인/조건부/반려 결정.', priceTarget: null, impact: 'decision', volatility: 0.4 },
  { date: '2027-03-01', type: 'LAUNCH', title: 'VT-EBV-N 국내 출시', description: '보령제약과 국내 상업화 시작. 첫 매출 발생.', priceTarget: 22000, impact: 'positive', volatility: 0.1 },
  { date: '2027-06-01', type: 'CHINA', title: '중국 L/O 계약 체결', description: '중국 기술이전 계약. 업프론트 200억원 + 마일스톤.', priceTarget: 28000, impact: 'very_positive', volatility: 0.15 },
];

const NEWS_TEMPLATES: Record<string, string[]> = {
  positive: [
    "증권가 \"바이젠셀, 세포치료제 게임체인저\"...목표가 상향",
    "외국인, 바이젠셀 3거래일 연속 순매수",
    "바이젠셀, 기관 투자자 관심 증가...거래량 급증",
    "전문가 \"VT-EBV-N, 글로벌 경쟁력 충분\"",
    "바이오 섹터 강세...바이젠셀 수혜 기대",
  ],
  negative: [
    "코스닥 바이오 약세...바이젠셀도 하락",
    "개인 투자자 차익실현 매물 출회",
    "증권가 \"바이오 투자심리 위축 우려\"",
    "거래량 급감...관망세 지속",
    "외국인·기관 순매도 전환",
  ],
  neutral: [
    "바이젠셀, 박스권 등락 지속",
    "바이오 섹터 혼조세...종목별 차별화",
    "증시 관망세 속 바이젠셀 보합",
    "기관 '관망'...거래량 평이",
    "바이젠셀, 이벤트 대기 중",
  ]
};

const MENTAL_STATES: Record<number, MentalState> = {
  100: { emoji: '😎', text: '철벽 멘탈', color: '#22c55e' },
  80: { emoji: '😊', text: '안정적', color: '#84cc16' },
  60: { emoji: '😐', text: '보통', color: '#eab308' },
  40: { emoji: '😰', text: '불안함', color: '#f97316' },
  20: { emoji: '😱', text: '패닉', color: '#ef4444' },
  0: { emoji: '💀', text: '멘탈 붕괴', color: '#991b1b' },
};

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_buy', name: '첫 매수', desc: '처음으로 바이젠셀을 매수했습니다', icon: '🎯' },
  { id: 'diamond_hands', name: '다이아몬드 핸드', desc: '50% 하락에도 홀딩', icon: '💎' },
  { id: 'bottom_fisher', name: '바닥 낚시꾼', desc: '최저점 근처에서 매수', icon: '🎣' },
  { id: 'profit_100', name: '더블', desc: '100% 수익 달성', icon: '🚀' },
  { id: 'profit_300', name: '4배 달성', desc: '300% 수익 달성', icon: '🌟' },
  { id: 'survivor', name: '생존자', desc: '2023년 폭락장 생존', icon: '🏆' },
  { id: 'clinical_winner', name: '임상 승자', desc: '임상 성공 이벤트 경험', icon: '🏅' },
  { id: 'approval_holder', name: '허가 홀더', desc: '조건부허가까지 홀딩', icon: '👑' },
];

interface VigencellGameProps {
  isDemo?: boolean;
  onGameEnd?: (stats: Stats, portfolioValue: number, achievements: string[]) => void;
}

export default function VigencellGame({ isDemo = false, onGameEnd }: VigencellGameProps) {
  // 게임 상태
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'ended'>('menu');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');

  // 시간 관련
  const [currentDate, setCurrentDate] = useState(new Date('2021-08-25'));
  const [gameSpeed, setGameSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // 가격 관련
  const [currentPrice, setCurrentPrice] = useState(39078);
  const [priceHistory, setPriceHistory] = useState<{date: string; price: number}[]>([{ date: '2021-08-25', price: 39078 }]);
  const [dailyChange, setDailyChange] = useState(0);

  // 포트폴리오
  const [cash, setCash] = useState(50000000);
  const [shares, setShares] = useState(0);
  const [avgCost, setAvgCost] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [realizedProfit, setRealizedProfit] = useState(0);

  // 거래 기록
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tradeAmount, setTradeAmount] = useState(100);

  // 멘탈 & 이벤트
  const [mental, setMental] = useState(100);
  const [currentEvent, setCurrentEvent] = useState<HistoricalEvent | null>(null);
  const [newsQueue, setNewsQueue] = useState<News[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 업적 & 통계
  const [achievements, setAchievements] = useState<string[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    maxProfit: 0,
    maxLoss: 0,
    daysPlayed: 0,
  });

  // 시나리오 결과
  const [approvalResult, setApprovalResult] = useState<string | null>(null);
  const [eventIndex, setEventIndex] = useState(0);

  // 계산값들
  const portfolioValue = cash + (shares * currentPrice);
  const unrealizedProfit = shares > 0 ? (currentPrice - avgCost) * shares : 0;
  const unrealizedProfitPercent = shares > 0 && avgCost > 0 ? ((currentPrice - avgCost) / avgCost) * 100 : 0;
  const totalProfit = unrealizedProfit + realizedProfit;

  // 멘탈 상태 가져오기
  const getMentalState = (value: number): MentalState => {
    if (value >= 80) return MENTAL_STATES[100];
    if (value >= 60) return MENTAL_STATES[80];
    if (value >= 40) return MENTAL_STATES[60];
    if (value >= 20) return MENTAL_STATES[40];
    if (value > 0) return MENTAL_STATES[20];
    return MENTAL_STATES[0];
  };

  // 알림 추가
  const addNotification = useCallback((message: string) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // 업적 확인
  const checkAchievements = useCallback(() => {
    const newAchievements = [...achievements];

    if (shares > 0 && !achievements.includes('first_buy')) {
      newAchievements.push('first_buy');
      addNotification('🎯 업적 달성: 첫 매수!');
    }

    if (unrealizedProfitPercent <= -50 && shares > 0 && !achievements.includes('diamond_hands')) {
      newAchievements.push('diamond_hands');
      addNotification('💎 업적 달성: 다이아몬드 핸드!');
    }

    if (currentPrice <= 3000 && shares > 0 && !achievements.includes('bottom_fisher')) {
      newAchievements.push('bottom_fisher');
      addNotification('🎣 업적 달성: 바닥 낚시꾼!');
    }

    if (unrealizedProfitPercent >= 100 && !achievements.includes('profit_100')) {
      newAchievements.push('profit_100');
      addNotification('🚀 업적 달성: 더블!');
    }

    if (unrealizedProfitPercent >= 300 && !achievements.includes('profit_300')) {
      newAchievements.push('profit_300');
      addNotification('🌟 업적 달성: 4배 달성!');
    }

    if (currentDate >= new Date('2024-01-01') && shares > 0 && !achievements.includes('survivor')) {
      newAchievements.push('survivor');
      addNotification('🏆 업적 달성: 생존자!');
    }

    if (newAchievements.length !== achievements.length) {
      setAchievements(newAchievements);
    }
  }, [achievements, shares, unrealizedProfitPercent, currentPrice, currentDate, addNotification]);

  // 가격 시뮬레이션
  const simulatePrice = useCallback((basePrice: number, volatility: number, trend: string): number => {
    const randomFactor = (Math.random() - 0.5) * 2 * volatility;
    const trendFactor = trend === 'positive' ? 0.002 : trend === 'negative' ? -0.002 : 0;
    const newPrice = basePrice * (1 + randomFactor + trendFactor);
    return Math.max(1000, Math.round(newPrice));
  }, []);

  // 매수
  const handleBuy = () => {
    if (gameState !== 'playing' || isPaused) return;

    const cost = currentPrice * tradeAmount;
    if (cost > cash) {
      addNotification('❌ 현금이 부족합니다!');
      return;
    }

    const newShares = shares + tradeAmount;
    const newTotalInvested = totalInvested + cost;
    const newAvgCost = shares === 0 ? currentPrice : ((avgCost * shares) + cost) / newShares;

    setCash(cash - cost);
    setShares(newShares);
    setAvgCost(newAvgCost);
    setTotalInvested(newTotalInvested);

    const trade: Trade = {
      type: 'BUY',
      date: currentDate.toISOString().split('T')[0],
      price: currentPrice,
      amount: tradeAmount,
      total: cost,
    };
    setTrades([...trades, trade]);
    setStats(prev => ({ ...prev, totalTrades: prev.totalTrades + 1 }));

    if (currentPrice > avgCost * 1.1) {
      setMental(prev => Math.min(100, prev + 2));
    }

    addNotification(`✅ ${tradeAmount}주 매수 @ ${currentPrice.toLocaleString()}원`);
    checkAchievements();
  };

  // 매도
  const handleSell = () => {
    if (gameState !== 'playing' || isPaused) return;

    const sellAmount = Math.min(tradeAmount, shares);
    if (sellAmount <= 0) {
      addNotification('❌ 보유 주식이 없습니다!');
      return;
    }

    const revenue = currentPrice * sellAmount;
    const costBasis = avgCost * sellAmount;
    const profit = revenue - costBasis;

    setCash(cash + revenue);
    setShares(shares - sellAmount);
    setRealizedProfit(realizedProfit + profit);

    if (shares - sellAmount === 0) {
      setAvgCost(0);
    }

    const trade: Trade = {
      type: 'SELL',
      date: currentDate.toISOString().split('T')[0],
      price: currentPrice,
      amount: sellAmount,
      total: revenue,
      profit: profit,
    };
    setTrades([...trades, trade]);

    setStats(prev => ({
      ...prev,
      totalTrades: prev.totalTrades + 1,
      winningTrades: profit > 0 ? prev.winningTrades + 1 : prev.winningTrades,
      losingTrades: profit < 0 ? prev.losingTrades + 1 : prev.losingTrades,
      maxProfit: Math.max(prev.maxProfit, profit),
      maxLoss: Math.min(prev.maxLoss, profit),
    }));

    if (profit > 0) {
      setMental(prev => Math.min(100, prev + 5));
      addNotification(`✅ ${sellAmount}주 매도 @ ${currentPrice.toLocaleString()}원 (+${profit.toLocaleString()}원)`);
    } else {
      setMental(prev => Math.max(0, prev - 3));
      addNotification(`📉 ${sellAmount}주 매도 @ ${currentPrice.toLocaleString()}원 (${profit.toLocaleString()}원)`);
    }
  };

  // 게임 루프
  useEffect(() => {
    if (gameState !== 'playing' || isPaused) return;

    const interval = setInterval(() => {
      setCurrentDate(prev => {
        const newDate = new Date(prev);
        newDate.setDate(newDate.getDate() + 1);
        return newDate;
      });
    }, 1000 / gameSpeed);

    return () => clearInterval(interval);
  }, [gameState, isPaused, gameSpeed]);

  // 날짜 변경 시 가격 업데이트
  useEffect(() => {
    if (gameState !== 'playing') return;

    const dateStr = currentDate.toISOString().split('T')[0];

    const event = HISTORICAL_EVENTS.find(e => e.date === dateStr);
    if (event) {
      setCurrentEvent(event);
      setEventIndex(HISTORICAL_EVENTS.indexOf(event));

      if (event.type === 'DECISION') {
        setIsPaused(true);
        const rand = Math.random();
        let result: string;
        if (rand < 0.6) result = 'approved';
        else if (rand < 0.85) result = 'conditional';
        else result = 'rejected';
        setApprovalResult(result);
      } else if (event.priceTarget) {
        setCurrentPrice(event.priceTarget);
      }

      if (event.impact === 'very_positive') {
        setMental(prev => Math.min(100, prev + 20));
        if (!achievements.includes('clinical_winner') && event.type === 'CATALYST') {
          setAchievements(prev => [...prev, 'clinical_winner']);
          addNotification('🏅 업적 달성: 임상 승자!');
        }
      } else if (event.impact === 'positive') {
        setMental(prev => Math.min(100, prev + 5));
      } else if (event.impact === 'negative') {
        setMental(prev => Math.max(0, prev - 10));
      }

      addNotification(`📢 ${event.title}`);
    } else {
      const lastEvent = HISTORICAL_EVENTS.filter(e => new Date(e.date) <= currentDate).pop();
      const volatility = lastEvent?.volatility || 0.05;
      const trend = lastEvent?.impact === 'positive' || lastEvent?.impact === 'very_positive' ? 'positive' :
                   lastEvent?.impact === 'negative' ? 'negative' : 'neutral';

      setCurrentPrice(prev => {
        const newPrice = simulatePrice(prev, volatility, trend);
        const change = ((newPrice - prev) / prev) * 100;
        setDailyChange(change);

        if (shares > 0) {
          if (change < -5) setMental(m => Math.max(0, m - 5));
          else if (change < -3) setMental(m => Math.max(0, m - 2));
          else if (change > 5) setMental(m => Math.min(100, m + 3));
          else if (change > 3) setMental(m => Math.min(100, m + 1));
        }

        return newPrice;
      });

      if (Math.random() < 0.1) {
        const newsType = Math.random() < 0.33 ? 'positive' : Math.random() < 0.5 ? 'negative' : 'neutral';
        const newsArray = NEWS_TEMPLATES[newsType];
        const news = newsArray[Math.floor(Math.random() * newsArray.length)];
        setNewsQueue(prev => [{ date: dateStr, text: news, type: newsType }, ...prev].slice(0, 10));
      }
    }

    setPriceHistory(prev => [...prev, { date: dateStr, price: currentPrice }].slice(-100));
    setStats(prev => ({ ...prev, daysPlayed: prev.daysPlayed + 1 }));

    if (currentDate >= new Date('2027-12-31')) {
      setGameState('ended');
      if (onGameEnd) {
        onGameEnd(stats, portfolioValue, achievements);
      }
    }

    checkAchievements();
  }, [currentDate, gameState, simulatePrice, shares, achievements, addNotification, checkAchievements, stats, portfolioValue, onGameEnd, currentPrice]);

  // 허가 결정 처리
  const handleApprovalDecision = () => {
    if (approvalResult === 'approved') {
      setCurrentPrice(22000);
      setMental(100);
      addNotification('🎉 조건부허가 승인! 주가 급등!');
      if (shares > 0) {
        setAchievements(prev => [...prev, 'approval_holder']);
        addNotification('👑 업적 달성: 허가 홀더!');
      }
    } else if (approvalResult === 'conditional') {
      setCurrentPrice(16000);
      setMental(prev => Math.min(100, prev + 10));
      addNotification('⚠️ 조건부 승인. 추가 임상 조건 부여.');
    } else {
      setCurrentPrice(6000);
      setMental(prev => Math.max(0, prev - 40));
      addNotification('❌ 허가 반려. 주가 급락...');
    }
    setApprovalResult(null);
    setIsPaused(false);
  };

  // 게임 시작
  const startGame = (diff: 'easy' | 'normal' | 'hard') => {
    setDifficulty(diff);
    setCash(diff === 'easy' ? 100000000 : diff === 'normal' ? 50000000 : 30000000);
    setGameState('playing');
    setCurrentDate(new Date('2021-08-25'));
    setCurrentPrice(39078);
    setShares(0);
    setAvgCost(0);
    setTotalInvested(0);
    setRealizedProfit(0);
    setMental(100);
    setTrades([]);
    setAchievements([]);
    setPriceHistory([{ date: '2021-08-25', price: 39078 }]);
    setNewsQueue([]);
    setEventIndex(0);
  };

  // 미니 차트
  const renderMiniChart = () => {
    if (priceHistory.length < 2) return null;

    const maxPrice = Math.max(...priceHistory.map(p => p.price));
    const minPrice = Math.min(...priceHistory.map(p => p.price));
    const range = maxPrice - minPrice || 1;

    const points = priceHistory.map((p, i) => {
      const x = (i / (priceHistory.length - 1)) * 280;
      const y = 80 - ((p.price - minPrice) / range) * 70;
      return `${x},${y}`;
    }).join(' ');

    const color = priceHistory[priceHistory.length - 1].price >= priceHistory[0].price ? '#22c55e' : '#ef4444';

    return (
      <svg width="100%" height="90" viewBox="0 0 280 90" className="mt-2">
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
        <text x="5" y="15" fontSize="10" fill="#888">{maxPrice.toLocaleString()}</text>
        <text x="5" y="85" fontSize="10" fill="#888">{minPrice.toLocaleString()}</text>
      </svg>
    );
  };

  // 메뉴 화면
  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-blue-500/30">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">🧬 바이젠셀</h1>
            <h2 className="text-xl md:text-2xl text-blue-400">투자 마스터</h2>
            <p className="text-gray-400 mt-4 text-sm md:text-base">
              2021년 IPO부터 2027년까지<br />바이젠셀의 여정을 함께하세요
            </p>
            {isDemo && (
              <div className="mt-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                <p className="text-yellow-400 text-sm">🎮 데모 모드로 실행됩니다</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">🎮 난이도 선택</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => startGame('easy')}
                  className="bg-green-600 hover:bg-green-500 text-white py-3 px-2 md:px-4 rounded-lg transition-all"
                >
                  <div className="font-bold text-sm md:text-base">쉬움</div>
                  <div className="text-xs opacity-80">1억원</div>
                </button>
                <button
                  onClick={() => startGame('normal')}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white py-3 px-2 md:px-4 rounded-lg transition-all"
                >
                  <div className="font-bold text-sm md:text-base">보통</div>
                  <div className="text-xs opacity-80">5천만원</div>
                </button>
                <button
                  onClick={() => startGame('hard')}
                  className="bg-red-600 hover:bg-red-500 text-white py-3 px-2 md:px-4 rounded-lg transition-all"
                >
                  <div className="font-bold text-sm md:text-base">어려움</div>
                  <div className="text-xs opacity-80">3천만원</div>
                </button>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">📋 게임 설명</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• 실제 바이젠셀 주가 흐름 기반</li>
                <li>• 임상 결과, 허가 등 실제 이벤트 반영</li>
                <li>• 멘탈 관리와 분할매매 전략 실습</li>
                <li>• 다양한 업적과 엔딩</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 게임 종료 화면
  if (gameState === 'ended') {
    const initialCash = difficulty === 'easy' ? 100000000 : difficulty === 'normal' ? 50000000 : 30000000;
    const finalReturn = ((portfolioValue - initialCash) / initialCash) * 100;
    let ending = '';
    let endingEmoji = '';

    if (finalReturn >= 500) { ending = '전설의 투자자'; endingEmoji = '👑'; }
    else if (finalReturn >= 200) { ending = '성공한 투자자'; endingEmoji = '🏆'; }
    else if (finalReturn >= 50) { ending = '수익 실현'; endingEmoji = '📈'; }
    else if (finalReturn >= 0) { ending = '본전 치기'; endingEmoji = '😅'; }
    else if (finalReturn >= -50) { ending = '손실 감수'; endingEmoji = '📉'; }
    else { ending = '파산 위기'; endingEmoji = '💸'; }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-blue-500/30">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{endingEmoji}</div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">게임 종료</h1>
            <h2 className="text-lg md:text-xl text-blue-400">{ending}</h2>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-3">📊 최종 성적</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">최종 자산</div>
                <div className="text-white font-bold">{portfolioValue.toLocaleString()}원</div>
              </div>
              <div>
                <div className="text-gray-400">총 수익률</div>
                <div className={`font-bold ${finalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {finalReturn >= 0 ? '+' : ''}{finalReturn.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-gray-400">총 거래 횟수</div>
                <div className="text-white font-bold">{stats.totalTrades}회</div>
              </div>
              <div>
                <div className="text-gray-400">승률</div>
                <div className="text-white font-bold">
                  {stats.totalTrades > 0 ? ((stats.winningTrades / stats.totalTrades) * 100).toFixed(0) : 0}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-3">🏅 획득 업적 ({achievements.length}/{ACHIEVEMENTS.length})</h3>
            <div className="flex flex-wrap gap-2">
              {achievements.map(a => {
                const ach = ACHIEVEMENTS.find(x => x.id === a);
                return ach ? (
                  <span key={a} className="bg-blue-600 text-white text-xs px-2 py-1 rounded" title={ach.desc}>
                    {ach.icon} {ach.name}
                  </span>
                ) : null;
              })}
              {achievements.length === 0 && <span className="text-gray-400 text-sm">업적 없음</span>}
            </div>
          </div>

          <button
            onClick={() => setGameState('menu')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-all"
          >
            다시 시작
          </button>
        </div>
      </div>
    );
  }

  // 허가 결정 모달
  if (approvalResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-yellow-500/50">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">⚖️</div>
            <h1 className="text-xl md:text-2xl font-bold text-white mb-2">식약처 조건부허가 결정</h1>
            <p className="text-gray-400">2026년 9월 1일</p>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <div className="text-center">
              {approvalResult === 'approved' && (
                <>
                  <div className="text-4xl mb-2">🎉</div>
                  <div className="text-green-400 text-xl font-bold">허가 승인!</div>
                  <p className="text-gray-300 mt-2">VT-EBV-N이 조건부허가를 획득했습니다!</p>
                </>
              )}
              {approvalResult === 'conditional' && (
                <>
                  <div className="text-4xl mb-2">⚠️</div>
                  <div className="text-yellow-400 text-xl font-bold">조건부 승인</div>
                  <p className="text-gray-300 mt-2">추가 시판 후 임상 조건이 부여되었습니다.</p>
                </>
              )}
              {approvalResult === 'rejected' && (
                <>
                  <div className="text-4xl mb-2">❌</div>
                  <div className="text-red-400 text-xl font-bold">허가 반려</div>
                  <p className="text-gray-300 mt-2">추가 데이터 제출이 요구되었습니다.</p>
                </>
              )}
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-400 mb-2">현재 포지션</div>
            <div className="text-white">
              보유: {shares.toLocaleString()}주 (평단가: {avgCost.toLocaleString()}원)
            </div>
            <div className={`${unrealizedProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              평가손익: {unrealizedProfit >= 0 ? '+' : ''}{unrealizedProfit.toLocaleString()}원
            </div>
          </div>

          <button
            onClick={handleApprovalDecision}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-all"
          >
            결과 확인
          </button>
        </div>
      </div>
    );
  }

  // 메인 게임 화면
  return (
    <div className="min-h-screen bg-gray-900 text-white safe-area-top safe-area-bottom">
      {/* 알림 */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-xs">
        {notifications.map(n => (
          <div key={n.id} className="bg-gray-800 border border-blue-500 px-4 py-2 rounded-lg shadow-lg animate-fade-in text-sm">
            {n.message}
          </div>
        ))}
      </div>

      {/* 상단 바 */}
      <div className="bg-gray-800 border-b border-gray-700 px-3 md:px-4 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-lg md:text-xl font-bold">🧬</span>
            <span className="text-gray-400 text-sm md:text-base">{currentDate.toLocaleDateString('ko-KR')}</span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-gray-400 text-sm">속도:</span>
              {[1, 2, 5, 10].map(s => (
                <button
                  key={s}
                  onClick={() => setGameSpeed(s)}
                  className={`px-2 py-1 rounded text-sm ${gameSpeed === s ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  {s}x
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 md:px-4 py-1 rounded text-sm ${isPaused ? 'bg-green-600' : 'bg-yellow-600'}`}
            >
              {isPaused ? '▶️' : '⏸️'}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 속도 조절 */}
      <div className="sm:hidden bg-gray-800 border-b border-gray-700 px-3 py-2">
        <div className="flex items-center justify-center gap-2">
          <span className="text-gray-400 text-sm">속도:</span>
          {[1, 2, 5, 10].map(s => (
            <button
              key={s}
              onClick={() => setGameSpeed(s)}
              className={`px-3 py-1 rounded text-sm ${gameSpeed === s ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-6xl mx-auto p-3 md:p-4 grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        {/* 왼쪽: 주가 정보 */}
        <div className="lg:col-span-2 space-y-3 md:space-y-4">
          {/* 주가 카드 */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-sm md:text-lg text-gray-400">바이젠셀 (308080)</h2>
                <div className="text-2xl md:text-3xl font-bold">{currentPrice.toLocaleString()}원</div>
                <div className={`text-sm ${dailyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {dailyChange >= 0 ? '▲' : '▼'} {Math.abs(dailyChange).toFixed(2)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-xs md:text-sm">시가총액</div>
                <div className="text-white text-sm md:text-base">{(currentPrice * 20460000 / 100000000).toFixed(0)}억원</div>
              </div>
            </div>
            {renderMiniChart()}
          </div>

          {/* 이벤트 카드 */}
          {currentEvent && (
            <div className={`rounded-xl p-4 border ${
              currentEvent.impact === 'very_positive' ? 'bg-green-900/30 border-green-500' :
              currentEvent.impact === 'positive' ? 'bg-blue-900/30 border-blue-500' :
              currentEvent.impact === 'negative' ? 'bg-red-900/30 border-red-500' :
              'bg-gray-800 border-gray-700'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {currentEvent.type === 'CATALYST' ? '⭐' :
                   currentEvent.type === 'IPO' ? '🎉' :
                   currentEvent.type === 'BOTTOM' ? '📉' :
                   currentEvent.type === 'SURGE' ? '🚀' :
                   currentEvent.type === 'MAJOR' ? '📢' : '📌'}
                </span>
                <span className="font-bold text-sm md:text-base">{currentEvent.title}</span>
              </div>
              <p className="text-gray-300 text-xs md:text-sm">{currentEvent.description}</p>
            </div>
          )}

          {/* 뉴스 피드 */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="font-semibold mb-3 text-sm md:text-base">📰 뉴스</h3>
            <div className="space-y-2 max-h-32 md:max-h-40 overflow-y-auto">
              {newsQueue.length > 0 ? newsQueue.map((news, i) => (
                <div key={i} className="text-xs md:text-sm border-b border-gray-700 pb-2">
                  <span className="text-gray-500">{news.date}</span>
                  <span className={`ml-2 ${
                    news.type === 'positive' ? 'text-green-400' :
                    news.type === 'negative' ? 'text-red-400' : 'text-gray-300'
                  }`}>{news.text}</span>
                </div>
              )) : (
                <div className="text-gray-500 text-xs md:text-sm">뉴스가 없습니다</div>
              )}
            </div>
          </div>

          {/* 거래 패널 */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="font-semibold mb-3 text-sm md:text-base">💹 거래</h3>
            <div className="flex items-center gap-2 md:gap-4 mb-4">
              <div className="flex-1">
                <label className="text-gray-400 text-xs md:text-sm">수량</label>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mt-1 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="text-gray-400 text-xs md:text-sm">예상 금액</label>
                <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 mt-1 text-sm">
                  {(currentPrice * tradeAmount).toLocaleString()}원
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[10, 50, 100, 500].map(amt => (
                <button
                  key={amt}
                  onClick={() => setTradeAmount(amt)}
                  className="bg-gray-700 hover:bg-gray-600 py-1 md:py-2 rounded text-xs md:text-sm"
                >
                  {amt}주
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <button
                onClick={handleBuy}
                disabled={isPaused || cash < currentPrice * tradeAmount}
                className="bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 md:py-4 rounded-lg font-bold transition-all text-sm md:text-base"
              >
                매수
              </button>
              <button
                onClick={handleSell}
                disabled={isPaused || shares < tradeAmount}
                className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 md:py-4 rounded-lg font-bold transition-all text-sm md:text-base"
              >
                매도
              </button>
            </div>
          </div>
        </div>

        {/* 오른쪽: 포트폴리오 */}
        <div className="space-y-3 md:space-y-4">
          {/* 멘탈 게이지 */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm md:text-base">🧠 멘탈</span>
              <span style={{ color: getMentalState(mental).color }} className="text-sm">
                {getMentalState(mental).emoji} {getMentalState(mental).text}
              </span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${mental}%`, backgroundColor: getMentalState(mental).color }}
              />
            </div>
          </div>

          {/* 포트폴리오 */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="font-semibold mb-3 text-sm md:text-base">💰 포트폴리오</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">현금</span>
                <span>{cash.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">보유 주식</span>
                <span>{shares.toLocaleString()}주</span>
              </div>
              {shares > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">평균단가</span>
                    <span>{avgCost.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">평가금액</span>
                    <span>{(shares * currentPrice).toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">평가손익</span>
                    <span className={unrealizedProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {unrealizedProfit >= 0 ? '+' : ''}{unrealizedProfit.toLocaleString()}원
                      ({unrealizedProfitPercent >= 0 ? '+' : ''}{unrealizedProfitPercent.toFixed(1)}%)
                    </span>
                  </div>
                </>
              )}
              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">총 자산</span>
                  <span className="font-bold">{portfolioValue.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">총 수익</span>
                  <span className={totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 업적 */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="font-semibold mb-3 text-sm md:text-base">🏅 업적 ({achievements.length}/{ACHIEVEMENTS.length})</h3>
            <div className="flex flex-wrap gap-1 md:gap-2">
              {ACHIEVEMENTS.map(a => {
                const unlocked = achievements.includes(a.id);
                return (
                  <span
                    key={a.id}
                    className={`text-xs px-2 py-1 rounded ${unlocked ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-500'}`}
                    title={a.desc}
                  >
                    {a.icon} {a.name}
                  </span>
                );
              })}
            </div>
          </div>

          {/* 최근 거래 */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="font-semibold mb-3 text-sm md:text-base">📜 최근 거래</h3>
            <div className="space-y-2 max-h-24 md:max-h-32 overflow-y-auto">
              {trades.slice(-5).reverse().map((t, i) => (
                <div key={i} className="text-xs md:text-sm flex justify-between">
                  <span className={t.type === 'BUY' ? 'text-red-400' : 'text-blue-400'}>
                    {t.type === 'BUY' ? '매수' : '매도'} {t.amount}주
                  </span>
                  <span className="text-gray-400">@{t.price.toLocaleString()}</span>
                </div>
              ))}
              {trades.length === 0 && <div className="text-gray-500 text-xs md:text-sm">거래 내역 없음</div>}
            </div>
          </div>

          {/* 이벤트 타임라인 */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="font-semibold mb-3 text-sm md:text-base">📅 주요 일정</h3>
            <div className="space-y-2 max-h-32 md:max-h-40 overflow-y-auto text-xs md:text-sm">
              {HISTORICAL_EVENTS.slice(eventIndex, eventIndex + 5).map((e, i) => (
                <div key={i} className={`flex items-center gap-2 ${i === 0 ? 'text-blue-400' : 'text-gray-500'}`}>
                  <span className="text-xs flex-shrink-0">{e.date}</span>
                  <span className="truncate">{e.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
