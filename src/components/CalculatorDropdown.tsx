import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DropdownOption {
  label: string;
  value: string;
}

interface CalculatorDropdownProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: DropdownOption[];
}

export function CalculatorDropdown({
  label,
  value,
  onValueChange,
  options,
}: CalculatorDropdownProps) {
  const [visible, setVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onValueChange(optionValue);
      setVisible(false);
    },
    [onValueChange],
  );

  const renderOption = useCallback(
    ({ item }: { item: DropdownOption }) => {
      const isSelected = item.value === value;
      return (
        <Pressable
          onPress={() => handleSelect(item.value)}
          className={`flex-row items-center justify-between border-b border-border px-5 py-4 ${
            isSelected ? 'bg-primary/10' : 'bg-surface'
          }`}
        >
          <Text
            className={`text-base ${
              isSelected ? 'font-bold text-primary' : 'text-text'
            }`}
          >
            {item.label}
          </Text>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={22} color="#0D9488" />
          )}
        </Pressable>
      );
    },
    [value, handleSelect],
  );

  return (
    <View>
      {/* Label */}
      <Text className="mb-2 text-sm font-medium text-text-secondary">
        {label}
      </Text>

      {/* Trigger Button */}
      <Pressable
        onPress={() => setVisible(true)}
        className="flex-row items-center justify-between rounded-input border border-border bg-surface px-4 py-3"
      >
        <Text className="text-base text-text">
          {selectedOption?.label ?? 'Select...'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
      </Pressable>

      {/* Dropdown Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setVisible(false)}
        >
          <Pressable
            onPress={() => {
              /* prevent close when tapping content */
            }}
          >
            <View className="max-h-[60%] rounded-t-3xl bg-surface pb-8">
              {/* Header */}
              <View className="items-center border-b border-border px-5 py-4">
                <View className="mb-2 h-1 w-10 rounded-full bg-border" />
                <Text className="text-lg font-bold text-text">
                  {label}
                </Text>
              </View>

              {/* Options List */}
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                renderItem={renderOption}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
