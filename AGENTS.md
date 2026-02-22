# ddukddak-web (ddukddak-app) - Codex Notes

AI fairy tale service mobile app built with Expo/Expo Router for iOS, Android, and Web.

## Agent Identity
- Frontend owner in this project: `프롱`.
- Codex should operate in this repo as `프롱` (frontend 담당자) and keep decisions aligned with frontend scope.

## Project Overview
- Product: "뚝딱동화" cross-platform app (mobile-first web layout).
- Role split in monorepo: planning, content, backend, frontend live under `fairytale/`.
- Current state: core app features and API integration are complete; Google Play release pending.

## Tech Stack
- Expo 53 + Expo Router 5
- TypeScript 5
- NativeWind (Tailwind 3) + React Native Reanimated
- Zustand (client state), TanStack Query (server state)
- Supabase Auth (Google/Kakao OAuth)
- expo-image, expo-video

## Repo Structure (Frontend)
```
app/                            # Expo Router routes
  _layout.tsx                   # font loading, providers, auth guard, web container
  index.tsx                     # splash
  onboarding.tsx
  login.tsx
  signup.tsx
  (tabs)/                       # protected tabs
    _layout.tsx
    home.tsx
    stories.tsx
    settings/
      _layout.tsx
      index.tsx
      profile.tsx
      subscription.tsx
  story/
    [id].tsx                    # story detail
    [id]/viewer.tsx             # story viewer
  subscription.tsx
  payment.tsx
  auth/callback.tsx             # OAuth callback (web/native split)

src/
  components/
    ui/                         # Button, Card, Input, Skeleton, etc.
    layout/                     # Header, HomeHeader, PageIndicator
  hooks/                        # useAuth, useStories, useProgress, useSubscription, useUser
  lib/                          # api, supabase, constants, utils, layout
  providers/                    # QueryProvider, AuthProvider
  stores/                       # authStore (Zustand + AsyncStorage)
  types/                        # story.ts, index.ts
```

## Module Architecture (Expo)
- Route layer: `app/**` contains screen composition and navigation only.
- Domain/UI layer: `src/components/**` renders reusable UI/layout blocks.
- Data layer: `src/hooks/**` wraps TanStack Query and exposes screen-friendly APIs.
- Infra layer: `src/lib/**` contains API client, Supabase client, constants, platform utils.
- App state: `src/stores/authStore.ts` (persisted auth/subscription), bootstrapped by providers.
- Bootstrap chain in `app/_layout.tsx`: fonts/splash -> `QueryProvider` -> `AuthProvider` -> `AuthGuard` -> `Stack`.

## Data/Auth Flow
- API auth token injection is centralized in `src/lib/api.ts` via `supabase.auth.getSession()`.
- `401` from backend triggers `supabase.auth.signOut()` in API client.
- `AuthProvider` initializes user/subscription from backend and listens to Supabase auth events.
- Query defaults are centralized in `src/providers/QueryProvider.tsx` (`staleTime=5m`, `retry=1`).
- Login/OAuth success path resets progress and clears related query cache in `src/hooks/useAuth.ts`.

## Key App Behaviors
- Web is mobile-first: maintain a fixed aspect ratio container on tablet/desktop.
  - Layout constants/util: `src/lib/layout.ts`
  - Container wrapper: `app/_layout.tsx`
- OAuth:
  - Web: full-page redirect, detect session in URL.
  - Native: in-app browser popup (`openAuthSessionAsync`).
- FREE_MODE:
  - `src/lib/constants.ts` `FREE_MODE` defaults true (env override).
  - Unlocks content and disables subscription/payment UI.
- Story viewer:
  - `StoryPage.mediaType` supports `image` or `video`.
  - Video uses `expo-video` with muted loop and image fallback.

## Expo Config Snapshot
- `app.json`: `newArchEnabled: true`, `typedRoutes: true`, scheme `ddukddak`, EAS update URL configured.
- `eas.json`: channels split by `development` / `preview` / `production`.
- `metro.config.js`: web resolver conditions include `"react-native"` to avoid ESM/import-meta issues.
- `tailwind.config.ts`: design tokens and font families are pre-defined; reuse tokens instead of raw values.

## Environment
`.env`:
```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```
Production API: `https://ddukddak-api-2lb4yqjazq-du.a.run.app/api`

## Source Of Truth Priority
- 1) Runtime code/types: `src/types/**`, `src/lib/**`, `app/**`
- 2) Project handbook: `CLAUDE.md`
- 3) Supporting docs: `README.md`, `docs/**`
- Note: `docs/API_SPEC.md` can lag behind implementation; validate API shape against `src/types/story.ts` and actual hooks/client usage.

## Commands
```
npm run dev          # Expo dev server
npm run dev:web      # Web
npm run dev:android  # Android
npm run dev:ios      # iOS
npm run build        # export build
npm run ts:check     # TypeScript check
```

## Conventions
- One component per file; use `export function` (pages use default export).
- Prefer NativeWind classes over inline styles.
- Use TanStack Query for server state, Zustand for client state.
- Add accessibility props where relevant.

## Local Commands/Skills (.claude)
Commands:
- `dd-brainstorm`, `dd-build`, `dd-commit`, `dd-expo-check`, `dd-expo-screen`
- `dd-figma`, `dd-pr`, `dd-security-check`, `dd-work-order`, `dd-work`

Skills:
- `component`, `expo-best-practices`, `react-best-practices`, `review`, `web-design-guidelines`

Recommended command usage:
- Task execution from discussion: `dd-work`
- Work-order driven implementation/reporting: `dd-work-order`
- Pre-PR verification/fixes: `dd-build`, `dd-expo-check`
- Commit/PR automation: `dd-commit`, `dd-pr`
- Security-focused pass: `dd-security-check`

Skill usage notes:
- Prefer `expo-best-practices` for Expo Router/mobile decisions.
- Use `component` for component scaffolding conventions in this repo.
- `react-best-practices` and `review` include Next.js/web-oriented rules; apply selectively for React-general performance/code quality only.
- `web-design-guidelines` is web UI audit-oriented and requires fetching external guideline content.

## Command Invocation Rule
- If user says a command name like `dd-commit`, resolve and read `.claude/commands/dd-commit.md`.
- Execute the command workflow as written (required checks, ordering, output format), not a simplified variant.
- If command has arguments (example: `dd-work all`), apply argument semantics defined in that command file.

## Related Repos (Monorepo)
```
fairytale-planning/  # planning docs
ddukddak-story/      # content generation
ddukddak-api/        # NestJS backend
ddukddak-web/        # this app
```
