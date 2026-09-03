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
  selectedFilter: 'upcoming' | 'ongoing' | 'closed';
  onFilterChange: (filter: 'upcoming' | 'ongoing' | 'closed') => void;
  /** Shown on the tab itself, so the screen does not repeat them above. */
  counts?: { upcoming?: number; ongoing?: number };
  style?: ViewStyle;
}

export function FilterChips({ selectedFilter, onFilterChange, counts, style }: FilterChipsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const filters = [
    { key: 'upcoming' as const, label: 'Upcoming', count: counts?.upcoming },
    { key: 'ongoing' as const, label: 'Live', count: counts?.ongoing },
    // Paged in from the server, so there is no total to show here
    { key: 'closed' as const, label: 'Allotment', count: undefined },
  ];

  const styles = getStyles(isDark);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.segmentedControl}>
        {filters.map((filter) => {
          const selected = selectedFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[styles.segment, selected && styles.selectedSegment]}
              onPress={() => onFilterChange(filter.key)}
            >
              <Text style={[styles.segmentText, selected && styles.selectedSegmentText]}>
                {filter.label}
              </Text>
              {typeof filter.count === 'number' && (
                <View style={[styles.countPill, selected && styles.countPillSelected]}>
                  <Text style={[styles.countText, selected && styles.countTextSelected]}>
                    {filter.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPill: {
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 9,
    backgroundColor: isDark ? '#334155' : '#E2E8F0',
    alignItems: 'center',
  },
  countPillSelected: { backgroundColor: 'rgba(255,255,255,0.24)' },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: isDark ? '#CBD5E1' : '#475569',
  },
  countTextSelected: { color: '#FFFFFF' },
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