import { useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { useSharedValue, withTiming, withDelay } from 'react-native-reanimated';
import { STARTUP_TIMINGS, STARTUP_EASING } from '../constants';

/**
 * Master timeline. Each shared value here represents the *progress* of an act
 * from 0 → 1, so layers can interpolate freely off a single source of truth.
 */
export function useStartupOrchestrator(onComplete: () => void, reducedMotion: boolean) {
  const actI = useSharedValue(0);
  const actII = useSharedValue(0);
  const actIII = useSharedValue(0);
  const actIV = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      // Collapse to a 600ms fade-in only.
      actI.value = withTiming(1, { duration: 200, easing: STARTUP_EASING.smooth });
      actII.value = withDelay(150, withTiming(1, { duration: 250, easing: STARTUP_EASING.smooth }));
      actIII.value = withDelay(300, withTiming(1, { duration: 150, easing: STARTUP_EASING.smooth }));
      actIV.value = withDelay(450, withTiming(1, { duration: 150, easing: STARTUP_EASING.smooth }));
      const t = setTimeout(onComplete, 700);
      return () => clearTimeout(t);
    }

    const { actI: aI, actII: aII, actIII: aIII, actIV: aIV } = STARTUP_TIMINGS;

    actI.value = withTiming(1, { duration: aI.end - aI.start, easing: STARTUP_EASING.outExpo });
    actII.value = withDelay(
      aII.start,
      withTiming(1, { duration: aII.end - aII.start, easing: STARTUP_EASING.outExpo }),
    );
    actIII.value = withDelay(
      aIII.start,
      withTiming(1, { duration: aIII.end - aIII.start, easing: STARTUP_EASING.smooth }),
    );
    actIV.value = withDelay(
      aIV.start,
      withTiming(1, { duration: aIV.end - aIV.start, easing: STARTUP_EASING.inOutExpo }),
    );

    // Haptic beats — punctuate key moments
    const hapticA = setTimeout(() => {
      Haptics.selectionAsync().catch(() => {});
    }, 300);
    const hapticB = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }, aII.start + 100);
    const hapticC = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }, aIV.start + 400);

    const completeTimer = setTimeout(onComplete, STARTUP_TIMINGS.totalMs);

    return () => {
      clearTimeout(hapticA);
      clearTimeout(hapticB);
      clearTimeout(hapticC);
      clearTimeout(completeTimer);
    };
  }, [actI, actII, actIII, actIV, onComplete, reducedMotion]);

  return { actI, actII, actIII, actIV };
}
