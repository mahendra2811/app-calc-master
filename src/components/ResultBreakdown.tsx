import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface BreakdownItem {
  label: string;
  value: string;
  highlight?: boolean;
}

interface ResultBreakdownProps {
  items: BreakdownItem[];
  title?: string;
}

export function ResultBreakdown({ items, title = 'Breakdown' }: ResultBreakdownProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  return (
    <View className="overflow-hidden rounded-card border border-border bg-surface">
      {/* Header / Toggle */}
      <Pressable
        onPress={toggleExpanded}
        className="flex-row items-center justify-between px-4 py-3"
      >
        <Text className="text-base font-semibold text-text">
          {title}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#9CA3AF"
        />
      </Pressable>

      {/* Collapsible Content */}
      {expanded && (
        <View className="border-t border-border">
          {items.map((item, index) => (
            <View
              key={`${item.label}-${index}`}
              className={`flex-row items-center justify-between px-4 py-3 ${
                index % 2 === 0 ? 'bg-surface' : 'bg-surface-elevated/50'
              }`}
            >
              <Text
                className={`flex-1 text-sm ${
                  item.highlight
                    ? 'font-bold text-primary'
                    : 'text-text-secondary'
                }`}
              >
                {item.label}
              </Text>
              <Text
                className={`text-sm ${
                  item.highlight
                    ? 'font-bold text-primary'
                    : 'font-medium text-text'
                }`}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
