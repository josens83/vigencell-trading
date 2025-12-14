'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration);

            // 업데이트 확인
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      // 새 버전 사용 가능
                      console.log('New content available');
                    } else {
                      // 콘텐츠 캐시됨
                      console.log('Content cached for offline use');
                    }
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.error('SW registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
