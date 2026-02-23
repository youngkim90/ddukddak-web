# 뚝딱동화 (ddukddak)

> AI 기반 맞춤형 동화 서비스 - iOS / Android / Web

아이들을 위한 맞춤형 AI 동화 서비스입니다. 연령별 맞춤 동화를 AI 생성 이미지/영상과 텍스트로 구성된 뷰어를 통해 몰입감 있는 독서 경험을 제공합니다.

**Web**: https://ddukddak.expo.app

## 주요 기능

- 연령별 맞춤 동화 추천 (카테고리: 전래, 교훈, 모험, 가정, 창의)
- 동화 뷰어 (AI 이미지/영상 + 자막, 스와이프, 자동 넘기기, 진행률 저장)
- AI 영상 재생 (핵심 장면 2~3초 무음 MP4, 이미지 폴백)
- TTS 나레이션 (웹: Web Speech API)
- BGM 재생 (동화별 30초 루프 MP3, 볼륨 조절)
- 다국어 지원 (한국어 / 영어 전환)
- 소셜 로그인 (Google, Kakao OAuth)
- 무료 모드 (MVP: 전체 동화 무료 제공)
- 크로스플랫폼 (iOS, Android, Web)

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Expo 53 + Expo Router 5 |
| Language | TypeScript 5 |
| Styling | NativeWind 4 (Tailwind CSS 3) |
| State | Zustand 5 |
| Server State | TanStack Query 5 |
| Auth | Supabase Auth (Google, Kakao OAuth) |
| Image | expo-image |
| Video | expo-video |
| Audio | expo-av |
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

# Android / iOS
npm run dev:android
npm run dev:ios

# TypeScript + ESLint 검사
npm run lint
```

### 환경 변수

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
├── login.tsx / signup.tsx      # 인증
├── (tabs)/                     # 탭 네비게이터
│   ├── home.tsx                # 홈 (배너 + 카테고리별 동화)
│   ├── stories.tsx             # 동화 목록 (카테고리/연령 필터)
│   └── settings/               # 설정 / 프로필 / 구독관리
├── story/
│   ├── [id].tsx                # 동화 상세
│   └── [id]/viewer.tsx         # 동화 뷰어
├── subscription.tsx            # 구독 안내
├── payment.tsx                 # 결제
└── auth/callback.tsx           # OAuth 콜백

src/
├── components/
│   ├── ui/                     # Button, Card, Input, Skeleton 등
│   ├── layout/                 # Header, HomeHeader, PageIndicator
│   └── story/                  # ViewerTopBar, ViewerMainContent 등
├── hooks/                      # useAuth, useStories, useProgress 등
├── lib/                        # api, supabase, constants, utils, webTts
├── providers/                  # QueryProvider, AuthProvider
├── stores/                     # authStore (Zustand + AsyncStorage)
└── types/                      # TypeScript 타입 정의
```

## 화면 목록 (13개)

| Route | 화면 |
|-------|------|
| `/` | 스플래시 |
| `/onboarding` | 온보딩 (3 슬라이드) |
| `/login` | 로그인 (이메일 + Google/Kakao OAuth) |
| `/signup` | 회원가입 |
| `/(tabs)/home` | 홈 (배너 + 카테고리별 동화) |
| `/(tabs)/stories` | 동화 목록 (카테고리/연령 필터) |
| `/story/[id]` | 동화 상세 (한/영 전환) |
| `/story/[id]/viewer` | 동화 뷰어 (AI 영상/이미지, TTS, BGM, 스와이프) |
| `/subscription` | 구독 안내 (현재 무료 모드) |
| `/payment` | 결제 (현재 비활성화) |
| `/(tabs)/settings` | 설정 |
| `/(tabs)/settings/profile` | 프로필 관리 |
| `/(tabs)/settings/subscription` | 구독 관리 |

## 배포

| 환경 | URL |
|------|-----|
| Web | https://ddukddak.expo.app |
| Backend API | https://ddukddak-api-2lb4yqjazq-du.a.run.app/api |
| EAS 프로젝트 | https://expo.dev/accounts/0kim/projects/ddukddak |

### CI/CD (GitHub Actions)

| 트리거 | 동작 |
|--------|------|
| PR 생성 | TypeScript 검사 + Web 빌드 체크 |
| main 머지 | Web 프로덕션 배포 + Android AAB 빌드 |

### 수동 배포

```bash
# Web 프로덕션 배포
npx expo export --platform web
eas deploy --prod

# Android 빌드
eas build --platform android --profile production
```

## 개발 현황

- [x] Expo 전환 완료 (Next.js -> Expo Router)
- [x] 전체 13화면 구현
- [x] 백엔드 API 연동 (Supabase Auth + REST API)
- [x] Google/Kakao OAuth 인증
- [x] EAS 배포 (Web + Android)
- [x] CI/CD (GitHub Actions)
- [x] 접근성 지원
- [x] 무료 모드 UI (FREE_MODE 플래그)
- [x] AI 영상 뷰어 (expo-video 오버레이 패턴)
- [x] BGM 오디오 재생 (expo-av, 볼륨 조절)
- [x] TTS 나레이션 (웹: Web Speech API)
- [ ] 결제 연동 (인앱결제 RevenueCat + 토스 웹)
- [ ] Google Play 출시

## 관련 문서

- [기획 문서](../fairytale-planning/docs/) - 기능 정의, 화면 설계, API 명세
- [Figma](https://www.figma.com/design/xgSTViIo7HytQATKKWSu7q/Tuktak) - 와이어프레임

## License

Private - All rights reserved
