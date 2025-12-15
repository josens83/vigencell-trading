import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full game-card p-8 text-center">
        <div className="text-8xl font-bold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-gray-400 mb-6">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
          <br />
          URL을 확인하시거나 아래 버튼을 클릭해 주세요.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            홈으로
          </Link>
          <Link
            href="/game"
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            게임하기
          </Link>
        </div>
      </div>
    </div>
  );
}
