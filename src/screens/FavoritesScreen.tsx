import React, { useMemo, useCallback } from 'react';
import { View, Text, FlatList, ListRenderItem } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useResponsive } from '@/hooks/useResponsive';
import { getCalculatorBySlug } from '@/constants/calculators';
import { CalculatorCard } from '@/components/CalculatorCard';
import { EmptyState } from '@/components/EmptyState';
import type { CalculatorMeta } from '@/types/calculator';

export default function FavoritesScreen() {
  const { t } = useLanguage();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const { columns } = useResponsive();

  const favoriteCalcs = useMemo(() => {
    return favorites
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
  }, [favorites, t]);

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

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-5 pb-2 pt-3">
        <Text className="text-2xl font-extrabold text-text">
          {t('favorites.title')}
        </Text>
      </View>

      {favoriteCalcs.length === 0 ? (
        <EmptyState
          title={t('favorites.empty')}
          description={t('favorites.emptyDesc')}
          icon="star-outline"
        />
      ) : (
        <FlatList
          data={favoriteCalcs}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={columns}
          key={`fav-grid-${columns}`}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
