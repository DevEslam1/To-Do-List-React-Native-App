import { useWindowDimensions } from 'react-native';

const TABLET_BREAKPOINT = 768;
const WIDE_TABLET_BREAKPOINT = 1100;

export interface ResponsiveLayout {
  width: number;
  height: number;
  isTablet: boolean;
  isWideTablet: boolean;
  isLandscape: boolean;
  screenPadding: number;
  contentMaxWidth: number;
  dockedSidebarWidth: number;
  overlaySidebarWidth: number;
  dialogWidth: number;
}

export function getResponsiveLayout(width: number, height: number): ResponsiveLayout {
  const isTablet = width >= TABLET_BREAKPOINT;
  const isWideTablet = width >= WIDE_TABLET_BREAKPOINT;
  const isLandscape = width > height;
  const screenPadding = isWideTablet ? 32 : isTablet ? 28 : 18;
  const contentMaxWidth = isWideTablet ? 1220 : isTablet ? 860 : width;
  const dockedSidebarWidth = Math.min(Math.max(width * 0.28, 280), 340);
  const overlaySidebarWidth = Math.min(width * 0.8, 320);
  const dialogWidth = Math.min(width - screenPadding * 2, isWideTablet ? 760 : 720);

  return {
    width,
    height,
    isTablet,
    isWideTablet,
    isLandscape,
    screenPadding,
    contentMaxWidth,
    dockedSidebarWidth,
    overlaySidebarWidth,
    dialogWidth,
  };
}

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  return getResponsiveLayout(width, height);
}
