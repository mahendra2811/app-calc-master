import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  Pressable,
  ListRenderItem,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useRecent } from '@/contexts/RecentContext';
import { useResponsive } from '@/hooks/useResponsive';
import { getAllCalculators, getCalculatorBySlug } from '@/constants/calculators';
import { CalculatorCard } from '@/components/CalculatorCard';
import { CategoryChip } from '@/components/CategoryChip';
import type { CalculatorMeta, Category } from '@/types/calculator';

type FilterCategory = 'all' | Category;

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { recentCalculators } = useRecent();
  const { columns } = useResponsive();

  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>('all');

  const allCalculators = useMemo(() => getAllCalculators(), []);

  const categories: { key: FilterCategory; label: string }[] = useMemo(
    () => [
      { key: 'all', label: t('home.all') },
      { key: 'finance', label: t('home.finance') },
      { key: 'math', label: t('home.math') },
    ],
    [t],
  );

  const filteredCalculators = useMemo(() => {
    if (selectedCategory === 'all') return allCalculators;
    return allCalculators.filter((c) => c.category === selectedCategory);
  }, [allCalculators, selectedCategory]);

  // Translate calculator names/descs for display
  const translatedCalculators = useMemo(
    () =>
      filteredCalculators.map((calc) => ({
        ...calc,
        name: t(calc.name),
        shortDesc: t(calc.shortDesc),
      })),
    [filteredCalculators, t],
  );

  const recentCalcs = useMemo(() => {
    return recentCalculators
      .map((slug) => {
        const meta = getCalculatorBySlug(slug);
        if (!meta) return null;
        return {
          ...meta,
          name: t(meta.name),
          shortDesc: t(meta.shortDesc),
        };
      })
      .filter(Boolean) as CalculatorMeta[];
  }, [recentCalculators, t]);

  const renderCalculatorCard: ListRenderItem<CalculatorMeta> = useCallback(
    ({ item }) => (
      <View className="flex-1 p-1.5">
        <CalculatorCard
          calculator={item}
          isFavorite={isFavorite(item.id)}
          onToggleFavorite={() => toggleFavorite(item.id)}
        />
      </View>
    ),
    [isFavorite, toggleFavorite],
  );

  const renderRecentCard = useCallback(
    (calc: CalculatorMeta) => (
      <View key={calc.id} className="mr-3" style={{ width: 160 }}>
        <CalculatorCard
          calculator={calc}
          isFavorite={isFavorite(calc.id)}
          onToggleFavorite={() => toggleFavorite(calc.id)}
        />
      </View>
    ),
    [isFavorite, toggleFavorite],
  );

  const keyExtractor = useCallback((item: CalculatorMeta) => item.id, []);

  const ListHeader = useMemo(
    () => (
      <View className="px-1.5">
        {/* Greeting */}
        <Text className="mt-2 text-base text-text-secondary">
          {t('home.greeting')}
        </Text>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {categories.map((cat) => (
            <CategoryChip
              key={cat.key}
              label={cat.label}
              isActive={selectedCategory === cat.key}
              onPress={() => setSelectedCategory(cat.key)}
            />
          ))}
        </ScrollView>

        {/* Recently Used */}
        {recentCalcs.length > 0 && (
          <View className="mt-6">
            <Text className="mb-3 text-lg font-bold text-text">
              {t('home.recent')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            >
              {recentCalcs.map(renderRecentCard)}
            </ScrollView>
          </View>
        )}

        {/* Section Title */}
        <Text className="mb-2 mt-6 text-lg font-bold text-text">
          {selectedCategory === 'all'
            ? t('home.categories')
            : categories.find((c) => c.key === selectedCategory)?.label ?? ''}
        </Text>
      </View>
    ),
    [t, categories, selectedCategory, recentCalcs, renderRecentCard],
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
        <Text className="text-2xl font-extrabold text-text">
          {t('app.name')}
        </Text>
        <Pressable
          onPress={() => router.push('/search')}
          hitSlop={8}
          className="rounded-full bg-surface-elevated p-2.5 active:opacity-70"
        >
          <Ionicons name="search-outline" size={22} color="#9CA3AF" />
        </Pressable>
      </View>

      {/* Calculator Grid */}
      <FlatList
        data={translatedCalculators}
        renderItem={renderCalculatorCard}
        keyExtractor={keyExtractor}
        numColumns={columns}
        key={`grid-${columns}`}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
