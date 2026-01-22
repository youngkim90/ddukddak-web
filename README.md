# 뚝딱동화 (ddukddak-web)

AI 동화 서비스 프론트엔드

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State**: Zustand, TanStack Query
- **Auth**: Supabase Auth

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 린트
npm run lint
```

## 환경 변수

`.env.local` 파일 생성:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_URL=
```

## 프로젝트 구조

```
src/
├── app/           # App Router 페이지
├── components/    # 공통 컴포넌트
├── features/      # 기능별 모듈
├── hooks/         # 커스텀 훅
├── lib/           # 유틸리티
├── stores/        # Zustand 스토어
└── types/         # TypeScript 타입
```
