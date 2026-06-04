/**
 * Ad service abstraction.
 *
 * Every public function is a no-op unless `EXPO_PUBLIC_ADS_ENABLED` is set to
 * `'true'` in the environment.  This lets you wire up a real ad SDK later
 * without touching any call-sites.
 */

const isEnabled = (): boolean => {
  try {
    return process.env.EXPO_PUBLIC_ADS_ENABLED === 'true';
  } catch {
    return false;
  }
};

/**
 * Initialise the ad SDK.
 *
 * Call once at app startup (e.g. in the root layout).
 */
export function initializeAds(): void {
  try {
    if (!isEnabled()) return;

    // TODO: Replace with real SDK initialisation, e.g.
    // mobileAds().initialize();
    if (__DEV__) {
      console.log('[Ads] initialised');
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[Ads] initializeAds failed:', error);
    }
  }
}

/**
 * Show a full-screen interstitial ad.
 *
 * Resolves once the ad has been dismissed (or immediately if ads are disabled).
 */
export async function showInterstitial(): Promise<void> {
  try {
    if (!isEnabled()) return;

    // TODO: Replace with real interstitial logic, e.g.
    // await InterstitialAd.createForAdRequest(AD_UNIT_ID).load();
    if (__DEV__) {
      console.log('[Ads] showInterstitial (stub)');
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[Ads] showInterstitial failed:', error);
    }
  }
}

/**
 * Show a rewarded ad.
 *
 * @returns `true` if the user earned the reward, `false` otherwise (including
 *          when ads are disabled).
 */
export async function showRewarded(): Promise<boolean> {
  try {
    if (!isEnabled()) return false;

    // TODO: Replace with real rewarded-ad logic, e.g.
    // const ad = RewardedAd.createForAdRequest(AD_UNIT_ID);
    // await ad.load();
    // return new Promise(resolve => { ad.onAdEvent(...) });
    if (__DEV__) {
      console.log('[Ads] showRewarded (stub)');
    }

    return false;
  } catch (error) {
    if (__DEV__) {
      console.warn('[Ads] showRewarded failed:', error);
    }
    return false;
  }
}
