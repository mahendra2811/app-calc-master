const isEnabled = (): boolean => {
  try {
    return process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === 'true';
  } catch {
    return false;
  }
};

export function logEvent(name: string, params?: Record<string, any>): void {
  try {
    if (!isEnabled()) return;
    // Firebase analytics integration point.
    // When firebase is configured, import analytics and call logEvent here.
    if (__DEV__) {
      console.log('[Analytics] event:', name, params);
    }
  } catch {
    // Never throw from analytics
  }
}

export function logScreenView(screenName: string): void {
  try {
    if (!isEnabled()) return;
    // Firebase screen view tracking integration point.
    if (__DEV__) {
      console.log('[Analytics] screen:', screenName);
    }
  } catch {
    // Never throw from analytics
  }
}

export function setUserProperty(name: string, value: string): void {
  try {
    if (!isEnabled()) return;
    // Firebase user property integration point.
    if (__DEV__) {
      console.log('[Analytics] userProperty:', name, '=', value);
    }
  } catch {
    // Never throw from analytics
  }
}
