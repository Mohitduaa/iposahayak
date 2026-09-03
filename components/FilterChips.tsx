import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  ViewStyle,
} from 'react-native';

interface FilterChipsProps {
  selectedFilter: 'all' | 'upcoming' | 'ongoing' | 'closed';
  onFilterChange: (filter: 'all' | 'upcoming' | 'ongoing' | 'closed') => void;
  style?: ViewStyle;
}

export function FilterChips({ selectedFilter, onFilterChange, style }: FilterChipsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const filters = [
    { key: 'all' as const, label: 'All IPOs' },
    { key: 'upcoming' as const, label: 'Upcoming' },
    { key: 'ongoing' as const, label: 'Live' },
    { key: 'closed' as const, label: 'Closed' },
  ];

  const styles = getStyles(isDark);

  return (
    <View style={[styles.container, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.chip,
              selectedFilter === filter.key && styles.selectedChip,
            ]}
            onPress={() => onFilterChange(filter.key)}
          >
            <Text
              style={[
                styles.chipText,
                selectedFilter === filter.key && styles.selectedChipText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  chip: {
    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  selectedChip: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#94A3B8' : '#64748B',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
});