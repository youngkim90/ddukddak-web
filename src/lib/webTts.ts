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

/** 유저 제스처 핸들러 내에서 호출 — 오디오 요소 생성 + 활성화 */
export function activateWebTts(): void {
  if (typeof document === "undefined") return;

  if (!_audio) {
    _audio = document.createElement("audio");
    _audio.setAttribute("playsinline", "");
  }

  // 무음 재생으로 요소 "unlock"
  _audio.src = SILENT_WAV;
  _audio.play()
    .then(() => {
      _audio!.pause();
      _audio!.currentTime = 0;
    })
    .catch(() => {});
}

/** 활성화된 오디오 요소 반환 (없으면 null) */
export function getWebTtsAudio(): HTMLAudioElement | null {
  return _audio;
}

/** 뷰어 언마운트 시 정리 */
export function cleanupWebTts(): void {
  if (!_audio) return;
  _audio.pause();
  _audio.onended = null;
  _audio.onerror = null;
  _audio.src = "";
}
