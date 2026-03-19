import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLanguage } from '@/contexts/LanguageContext';

type TabItem = {
  route: string;
  activeIcon: React.ComponentProps<typeof Ionicons>['name'];
  inactiveIcon: React.ComponentProps<typeof Ionicons>['name'];
  labelKey: string;
};

const TABS: TabItem[] = [
  { route: '/', activeIcon: 'home', inactiveIcon: 'home-outline', labelKey: 'nav.home' },
  { route: '/favorites', activeIcon: 'star', inactiveIcon: 'star-outline', labelKey: 'nav.favorites' },
  { route: '/history', activeIcon: 'time', inactiveIcon: 'time-outline', labelKey: 'nav.history' },
  { route: '/settings', activeIcon: 'settings', inactiveIcon: 'settings-outline', labelKey: 'nav.settings' },
];

export function PersistentTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  const isActive = (route: string) => {
    if (route === '/') return pathname === '/' || pathname === '/index';
    return pathname.startsWith(route);
  };

  return (
    <SafeAreaView edges={['bottom']} className="bg-surface border-t border-border">
      <View className="flex-row" style={{ height: Platform.OS === 'ios' ? 50 : 56 }}>
        {TABS.map((tab) => {
          const active = isActive(tab.route);
          return (
            <Pressable
              key={tab.route}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                router.navigate(tab.route as any);
              }}
              className="flex-1 items-center justify-center"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Ionicons
                name={active ? tab.activeIcon : tab.inactiveIcon}
                size={22}
                color={active ? '#0D9488' : '#9CA3AF'}
              />
              <Text
                className="mt-0.5 text-xs font-semibold"
                style={{ color: active ? '#0D9488' : '#9CA3AF' }}
              >
                {t(tab.labelKey as any)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
