import VigencellGame from '@/components/game/VigencellGame';

export const metadata = {
  title: '데모 플레이 - 바이젠셀 투자 마스터',
  description: '무료 데모로 바이젠셀 투자 시뮬레이션을 체험하세요',
};

export default function DemoGamePage() {
  return <VigencellGame isDemo={true} />;
}
