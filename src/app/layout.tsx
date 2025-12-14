import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export const metadata: Metadata = {
  title: '바이젠셀 투자 마스터 - 주식 투자 시뮬레이션 게임',
  description: '실제 바이젠셀 주가 데이터를 기반으로 한 투자 시뮬레이션 게임. IPO부터 조건부허가까지의 여정을 경험하세요.',
  keywords: ['바이젠셀', '주식', '투자', '시뮬레이션', '게임', '세포치료제', 'VT-EBV-N'],
  authors: [{ name: 'Vigencell Trading Master' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '바이젠셀 투자 마스터',
  },
  openGraph: {
    title: '바이젠셀 투자 마스터',
    description: '실제 데이터 기반 주식 투자 시뮬레이션 게임',
    type: 'website',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '바이젠셀 투자 마스터',
    description: '실제 데이터 기반 주식 투자 시뮬레이션 게임',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="antialiased">
        <ServiceWorkerRegistration />
        {children}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
