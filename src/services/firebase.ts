/**
 * Firebase abstraction layer.
 *
 * Every public function is a no-op unless `EXPO_PUBLIC_FIREBASE_ENABLED` is
 * set to `'true'` in the environment.  Swap in real Firebase SDK calls when
 * you're ready to enable telemetry.
 */

import * as analytics from '@/utils/analytics';

const isEnabled = (): boolean => {
  try {
    return process.env.EXPO_PUBLIC_FIREBASE_ENABLED === 'true';
  } catch {
    return false;
  }
};

/**
 * Initialise Firebase services.
 *
 * Call once at app startup (e.g. in the root layout).
 */
export function initializeFirebase(): void {
  try {
    if (!isEnabled()) return;

    // TODO: Replace with real Firebase initialisation, e.g.
    // if (!getApps().length) { initializeApp(firebaseConfig); }
    if (__DEV__) {
      console.log('[Firebase] initialised');
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[Firebase] initializeFirebase failed:', error);
    }
  }
}

/**
 * Log a custom analytics event.
 *
 * @param name   - Event name (e.g. `'calculate_pressed'`).
 * @param params - Optional key/value payload.
 */
export function logEvent(
  name: string,
  params?: Record<string, any>,
): void {
  try {
    if (!isEnabled()) return;

    analytics.logEvent(name, params);
  } catch (error) {
    if (__DEV__) {
      console.warn('[Firebase] logEvent failed:', error);
    }
  }
}

/**
 * Log a screen-view event.
 *
 * @param screen - Human-readable screen name (e.g. `'HomeScreen'`).
 */
export function logScreenView(screen: string): void {
  try {
    if (!isEnabled()) return;

    analytics.logScreenView(screen);
  } catch (error) {
    if (__DEV__) {
      console.warn('[Firebase] logScreenView failed:', error);
    }
  }
}
