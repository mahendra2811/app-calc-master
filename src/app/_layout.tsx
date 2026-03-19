import '../../global.css';
import { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Providers } from '@/contexts/Providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AnimatedSplash } from '@/components/AnimatedSplash';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Give contexts time to load from storage
    const timer = setTimeout(() => {
      setAppReady(true);
      SplashScreen.hideAsync();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const onSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <Providers>
      <ErrorBoundary>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="calculator" />
          <Stack.Screen name="search" options={{ presentation: 'modal' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        {showSplash && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <AnimatedSplash onComplete={onSplashComplete} />
          </View>
        )}
      </ErrorBoundary>
    </Providers>
  );
}
