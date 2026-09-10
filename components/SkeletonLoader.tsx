import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useColorScheme } from 'react-native';

interface SkeletonLoaderProps {
  type?: 'card' | 'list' | 'stats';
  count?: number;
}

export function SkeletonLoader({ type = 'card', count = 3 }: SkeletonLoaderProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const styles = getStyles(isDark);

  if (type === 'stats') {
    return (
      <View style={styles.statsContainer}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Animated.View key={index} style={[styles.statsSkeleton, { opacity }]} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View key={index} style={[styles.cardSkeleton, { opacity }]}>
          <View style={styles.header}>
            <View style={styles.titleSkeleton} />
            <View style={styles.badgeSkeleton} />
          </View>
          <View style={styles.content}>
            <View style={styles.lineSkeleton} />
            <View style={styles.lineSkeletonShort} />
          </View>
          <View style={styles.footer}>
            <View style={styles.footerItem} />
            <View style={styles.footerItem} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16,
  },
  cardSkeleton: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleSkeleton: {
    width: '60%',
    height: 20,
    backgroundColor: isDark ? '#334155' : '#E2E8F0',
    borderRadius: 4,
  },
  badgeSkeleton: {
    width: 60,
    height: 24,
    backgroundColor: isDark ? '#334155' : '#E2E8F0',
    borderRadius: 12,
  },
  content: {
    gap: 8,
    marginBottom: 16,
  },
  lineSkeleton: {
    width: '100%',
    height: 16,
    backgroundColor: isDark ? '#334155' : '#E2E8F0',
    borderRadius: 4,
  },
  lineSkeletonShort: {
    width: '70%',
    height: 16,
    backgroundColor: isDark ? '#334155' : '#E2E8F0',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    width: '40%',
    height: 16,
    backgroundColor: isDark ? '#334155' : '#E2E8F0',
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  statsSkeleton: {
    flex: 1,
    height: 80,
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
});