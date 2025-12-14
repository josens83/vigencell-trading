'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // iOS 체크
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // 이미 설치된 앱인지 확인
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsStandalone(isStandaloneMode);

    // 설치 프롬프트 이벤트 감지
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // 이미 설치되지 않았고 iOS가 아닌 경우 3초 후 프롬프트 표시
    if (!isStandaloneMode && !isIOSDevice) {
      const timer = setTimeout(() => {
        if (deferredPrompt) {
          setShowPrompt(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // 24시간 동안 다시 표시하지 않음
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // 이미 설치됨 또는 프롬프트 표시 안함
  if (isStandalone || !showPrompt) return null;

  // 이미 dismiss한 경우 24시간 체크
  if (typeof window !== 'undefined') {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) {
      return null;
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gray-800 border border-blue-500/50 rounded-2xl p-4 shadow-2xl max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🧬</div>
          <div className="flex-1">
            <h3 className="text-white font-bold mb-1">앱으로 설치하기</h3>
            <p className="text-gray-400 text-sm mb-3">
              {isIOS
                ? '홈 화면에 추가하여 앱처럼 사용하세요'
                : '더 빠르고 편리하게 게임을 즐기세요'}
            </p>

            {isIOS ? (
              <div className="text-xs text-gray-500">
                Safari에서 <span className="text-blue-400">공유 버튼</span> →{' '}
                <span className="text-blue-400">홈 화면에 추가</span>를 탭하세요
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  설치하기
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-white py-2 px-3 text-sm"
                >
                  나중에
                </button>
              </div>
            )}
          </div>
          {isIOS && (
            <button
              onClick={handleDismiss}
              className="text-gray-500 hover:text-white p-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
