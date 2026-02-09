# 프론트엔드 작업 보고서

> 작업지시서: `WORK_ORDER_PRONG.md` v9 (2026-02-08) 기준
> 작업자: 프롱 (프론트엔드)
> 보고일: 2026-02-09
> PR: #15

---

## 1. 탭바 텍스트 잘림 수정 (P1)

### 상태: 완료

PR #14에서 80→60px로 줄인 영향으로 GowunDodum 한글 글리프가 `overflow: hidden`에 의해 잘리는 문제.

| 항목 | 요청 사항 | 결과 | 비고 |
|------|----------|------|------|
| 탭바 높이 | 64~68px | **64px** | 컴팩트 유지 |
| paddingBottom | 조정 | **10px** | 라벨 하단 여유 확보 |
| paddingTop | 유지 | **6px** | - |
| 라벨 overflow | 잘림 해결 | `overflow: "visible"` | 근본 원인 해결 |

### 설계 결정
- GowunDodum 한글 글리프가 Expo 탭바 내부 `overflow: hidden` 컨테이너(11px)에서 잘림. `overflow: "visible"` 직접 지정으로 라벨 높이 11px → 16px 확보. 높이를 무작정 키우지 않고 근본 원인 해결.

---

## 2. UI 폰트 Gowun Dodum 적용 (P1)

### 상태: 완료

Pretendard(비즈니스) → GowunDodum(부드럽고 따뜻한) 폰트로 전체 UI 변경.

| 항목 | 요청 사항 | 결과 | 비고 |
|------|----------|------|------|
| tailwind 기본 폰트 | GowunDodum | `fontFamily.sans: ["GowunDodum"]` | 모든 텍스트에 자동 적용 |
| 탭바 라벨 | GowunDodum | `fontFamily: "GowunDodum"` | 직접 지정 (시스템 기본 폰트 우회) |
| 동화 뷰어 자막 | 유지 | `fontFamily: "GowunDodum"` (기존) | 변경 없음 |

### 설계 결정
- `tailwind.config.ts`에서 `fontFamily.sans`를 `["GowunDodum"]`으로 설정하여 NativeWind의 기본 폰트를 일괄 변경. Pretendard는 `font-pretendard` 클래스로 필요 시 개별 사용 가능.
- GowunDodum은 Bold 웨이트가 없는 단일 웨이트 폰트이므로, `fontWeight: "bold"` 적용 시 시스템이 합성 볼드 처리함.

---

## 3. 동화 목록 썸네일 3:2 비율 (P1)

### 상태: 완료

동화 탭(S-06) 썸네일 비율 조정. 잡스 피드백으로 1:1 대신 3:2로 최종 결정.

| 항목 | 요청 사항 | 결과 | 비고 |
|------|----------|------|------|
| 목록 썸네일 | 4:5 → 3:2 | `aspect-[3/2]` | 가로형 crop, `contentFit="cover"` |
| 뷰어 이미지 | 유지 | 3:2 (변경 없음) | - |
| 홈 배너/카드 | 기존 유지 | 변경 없음 | - |

---

## 4. 교훈(lesson) 카테고리 제거 (P1)

### 상태: 완료

"교훈" 카테고리 독립성 부족 → 제거. 4개 카테고리로 축소.

| 항목 | 요청 사항 | 결과 | 비고 |
|------|----------|------|------|
| CATEGORY_OPTIONS | "교훈" 제거 | 필터에서 제거 | `constants.ts` |
| 홈 카테고리 섹션 | "교훈 동화" 제거 | `lesson` 섹션 제거 | `home.tsx` |
| CATEGORY_EMOJIS | "교훈" 제거 | 이모지 매핑 제거 | `home.tsx` |
| StoryCategory 타입 | 유지 | `"lesson"` 유지 | 백엔드 호환 |
| CATEGORY_LABELS 등 | 유지 | 유지 | 기존 데이터 표시용 |

### 설계 결정
- 타입과 매핑 상수는 유지 (백엔드에 아직 `lesson` 카테고리 데이터 존재). UI 필터와 홈 섹션에서만 제거.

---

