# 뚝딱동화 - 모바일 앱 (ddukddak-app)

> AI 동화 서비스 크로스플랫폼 모바일 앱 (iOS / Android / Web)

## Claude 역할

- **담당**: 프론트엔드 프로젝트 담당자 및 프론트 개발 전문가(이름: '프롱')
- **문서 관리 범위**: 이 프로젝트 내의 문서만 관리
- **외부 문서**: 업데이트 필요 시 사용자에게 허락을 구한 후 수행

---

## 기획 문서 참조

**중요: 개발 전 반드시 기획 문서를 참고하세요.**

```
../fairytale-planning/docs/
├── 2_FEATURES.md     # 기능 요구사항 (User Story)
├── 3_SCREENS.md      # 화면 설계, 와이어프레임
├── 4_TECH_STACK.md   # 기술 스택, 프로젝트 구조
├── 5_API_SPEC.md     # API 명세서
├── 6_DEV_PLAN.md     # 개발 계획서
└── 7_TASK_TRACKER.md # 작업 현황 관리
```

- **Figma 와이어프레임**: https://www.figma.com/design/xgSTViIo7HytQATKKWSu7q/Tuktak

---

## 현재 개발 단계

**Expo 전환 (Next.js -> Expo Router) - 완료**

```
Phase 0: 프로젝트 생성 및 설정              [##########] 100%
Phase 1: 공유 인프라 (types, lib, hooks)    [##########] 100%
Phase 2: 라우팅 구조 및 인증 가드           [##########] 100%
Phase 3: UI 컴포넌트 전환 (12개)            [##########] 100%
Phase 4: 인증 화면 (4개)                    [##########] 100%
Phase 5: 메인 화면 (3개)                    [##########] 100%
Phase 6: 동화 뷰어                          [##########] 100%
Phase 7: 나머지 화면 (5개)                  [##########] 100%
Phase 8: 마무리 (Safe Area, 접근성, 검증)   [##########] 100%
```

**API 연동 - 완료**

```
백엔드 API 연동                             [##########] 100%
- GET  /users/me                            ✅ 프로필 조회
- PATCH /users/me                           ✅ 프로필 수정
- GET  /stories                             ✅ 동화 목록
- GET  /stories/:id                         ✅ 동화 상세
- GET  /stories/:id/pages                   ✅ 동화 페이지
- GET  /subscriptions/plans                 ✅ 구독 플랜 목록
- GET  /subscriptions/me                    ✅ 내 구독 정보
- GET  /progress/:storyId                   ✅ 진행률 조회
- PUT  /progress/:storyId                   ✅ 진행률 저장
- POST /subscriptions                       ⏳ 결제 연동 후 테스트
- DELETE /subscriptions/me                  ⏳ 구독 후 테스트
- DELETE /users/me                          ⏳ 회원 탈퇴 (미테스트)
```

**EAS 배포 설정 - 완료**

```
Task 2-8. EAS 통합 배포
├── eas.json 설정                           [##########] 100%
├── app.json 업데이트                       [##########] 100%
├── GitHub Actions 워크플로우               [##########] 100%
├── EAS 프로젝트 연결                       [##########] 100%
├── EAS Secrets 설정                        [##########] 100%
├── GitHub Secrets 설정                     [##########] 100%
├── Web Production 배포                     [##########] 100%
└── Android Production 빌드                 [##########] 100%
```

- **Web URL**: https://ddukddak--5ss9spp97k.expo.app
- **Backend API**: https://ddukddak-api-2lb4yqjazq-du.a.run.app/api
- **EAS 프로젝트**: https://expo.dev/accounts/0kim/projects/ddukddak

**다음 단계: 결제 연동 + 앱 출시 (Google Play 우선)**

```
3-1. 토스페이먼츠 SDK 연동                  [          ] 0%
3-2. 결제 플로우 구현 (POST /subscriptions) [          ] 0%
3-3. Google Play 출시                       [          ] 0%
```

### 완료된 화면 (13/13)

| Route | 화면 | 상태 |
|-------|------|------|
| `/` (index) | S-01 스플래시 | ✅ |
| `/onboarding` | S-02 온보딩 | ✅ |
| `/login` | S-03 로그인 | ✅ |
| `/signup` | S-04 회원가입 | ✅ |
| `/(tabs)/home` | S-05 홈 | ✅ |
| `/(tabs)/stories` | S-06 동화 목록 | ✅ |
| `/story/[id]` | S-07 동화 상세 | ✅ |
| `/story/[id]/viewer` | S-08 동화 뷰어 | ✅ |
| `/subscription` | S-09 구독 안내 | ✅ |
| `/payment` | S-10 결제 | ✅ |
| `/(tabs)/settings` | S-11 설정 | ✅ |
| `/(tabs)/settings/profile` | S-12 프로필 | ✅ |
| `/(tabs)/settings/subscription` | S-13 구독 관리 | ✅ |

