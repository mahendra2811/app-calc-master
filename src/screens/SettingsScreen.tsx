import React, { useCallback } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHistory } from "@/contexts/HistoryContext";
import { useFavorites } from "@/contexts/FavoritesContext";

type ThemeOption = "light" | "dark" | "system";

const APP_VERSION = "1.0.0";

export default function SettingsScreen() {
  const { theme, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { clearHistory } = useHistory();
  const { clearAllFavorites } = useFavorites();

  const themeOptions: { key: ThemeOption; label: string }[] = [
    { key: "light", label: t("settings.themeLight") },
    { key: "dark", label: t("settings.themeDark") },
    { key: "system", label: t("settings.themeSystem") },
  ];

  const handleClearHistory = useCallback(() => {
    Alert.alert(t("settings.clearHistory"), t("settings.clearConfirm"), [
      { text: t("nav.back"), style: "cancel" },
      {
        text: t("settings.clearHistory"),
        style: "destructive",
        onPress: () => clearHistory(),
      },
    ]);
  }, [t, clearHistory]);

  const handleClearFavorites = useCallback(() => {
    Alert.alert(t("settings.clearFavorites"), t("settings.clearConfirm"), [
      { text: t("nav.back"), style: "cancel" },
      {
        text: t("settings.clearFavorites"),
        style: "destructive",
        onPress: () => clearAllFavorites(),
      },
    ]);
  }, [t, clearAllFavorites]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="px-5 pb-2 pt-3">
        <Text className="text-2xl font-extrabold text-text">{t("nav.settings")}</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Appearance Section ──────────────────────────────────── */}
        <Text className="mb-3 mt-6 text-sm font-bold uppercase tracking-wider text-text-tertiary">
          {t("settings.appearance")}
        </Text>
        <View className="rounded-card border border-border bg-surface p-4">
          {/* Theme */}
          <Text className="mb-3 text-base font-semibold text-text">{t("settings.theme")}</Text>
          <View className="flex-row gap-2">
            {themeOptions.map((option) => (
              <Pressable
                key={option.key}
                onPress={() => setTheme(option.key)}
                className={`flex-1 items-center rounded-btn border py-2.5 ${
                  theme === option.key
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface-elevated"
                }`}
              >
                <Ionicons
                  name={
                    option.key === "light"
                      ? "sunny-outline"
                      : option.key === "dark"
                        ? "moon-outline"
                        : "phone-portrait-outline"
                  }
                  size={20}
                  color={theme === option.key ? "#0D9488" : "#9CA3AF"}
                />
                <Text
                  className={`mt-1 text-xs font-medium ${
                    theme === option.key ? "text-primary" : "text-text-secondary"
                  }`}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Language */}
          <Text className="mb-3 mt-5 text-base font-semibold text-text">
            {t("settings.language")}
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setLanguage("en")}
              className={`flex-1 items-center rounded-btn border py-2.5 ${
                language === "en"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface-elevated"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  language === "en" ? "text-primary" : "text-text-secondary"
                }`}
              >
                {t("settings.languageEn")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setLanguage("hi")}
              className={`flex-1 items-center rounded-btn border py-2.5 ${
                language === "hi"
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface-elevated"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  language === "hi" ? "text-primary" : "text-text-secondary"
                }`}
              >
                {t("settings.languageHi")}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ── Data Section ───────────────────────────────────────── */}
        {/* <Text className="mb-3 mt-8 text-sm font-bold uppercase tracking-wider text-text-tertiary">
          {t("settings.data")}
        </Text>
        <View className="rounded-card border border-border bg-surface">
          <Pressable
            onPress={handleClearHistory}
            className="flex-row items-center justify-between border-b border-border px-4 py-3.5 active:opacity-70"
          >
            <View className="flex-row items-center">
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text className="ml-3 text-base text-text">{t("settings.clearHistory")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
          <Pressable
            onPress={handleClearFavorites}
            className="flex-row items-center justify-between px-4 py-3.5 active:opacity-70"
          >
            <View className="flex-row items-center">
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text className="ml-3 text-base text-text">{t("settings.clearFavorites")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>
        </View> */}

        {/* ── About Section ──────────────────────────────────────── */}
        <Text className="mb-3 mt-8 text-sm font-bold uppercase tracking-wider text-text-tertiary">
          {t("settings.about")}
        </Text>
        <View className="rounded-card border border-border bg-surface">
          <View className="flex-row items-center justify-between px-4 py-3.5">
            <View className="flex-row items-center">
              <Ionicons name="information-circle-outline" size={20} color="#9CA3AF" />
              <Text className="ml-3 text-base text-text">{t("settings.version")}</Text>
            </View>
            <Text className="text-sm text-text-tertiary">{APP_VERSION}</Text>
          </View>
        </View>

        {/* ── Made With Love ─────────────────────────────────────── */}
        <View className="mt-8 items-center justify-center rounded-card border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 px-6 py-6">
          <View className="mb-3 flex-row items-center">
            <Ionicons name="heart" size={20} color="#EF4444" />
            <Text className="ml-2 text-sm font-medium text-text-secondary">
              Crafted with passion
            </Text>
          </View>

          <Text className="text-center text-lg font-bold text-text">Mahendra singh</Text>

          <View className="mt-2 flex-row items-center">
            <Ionicons name="business-outline" size={16} color="#0D9488" />
            <Text className="ml-1.5 text-center text-sm font-semibold text-primary">
              Hatke Technologies
            </Text>
          </View>

          <Text className="mt-3 text-center text-xs italic text-text-tertiary">
            "Innovation meets simplicity"
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
