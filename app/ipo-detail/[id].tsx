import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { IPODetailsView } from '@/components/IPODetailsView';
import { IPO } from '@/types';

/**
 * The IPO sheet as a screen rather than a modal.
 *
 * React Native's Android `Modal` opens a separate dialog window, and on this RN
 * version that window is drawn before it has been sized — opening the sheet
 * flashed a small white box in the top-left corner and then snapped to full
 * screen. A route has no second window, so it gets the platform's own screen
 * transition instead. The allotment results screen already worked this way.
 *
 * The card that opens this already holds the list record, so it is passed
 * through as `data` and the screen paints immediately; IPODetailsView fetches
 * the rest by id as it always did.
 */
export default function IPODetailScreen() {
  const { data } = useLocalSearchParams<{ id: string; data?: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const ipo = useMemo<IPO | null>(() => {
    if (!data) return null;
    try {
      return JSON.parse(data) as IPO;
    } catch {
      return null;
    }
  }, [data]);

  // Only reachable if the screen is opened without its record — a stale deep
  // link, say. Better than a blank screen with no way back.
  if (!ipo) {
    return (
      <View style={[styles.fallback, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
        <Text style={[styles.fallbackText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          This IPO could not be opened.
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.fallbackButton}>
          <Text style={styles.fallbackButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <IPODetailsView ipo={ipo} onClose={() => router.back()} />;
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  fallbackText: {
    fontSize: 15,
    textAlign: 'center',
  },
  fallbackButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1E40AF',
  },
  fallbackButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
