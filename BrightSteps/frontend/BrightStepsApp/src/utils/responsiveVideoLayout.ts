import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Matches App.tsx shell horizontal padding. */
const APP_SHELL_PADDING = 12;
const SCREEN_PADDING = 16;
const PLAYER_CARD_PADDING = 12;
const TABLET_SHORT_EDGE = 600;
const MAX_PLAYER_WIDTH_TABLET = 880;

export type ResponsiveVideoLayout = {
  playerWidth: number;
  playerHeight: number;
  isTablet: boolean;
  isLandscape: boolean;
  contentWidth: number;
};

export function computeVideoPlayerLayout(
  windowWidth: number,
  windowHeight: number,
  safeHorizontal: number
): ResponsiveVideoLayout {
  const shortEdge = Math.min(windowWidth, windowHeight);
  const isTablet = shortEdge >= TABLET_SHORT_EDGE;
  const isLandscape = windowWidth > windowHeight;

  const horizontalGutter =
    safeHorizontal + APP_SHELL_PADDING * 2 + SCREEN_PADDING * 2 + PLAYER_CARD_PADDING * 2;

  let playerWidth = Math.max(240, windowWidth - horizontalGutter);

  if (isTablet) {
    playerWidth = Math.min(playerWidth, MAX_PLAYER_WIDTH_TABLET);
  }

  let playerHeight = Math.round(playerWidth * (9 / 16));

  const maxPlayerHeight = Math.round(windowHeight * (isLandscape ? 0.58 : isTablet ? 0.42 : 0.36));
  if (playerHeight > maxPlayerHeight) {
    playerHeight = maxPlayerHeight;
    playerWidth = Math.round(playerHeight * (16 / 9));
  }

  const contentWidth = isTablet
    ? Math.min(windowWidth - safeHorizontal - APP_SHELL_PADDING * 2, MAX_PLAYER_WIDTH_TABLET + PLAYER_CARD_PADDING * 2 + SCREEN_PADDING * 2)
    : windowWidth - safeHorizontal - APP_SHELL_PADDING * 2;

  return { playerWidth, playerHeight, isTablet, isLandscape, contentWidth };
}

export function useResponsiveVideoLayout(): ResponsiveVideoLayout {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  return computeVideoPlayerLayout(width, height, insets.left + insets.right);
}
