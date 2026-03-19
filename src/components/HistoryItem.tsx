import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { HistoryEntry } from '@/types/calculator';

interface HistoryItemProps {
  entry: HistoryEntry;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function formatResultPreview(result: Record<string, any>): string {
  const entries = Object.entries(result);
  if (entries.length === 0) return '';

  return entries
    .slice(0, 2)
    .map(([key, val]) => {
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
      const formatted = typeof val === 'number' ? val.toLocaleString() : String(val);
      return `${label}: ${formatted}`;
    })
    .join('  |  ');
}

export function HistoryItem({ entry, onDelete, onToggleFavorite }: HistoryItemProps) {
  const timeLabel = useMemo(() => formatTimestamp(entry.timestamp), [entry.timestamp]);
  const resultPreview = useMemo(() => formatResultPreview(entry.result), [entry.result]);

  return (
    <View className="flex-row items-center rounded-card border border-border bg-surface px-4 py-3">
      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="text-sm font-bold text-text" numberOfLines={1}>
            {entry.calcName}
          </Text>
          {entry.label && (
            <Text className="ml-2 text-xs text-text-tertiary" numberOfLines={1}>
              {entry.label}
            </Text>
          )}
        </View>

        {resultPreview ? (
          <Text className="mt-1 text-xs text-text-secondary" numberOfLines={1}>
            {resultPreview}
          </Text>
        ) : null}

        <Text className="mt-1 text-[10px] text-text-tertiary">
          {timeLabel}
        </Text>
      </View>

      {/* Actions */}
      <View className="ml-3 flex-row items-center gap-2">
        <Pressable onPress={onToggleFavorite} hitSlop={6} className="p-1">
          <Ionicons
            name={entry.isFavorite ? 'star' : 'star-outline'}
            size={20}
            color={entry.isFavorite ? '#F59E0B' : '#9CA3AF'}
          />
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={6} className="p-1">
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </Pressable>
      </View>
    </View>
  );
}
