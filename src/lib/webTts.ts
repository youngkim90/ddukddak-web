/**
 * Web TTS — 단일 HTMLAudioElement 재사용 (iOS Safari 오디오 정책 대응)
 *
 * iOS Safari: 무음 WAV play()로 unlock 시도 시 src 충돌(AbortError) 발생.
 * 대신 오디오 요소만 생성하고, 실제 MP3 play()를 제스처 안에서 직접 호출.
 * startQueue의 await 제거로 play()가 제스처 컨텍스트 내에서 동기적으로 호출됨.
 */

let _audio: HTMLAudioElement | null = null;
let _playPromise: Promise<void> | null = null;
/** true = TTS가 재생 중이어야 하는 상태 */
let _shouldBePlaying = false;

/** 유저 제스처 핸들러 내에서 호출 — 오디오 요소 생성 */
export function activateWebTts(): void {
  if (typeof document === "undefined") return;
  if (!_audio) {
    _audio = document.createElement("audio");
    _audio.setAttribute("playsinline", "");
  }
}

/** 오디오 요소만 생성 — 모듈 인스턴스 불일치 폴백용 */
export function ensureWebTtsAudio(): HTMLAudioElement | null {
  if (typeof document === "undefined") return null;
  if (!_audio) {
    _audio = document.createElement("audio");
    _audio.setAttribute("playsinline", "");
  }
  return _audio;
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

/** play()를 추적하며 호출 — 실패 시 에러를 호출자에게 전파 */
export function trackedPlay(audio: HTMLAudioElement): Promise<void> {
  _shouldBePlaying = true;
  const p = audio.play();
  _playPromise = p.catch(() => {}).finally(() => { _playPromise = null; });
  // 호출자에게는 원본 Promise 반환 (reject 전파)
  return p.catch((err) => {
    _shouldBePlaying = false;
    throw err;
  });
}

/** 뷰어 언마운트 시 정리 */
export function cleanupWebTts(): void {
  _shouldBePlaying = false;
  if (!_audio) return;
  _audio.pause();
  _audio.onended = null;
  _audio.onerror = null;
  _audio.currentTime = 0;
  _playPromise = null;
}
