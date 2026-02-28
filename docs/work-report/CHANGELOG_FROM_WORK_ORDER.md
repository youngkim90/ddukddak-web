# 프론트엔드 작업 보고서

> 작업지시서: `WORK_ORDER_PRONG.md` v11 (2026-02-23) 기준
> 작업자: 프롱 (프론트엔드)
> 보고일: 2026-02-25
> PR: 커밋 후 생성 예정

---

## 1. 문장 단위 TTS 재생 구현

### 상태: 완료

코난 API 스펙(`Sentence` 인터페이스) 수신 후 구현 완료.

| 항목 | 요청 사항 | 결과 | 비고 |
|------|----------|------|------|
| `useSentenceTts` 훅 분리 | 문장 큐 재생 로직 | ✅ 신규 파일 | 세대 카운터 경쟁 상태 방어 포함 |
| 문장 하이라이트 UI | 현재/완료/미재생 구분 | ✅ 구현 | 현재 문장 자동 스크롤 포함 |
| 페이지 단위 폴백 | sentences 비어있을 때 | ✅ 구현 | `isSentenceMode` 플래그로 분기 |
| 웹 재생 | HTMLAudioElement src 교체 | ✅ 구현 | 기존 webTts 패턴 확장 |
| 앱 재생 | expo-av double-buffering | ✅ 구현 | Sound 2개 교대 + 프리로드 |
| 언어 전환 | 동일 인덱스 유지 | ✅ 구현 | 코난 API가 한/영 단일 배열 → 매핑 문제 없음 |

### 설계 결정

1. **코난 API 방식 채택**: v10 보고서에서 `sentencesKo[]`/`sentencesEn[]` 분리를 제안했으나, 코난이 단일 `sentences[]` 배열(각 항목에 ko/en 포함)로 구현 → 언어 인덱스 매핑 문제가 자동 해결되어 더 나은 구조
2. **viewer.tsx 최소 변경**: 기존 TTS 로직(playTts, ttsEnabled 토글, 볼륨 등)을 유지하고, 문장 모드일 때만 `useSentenceTts` 훅에 위임. `isSentenceMode` 플래그로 분기하여 기존 코드 영향 최소화
3. **문장 간 대기**: 400ms 설정 (SENTENCE_GAP_MS). 잡스 확정 후 조정 가능
4. **오디오 없는 문장**: audioUrl이 없는 문장은 자동 skip → 다음 문장으로 진행

---

## 2. Sentry 에러 모니터링

### 상태: 제외 (사용자 지시)

Sentry 미도입 상태이므로 이번 작업에서 제외.

---

## 코난에게 전달 사항

1. **프론트 연동 완료**: `Sentence` 인터페이스 기반 타입 정의 + 재생 로직 구현됨
2. **테스트 데이터 필요**: 현재 01~03번 동화는 `sentences: []` → 문장 모드 동작 검증 불가. 캉테 04번 데이터 준비되면 연동 테스트 예정
3. **하위 호환 정상**: sentences 빈 배열일 때 기존 페이지 단위 재생 폴백 확인됨

## 잡스에게 요청 사항

1. **문장 하이라이트 디자인 확정**: 현재 임시 스타일 적용 (현재 문장: 흰색+배경, 완료: 50% 투명, 미재생: 35% 투명). Figma 정식 디자인 필요
2. **문장 간 대기 시간**: 현재 400ms 설정. 확정 필요
3. **Google Play 블로커**: 앱 아이콘, Feature Graphic, 개발자 계정 키 전달

---

## 변경 파일 목록

| 파일 | 변경 |
|------|------|
| `src/types/story.ts` | `Sentence` 인터페이스 추가, `StoryPage.sentences` 필드 추가 |
| `src/hooks/useSentenceTts.ts` | 신규 — 문장 큐 재생 훅 (웹 + 네이티브) |
| `src/components/story/ViewerMainContent.tsx` | 문장 하이라이트 렌더링 + 자동 스크롤 |
| `app/story/[id]/viewer.tsx` | useSentenceTts 통합, 문장/레거시 모드 분기 |
