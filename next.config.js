/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // PWA 지원을 위한 헤더 설정
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ];
  },
  // 이미지 최적화
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },
};

module.exports = nextConfig;
