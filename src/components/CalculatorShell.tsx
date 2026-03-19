import React from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HapticButton } from './HapticButton';

interface CalculatorShellProps {
  title: string;
  children: React.ReactNode;
  onCalculate?: () => void;
  onReset?: () => void;
  showHistory?: boolean;
}

export function CalculatorShell({
  title,
  children,
  onCalculate,
  onReset,
  showHistory = true,
}: CalculatorShellProps) {
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8 pt-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title Bar */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-text">
              {title}
            </Text>
          </View>

          {/* Calculator Content */}
          <View className="gap-4">
            {children}
          </View>

          {/* Action Buttons */}
          {(onCalculate || onReset) && (
            <View className="mt-8 gap-3">
              {onCalculate && (
                <HapticButton
                  onPress={onCalculate}
                  hapticType="medium"
                  className="items-center rounded-btn bg-primary py-4"
                >
                  <Text className="text-lg font-bold text-white">
                    Calculate
                  </Text>
                </HapticButton>
              )}
              {onReset && (
                <HapticButton
                  onPress={onReset}
                  hapticType="light"
                  className="items-center rounded-btn border border-border bg-surface py-3"
                >
                  <Text className="text-base font-medium text-text-secondary">
                    Reset
                  </Text>
                </HapticButton>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
