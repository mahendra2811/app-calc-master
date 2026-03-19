import React from "react";
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HapticButton } from "./HapticButton";
import i18n from "../i18n";

interface CalculatorShellProps {
  title: string;
  children: React.ReactNode;
  onCalculate?: () => void;
  onReset?: () => void;
  showHistory?: boolean;
}

export function CalculatorShell({
  title: _title,
  children,
  onCalculate,
  onReset,
  showHistory: _showHistory = true,
}: CalculatorShellProps) {
  const hasButtons = onCalculate || onReset;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View className="flex-1">
          {/* Scrollable content */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: hasButtons ? 8 : 24 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Calculator Content */}
            <View style={{ gap: 16 }}>{children}</View>
          </ScrollView>

          {/* Fixed bottom action buttons — always visible, never scrolls away */}
          {hasButtons && (
            <View
              className="border-t border-border bg-surface px-4 pt-3 pb-3"
              style={{ gap: 10 }}
            >
              {onCalculate && (
                <HapticButton
                  onPress={onCalculate}
                  hapticType="medium"
                  className="items-center rounded-btn bg-primary py-4"
                >
                  <Text className="text-lg font-bold text-white">{i18n.t("calc.calculate")}</Text>
                </HapticButton>
              )}
              {onReset && (
                <HapticButton
                  onPress={onReset}
                  hapticType="light"
                  className="items-center rounded-btn border border-border bg-background py-3"
                >
                  <Text className="text-base font-medium text-text-secondary">
                    {i18n.t("calc.reset")}
                  </Text>
                </HapticButton>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
