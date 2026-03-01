# 뚝딱동화 - 모바일 앱 (ddukddak-app)

> AI 동화 서비스 크로스플랫폼 모바일 앱 (iOS / Android / Web)

## Claude 역할

- **담당**: 프론트엔드 프로젝트 담당자 및 프론트 개발 전문가(이름: '프롱')
- **문서 관리 범위**: 이 프로젝트 내의 문서만 관리
- **외부 문서**: 업데이트 필요 시 사용자에게 허락을 구한 후 수행

### 관련 프로젝트

```
fairytale/
├── fairytale-planning/    ← 기획 문서 - 잡스 담당
├── ddukddak-story/        ← 콘텐츠 생성 - 캉테 담당
├── ddukddak-web/          ← 프론트엔드 (Expo) - 프롱 담당
└── ddukddak-api/          ← 백엔드 (NestJS) - 코난 담당
```

---

## 기획 문서 참조

**중요: 개발 전 반드시 기획 문서를 참고하세요.**

```
../fairytale-planning/docs/
├── planning/          # 0_RESEARCH ~ 3_SCREENS
├── specs/             # 4_TECH_STACK, 5_API_SPEC
├── management/        # 6_DEV_PLAN, 7_TASK_TRACKER, 8_PAYMENT_POLICY
└── work-orders/       # WORK_ORDER_{PRONG,CONAN,KANTE,JOBS}.md
```

- **Figma 와이어프레임**: https://www.figma.com/design/xgSTViIo7HytQATKKWSu7q/Tuktak

---

## 현재 상태

| 항목 | 상태 |
|------|------|
| Expo 전환 (Next.js → Expo Router) | ✅ 완료 |
| 전체 13화면 구현 | ✅ 완료 |
| 백엔드 API 연동 | ✅ 완료 (결제/탈퇴 API 미테스트) |
| EAS 배포 (Web + Android) | ✅ 완료 |
| OAuth 인증 (Google, Kakao) | ✅ 완료 |
| Free Mode UI | ✅ 완료 |
| AI 비디오 뷰어 (expo-video) | ✅ 완료 |
| TTS 나레이션 (웹 + iOS/Android) | ✅ 완료 |
| 결제 연동 (RevenueCat / 토스) | ⏳ 미착수 |
| Google Play 출시 | ⏳ 수동 작업 대기 |

**배포 URL**:
- **Web**: https://ddukddak.expo.app
- **Backend API**: https://ddukddak-api-2lb4yqjazq-du.a.run.app/api
- **EAS**: https://expo.dev/accounts/0kim/projects/ddukddak

---

## 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| Framework | Expo + Expo Router | 53.x / 5.x |
| Language | TypeScript | 5.x |
| Styling | NativeWind (Tailwind CSS 3) | 4.x |
| State | Zustand | 5.x |
| Server State | TanStack Query | 5.x |
| Auth | Supabase Auth (OAuth: Google, Kakao) | 2.x |
| Image | expo-image | 2.x |
| Video | expo-video | 1.x |
| Animation | React Native Reanimated | 3.x |
| Icons | Lucide React Native | 0.475.x |

---

## 디자인 가이드

### 컬러

| 용도 | 코드 | NativeWind |
|------|------|------------|
| Primary (오렌지) | `#FF9500` | `bg-primary` / `text-primary` |
| Secondary (하늘색) | `#5AC8FA` | `bg-secondary` |
| Background (크림색) | `#FFF9F0` | `bg-background` |
| Surface (화이트) | `#FFFFFF` | `bg-white` |
| Text (다크 그레이) | `#333333` | `text-text-main` |
| Sub Text (그레이) | `#888888` | `text-text-sub` |
| Error (레드) | `#FF3B30` | `text-error` / `bg-error` |
| Success (그린) | `#34C759` | - |

### 컴포넌트 스타일

| 용도 | Radius |
|------|--------|
| 버튼 | `rounded-xl` (12px) |
| 카드 | `rounded-2xl` (16px) |
| 인풋 | `rounded-lg` (8px) |
| 이미지 | `rounded-xl` (12px) |

