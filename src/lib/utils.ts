/**
 * Supabase Storage 이미지 최적화 URL 변환
 * @param url 원본 이미지 URL
 * @param width 원하는 너비 (기본값: 400)
 * @returns 최적화된 이미지 URL
 */
export function getOptimizedImageUrl(url: string, width: number = 400): string {
  if (!url) return "";

  // Supabase Storage URL인 경우에만 Transform 적용
  if (url.includes("/object/")) {
    return (
      url.replace("/object/", "/render/image/") +
      `?width=${width}&resize=contain`
    );
  }

  return url;
}

/**
 * 분 단위 시간을 한글 형식으로 변환
 * @param minutes 분 단위 시간
 * @returns "N분" 형식의 문자열
 */
export function formatDuration(minutes: number): string {
  if (minutes < 1) return "1분 미만";
  if (minutes < 60) return `${minutes}분`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}시간`;
  }

  return `${hours}시간 ${remainingMinutes}분`;
}

/**
 * 날짜를 한국어 형식으로 변환
 * @param isoDate ISO 8601 형식의 날짜 문자열
 * @returns "YYYY.MM.DD" 형식의 문자열
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}`;
}

/**
 * 가격을 원화 형식으로 변환
 * @param price 숫자 가격
 * @returns "₩N,NNN" 형식의 문자열
 */
export function formatPrice(price: number): string {
  return `₩${price.toLocaleString("ko-KR")}`;
}

/**
 * API 에러 메시지 추출
 * @param message string 또는 string[] 형태의 에러 메시지
 * @returns 단일 문자열 에러 메시지
 */
export function getErrorMessage(message: string | string[]): string {
  if (Array.isArray(message)) {
    return message[0] || "알 수 없는 오류가 발생했습니다.";
  }
  return message || "알 수 없는 오류가 발생했습니다.";
}

/**
 * 클래스명 조건부 결합
 * @param classes 클래스명 배열 또는 조건부 객체
 * @returns 결합된 클래스명 문자열
 */
export function cn(
  ...classes: (string | boolean | undefined | null)[]
): string {
  return classes.filter(Boolean).join(" ");
}
