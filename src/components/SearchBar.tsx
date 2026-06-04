import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search calculators...',
  autoFocus = false,
}: SearchBarProps) {
  return (
    <View className="flex-row items-center rounded-card bg-surface-elevated px-4 py-2">
      {/* Search Icon */}
      <Ionicons name="search-outline" size={20} color="#9CA3AF" />

      {/* Text Input */}
      <TextInput
        className="ml-3 flex-1 text-base text-text"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        selectionColor="#0D9488"
      />

      {/* Clear Button */}
      {value.length > 0 && (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={8}
          className="ml-2 rounded-full bg-border/50 p-1"
        >
          <Ionicons name="close" size={16} color="#6B7280" />
        </Pressable>
      )}
    </View>
  );
}
