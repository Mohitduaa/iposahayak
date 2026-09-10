import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { GMPDetailsView } from '@/components/GMPDetailsView';

/**
 * The GMP sheet as a screen rather than a modal, for the same reason as the IPO
 * one: React Native's Android `Modal` opens a second window that is drawn
 * before it is sized, which showed as a box flashing in the top-left corner.
 *
 * The card already holds the row it is showing, so it travels through as
 * `data` and the screen paints immediately.
 */
export default function GMPDetailScreen() {
  const { data } = useLocalSearchParams<{ name: string; data?: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const gmp = useMemo(() => {
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }, [data]);

  if (!gmp) {
    return (
      <View style={[styles.fallback, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
        <Text style={[styles.fallbackText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          This IPO&apos;s premium could not be opened.
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.fallbackButton}>
          <Text style={styles.fallbackButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <GMPDetailsView data={gmp} onClose={() => router.back()} />;
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
