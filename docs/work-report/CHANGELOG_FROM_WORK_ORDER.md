# 프론트엔드 작업 보고서

> 작업지시서: `WORK_ORDER_PRONG.md` v12 (2026-03-01) 기준
> 작업자: 프롱 (프론트엔드)
> 보고일: 2026-03-01
> PR: [#28](https://github.com/youngkim90/ddukddak-web/pull/28) (TTS 버그픽스, main 머지 완료) · [#29](https://github.com/youngkim90/ddukddak-web/pull/29) (F-212 페이지 전환 애니메이션, 리뷰 대기)

---

## 1. 01~03 실데이터 순차 검증

### 상태: ⏳ 대기 — 캉테 데이터 미도착

캉테의 01~03 문장 단위 오디오 반영 작업 진행 중. 데이터 도착 즉시 착수 예정.

| 항목 | 요청 사항 | 결과 | 비고 |
|------|----------|------|------|
| 01 문장 큐 재생 | 정상 동작 확인 | ⏳ 대기 | 캉테 반영 대기 |
| 02 문장 큐 재생 | 정상 동작 확인 | ⏳ 대기 | 캉테 반영 대기 |
| 03 문장 큐 재생 | 정상 동작 확인 | ⏳ 대기 | 캉테 반영 대기 |
| 하이라이트 인덱스 | 정상 확인 | ⏳ 대기 | |
| 언어 전환 인덱스 | 정상 확인 | ⏳ 대기 | |
| 자동 넘김 | 정상 확인 | ⏳ 대기 | |
| fallback 분기 | 정상 확인 | ⏳ 대기 | |

---

## 2. iOS/Android 동시 검증

### 상태: ✅ iOS 완료 / ⏳ Android 미수행

iPhone 17 Pro 시뮬레이터 기준으로 문장 단위 TTS 전체 플로우 검증 수행.

| 항목 | iOS | Android |
|------|-----|---------|
| TTS 재생 시작 | ✅ | ⏳ |
| 문장 하이라이트 | ✅ | ⏳ |
| 자동 페이지 넘김 | ✅ | ⏳ |
| 언어 전환 | ✅ | ⏳ |
| 재생/일시정지 | ✅ | ⏳ |
| 페이지 전환 애니메이션 | 실데이터 검증 시 통합 확인 예정 | ⏳ |

### iOS 발견 버그 및 수정 (PR #28, main 머지 완료)

| 버그 | 원인 | 수정 |
|------|------|------|
| TTS 재생 안됨 | SILENT_WAV play → AbortError | SILENT_WAV 제거, 요소 생성만 수행 |
| 자동 넘김 안됨 | `stopAll()` await → 제스처 컨텍스트 만료 | fire-and-forget 전환 |
| 재생 버튼 무반응 | `idle`/`page_complete` 상태 핸들링 누락 | `restart()` 메서드 추가 |
| 자막 공백 | TTS 미시작(index=-1) 시 첫 문장 미표시 | `Math.max(0, index)` 처리 |

---

## 3. 운영 튜닝

### 상태: ✅ 검토 완료 — 일부 조정

| 튜닝 항목 | 이전값 | 조정값 | 판단 |
|----------|--------|--------|------|
| `SENTENCE_GAP_MS` | 400ms | 400ms | 실데이터 검증 전 변경 보류. 자연스러운 호흡 간격으로 적정 |
| `PAGE_TRANSITION_DELAY_MS` | 500ms | **700ms** | 페이지 전환 애니메이션(400ms) 추가로 여유 시간 확보 |
| 하이라이트 가독성 | 단일 문장 (흰색 + 대사 노란색) | 현행 유지 | 아이 독서 특성상 단일 집중 표시 적합 |
| 긴 페이지 자동 스크롤 | 해당 없음 | 해당 없음 | 고정 레이아웃, 스크롤 구조 없음 |

---

## 4. Sentry 에러 포인트 정리

### 상태: ✅ 완료 — useSentenceTts.ts 코드 마킹

Sentry SDK 도입 전 단계로, 코드 내 3개 포인트에 구조화된 TODO 주석 추가.

| 이벤트 | 파일 | 조건 |
|--------|------|------|
| `tts.sentence.load_error` | `useSentenceTts.ts` onerror 핸들러 | 오디오 파일 로드 실패 |
| `tts.sentence.playback_error` | `useSentenceTts.ts` trackedPlay catch | play() 거부 (NotAllowedError, AbortError 등) |
| `tts.sentence.fallback` | `useSentenceTts.ts` startQueue | sentences 없음 또는 audioUrl 없어 페이지 단위로 폴백 |

---

## 5. [병렬] F-212 페이지 전환 애니메이션

### 상태: ✅ 구현 완료 (PR #29)

지시서에서는 "기술 검토 리포트" 수준을 요청했으나, 검토 결과 Reanimated 3만으로 즉시 구현 가능하다고 판단해 잡스 확인 후 구현까지 진행.

### A. 후보 기술 비교

| 후보 | Expo 53 호환 | 크로스플랫폼 | 결론 |
|------|------------|------------|------|
| `react-native-page-curl` | ❌ npm 404 (존재하지 않음) | — | **사용 불가** |
| `Reanimated 3` 단독 | ✅ 이미 설치됨 | ✅ iOS/Android/Web | **채택** |
| `Reanimated 3 + Skia` | ✅ 추가 설치 필요 | ✅ | 추후 고려 |
| CSS 3D transform | 웹 전용 | ❌ | 적용 불가 |

### B. 구현 방식 결정 과정

잡스와 논의 후 사용자 테스트를 통해 아래 순서로 방식을 탐색:

| 시도 | 방식 | 결과 |
|------|------|------|
| 1차 | 단일 레이어 슬라이드 인 | 이전 페이지 flash 버그 |
| 2차 | 듀얼 레이어 좌우 슬라이드 | 자연스럽지만 "따로 논다" |
| 3차 | 이미지만 대각선 슬라이드 | 컨테이너째 이동하는 느낌 |
| **4차** | **이미지만 크로스페이드** | **✅ 최종 채택** |

### C. 최종 구현 사양

| 항목 | 값 |
|------|-----|
| 전환 방식 | 이미지 영역 고정, 이미지 콘텐츠만 opacity 0→1 fade-in |
| 애니메이션 | 400ms, `Easing.inOut(Easing.cubic)` |
| 자막 영역 | 고정 (애니메이션 없음) |
| 연속 탭 방지 | `isAnimatingRef`로 400ms debounce |
| 이전 이미지 처리 | exit 레이어 absoluteFill 정지 대기 → fade-in 완료 후 제거 |

### D. 설계 결정

- **크로스페이드 채택 이유**: 이미지 컨테이너가 고정된 채 내용만 바뀌는 "책 페이지 내용 교체" 느낌이 동화 뷰어에 가장 자연스럽다고 판단. 슬라이드는 "앱 화면 전환" 느낌이 강해 아이 독서 몰입에 방해 가능
- **`useLayoutEffect` 활용**: React 렌더 후 페인트 전 시점에 opacity를 0으로 세팅 → 새 이미지 flash 없이 깔끔한 fade-in 시작
- **Skia 업그레이드**: 실데이터 검증 + 사용자 반응 확인 후 결정. 현재 크로스페이드로 충분

---

## 코난에게 전달 사항

- 없음 (이번 작업 모두 프론트 단독)

## 잡스에게 요청 사항

1. **캉테 01~03 반영 완료 시 즉시 공유 요청** — 실데이터 검증 착수 필요
2. **F-212 페이지 전환 효과 피드백** — PR #29 머지 전 테스트 빌드 확인 요청
3. **Sentry 도입 일정 공유** — 도입 시 3개 포인트 즉시 연동 가능 상태

---

## 변경 파일 목록

| 파일 | 변경 | PR |
|------|------|-----|
| `src/lib/webTts.ts` | SILENT_WAV 제거, ensureWebTtsAudio() 추가 | #28 |
| `src/hooks/useSentenceTts.ts` | fire-and-forget stopAll, restart() 추가, Sentry 포인트 마킹 | #28 / #29 |
| `src/components/story/ViewerMainContent.tsx` | TTS 미시작 시 첫 문장 기본 표시, `imageStyle`/`hideSubtitle` prop 추가 | #28 / #29 |
| `app/story/[id]/viewer.tsx` | idle/page_complete 재시작 처리, 크로스페이드 애니메이션 추가 | #28 / #29 |
| `CLAUDE.md` | TTS 상태 업데이트, iOS Safari 규칙 추가 | #28 |
| `README.md` | TTS 항목 업데이트 | #28 |