---

## 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| Framework | Expo + Expo Router | 53.x / 5.x |
| Language | TypeScript | 5.x |
| Styling | NativeWind (Tailwind CSS 3) | 4.x |
| State | Zustand | 5.x |
| Server State | TanStack Query | 5.x |
| Auth | Supabase Auth | 2.x |
| Image | expo-image | 2.x |
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

| 용도 | 폰트 | 크기 | 스타일 |
|------|------|------|--------|
| 기본 텍스트 | Pretendard | - | Regular/Bold |
| 동화 뷰어 자막 | Gowun Dodum | 23px | Bold |

**폰트 파일 위치**: `assets/fonts/`
- `Pretendard-Regular.otf`, `Pretendard-Bold.otf`
- `GowunDodum-Regular.ttf` (동화 뷰어용)

### 웹 화면 비율 (반응형 레이아웃)

**중요**: 이 앱은 모바일 우선 웹앱으로, 웹에서도 모바일 비율을 유지합니다.

| 상수 | 값 | 설명 |
|------|-----|------|
| `MOBILE_ASPECT_RATIO` | `9 / 19.5` | iPhone 14 Pro 기준 (393x852) |
| `MAX_CONTAINER_WIDTH` | `520px` | 최대 컨테이너 너비 |
| `MAX_CONTAINER_HEIGHT` | `1040px` | 최대 컨테이너 높이 |

| 브레이크포인트 | 값 | 동작 |
|----------------|-----|------|
| 모바일 | `≤480px` | 전체 화면 |
| 태블릿 | `481-1023px` | 뷰포트 높이의 96% |
| 데스크톱 | `≥1024px` | 뷰포트 높이의 92% |

**웹 디바이스 프레임 스타일** (태블릿/데스크톱):
- `borderRadius: 24` - 라운드 모서리
- `shadow` - 그림자 효과로 디바이스 느낌
- 배경색: `#E8E4DE` (outer), 컨텐츠: `#FFF9F0` (background)

**구현 파일**:
- `src/lib/layout.ts` - 레이아웃 상수 및 `calculateContainerSize()` 유틸리티
- `app/_layout.tsx` - 웹 컨테이너 래퍼 적용

**주의사항**:
1. `FlatList`, `ScrollView` 등의 너비 계산 시 `calculateContainerSize()` 사용
2. 모바일 브레이크포인트(480px 이하)에서는 전체 화면 사용
3. 웹에서 `useWindowDimensions`는 브라우저 전체 크기 반환 → 실제 컨테이너 크기와 다름

---

## 프로젝트 구조

```
app/                            # Expo Router (파일 기반 라우팅)
├── _layout.tsx                 # 루트 (폰트 로딩, Providers, 인증 가드)
├── index.tsx                   # 스플래시
├── onboarding.tsx
├── login.tsx
├── signup.tsx
├── (tabs)/                     # 탭 네비게이터 (보호 라우트)
│   ├── _layout.tsx             # 3탭: Home, Stories, Settings
│   ├── home.tsx
│   ├── stories.tsx
│   └── settings/
│       ├── _layout.tsx
│       ├── index.tsx
│       ├── profile.tsx
│       └── subscription.tsx
├── story/
│   ├── [id].tsx                # 동화 상세
│   └── [id]/viewer.tsx         # 동화 뷰어
├── subscription.tsx
├── payment.tsx
└── auth/callback.tsx           # OAuth 딥링크 핸들러

src/
├── components/
│   ├── ui/                     # Button, Card, Input, Skeleton 등
│   └── layout/                 # Header, HomeHeader, PageIndicator
├── hooks/                      # useAuth, useStories, useProgress 등
├── lib/                        # api, supabase, constants, utils
├── providers/                  # QueryProvider, AuthProvider
├── stores/                     # authStore (Zustand + AsyncStorage)
└── types/                      # story.ts, index.ts
```

---

## 구현된 컴포넌트

| 분류 | 컴포넌트 | 파일 |
|------|----------|------|
| **UI** | Button | `src/components/ui/Button.tsx` |
| | Card | `src/components/ui/Card.tsx` |
| | Input | `src/components/ui/Input.tsx` |
| | Checkbox | `src/components/ui/Checkbox.tsx` |
| | StoryCard | `src/components/ui/StoryCard.tsx` |
| | RecommendBanner | `src/components/ui/RecommendBanner.tsx` |
| | ErrorBoundary | `src/components/ui/ErrorBoundary.tsx` |
| | ApiError | `src/components/ui/ApiError.tsx` |
| | Skeleton | `src/components/ui/Skeleton.tsx` |
| **Layout** | Header | `src/components/layout/Header.tsx` |
| | HomeHeader | `src/components/layout/HomeHeader.tsx` |
| | PageIndicator | `src/components/layout/PageIndicator.tsx` |

