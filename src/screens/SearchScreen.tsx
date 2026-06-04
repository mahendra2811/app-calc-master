import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useResponsive } from '@/hooks/useResponsive';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { getAllCalculators } from '@/constants/calculators';
import { SearchBar } from '@/components/SearchBar';
import { CalculatorCard } from '@/components/CalculatorCard';
import { EmptyState } from '@/components/EmptyState';
import type { CalculatorMeta } from '@/types/calculator';

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { columns } = useResponsive();

  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebouncedValue(searchText, 300);

  const allCalculators = useMemo(() => {
    return getAllCalculators().map((calc) => ({
      ...calc,
      name: t(calc.name),
      shortDesc: t(calc.shortDesc),
    }));
  }, [t]);

  const filteredResults = useMemo(() => {
    if (!debouncedSearch.trim()) return allCalculators;

    const query = debouncedSearch.toLowerCase().trim();
    return allCalculators.filter(
      (calc) =>
        calc.name.toLowerCase().includes(query) ||
        calc.shortDesc.toLowerCase().includes(query),
    );
  }, [allCalculators, debouncedSearch]);

  const renderItem: ListRenderItem<CalculatorMeta> = useCallback(
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

  const keyExtractor = useCallback((item: CalculatorMeta) => item.id, []);

  const hasSearchQuery = debouncedSearch.trim().length > 0;
  const noResults = hasSearchQuery && filteredResults.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 pb-3 pt-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="rounded-full p-1 active:opacity-70"
        >
          <Ionicons name="arrow-back" size={24} color="#9CA3AF" />
        </Pressable>
        <View className="flex-1">
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            placeholder={t('search.placeholder')}
            autoFocus
          />
        </View>
      </View>

      {/* Results */}
      {noResults ? (
        <EmptyState
          title={t('search.noResults')}
          description={t('search.noResultsDesc')}
          icon="search-outline"
        />
      ) : (
        <FlatList
          data={filteredResults}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={columns}
          key={`search-grid-${columns}`}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
