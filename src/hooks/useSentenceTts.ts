/**
 * useSentenceTts — 문장 단위 TTS 큐 재생 훅
 *
 * sentences[].audioUrl이 있으면 문장 단위 순차 재생 + 하이라이트
 * sentences가 비어있거나 audioUrl이 없으면 기존 페이지 단위 폴백
 *
 * 웹: webTts.ts의 단일 HTMLAudioElement src 교체 방식
 * 네이티브: expo-av Audio.Sound double-buffering (2개 교대)
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { Audio } from "expo-av";
import type { Sentence } from "@/types/story";
import {
  getWebTtsAudio,
  safePauseWebTts,
  trackedPlay,
  markWebTtsDone,
  isWebTtsActive,
} from "@/lib/webTts";

export type SentenceTtsState =
  | "idle"
  | "playing"
  | "paused"
  | "page_complete";

interface UseSentenceTtsParams {
  sentences: Sentence[];
  language: "ko" | "en";
  enabled: boolean;
  volume: number;
  /** 진행률 복원 완료 후 true */
  ready: boolean;
  onAllComplete: () => void;
}

interface UseSentenceTtsReturn {
  currentIndex: number;
  state: SentenceTtsState;
  /** 문장 단위 모드인지 (false면 기존 페이지 단위 폴백) */
  isSentenceMode: boolean;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  /** 페이지 전환 등으로 큐 즉시 중단 */
  reset: () => void;
}

/** 문장 간 대기 시간 (ms) */
const SENTENCE_GAP_MS = 400;