### 커스텀 훅

| 훅 | 설명 |
|----|------|
| `useAuth` | 로그인/회원가입/OAuth/로그아웃 |
| `useStories` | 동화 목록/상세/페이지 조회 |
| `useProgress` | 진행률 조회/저장 |
| `useSubscription` | 구독 플랜/상태/해지 |
| `useUser` | 프로필 수정/회원 탈퇴 |

---

## 접근성 (Accessibility)

| 기능 | 적용 위치 |
|------|----------|
| `accessibilityState={{ selected }}` | 필터 버튼, 언어 선택 |
| `accessibilityElementsHidden` | 장식용 이모지 |
| `accessibilityLabel` | 아이콘 버튼 (닫기, 설정, 네비게이션, 카메라) |
| `accessibilityRole="radio"` | 구독 플랜 선택 |
| `accessibilityRole="switch"` | 자동 넘기기 토글 |
| `accessibilityRole="checkbox"` | 약관 동의 체크박스 |

---

## 개발 명령어

```bash
npm run dev          # Expo 개발 서버
npm run dev:web      # 웹 브라우저 (http://localhost:3000)
npm run dev:android  # Android
npm run dev:ios      # iOS

npm run build        # 빌드 (export)
npm run ts:check     # TypeScript 검사
```

## 환경 변수

`.env` 파일:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

**프로덕션 API:**
```
https://ddukddak-api-2lb4yqjazq-du.a.run.app/api
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

## Claude Code Commands

| 커맨드 | 용도 |
|--------|------|
| `/dd-commit [push]` | 커밋 생성 (push 옵션) |
| `/dd-build` | 빌드 및 에러 수정 |
| `/dd-figma <url>` | Figma -> 코드 변환 |
| `/dd-security-check [type]` | 보안 검토 |
| `/dd-expo-screen [name] [type]` | 새 화면 생성 (tab/modal/stack) |
| `/dd-expo-check [type]` | 프로젝트 상태 체크 (deps/config/ts) |

---

## EAS 배포 가이드

### 배포 파일 구조

```
ddukddak-web/
├── eas.json                      # EAS 빌드 프로필 (preview/production)
├── app.json                      # Expo 앱 설정 + EAS 업데이트 설정
└── .github/workflows/
    ├── preview.yml               # PR 시 preview 빌드
    └── production.yml            # main 머지 시 production 배포
```

### 배포 프로필

| 프로필 | 용도 | 트리거 | 빌드 타입 |
|--------|------|--------|----------|
| `development` | 로컬 개발 | 수동 | APK (debug) |
| `preview` | 테스트/QA | PR 생성 시 | APK (internal) |
| `production` | 실서비스 | main 머지 | AAB (app-bundle) |

### 초기 설정 (최초 1회)

```bash
# 1. EAS CLI 설치
npm install -g eas-cli

# 2. Expo 계정 로그인
eas login

# 3. 프로젝트 연결 (projectId 자동 생성)
eas build:configure

# 4. EAS Secrets 설정 (환경 변수) - eas env:create 사용
eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxx.supabase.co" --environment production --visibility plain
eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your_anon_key" --environment production --visibility sensitive
eas env:create --name EXPO_PUBLIC_API_URL --value "https://api.ddukddak.com" --environment production --visibility plain
```

### GitHub Secrets 설정

| Secret | 설명 |
|--------|------|
| `EXPO_TOKEN` | Expo 액세스 토큰 ([expo.dev](https://expo.dev/accounts/settings/access-tokens)) |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `EXPO_PUBLIC_API_URL` | 백엔드 API URL |

### 수동 빌드 명령어

```bash
# Preview APK 빌드
eas build --platform android --profile preview

# Production AAB 빌드
eas build --platform android --profile production

# Web 배포
npx expo export --platform web
eas deploy
```

### 참고 문서

- [EAS Build 공식 문서](https://docs.expo.dev/build/introduction/)
- [EAS Hosting 문서](https://docs.expo.dev/eas/hosting/introduction/)
- [GitHub Actions + EAS](https://docs.expo.dev/build/building-on-ci/)

---

### 주의사항 (빌드 트러블슈팅)

| 문제 | 원인 | 해결 |
|------|------|------|
| `react-native-worklets` 충돌 | reanimated 3.x에 이미 worklets 내장 | `react-native-worklets` 제거 |
| `nativewind` 4.2.x Babel 에러 | `css-interop@0.2.1`이 worklets/plugin 요구 | `nativewind@4.1.23` 고정 |
| `eas hosting:deploy` not found | 명령어 변경됨 | `eas deploy` 사용 |
| 아이콘 not square | EAS 빌드 시 정사각형 필수 | 940x940 정사각형 이미지 사용 |

---

*마지막 업데이트: 2026-01-30 (EAS 배포 완료, 트러블슈팅 추가)*