### 폰트

| 용도 | 폰트 | 비고 |
|------|------|------|
| 기본 텍스트 | Pretendard | Regular/Bold (`assets/fonts/`) |
| 동화 뷰어 자막 | Gowun Dodum | 23px Bold |

### 웹 반응형 레이아웃

모바일 우선 웹앱으로, 웹에서도 모바일 비율을 유지합니다.

| 상수 | 값 |
|------|-----|
| `MOBILE_ASPECT_RATIO` | `9 / 19.5` (iPhone 14 Pro 기준) |
| `MAX_CONTAINER_WIDTH` | `600px` |
| `MAX_CONTAINER_HEIGHT` | `1300px` |

| 브레이크포인트 | 동작 |
|----------------|------|
| 모바일 `≤480px` | 전체 화면 |
| 태블릿 `481-1023px` | 뷰포트 높이의 98% |
| 데스크톱 `≥1024px` | 뷰포트 높이의 96% |

**구현**: `src/lib/layout.ts` (`calculateContainerSize()`), `app/_layout.tsx`

**주의**: 웹에서 `useWindowDimensions`는 브라우저 전체 크기 반환 → `calculateContainerSize()` 사용

---

## 프로젝트 구조

```
app/                            # Expo Router (파일 기반 라우팅)
├── _layout.tsx                 # 루트 (폰트 로딩, Providers, 인증 가드)
├── index.tsx                   # 스플래시
├── onboarding.tsx
├── login.tsx / signup.tsx
├── (tabs)/                     # 탭 네비게이터 (보호 라우트)
│   ├── _layout.tsx             # 3탭: Home, Stories, Settings
│   ├── home.tsx
│   ├── stories.tsx
│   └── settings/               # index, profile, subscription
├── story/
│   ├── [id].tsx                # 동화 상세
│   └── [id]/viewer.tsx         # 동화 뷰어
├── subscription.tsx / payment.tsx
└── auth/callback.tsx           # OAuth 콜백

src/
├── components/
│   ├── ui/                     # Button, Card, Input, Skeleton 등
│   ├── layout/                 # Header, HomeHeader, PageIndicator
│   └── story/                  # ViewerTopBar, ViewerMainContent 등 (뷰어 UI)
├── hooks/                      # useAuth, useStories, useProgress 등
├── lib/                        # api, supabase, constants, utils, layout, webTts
├── providers/                  # QueryProvider, AuthProvider
├── stores/                     # authStore (Zustand + AsyncStorage)
└── types/                      # story.ts, index.ts
```

---

## 개발 명령어

```bash
npm run dev          # Expo 개발 서버
npm run dev:web      # 웹 브라우저 (http://localhost:3000)
npm run dev:android  # Android
npm run dev:ios      # iOS

npm run build        # 빌드 (export)
npm run lint         # TypeScript + ESLint
npm run ts:check     # TypeScript 검사 (단독)
```

### iOS 테스트 (Xcode Simulator)

```bash
xcrun simctl boot "iPhone 17 Pro" && open -a Simulator
xcrun simctl openurl booted "https://ddukddak.expo.app"   # 프로덕션
xcrun simctl openurl booted "http://localhost:3000"        # 로컬
```

### 환경 변수

