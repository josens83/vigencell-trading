'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧬</span>
              <span className="text-xl font-bold text-white">바이젠셀 투자 마스터</span>
            </div>

            {/* 데스크톱 메뉴 */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">특징</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">요금제</a>
              <a href="#leaderboard" className="text-gray-300 hover:text-white transition-colors">리더보드</a>
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">로그인</Link>
              <Link href="/register" className="btn-primary text-sm py-2 px-4">무료 시작</Link>
            </div>

            {/* 모바일 메뉴 버튼 */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900/95 border-b border-white/10">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-gray-300 hover:text-white py-2">특징</a>
              <a href="#pricing" className="block text-gray-300 hover:text-white py-2">요금제</a>
              <a href="#leaderboard" className="block text-gray-300 hover:text-white py-2">리더보드</a>
              <Link href="/login" className="block text-gray-300 hover:text-white py-2">로그인</Link>
              <Link href="/register" className="block btn-primary text-center py-3 mt-2">무료 시작</Link>
            </div>
          </div>
        )}
      </nav>

      {/* 히어로 섹션 */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-float mb-8">
            <span className="text-8xl">🧬</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            바이젠셀
            <span className="gradient-text block mt-2">투자 마스터</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            2021년 IPO부터 2027년까지<br className="md:hidden" />
            실제 데이터로 배우는 주식 투자 시뮬레이션
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/register" className="btn-primary text-lg py-4 px-8 w-full sm:w-auto">
              🎮 무료로 시작하기
            </Link>
            <Link href="/game/demo" className="btn-secondary text-lg py-4 px-8 w-full sm:w-auto">
              👀 데모 체험
            </Link>
          </div>

          {/* 주요 지표 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: 'IPO 가격', value: '52,700원' },
              { label: '최저점', value: '2,305원', sub: '-95.6%' },
              { label: '급등 고점', value: '17,360원', sub: '+654%' },
              { label: '임상 성공', value: 'p=0.0347' },
            ].map((stat, i) => (
              <div key={i} className="glass-effect rounded-xl p-4">
                <div className="text-gray-400 text-sm">{stat.label}</div>
                <div className="text-white font-bold text-xl">{stat.value}</div>
                {stat.sub && (
                  <div className={`text-sm ${stat.sub.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.sub}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section id="features" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            🎯 게임 특징
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '📈',
                title: '실제 데이터 기반',
                desc: 'IPO부터 임상 성공, 조건부허가까지 실제 바이젠셀 주가 흐름을 그대로 재현'
              },
              {
                icon: '📰',
                title: '실시간 뉴스 피드',
                desc: '주가에 영향을 미치는 다양한 뉴스와 이벤트를 실시간으로 경험'
              },
              {
                icon: '🧠',
                title: '멘탈 관리 시스템',
                desc: '급락장에서의 심리적 압박감을 체험하고 멘탈 관리 능력 향상'
              },
              {
                icon: '💹',
                title: '분할매매 전략',
                desc: '평단가 관리와 분할 매수/매도 전략을 실전처럼 연습'
              },
              {
                icon: '🏆',
                title: '업적 시스템',
                desc: '다양한 도전 과제를 달성하고 업적을 수집하세요'
              },
              {
                icon: '🎬',
                title: '멀티 엔딩',
                desc: '당신의 투자 결과에 따라 다양한 엔딩을 경험'
              },
            ].map((feature, i) => (
              <div key={i} className="game-card p-6 card-hover">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 타임라인 섹션 */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            📅 바이젠셀 타임라인
          </h2>

          <div className="space-y-8">
            {[
              { date: '2021.08', event: 'IPO 상장', desc: '공모가 52,700원으로 코스닥 상장', type: 'neutral' },
              { date: '2023.12', event: '역사적 최저점', desc: '2,305원 (공모가 대비 -95.6%)', type: 'negative' },
              { date: '2025.01', event: '최대주주 변경', desc: '테라베스트 그룹 편입', type: 'positive' },
              { date: '2025.11', event: '임상 2상 성공!', desc: '2년 DFS 95% 달성, p=0.0347', type: 'very_positive' },
              { date: '2025.12', event: '연속 상한가', desc: '5연속 상한가, 17,360원 기록', type: 'positive' },
              { date: '2026.09', event: '허가 결정', desc: '조건부허가 심사 결과 발표', type: 'decision' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-blue-400 font-mono">{item.date}</span>
                </div>
                <div className="flex-shrink-0">
                  <div className={`w-4 h-4 rounded-full ${
                    item.type === 'very_positive' ? 'bg-green-500 animate-pulse' :
                    item.type === 'positive' ? 'bg-blue-500' :
                    item.type === 'negative' ? 'bg-red-500' :
                    item.type === 'decision' ? 'bg-yellow-500 animate-pulse' :
                    'bg-gray-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold">{item.event}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 요금제 섹션 */}
      <section id="pricing" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            💎 요금제
          </h2>
          <p className="text-gray-400 text-center mb-12">
            무료로 시작하고, 프리미엄 기능으로 업그레이드하세요
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {/* 무료 플랜 */}
            <div className="game-card p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">무료</h3>
                <div className="text-4xl font-bold text-white mb-2">₩0</div>
                <div className="text-gray-400">영원히 무료</div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 데모 게임 1회
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 기본 튜토리얼
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 업적 5개
                </li>
                <li className="flex items-center gap-2 text-gray-500">
                  <span>✗</span> 저장 기능
                </li>
                <li className="flex items-center gap-2 text-gray-500">
                  <span>✗</span> 리더보드
                </li>
              </ul>
              <Link href="/register" className="block btn-secondary text-center py-3 w-full">
                무료로 시작
              </Link>
            </div>

            {/* 베이직 플랜 */}
            <div className="game-card p-6 border-blue-500/50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-sm py-1 px-4 rounded-full">
                인기
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">베이직</h3>
                <div className="text-4xl font-bold text-white mb-2">₩9,900</div>
                <div className="text-gray-400">월간 구독</div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 무제한 게임
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 저장 슬롯 3개
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 전체 업적 (8개)
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 월간 리더보드
                </li>
                <li className="flex items-center gap-2 text-gray-500">
                  <span>✗</span> 프리미엄 시나리오
                </li>
              </ul>
              <Link href="/register?plan=basic" className="block btn-primary text-center py-3 w-full">
                구독하기
              </Link>
            </div>

            {/* 프리미엄 플랜 */}
            <div className="game-card p-6 border-purple-500/50">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">프리미엄</h3>
                <div className="text-4xl font-bold text-white mb-2">₩79,000</div>
                <div className="text-gray-400">연간 구독 <span className="text-green-400">(33% 할인)</span></div>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 베이직 전체 기능
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 프리미엄 시나리오
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 다른 종목 시나리오
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 상세 통계 분석
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span> 우선 지원
                </li>
              </ul>
              <Link href="/register?plan=premium" className="block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 px-6 rounded-xl text-center transition-all">
                연간 구독
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 리더보드 미리보기 */}
      <section id="leaderboard" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            🏆 리더보드
          </h2>
          <p className="text-gray-400 text-center mb-12">
            다른 투자자들과 실력을 겨뤄보세요
          </p>

          <div className="game-card overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-white font-bold">2024년 12월 랭킹</span>
                <span className="text-gray-400 text-sm">총 1,234명 참여</span>
              </div>
            </div>
            <div className="divide-y divide-gray-700/50">
              {[
                { rank: 1, name: '투자의신', return: '+542%', icon: '👑' },
                { rank: 2, name: '다이아핸드', return: '+489%', icon: '🥈' },
                { rank: 3, name: '바이젠셀러버', return: '+421%', icon: '🥉' },
                { rank: 4, name: '임상마스터', return: '+398%', icon: '' },
                { rank: 5, name: '주식초보', return: '+356%', icon: '' },
              ].map((player) => (
                <div key={player.rank} className="flex items-center p-4 hover:bg-white/5 transition-colors">
                  <div className="w-12 text-center">
                    {player.icon || <span className="text-gray-400">{player.rank}</span>}
                  </div>
                  <div className="flex-1 text-white font-medium">{player.name}</div>
                  <div className="text-green-400 font-bold">{player.return}</div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-800/50 text-center">
              <Link href="/register" className="text-blue-400 hover:text-blue-300">
                로그인하고 랭킹에 도전하기 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금 바로 시작하세요!
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            실제 데이터로 배우는 주식 투자, 리스크 없이 경험하세요
          </p>
          <Link href="/register" className="inline-block btn-primary text-lg py-4 px-12">
            🎮 무료로 게임 시작
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🧬</span>
                <span className="text-xl font-bold text-white">바이젠셀 투자 마스터</span>
              </div>
              <p className="text-gray-400 text-sm">
                실제 데이터 기반 주식 투자 시뮬레이션 게임
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">서비스</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/game/demo" className="hover:text-white">데모 플레이</Link></li>
                <li><Link href="/pricing" className="hover:text-white">요금제</Link></li>
                <li><Link href="/leaderboard" className="hover:text-white">리더보드</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">도움말</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-white">문의하기</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">법적 고지</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/terms" className="hover:text-white">이용약관</Link></li>
                <li><Link href="/privacy" className="hover:text-white">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p className="mb-2">
              ⚠️ 본 게임은 교육 목적의 시뮬레이션입니다. 실제 투자 권유가 아닙니다.
            </p>
            <p>
              © 2024 바이젠셀 투자 마스터. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
