# 뚝딱동화 (ddukddak-app)

> AI 기반 다국어 동화 서비스 - iOS / Android / Web

아이들을 위한 맞춤형 AI 동화 서비스입니다. 한국어/영어 TTS 음성과 배경음악과 함께 동화를 즐길 수 있습니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Expo 53 + Expo Router 5 |
| Language | TypeScript 5 |
| Styling | NativeWind 4 (Tailwind CSS 3) |
| State | Zustand 5 |
| Server State | TanStack Query 5 |
| Auth | Supabase Auth |
| Image | expo-image |
| Animation | React Native Reanimated |
| Icons | Lucide React Native |

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버
npm run dev

# 웹 브라우저로 실행
npm run dev:web

# Android
npm run dev:android

# iOS
npm run dev:ios

# TypeScript 검사
npm run ts:check
```

## 환경 변수

프로젝트 루트에 `.env` 파일 생성:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

## 프로젝트 구조

```
app/                            # Expo Router (파일 기반 라우팅)
├── _layout.tsx                 # 루트 레이아웃 (폰트, Providers, 인증 가드)
├── index.tsx                   # 스플래시
├── onboarding.tsx              # 온보딩
├── login.tsx                   # 로그인
├── signup.tsx                  # 회원가입
├── (tabs)/                     # 탭 네비게이터
│   ├── _layout.tsx             # 홈 / 동화목록 / 설정
│   ├── home.tsx
│   ├── stories.tsx
│   └── settings/
│       ├── index.tsx           # 설정
│       ├── profile.tsx         # 프로필 관리
│       └── subscription.tsx    # 구독 관리
├── story/
│   ├── [id].tsx                # 동화 상세
│   └── [id]/viewer.tsx         # 동화 뷰어
├── subscription.tsx            # 구독 안내
├── payment.tsx                 # 결제
└── auth/callback.tsx           # OAuth 콜백

src/
├── components/
│   ├── ui/                     # Button, Card, Input, Skeleton 등
│   └── layout/                 # Header, HomeHeader, PageIndicator
├── hooks/                      # useAuth, useStories, useProgress 등
├── lib/                        # api, supabase, constants, utils
├── providers/                  # QueryProvider, AuthProvider
├── stores/                     # authStore (Zustand + AsyncStorage)
└── types/                      # TypeScript 타입 정의
```

## 화면 목록

| Route | 화면 |
|-------|------|
| `/` | 스플래시 |
| `/onboarding` | 온보딩 (3 슬라이드) |
| `/login` | 로그인 (이메일 + 카카오/구글 OAuth) |
| `/signup` | 회원가입 |
| `/(tabs)/home` | 홈 (배너 + 카테고리별 동화) |
| `/(tabs)/stories` | 동화 목록 (카테고리/연령 필터) |
| `/story/[id]` | 동화 상세 (한/영 전환, 읽기) |
| `/story/[id]/viewer` | 동화 뷰어 (스와이프, TTS/BGM, 자동넘기기) |
| `/subscription` | 구독 안내 (무료/월간/연간) |
| `/payment` | 결제 |
| `/(tabs)/settings` | 설정 |
| `/(tabs)/settings/profile` | 프로필 관리 |
| `/(tabs)/settings/subscription` | 구독 관리 |

## 주요 기능

- **동화 뷰어**: 스와이프 넘기기, TTS 음성, BGM, 자동 넘기기, 진행률 저장
- **다국어 지원**: 한국어/영어 전환
- **구독 시스템**: 무료/월간/연간 플랜
- **인증**: 이메일 로그인, 카카오/구글 OAuth
- **크로스플랫폼**: iOS, Android, Web 동시 지원

## 개발 현황

- [x] Expo 전환 완료 (Next.js -> Expo Router)
- [x] 전체 13화면 구현
- [x] 백엔드 API 연동 (Supabase Auth + REST API)
- [x] 접근성 지원
- [ ] 인앱 결제 연동
- [ ] Google Play 출시

## 관련 문서

- [기획 문서](../fairytale-planning/docs/) - 기능 정의, 화면 설계, API 명세
- [Figma](https://www.figma.com/design/xgSTViIo7HytQATKKWSu7q/Tuktak) - 와이어프레임

## License

Private - All rights reserved