`.env` 파일:
```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 개발 규칙

1. **기획 문서 우선**: 개발 전 `fairytale-planning/docs/` 참고
2. **컴포넌트 분리**: 1파일 1컴포넌트
3. **Named export**: 컴포넌트는 `export function` 사용 (페이지만 `export default`)
4. **Props interface**: 컴포넌트 위에 인터페이스 정의
5. **Function declaration**: arrow function 대신 function 선언
6. **TanStack Query**: 서버 상태는 useQuery/useMutation 사용
7. **Zustand**: 클라이언트 전역 상태 관리
8. **Functional setState**: 이전 상태 기반 업데이트 시 `setState(prev => ...)` 사용
9. **접근성**: `accessibilityLabel`, `accessibilityRole`, `accessibilityState` 적용
10. **NativeWind 우선**: 인라인 스타일 최소화, Tailwind 클래스 사용

---

## Claude Code Commands & Skills

> `.claude/` 디렉터리에 정의된 자동화 도구 목록입니다.
> Claude Code에서는 `/명령어`로 호출하고, Codex 등 다른 AI 에이전트는 아래 경로를 직접 참조하세요.

- **Commands**: `.claude/commands/*.md`
- **Skills**: `.claude/skills/*/`

### Commands

| 커맨드 | 용도 |
|--------|------|
| `/dd-commit [push]` | 커밋 생성 (push 옵션) |
| `/dd-build` | 빌드 및 에러 수정 |
| `/dd-figma <url>` | Figma -> 코드 변환 |
| `/dd-security-check [type]` | 보안 검토 |
| `/dd-expo-screen [name] [type]` | 새 화면 생성 (tab/modal/stack) |
| `/dd-expo-check [type]` | 프로젝트 상태 체크 (deps/config/ts) |
| `/dd-pr [branch]` | PR 생성 (커밋 + 푸시 + PR) |
| `/dd-work [all]` | 논의된 작업 실행 (all: 커밋+PR 포함) |
| `/dd-brainstorm` | 브레인스토밍 |
| `/dd-work-order [all]` | 작업지시서 읽기 + 구현 + 보고서 작성 |

### Skills

| 스킬 | 용도 |
|------|------|
| `expo-best-practices` | Expo Router/모바일 의사결정 시 우선 참조 |
| `react-best-practices` | React 성능/코드 품질 (웹 전용 규칙은 선별 적용) |
| `web-design-guidelines` | 웹 UI 접근성/디자인 감사 |
| `component` | 컴포넌트 스캐폴딩 컨벤션 |

### 커맨드 활용 가이드

- **작업 실행**: `dd-work` (논의 기반) / `dd-work-order` (작업지시서 기반)
- **PR 전 검증**: `dd-build`, `dd-expo-check`
- **커밋/PR**: `dd-commit`, `dd-pr`
- **보안 점검**: `dd-security-check`

### 커맨드 호출 규칙

- 사용자가 커맨드명(예: `dd-commit`)을 말하면 `.claude/commands/dd-commit.md`를 읽고 해당 워크플로우를 **그대로** 실행
- 인자가 있으면(예: `dd-work all`) 커맨드 파일에 정의된 인자 의미를 적용

---

## EAS 배포 가이드

### 배포 프로필

| 프로필 | 용도 | 트리거 | 빌드 타입 |
|--------|------|--------|----------|
| `development` | 로컬 개발 | 수동 | APK (debug) |
| `preview` | 테스트/QA | PR 생성 시 | APK (internal) |
| `production` | 실서비스 | main 머지 | AAB (app-bundle) |

### 수동 빌드 명령어

```bash
eas build --platform android --profile preview      # Preview APK
eas build --platform android --profile production   # Production AAB
npx expo export --platform web && eas deploy --prod # Web 배포
```

### 빌드 트러블슈팅

| 문제 | 해결 |
|------|------|
| `nativewind` 4.2.x Babel 에러 | `nativewind@4.1.23` 고정 |
| `eas deploy`가 preview 배포됨 | `eas deploy --prod` 사용 |
| 배포 후 이전 번들 로드됨 | CDN 캐시 최대 1시간 대기 |
| 프로덕션에서 `localhost` API 호출 | GitHub Actions secrets 확인 (`.env`는 빌드타임 고정) |

---

## OAuth 인증 가이드

### 플랫폼별 동작

| 플랫폼 | 방식 | 이유 |
|--------|------|------|
| **웹** | 페이지 리다이렉트 | Google COOP 헤더가 팝업 통신 차단 |
| **네이티브** | 인앱 브라우저 (팝업) | `expo-web-browser`의 `openAuthSessionAsync` |

### 핵심 설정

| 파일 | 설정 |
|------|------|
| `src/lib/supabase.ts` | `detectSessionInUrl: Platform.OS === "web"` |
| `src/hooks/useAuth.ts` | 웹: 리다이렉트 / 네이티브: `skipBrowserRedirect: true` |
| `app/auth/callback.tsx` | 웹: `getSession()` / 네이티브: `setSession(params)` |

### Supabase 설정

| 항목 | 값 |
|------|-----|
| Site URL | `https://ddukddak.expo.app` |
| Redirect URLs | `https://ddukddak.expo.app/**`, `ddukddak://auth/callback`, `http://localhost:3000/**` |

