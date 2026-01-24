# 뚝딱동화 (ddukddak-web)

> AI 기반 다국어 동화 서비스 프론트엔드

아이들을 위한 맞춤형 AI 동화 서비스입니다. 한국어/영어 TTS 음성과 배경음악과 함께 동화를 즐길 수 있습니다.

## 개발 현황

**Phase 1: 프론트엔드 UI - 100% 완료 ✅**

| 화면 | Route | 상태 |
|------|-------|------|
| 스플래시 | `/` | ✅ |
| 온보딩 | `/onboarding` | ✅ |
| 로그인 | `/login` | ✅ |
| 회원가입 | `/signup` | ✅ |
| 홈 | `/home` | ✅ |
| 동화 목록 | `/stories` | ✅ |
| 동화 상세 | `/story/[id]` | ✅ |
| 동화 뷰어 | `/story/[id]/viewer` | ✅ |
| 구독 안내 | `/subscription` | ✅ |
| 결제 | `/payment` | ✅ |
| 설정 | `/settings` | ✅ |
| 프로필 | `/settings/profile` | ✅ |
| 구독 관리 | `/settings/subscription` | ✅ |

**Phase 2: 백엔드 연동 - 예정**
- Supabase Auth 연동
- TossPayments 결제 연동
- TTS/BGM 오디오 연동

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| Server State | TanStack Query |
| Auth | Supabase Auth |
| Payment | TossPayments |
| Icons | Lucide React |

## 시작하기

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 린트
pnpm lint
```

개발 서버: http://localhost:3000

## 환경 변수

`.env.local` 파일 생성:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# TossPayments
NEXT_PUBLIC_TOSS_CLIENT_KEY=your_toss_client_key

# API
NEXT_PUBLIC_API_URL=your_api_url
```

## 프로젝트 구조

```
src/
├── app/                    # App Router
│   ├── home/               # 홈 화면
│   ├── login/              # 로그인
│   ├── signup/             # 회원가입
│   ├── onboarding/         # 온보딩
│   ├── stories/            # 동화 목록
│   ├── story/[id]/         # 동화 상세
│   │   └── viewer/         # 동화 뷰어
│   ├── subscription/       # 구독 안내
│   ├── payment/            # 결제
│   ├── settings/           # 설정
│   │   ├── profile/        # 프로필 관리
│   │   └── subscription/   # 구독 관리
│   └── layout.tsx          # 전역 레이아웃
│
├── components/
│   ├── ui/                 # Button, Card, Input, StoryCard...
│   └── layout/             # Header, TabBar...
│
└── types/                  # TypeScript 타입 정의
```

## 주요 기능

- **동화 뷰어**: 스와이프 넘기기, TTS 음성, BGM 배경음악, 전체화면
- **다국어 지원**: 한국어/영어 전환
- **구독 시스템**: 무료/월간/연간 플랜
- **결제**: 카드, 카카오페이, 네이버페이, 토스페이
- **반응형 레이아웃**: 모바일/태블릿 지원

## 관련 문서

- [기획 문서](../fairytale-planning/docs/) - 기능 정의, 화면 설계, API 명세
- [Figma](https://www.figma.com/design/xgSTViIo7HytQATKKWSu7q/Tuktak) - 와이어프레임

## License

Private - All rights reserved
