import React, { useState, useMemo, useCallback } from "react";
import { View, Text, FlatList, Pressable, Alert, SectionList, ListRenderItem } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHistory } from "@/contexts/HistoryContext";
import { HistoryItem } from "@/components/HistoryItem";
import { EmptyState } from "@/components/EmptyState";
import type { HistoryEntry } from "@/types/calculator";

type TabMode = "all" | "byCalculator";

export default function HistoryScreen() {
  const { t } = useLanguage();
  const { globalHistory, clearHistory, deleteHistoryEntry, toggleHistoryFavorite } = useHistory();

  const [activeTab, setActiveTab] = useState<TabMode>("all");

  const sortedHistory = useMemo(
    () => [...globalHistory].sort((a, b) => b.timestamp - a.timestamp),
    [globalHistory]
  );

  const groupedSections = useMemo(() => {
    const groups: Record<string, HistoryEntry[]> = {};
    for (const entry of sortedHistory) {
      const key = entry.calcName;
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    }
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [sortedHistory]);

  const handleClearAll = useCallback(() => {
    Alert.alert(t("history.clearAll"), t("settings.clearConfirm"), [
      { text: t("nav.back"), style: "cancel" },
      {
        text: t("history.clearAll"),
        style: "destructive",
        onPress: () => clearHistory(),
      },
    ]);
  }, [t, clearHistory]);

  const renderHistoryItem = useCallback(
    ({ item }: { item: HistoryEntry }) => (
      <View className="mb-2 px-1">
        <HistoryItem
          entry={item}
          onDelete={() => deleteHistoryEntry(item.id)}
          onToggleFavorite={() => toggleHistoryFavorite(item.id)}
        />
      </View>
    ),
    [deleteHistoryEntry, toggleHistoryFavorite]
  );

  const keyExtractor = useCallback((item: HistoryEntry) => item.id, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <View className="bg-background px-2 pb-1 pt-3">
        <Text className="text-base font-bold text-text">{section.title}</Text>
      </View>
    ),
    []
  );

  const isEmpty = globalHistory.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
        <Text className="text-2xl font-extrabold text-text">{t("history.title")}</Text>
        {/* {!isEmpty && (
          <Pressable
            onPress={handleClearAll}
            hitSlop={8}
            className="rounded-chip bg-error/10 px-3 py-1.5 active:opacity-70"
          >
            <Text className="text-xs font-semibold text-error">
              {t('history.clearAll')}
            </Text>
          </Pressable>
        )} */}
      </View>

      {/* Tabs */}
      {!isEmpty && (
        <View className="mx-5 mb-3 flex-row rounded-chip bg-surface-elevated p-1">
          <Pressable
            onPress={() => setActiveTab("all")}
            className={`flex-1 items-center rounded-chip py-2 ${
              activeTab === "all" ? "bg-primary" : ""
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === "all" ? "text-white" : "text-text-secondary"
              }`}
            >
              {t("history.global")}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("byCalculator")}
            className={`flex-1 items-center rounded-chip py-2 ${
              activeTab === "byCalculator" ? "bg-primary" : ""
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                activeTab === "byCalculator" ? "text-white" : "text-text-secondary"
              }`}
            >
              {t("history.byCalculator")}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Content */}
      {isEmpty ? (
        <EmptyState
          title={t("history.empty")}
          description={t("history.emptyDesc")}
          icon="time-outline"
        />
      ) : activeTab === "all" ? (
        <FlatList
          data={sortedHistory}
          renderItem={renderHistoryItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <SectionList
          sections={groupedSections}
          renderItem={renderHistoryItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );
}
