import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ViewStyle,
} from 'react-native';

interface TimeRangeSelectorProps {
  selectedRange: '7d' | '1m' | '3m' | '1y';
  onRangeChange: (range: '7d' | '1m' | '3m' | '1y') => void;
  style?: ViewStyle;
}

export function TimeRangeSelector({ selectedRange, onRangeChange, style }: TimeRangeSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const ranges = [
    { key: '7d' as const, label: '7D' },
    { key: '1m' as const, label: '1M' },
    { key: '3m' as const, label: '3M' },
    { key: '1y' as const, label: '1Y' },
  ];

  const styles = getStyles(isDark);

  return (
    <View style={[styles.container, style]}>
      {ranges.map((range) => (
        <TouchableOpacity
          key={range.key}
          style={[
            styles.rangeButton,
            selectedRange === range.key && styles.selectedRangeButton,
          ]}
          onPress={() => onRangeChange(range.key)}
        >
          <Text
            style={[
              styles.rangeText,
              selectedRange === range.key && styles.selectedRangeText,
            ]}
          >
            {range.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedRangeButton: {
    backgroundColor: '#1E40AF',
  },
  rangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#94A3B8' : '#64748B',
  },
  selectedRangeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});