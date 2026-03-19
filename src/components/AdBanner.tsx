import React from 'react';
import { View } from 'react-native';

/**
 * Safe ad banner wrapper.
 *
 * Renders an ad banner only when EXPO_PUBLIC_ADS_ENABLED is 'true'.
 * If ads are disabled or the ad SDK is not installed, renders nothing.
 * Catches any errors gracefully and falls back to null.
 */

interface AdBannerProps {
  /** Optional ad unit ID override */
  adUnitId?: string;
}

function AdBannerInner(_props: AdBannerProps): React.JSX.Element | null {
  // Check environment variable
  const adsEnabled = process.env.EXPO_PUBLIC_ADS_ENABLED === 'true';

  if (!adsEnabled) {
    return null;
  }

  // When ads are enabled, this is where you would render the actual
  // ad component (e.g., from react-native-google-mobile-ads).
  // For now, we render a placeholder stub that can be replaced later.
  //
  // Example future implementation:
  // import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
  // return (
  //   <BannerAd
  //     unitId={adUnitId ?? 'ca-app-pub-xxxxx/yyyyy'}
  //     size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
  //   />
  // );

  return null;
}

export function AdBanner(props: AdBannerProps): React.JSX.Element | null {
  try {
    return <AdBannerInner {...props} />;
  } catch {
    // If anything goes wrong (e.g., ad SDK not installed), fail silently
    return null;
  }
}
