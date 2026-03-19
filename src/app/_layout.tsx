import '../../global.css';
import { useEffect, useState, useCallback } from 'react';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Providers } from '@/contexts/Providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AnimatedSplash } from '@/components/AnimatedSplash';
import { PersistentTabBar } from '@/components/PersistentTabBar';

SplashScreen.preventAutoHideAsync();

function AppShell() {
  const [showSplash, setShowSplash] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Give contexts time to load from storage
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const onSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  // Hide tab bar on modals (search) and not-found
  const hideTabBar = showSplash || pathname === '/search' || pathname === '/+not-found';

  return (
    <View className="flex-1 bg-background">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="calculator" />
        <Stack.Screen name="search" options={{ presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      {!hideTabBar && <PersistentTabBar />}
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
    </View>
  );
}

export default function RootLayout() {
  return (
    <Providers>
      <ErrorBoundary>
        <StatusBar style="auto" />
        <AppShell />
      </ErrorBoundary>
    </Providers>
  );
}
