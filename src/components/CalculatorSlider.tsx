import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface CalculatorSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  formatValue?: (value: number) => string;
}

export function CalculatorSlider({
  label,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  suffix,
  formatValue,
}: CalculatorSliderProps) {
  const displayValue = formatValue ? formatValue(value) : String(value);

  const handleTextChange = (text: string) => {
    // Strip non-numeric characters except decimal point and minus
    const cleaned = text.replace(/[^0-9.\-]/g, '');
    if (cleaned === '' || cleaned === '-' || cleaned === '.') {
      return;
    }

    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) return;

    // Clamp to min/max
    const clamped = Math.min(max, Math.max(min, parsed));

    // Snap to step
    const stepped = Math.round(clamped / step) * step;
    // Avoid floating point issues
    const decimals = step.toString().split('.')[1]?.length ?? 0;
    const rounded = parseFloat(stepped.toFixed(decimals));

    onValueChange(rounded);
  };

  return (
    <View>
      {/* Row: Label + Value Input + Suffix */}
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-sm font-medium text-text-secondary">
          {label}
        </Text>
        <View className="flex-row items-center rounded-input border border-border bg-surface px-3">
          <TextInput
            className="min-w-[60px] py-2 text-right text-base font-semibold text-text"
            value={displayValue}
            onChangeText={handleTextChange}
            keyboardType="numeric"
            selectionColor="#0D9488"
          />
          {suffix && (
            <Text className="ml-1 text-sm text-text-tertiary">
              {suffix}
            </Text>
          )}
        </View>
      </View>

      {/* Min / Max Labels */}
      <View className="mt-2 flex-row justify-between">
        <Text className="text-xs text-text-tertiary">
          Min: {formatValue ? formatValue(min) : min}
        </Text>
        <Text className="text-xs text-text-tertiary">
          Max: {formatValue ? formatValue(max) : max}
        </Text>
      </View>
    </View>
  );
}