export function useSentenceTts({
  sentences,
  language,
  enabled,
  volume,
  ready,
  onAllComplete,
}: UseSentenceTtsParams): UseSentenceTtsReturn {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [state, setState] = useState<SentenceTtsState>("idle");

  // 세대 카운터 — 페이지/언어 전환 시 이전 큐 무효화
  const generationRef = useRef(0);
  const indexRef = useRef(-1);
  const stateRef = useRef<SentenceTtsState>("idle");

  // 네이티브 double-buffering
  const soundARef = useRef<Audio.Sound | null>(null);
  const soundBRef = useRef<Audio.Sound | null>(null);
  const activeSlotRef = useRef<"A" | "B">("A");

  // 타이머
  const gapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // onAllComplete의 stale closure 방지
  const onAllCompleteRef = useRef(onAllComplete);
  onAllCompleteRef.current = onAllComplete;

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  // 문장 단위 모드 판정: sentences에 현재 언어 audioUrl이 1개라도 있는지
  const hasSentenceAudio = sentences.length > 0 && sentences.some(
    (s) => (language === "ko" ? s.audioUrlKo : s.audioUrlEn)
  );

  // ── 정리 헬퍼 ──

  const clearGapTimer = useCallback(() => {
    if (gapTimerRef.current) {
      clearTimeout(gapTimerRef.current);
      gapTimerRef.current = null;
    }
  }, []);

  const cleanupNativeSounds = useCallback(async () => {
    for (const ref of [soundARef, soundBRef]) {
      if (ref.current) {
        ref.current.setOnPlaybackStatusUpdate(null);
        try { await ref.current.unloadAsync(); } catch {}
        ref.current = null;
      }
    }
  }, []);

  const stopAll = useCallback(async () => {
    clearGapTimer();
    const webAudio = Platform.OS === "web" ? getWebTtsAudio() : null;
    if (webAudio) {
      await safePauseWebTts();
      webAudio.onended = null;
      webAudio.onerror = null;
    }
    await cleanupNativeSounds();
  }, [clearGapTimer, cleanupNativeSounds]);

  // ── 단일 문장 재생 ──

  const playSentence = useCallback(async (index: number, gen: number) => {
    if (gen !== generationRef.current) return;
    if (!enabledRef.current) {
      setState("page_complete");
      stateRef.current = "page_complete";
      onAllCompleteRef.current();
      return;
    }

    const sentence = sentences[index];
    if (!sentence) {
      setState("page_complete");
      stateRef.current = "page_complete";
      onAllCompleteRef.current();
      return;
    }

    const audioUrl = language === "ko" ? sentence.audioUrlKo : sentence.audioUrlEn;

    // 오디오 URL이 없는 문장은 skip → 다음 문장
    if (!audioUrl) {
      const nextIdx = index + 1;
      if (nextIdx < sentences.length) {
        setCurrentIndex(nextIdx);
        indexRef.current = nextIdx;
        // 짧은 갭 후 다음 문장
        gapTimerRef.current = setTimeout(() => {
          if (gen !== generationRef.current) return;
          playSentence(nextIdx, gen);
        }, SENTENCE_GAP_MS);
      } else {
        setState("page_complete");
        stateRef.current = "page_complete";
        setCurrentIndex(sentences.length - 1);
        indexRef.current = sentences.length - 1;
        onAllCompleteRef.current();
      }
      return;
    }

    setCurrentIndex(index);
    indexRef.current = index;
    setState("playing");
    stateRef.current = "playing";

    const onSentenceEnd = () => {
      if (gen !== generationRef.current) return;
      const nextIdx = index + 1;
      if (nextIdx < sentences.length) {
        // 문장 간 갭
        gapTimerRef.current = setTimeout(() => {
          if (gen !== generationRef.current) return;
          playSentence(nextIdx, gen);
        }, SENTENCE_GAP_MS);
      } else {
        // 모든 문장 완료
        if (Platform.OS === "web") markWebTtsDone();
        setState("page_complete");
        stateRef.current = "page_complete";
        onAllCompleteRef.current();
      }
    };

    const onSentenceError = () => {
      if (gen !== generationRef.current) return;
      // 에러 시 다음 문장으로 skip
      onSentenceEnd();
    };

    // ── 웹: HTMLAudioElement src 교체 ──
    if (Platform.OS === "web") {
      const webAudio = getWebTtsAudio();
      if (!webAudio) {
        onSentenceError();
        return;
      }

      webAudio.src = audioUrl;
      webAudio.volume = volumeRef.current / 100;
      webAudio.currentTime = 0;
      webAudio.onended = onSentenceEnd;
      webAudio.onerror = onSentenceError;

      try {
        await trackedPlay(webAudio);
        if (gen !== generationRef.current) {
          webAudio.pause();
          return;
        }
      } catch {
        onSentenceError();
      }
      return;
    }

    // ── 네이티브: expo-av double-buffering ──
    try {
      // 현재 슬롯 정리
      const currentSlot = activeSlotRef.current;
      const currentRef = currentSlot === "A" ? soundARef : soundBRef;
      if (currentRef.current) {
        currentRef.current.setOnPlaybackStatusUpdate(null);
        try { await currentRef.current.unloadAsync(); } catch {}
        currentRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { volume: volumeRef.current / 100, shouldPlay: true }
      );

      if (gen !== generationRef.current) {
        sound.unloadAsync().catch(() => {});
        return;
      }

      currentRef.current = sound;
      // 다음 문장은 반대 슬롯 사용
      activeSlotRef.current = currentSlot === "A" ? "B" : "A";

      // 다음 문장 프리로드 (있으면)
      const nextSentence = sentences[index + 1];
      const nextAudioUrl = nextSentence
        ? (language === "ko" ? nextSentence.audioUrlKo : nextSentence.audioUrlEn)
        : null;
      if (nextAudioUrl) {
        const nextRef = activeSlotRef.current === "A" ? soundARef : soundBRef;
        // 기존 프리로드 Sound 정리 (덮어쓰기 누수 방지)
        if (nextRef.current) {
          nextRef.current.setOnPlaybackStatusUpdate(null);
          nextRef.current.unloadAsync().catch(() => {});
          nextRef.current = null;
        }
        try {
          const { sound: preloadSound } = await Audio.Sound.createAsync(
            { uri: nextAudioUrl },
            { volume: volumeRef.current / 100, shouldPlay: false }
          );
          if (gen !== generationRef.current) {
            preloadSound.unloadAsync().catch(() => {});
          } else {
            nextRef.current = preloadSound;
          }
        } catch {
          // 프리로드 실패는 무시 — playSentence에서 다시 로드
        }
      }

      sound.setOnPlaybackStatusUpdate((status) => {
        if (gen !== generationRef.current) return;
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          sound.setOnPlaybackStatusUpdate(null);
          onSentenceEnd();
        }
      });
    } catch {
      if (gen !== generationRef.current) return;
      onSentenceError();
    }
  }, [sentences, language, clearGapTimer]);

  // ── 큐 시작 ──

  const startQueue = useCallback(async () => {
    await stopAll();
    const gen = ++generationRef.current;

    if (!hasSentenceAudio || !enabled) {
      setState("idle");
      stateRef.current = "idle";
      setCurrentIndex(-1);
      indexRef.current = -1;
      return;
    }

    setCurrentIndex(0);
    indexRef.current = 0;
    playSentence(0, gen);
  }, [stopAll, hasSentenceAudio, enabled, playSentence]);

  // ── ready + sentences/language 변경 시 큐 재시작 ──

  useEffect(() => {
    if (!ready) return;
    startQueue();
  }, [ready, sentences, language]);

  // ── enabled 토글 ──

  const enabledMountedRef = useRef(false);
  useEffect(() => {
    if (!enabledMountedRef.current) {
      enabledMountedRef.current = true;
      return;
    }
    if (!hasSentenceAudio) return;

    if (enabled) {
      // 재개: 현재 인덱스부터 다시 시작
      const gen = ++generationRef.current;
      const idx = indexRef.current >= 0 ? indexRef.current : 0;
      playSentence(idx, gen);
    } else {
      stopAll();
      setState("paused");
      stateRef.current = "paused";
    }
  }, [enabled]);

  // ── 볼륨 변경 ──

  useEffect(() => {
    if (Platform.OS === "web") {
      const webAudio = getWebTtsAudio();
      if (webAudio) webAudio.volume = volume / 100;
    } else {
      for (const ref of [soundARef, soundBRef]) {
        ref.current?.setVolumeAsync(volume / 100).catch(() => {});
      }
    }
  }, [volume]);

  // ── pause / resume ──

  const pause = useCallback(async () => {
    clearGapTimer();
    if (Platform.OS === "web") {
      await safePauseWebTts();
    } else {
      const slot = activeSlotRef.current === "A" ? soundBRef : soundARef; // 직전 슬롯
      const status = await slot.current?.getStatusAsync().catch(() => null);
      if (status && status.isLoaded && status.isPlaying) {
        await slot.current?.pauseAsync();
      }
    }
    setState("paused");
    stateRef.current = "paused";
  }, [clearGapTimer]);

  const resume = useCallback(async () => {
    if (stateRef.current !== "paused") return;
    if (Platform.OS === "web") {
      const webAudio = getWebTtsAudio();
      if (webAudio && webAudio.src && !webAudio.ended) {
        await trackedPlay(webAudio);
        setState("playing");
        stateRef.current = "playing";
      } else {
        // src가 없거나 끝남 → 현재 인덱스부터 재시작
        const gen = ++generationRef.current;
        playSentence(indexRef.current >= 0 ? indexRef.current : 0, gen);
      }
    } else {
      const slot = activeSlotRef.current === "A" ? soundBRef : soundARef;
      const status = await slot.current?.getStatusAsync().catch(() => null);
      if (status && status.isLoaded && !status.isPlaying) {
        await slot.current?.playAsync();
        setState("playing");
        stateRef.current = "playing";
      } else {
        const gen = ++generationRef.current;
        playSentence(indexRef.current >= 0 ? indexRef.current : 0, gen);
      }
    }
  }, [playSentence]);

  // ── reset (페이지 전환 시 호출) ──

  const reset = useCallback(() => {
    generationRef.current++;
    clearGapTimer();
    // 비동기 정리는 fire-and-forget
    stopAll();
    setCurrentIndex(-1);
    indexRef.current = -1;
    setState("idle");
    stateRef.current = "idle";
  }, [clearGapTimer, stopAll]);

  // ── 언마운트 정리 ──

  useEffect(() => {
    return () => {
      generationRef.current++;
      clearGapTimer();
      stopAll();
    };
  }, [clearGapTimer, stopAll]);

  return {
    currentIndex,
    state,
    isSentenceMode: hasSentenceAudio,
    pause,
    resume,
    reset,
  };
}
