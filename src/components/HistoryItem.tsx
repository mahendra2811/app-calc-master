import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { HistoryEntry } from "@/types/calculator";

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

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function formatResultPreview(result: Record<string, any>): string {
  const entries = Object.entries(result);
  if (entries.length === 0) return "";

  return entries
    .slice(0, 2)
    .map(([key, val]) => {
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase())
        .trim();
      const formatted = typeof val === "number" ? val.toLocaleString() : String(val);
      return `${label}: ${formatted}`;
    })
    .join("  |  ");
}

export function HistoryItem({ entry, onDelete, onToggleFavorite }: HistoryItemProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const timeLabel = useMemo(() => formatTimestamp(entry.timestamp), [entry.timestamp]);
  const resultPreview = useMemo(() => formatResultPreview(entry.result), [entry.result]);

  const fullDate = useMemo(() => {
    const date = new Date(entry.timestamp);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [entry.timestamp]);

  return (
    <>
      <Pressable
        onPress={() => setIsModalVisible(true)}
        className="flex-row items-center rounded-card border border-border bg-surface px-4 py-3 active:opacity-70"
      >
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

          <Text className="mt-1 text-[10px] text-text-tertiary">{timeLabel}</Text>
        </View>

        {/* Actions */}
        <View className="ml-3 flex-row items-center gap-2">
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            hitSlop={6}
            className="p-1"
          >
            <Ionicons
              name={entry.isFavorite ? "star" : "star-outline"}
              size={20}
              color={entry.isFavorite ? "#F59E0B" : "#9CA3AF"}
            />
          </Pressable>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            hitSlop={6}
            className="p-1"
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </Pressable>
        </View>
      </Pressable>

      {/* Detail Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable className="flex-1 bg-black/50" onPress={() => setIsModalVisible(false)}>
          <View className="flex-1 items-center justify-center px-6">
            <Pressable
              className="w-full max-w-md rounded-card border border-border bg-surface shadow-lg"
              onPress={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between border-b border-border px-5 py-4">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-text">{entry.calcName}</Text>
                  {entry.label && (
                    <Text className="mt-0.5 text-xs text-text-tertiary">{entry.label}</Text>
                  )}
                </View>
                <Pressable
                  onPress={() => setIsModalVisible(false)}
                  hitSlop={8}
                  className="ml-2 rounded-full bg-surface-elevated p-1.5"
                >
                  <Ionicons name="close" size={20} color="#9CA3AF" />
                </Pressable>
              </View>

              {/* Content */}
              <ScrollView className="max-h-96 px-5 py-4" showsVerticalScrollIndicator={false}>
                {/* Inputs Section */}
                {entry.inputs && Object.keys(entry.inputs).length > 0 && (
                  <View className="mb-4">
                    <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
                      Inputs
                    </Text>
                    <View className="rounded-btn border border-border bg-surface-elevated p-3">
                      {Object.entries(entry.inputs).map(([key, value], index) => {
                        const label = key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (s) => s.toUpperCase())
                          .trim();
                        return (
                          <View
                            key={key}
                            className={index > 0 ? "mt-2 border-t border-border pt-2" : ""}
                          >
                            <Text className="text-xs text-text-secondary">{label}</Text>
                            <Text className="mt-0.5 text-base font-semibold text-text">
                              {typeof value === "number" ? value.toLocaleString() : String(value)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Results Section */}
                {entry.result && Object.keys(entry.result).length > 0 && (
                  <View className="mb-4">
                    <Text className="mb-2 text-xs font-bold uppercase tracking-wider text-text-tertiary">
                      Results
                    </Text>
                    <View className="rounded-btn border border-primary/20 bg-primary/5 p-3">
                      {Object.entries(entry.result).map(([key, value], index) => {
                        const label = key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (s) => s.toUpperCase())
                          .trim();
                        return (
                          <View
                            key={key}
                            className={index > 0 ? "mt-2 border-t border-primary/10 pt-2" : ""}
                          >
                            <Text className="text-xs text-text-secondary">{label}</Text>
                            <Text className="mt-0.5 text-base font-bold text-primary">
                              {typeof value === "number" ? value.toLocaleString() : String(value)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Timestamp */}
                <View className="flex-row items-center">
                  <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                  <Text className="ml-1.5 text-xs text-text-tertiary">{fullDate}</Text>
                </View>
              </ScrollView>

              {/* Footer Actions */}
              <View className="flex-row gap-2 border-t border-border px-5 py-3">
                <Pressable
                  onPress={() => {
                    onToggleFavorite();
                    setIsModalVisible(false);
                  }}
                  className="flex-1 flex-row items-center justify-center rounded-btn border border-border bg-surface-elevated py-2.5"
                >
                  <Ionicons
                    name={entry.isFavorite ? "star" : "star-outline"}
                    size={18}
                    color={entry.isFavorite ? "#F59E0B" : "#9CA3AF"}
                  />
                  <Text className="ml-2 text-sm font-semibold text-text">
                    {entry.isFavorite ? "Unfavorite" : "Favorite"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    onDelete();
                    setIsModalVisible(false);
                  }}
                  className="flex-1 flex-row items-center justify-center rounded-btn border border-error/20 bg-error/10 py-2.5"
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text className="ml-2 text-sm font-semibold text-error">Delete</Text>
                </Pressable>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
