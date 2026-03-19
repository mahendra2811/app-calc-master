import React, { Suspense } from 'react';
import { View, Text, ActivityIndicator, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCalculatorComponent } from '@/utils/calculator-registry';
import { getCalculatorBySlug } from '@/constants/calculators';

function LoadingFallback() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#0D9488" />
      <Text className="mt-4 text-sm text-text-secondary">
        Loading calculator...
      </Text>
    </View>
  );
}

function NotFoundFallback() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-background px-8">
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
  );
}

export default function CalculatorScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const Component = slug ? getCalculatorComponent(slug) : null;
  const meta = slug ? getCalculatorBySlug(slug) : undefined;

  if (!Component || !meta) {
    return <NotFoundFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );
}
