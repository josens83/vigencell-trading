# 바이젠셀 투자 마스터 🧬

실제 바이젠셀 주가 데이터를 기반으로 한 주식 투자 시뮬레이션 게임입니다.

## 주요 기능

### 게임 특징
- **실제 데이터 기반**: 2021년 IPO부터 2027년까지 실제 주가 흐름 재현
- **실시간 이벤트**: 임상 결과, 허가 신청, 최대주주 변경 등 실제 이벤트 반영
- **뉴스 피드**: 주가에 영향을 미치는 다양한 뉴스 시뮬레이션
- **멘탈 관리**: 급락장에서의 심리적 압박감 체험
- **분할매매**: 평단가 관리와 분할 매수/매도 전략 실습
- **업적 시스템**: 8가지 업적 달성
- **멀티 엔딩**: 투자 결과에 따른 다양한 엔딩

### 플랫폼 지원
- **웹**: 모든 브라우저 지원
- **모바일**: 반응형 디자인으로 모바일 최적화
- **PWA**: 앱처럼 설치하여 사용 가능

### 구독 플랜
- **무료**: 데모 게임 1회, 기본 튜토리얼
- **베이직** (₩9,900/월): 무제한 게임, 저장 슬롯, 리더보드
- **프리미엄** (₩79,000/년): 프리미엄 시나리오, 다른 종목 시나리오

## 기술 스택

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: JWT + HTTP-only Cookies
- **Payments**: Stripe
- **Deployment**: Vercel (권장)

## 시작하기

### 필수 요구사항
- Node.js 18.17.0 이상
- PostgreSQL 데이터베이스
- Stripe 계정 (결제 기능)

### 설치

```bash
# 저장소 클론
git clone https://github.com/josens83/vigencell-trading.git
cd vigencell-trading

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 필요한 값들을 설정하세요

# 데이터베이스 설정
npm run db:push
npm run db:generate

# 개발 서버 실행
npm run dev
```

### 환경 변수

```env
# 데이터베이스
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret-key"

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_PUBLISHABLE_KEY="pk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_YEARLY="price_..."

# 앱 URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 프로젝트 구조

```
vigencell-trading/
├── prisma/              # 데이터베이스 스키마
├── public/              # 정적 파일
│   ├── icons/          # PWA 아이콘
│   ├── manifest.json   # PWA 매니페스트
│   └── sw.js           # 서비스 워커
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── api/        # API 라우트
│   │   ├── game/       # 게임 페이지
│   │   ├── login/      # 로그인 페이지
│   │   ├── register/   # 회원가입 페이지
│   │   └── pricing/    # 요금제 페이지
│   ├── components/     # React 컴포넌트
│   │   └── game/       # 게임 컴포넌트
│   └── lib/            # 유틸리티
│       ├── auth.ts     # 인증
│       ├── db.ts       # 데이터베이스
│       └── stripe.ts   # 결제
├── package.json
└── tailwind.config.js
```

## 배포

### Vercel (권장)

1. [Vercel](https://vercel.com)에 로그인
2. "Import Project"로 GitHub 저장소 연결
3. 환경 변수 설정
4. 배포!

### Docker

```bash
docker build -t vigencell-trading .
docker run -p 3000:3000 vigencell-trading
```

## 라이선스

MIT License

## 기여

이슈와 PR을 환영합니다!

---

⚠️ **면책 조항**: 본 게임은 교육 목적의 시뮬레이션입니다. 실제 투자 권유가 아니며, 실제 투자 결정에 참고하지 마세요.
