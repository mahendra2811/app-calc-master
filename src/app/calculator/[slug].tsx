import React, { Suspense } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCalculatorComponent } from '@/utils/calculator-registry';
import { getCalculatorBySlug } from '@/constants/calculators';
import { useLanguage } from '@/contexts/LanguageContext';

function CalcHeader({ name }: { name: string }) {
  const router = useRouter();
  return (
    <SafeAreaView className="bg-surface" edges={['top']}>
      <View className="flex-row items-center border-b border-border bg-surface px-2 py-3">
        <Pressable
          onPress={() => router.back()}
          className="mr-2 rounded-full p-2 active:bg-border"
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color="#0D9488" />
        </Pressable>
        <Text className="flex-1 text-lg font-bold text-text" numberOfLines={1}>
          {name}
        </Text>
      </View>
    </SafeAreaView>
  );
}

function LoadingFallback() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Text style={{ fontSize: 36 }}>🧮</Text>
      </View>
      <ActivityIndicator size="large" color="#0D9488" />
      <Text className="mt-4 text-base font-semibold text-primary">CalcMaster</Text>
      <Text className="mt-1 text-sm text-text-secondary">Every calculation, one tap away</Text>
    </View>
  );
}

function NotFoundFallback() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <CalcHeader name="Calculator" />
      <View className="flex-1 items-center justify-center px-8">
        <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
        <Text className="mt-5 text-center text-lg font-bold text-text">
          Calculator Not Found
        </Text>
        <Text className="mt-2 text-center text-sm text-text-secondary">
          The requested calculator could not be found.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-8 rounded-btn bg-primary px-8 py-3 active:opacity-80"
        >
          <Text className="text-base font-semibold text-white">Go Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function CalculatorScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { t } = useLanguage();
  const Component = slug ? getCalculatorComponent(slug) : null;
  const meta = slug ? getCalculatorBySlug(slug) : undefined;

  if (!Component || !meta) {
    return <NotFoundFallback />;
  }

  // meta.name already holds the i18n key e.g. "calculators.sip.name"
  const name = t(meta.name as any) || meta.id;

  return (
    <View className="flex-1 bg-background">
      <CalcHeader name={name} />
      <Suspense fallback={<LoadingFallback />}>
        <Component />
      </Suspense>
    </View>
  );
}
