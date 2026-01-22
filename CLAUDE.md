# 뚝딱동화 - 프론트엔드 (ddukddak-web)

> AI 동화 서비스 프론트엔드 프로젝트

---

## 📚 기획 문서 참조

**중요: 개발 전 반드시 기획 문서를 참고하세요.**

```
../fairytale-planning/docs/
├── 2_FEATURES.md     # 기능 요구사항 (User Story)
├── 3_SCREENS.md      # 화면 설계, 와이어프레임
├── 4_TECH_STACK.md   # 기술 스택, 프로젝트 구조
├── 5_API_SPEC.md     # API 명세서
└── 6_DEV_PLAN.md     # 개발 계획서 ⭐
```

- **Figma 와이어프레임**: https://www.figma.com/design/xgSTViIo7HytQATKKWSu7q/Tuktak

---

## 🎯 현재 개발 단계

**Phase 1: 프론트엔드 (Mock 데이터)**

| Task | 상태 | 설명 |
|------|------|------|
| 1-1. 프로젝트 세팅 | ✅ 완료 | Next.js 15 + TypeScript + Tailwind |
| 1-2. 공통 컴포넌트 | ⏳ 진행 예정 | Button, Card, Modal, Layout |
| 1-3. 인증 화면 | ⏳ | 로그인, 회원가입, Supabase Auth |
| 1-4. 스플래시 + 온보딩 | ⏳ | |
| 1-5. 홈 화면 | ⏳ | |
| 1-6. 동화 목록 + 상세 | ⏳ | |
| 1-7. 동화 뷰어 ⭐ | ⏳ | 핵심 기능 |
| 1-8. 구독 + 결제 | ⏳ | |
| 1-9. 설정 화면 | ⏳ | |

---

## 🛠️ 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| Framework | Next.js | 15.x (App Router) |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| State | Zustand | - |
| Server State | TanStack Query | - |
| Auth | Supabase Auth | - |
| Animation | Framer Motion | - |
| Icons | Lucide React | - |

---

## 🎨 디자인 가이드

### 컬러

| 용도 | 색상 | 코드 |
|------|------|------|
| Primary | 오렌지 | `#FF9500` |
| Secondary | 하늘색 | `#5AC8FA` |
| Background | 크림색 | `#FFF9F0` |
| Surface | 화이트 | `#FFFFFF` |
| Text | 다크 그레이 | `#333333` |

### 스타일

- 버튼 radius: 12px
- 카드 radius: 16px
- 기준 화면: 390x844 (모바일)

---

## 📁 프로젝트 구조

```
src/
├── app/                    # App Router
│   ├── (auth)/             # 인증 그룹
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/             # 메인 그룹
│   │   ├── page.tsx        # 홈
│   │   ├── stories/        # 동화 목록
│   │   └── story/[id]/     # 동화 상세/뷰어
│   ├── subscription/       # 구독
│   ├── settings/           # 설정
│   └── layout.tsx
│
├── components/             # 공통 컴포넌트
│   ├── ui/                 # 버튼, 카드, 모달 등
│   ├── layout/             # 헤더, 탭바 등
│   └── story/              # 동화 관련 컴포넌트
│
├── features/               # 기능별 모듈
│   ├── auth/               # 인증 로직
│   ├── story/              # 동화 로직
│   └── subscription/       # 구독 로직
│
├── hooks/                  # 커스텀 훅
├── lib/                    # 유틸리티
│   ├── supabase.ts         # Supabase 클라이언트
│   └── api.ts              # API 클라이언트
│
├── stores/                 # Zustand 스토어
├── types/                  # TypeScript 타입
└── styles/                 # 글로벌 스타일
```

---

## 🔧 환경 변수

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_xxx
```

---

## 🚀 개발 명령어

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start

# 린트
npm run lint
```

---

## 📝 개발 규칙

1. **기획 문서 우선**: 개발 전 `fairytale-planning/docs/` 참고
2. **컴포넌트 분리**: 재사용 가능한 단위로 분리
3. **타입 정의**: `types/` 폴더에 공통 타입 정의
4. **Mock 데이터**: Phase 1에서는 Mock 데이터 사용, Phase 2에서 API 연동

---

## 🎓 개발 가이드라인 (Skills)

React/Next.js 코드 작성 시 아래 가이드라인을 참고하세요:

- **React 성능 최적화**: @.claude/skills/react-best-practices/SKILL.md
- **웹 디자인 가이드**: @.claude/skills/web-design-guidelines/SKILL.md

---

*마지막 업데이트: 2026-01-22*
