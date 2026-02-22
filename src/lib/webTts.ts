/**
 * Web TTS — 단일 HTMLAudioElement 재사용 (iOS Safari 오디오 정책 대응)
 *
 * iOS Safari는 새 HTMLAudioElement.play()마다 유저 제스처를 요구함.
 * 한번 제스처 내에서 play()된 요소는 src 변경 후에도 play() 가능.
 * → "읽기 시작" 버튼 탭 시 activate() 호출 → 이후 모든 TTS에서 재사용.
 */

// 약 0.1초 무음 WAV (base64)
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

let _audio: HTMLAudioElement | null = null;
let _playPromise: Promise<void> | null = null;
/** true = TTS가 재생 중이어야 하는 상태 */
let _shouldBePlaying = false;

/** 유저 제스처 핸들러 내에서 호출 — 오디오 요소 생성 + 활성화 */
export function activateWebTts(): void {
  if (typeof document === "undefined") return;

  if (!_audio) {
    _audio = document.createElement("audio");
    _audio.setAttribute("playsinline", "");
  }

  // 무음 재생으로 요소 "unlock" — play 완료 후 즉시 정리
  _audio.src = SILENT_WAV;
  _playPromise = _audio.play()
    .then(() => {
      _audio!.pause();
      _audio!.currentTime = 0;
    })
    .catch(() => {})
    .finally(() => { _playPromise = null; });
}

/** 활성화된 오디오 요소 반환 (없으면 null) */
export function getWebTtsAudio(): HTMLAudioElement | null {
  return _audio;
}

/** TTS가 재생 중이어야 하는 상태인지 (의도 기반) */
export function isWebTtsActive(): boolean {
  return _shouldBePlaying;
}

/** TTS 자연 종료 시 호출 — auto-advance 허용 */
export function markWebTtsDone(): void {
  _shouldBePlaying = false;
}

/** 비디오 미디어 세션에 의해 중단된 TTS를 명시적으로 재개 */
export function resumeWebTts(): void {
  if (!_shouldBePlaying || !_audio || _audio.ended) return;
  if (_audio.paused) {
    _audio.play().catch(() => {});
  }
}

/** 이전 play()가 완료될 때까지 대기 후 pause (AbortError 방지) */
export async function safePauseWebTts(): Promise<void> {
  _shouldBePlaying = false;
  if (!_audio) return;
  if (_playPromise) {
    await _playPromise.catch(() => {});
    _playPromise = null;
  }
  _audio.pause();
}

/** play()를 추적하며 호출 (AbortError를 내부에서 catch) */
export function trackedPlay(audio: HTMLAudioElement): Promise<void> {
  _shouldBePlaying = true;
  _playPromise = audio.play()
    .catch(() => { _shouldBePlaying = false; })
    .finally(() => { _playPromise = null; });
  return _playPromise;
}

/** 뷰어 언마운트 시 정리 */
export function cleanupWebTts(): void {
  _shouldBePlaying = false;
  if (!_audio) return;
  _audio.pause();
  _audio.onended = null;
  _audio.onerror = null;
  _audio.src = SILENT_WAV;
  _audio.currentTime = 0;
  _playPromise = null;
}
