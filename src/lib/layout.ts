/**
 * 레이아웃 상수 및 유틸리티
 *
 * 토스/카카오 스타일의 모바일 우선 웹앱 레이아웃
 * - 모바일: 전체 화면
 * - 태블릿/데스크톱: 중앙 정렬된 모바일 뷰 + 디바이스 프레임 스타일
 */

// 모바일/태블릿 비율 (글로벌 1위 360x800 = 9:20, 최신 안드로이드/아이폰 공통)
export const MOBILE_ASPECT_RATIO = 9 / 20;

// 데스크톱 웹 비율 (24인치+ 모니터에서 넓게 보기)
export const DESKTOP_ASPECT_RATIO = 9 / 16;

// 컨테이너 최대 크기 (더 큰 화면에서도 편안한 크기)
export const MAX_CONTAINER_WIDTH = 600;
export const MAX_CONTAINER_HEIGHT = 1333; // 9:20 기준 (600 / (9/20) ≈ 1333)

// 뷰포트 대비 컨테이너 비율 (더 크게 표시)
export const VIEWPORT_RATIOS = {
  desktop: 0.96,  // 데스크톱: 뷰포트 높이의 96%
  tablet: 0.98,   // 태블릿: 뷰포트 높이의 98%
  mobile: 1.0,    // 모바일: 전체 화면
} as const;

// 브레이크포인트
export const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
} as const;

// 컨테이너 스타일 (디바이스 프레임 효과)
export const CONTAINER_STYLE = {
  borderRadius: 24,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 24,
  elevation: 8,
} as const;

/**
 * 뷰포트 크기에 따른 컨테이너 크기 계산
 */
export function calculateContainerSize(
  windowWidth: number,
  windowHeight: number
): { width: number; height: number } {
  // 모바일 뷰포트는 전체 화면 사용
  if (windowWidth <= BREAKPOINTS.mobile) {
    return { width: windowWidth, height: windowHeight };
  }

  // 태블릿/데스크톱: 높이 기준으로 비율 계산
  const isDesktop = windowWidth >= BREAKPOINTS.desktop;
  const heightRatio = isDesktop ? VIEWPORT_RATIOS.desktop : VIEWPORT_RATIOS.tablet;
  const aspectRatio = isDesktop ? DESKTOP_ASPECT_RATIO : MOBILE_ASPECT_RATIO;

  const targetHeight = Math.min(windowHeight * heightRatio, MAX_CONTAINER_HEIGHT);
  const targetWidth = Math.min(targetHeight * aspectRatio, MAX_CONTAINER_WIDTH);

  // 화면이 좁으면 너비 기준으로 높이 재계산
  if (targetWidth > windowWidth * 0.95) {
    const adjustedWidth = windowWidth * 0.95;
    const adjustedHeight = adjustedWidth / aspectRatio;
    return {
      width: adjustedWidth,
      height: Math.min(adjustedHeight, windowHeight * heightRatio),
    };
  }

  return { width: targetWidth, height: targetHeight };
}
