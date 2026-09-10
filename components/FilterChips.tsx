import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ViewStyle,
} from 'react-native';

interface FilterChipsProps {
  selectedFilter: 'upcoming' | 'ongoing' | 'closed';
  onFilterChange: (filter: 'upcoming' | 'ongoing' | 'closed') => void;
  style?: ViewStyle;
}

export function FilterChips({ selectedFilter, onFilterChange, style }: FilterChipsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const filters = [
    { key: 'upcoming' as const, label: 'Upcoming' },
    { key: 'ongoing' as const, label: 'Live' },
    { key: 'closed' as const, label: 'Allotment' },
  ];

  const styles = getStyles(isDark);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.segmentedControl}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.segment,
              selectedFilter === filter.key && styles.selectedSegment,
            ]}
            onPress={() => onFilterChange(filter.key)}
          >
            {/*
              Three segments share the row, so "Allotment" only has a third of
              the width. At the largest system font it wrapped to "Allotmen / t"
              and the control grew to two lines. One line plus a capped
              multiplier keeps it a segmented control at every setting, while
              leaving the normal setting exactly as designed.
            */}
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
              style={[
                styles.segmentText,
                selectedFilter === filter.key && styles.selectedSegmentText,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedSegment: {
    backgroundColor: '#1E40AF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#94A3B8' : '#64748B',
  },
  selectedSegmentText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
