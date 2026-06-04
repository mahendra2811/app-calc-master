import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface ResponsiveInfo {
  /** Current screen width in dp. */
  width: number;
  /** Current screen height in dp. */
  height: number;
  /** `true` when `width < 768`. */
  isPhone: boolean;
  /** `true` when `width >= 768`. */
  isTablet: boolean;
  /** Suggested number of grid columns for the current width. */
  columns: number;
}

/**
 * Derive the optimal column count from the screen width.
 *
 * Breakpoints:
 *  - xs  (< 480)       -> 2 columns
 *  - sm  (480 .. 767)   -> 3 columns
 *  - md  (768 .. 1023)  -> 3 or 4 columns (4 when >= 900)
 *  - lg  (>= 1024)      -> 4 or 5 columns (5 when >= 1280)
 */
function getColumns(width: number): number {
  if (width < 480) return 2;
  if (width < 768) return 3;
  if (width < 1024) return width >= 900 ? 4 : 3;
  return width >= 1280 ? 5 : 4;
}

/**
 * Reactive screen-size hook.
 *
 * Re-renders the consuming component whenever the device dimensions change
 * (e.g. orientation flip, split-view resize on iPad, window resize on web).
 */
export function useResponsive(): ResponsiveInfo {
  const [dimensions, setDimensions] = useState<ScaledSize>(
    Dimensions.get('window'),
  );

  useEffect(() => {
    const handler = ({ window }: { window: ScaledSize }) => {
      setDimensions(window);
    };

    const subscription = Dimensions.addEventListener('change', handler);

    return () => {
      subscription.remove();
    };
  }, []);

  const { width, height } = dimensions;

  return {
    width,
    height,
    isPhone: width < 768,
    isTablet: width >= 768,
    columns: getColumns(width),
  };
}