## 5. 뷰어 컨트롤 반투명 + 색상 톤다운 (P2)

### 상태: 완료

동화 감상 몰입도 향상을 위한 반투명 처리 + 아이콘/텍스트 색상 톤다운.

| 항목 | 요청 사항 | 결과 | 비고 |
|------|----------|------|------|
| 상단 바 (닫기/설정) | 반투명 | `bg-black/20`, 아이콘 `#FFFFFFD9` (85%) | 영역 + 아이콘 톤다운 |
| 재생 컨트롤 영역 | 반투명 | `bg-black/20` | 80% 투명도 |
| 재생/이전/다음 버튼 | 색상 완화 | `bg-primary/85`, 아이콘 `#FFFFFFD9` | 15% 투명도 + 아이콘 85% |
| 프로그레스 바 | 반투명 + 톤다운 | `bg-primary/85`, 카운터 `text-white/50` | |
| 하단 버튼 (언어/TTS/BGM) | 반투명 + 톤다운 | `bg-primary/85`, 텍스트 `text-white/85` | 활성 시 85% 흰색 |

---

## 6. 모바일 폰트 크기 반응형 (추가)

### 상태: 완료

모바일(< 768px)에서 텍스트가 크게 보이는 문제. NativeWind 반응형 클래스로 해결.

| 요소 | 모바일 | 태블릿/웹 (≥768px) |
|------|--------|-------------------|
| 헤더 "뚝딱동화" | `text-base` (16px) | `md:text-lg` (18px) |
| 배너 제목 | `text-lg` (18px) | `md:text-xl` (20px) |
| 카테고리 제목 | `text-base` (16px) | `md:text-lg` (18px) |
| 동화 상세 제목 | `text-xl` (20px) | `md:text-2xl` (24px) |
| 동화 상세 설명 | `text-sm` (14px) | `md:text-base` (16px) |

---

## 7. Google Play 출시 (P0)

### 상태: 대기 (잡스 블로커)

| 항목 | 상태 | 담당 |
|------|------|------|
| 앱 아이콘 (512x512) | ⏳ 대기 | 잡스 |
| Feature Graphic (1024x500) | ⏳ 대기 | 잡스 |
| 개발자 계정 + 서비스 계정 키 | ⏳ 대기 | 잡스 |

---

## 8. 개인정보/이용약관 URL 교체

### 상태: 대기 (잡스 전달 대기)

잡스가 실제 URL 전달하면 `app/(tabs)/settings/index.tsx` 상수 교체 예정.

---

## 코난에게 전달 사항

- **교훈 카테고리 재분류**: 캉테가 스토리 JSON에서 `lesson` → `folktale` 변경 완료 후 재시드 필요
- 재시드 완료 후 프론트에서 `StoryCategory` 타입에서 `"lesson"` 제거 가능

## 잡스에게 요청 사항

1. **Google Play 블로커 해소**: 앱 아이콘, Feature Graphic, 개발자 계정 키 전달
2. **개인정보/이용약관 URL 전달**: 실제 URL 확정 시 즉시 교체 가능
3. **GowunDodum Bold 없음 확인**: Bold 웨이트가 없어 시스템 합성 볼드 사용 중. 가독성 문제 있으면 피드백 필요

---

## 변경 파일 목록

| 파일 | 변경 |
|------|------|
| `app/(tabs)/_layout.tsx` | 탭바 높이 64px, 폰트 GowunDodum, `overflow: "visible"` |
| `tailwind.config.ts` | 기본 폰트 `sans: ["GowunDodum"]` |
| `src/components/ui/StoryCard.tsx` | 썸네일 `aspect-[4/5]` → `aspect-[3/2]` |
| `src/lib/constants.ts` | CATEGORY_OPTIONS에서 교훈 제거 |
| `app/(tabs)/home.tsx` | 교훈 섹션 제거, 반응형 폰트 크기 |
| `src/components/layout/HomeHeader.tsx` | 반응형 폰트 크기 |
| `app/story/[id].tsx` | 반응형 폰트 크기 |
| `app/story/[id]/viewer.tsx` | 컨트롤 반투명 + 아이콘/텍스트 85% 톤다운 |
