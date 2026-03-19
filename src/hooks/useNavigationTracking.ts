import { useEffect } from 'react';
import * as analytics from '@/utils/analytics';

/**
 * Logs a screen-view analytics event whenever the component mounts or the
 * `screenName` value changes.
 *
 * Drop this into any screen component:
 *
 * ```ts
 * useNavigationTracking('HomeScreen');
 * ```
 */
export function useNavigationTracking(screenName: string): void {
  useEffect(() => {
    analytics.logScreenView(screenName);
  }, [screenName]);
}