---

## 동화 뷰어 미디어 가이드

### 뷰어 구조

- `app/story/[id]/viewer.tsx` — 상태 관리 + 재생 로직 (TTS, BGM, 비디오, auto-advance)
- `src/hooks/useSentenceTts.ts` — 문장 단위 TTS 큐 재생 훅 (웹 + 네이티브)
- `src/components/story/` — 순수 UI 컴포넌트 (props-only, 상태 없음)
- 웹 미디어 세션 충돌 대응: `src/lib/webTts.ts` (단일 HTMLAudioElement 재사용 + 의도 기반 상태 추적)

### TTS 재생 모드

| 모드 | 조건 | 동작 |
|------|------|------|
| 문장 단위 | `sentences.length > 0` + audioUrl 있음 | 문장별 순차 재생 + 하이라이트 |
| 페이지 단위 (폴백) | sentences 비어있음 | 기존 `audioUrlKo/En` 단일 재생 |

- 웹: HTMLAudioElement `src` 교체 방식 (단일 요소 재사용)
- 네이티브: expo-av `Audio.Sound` double-buffering (2개 교대 + 프리로드)
- 문장 간 대기: 400ms (`SENTENCE_GAP_MS`)

**iOS Safari 오디오 정책 핵심 규칙**:
- `activateWebTts()`: 유저 제스처(탭) 핸들러 내에서 호출 — 오디오 요소 생성만 수행 (SILENT_WAV 재생 X)
- `startQueue()` 내 `stopAll()` fire-and-forget — `await` 하면 제스처 컨텍스트 만료됨
- `stopAll()`에서 `onended`/`onerror` 제거 X — 세대 카운터(generationRef)가 stale 콜백 차단
- `restart()`: `idle`/`page_complete` 상태에서 유저 탭 → 재시작 (await 없이 호출)
- `ensureWebTtsAudio()`: Metro HMR 모듈 인스턴스 불일치 시 폴백 생성

### StoryPage 미디어 필드

```typescript
interface Sentence {
  sentenceIndex: number;         // 0-based, 정렬 보장
  textKo?: string;
  textEn?: string;
  audioUrlKo?: string;
  audioUrlEn?: string;
}

interface StoryPage {
  imageUrl: string;              // 항상 존재 (이미지 or 비디오 포스터)
  mediaType?: "image" | "video"; // 없으면 "image" 기본
  videoUrl?: string;             // mediaType === "video"일 때만
  sentences: Sentence[];         // 항상 배열 (빈 배열 → 페이지 단위 폴백)
}
```

### 비디오 재생 사양

| 항목 | 값 |
|------|-----|
| 포맷 | MP4 (Cloudflare R2 스트리밍) |
| 길이 | 2-3초, 음소거, 최대 2회 재생 후 정지 |
| 이미지 비율 | 3:2 (1536×1024 가로) |
| 에러 처리 | 비디오 실패 시 이미지 폴백 (오버레이 패턴) |

### FREE_MODE (무료 모드)

| 설정 | 값 |
|------|-----|
| 상수 | `src/lib/constants.ts` → `FREE_MODE` |
| 기본값 | `true` (환경 변수 `EXPO_PUBLIC_FREE_MODE`로 제어) |
| 동작 | 모든 동화 잠금 해제, 구독/결제 UI 비활성화 |

---

*마지막 업데이트: 2026-02-28 (문장 단위 TTS iOS Safari 오디오 정책 대응 완료)*
