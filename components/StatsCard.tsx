import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  onPress?: () => void;
}

export function StatsCard({ title, value, icon, color, onPress }: StatsCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const styles = getStyles(isDark);

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.container} onPress={onPress}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      {/*
        Three of these sit side by side, so each gets a third of the screen and
        no more. At the system's largest font setting "Upcoming" wrapped to
        "Upcomin / g" and the row grew a second line.

        The cap is the whole fix: at the normal setting the text renders at
        exactly the size in the styles below, and it is only stopped from
        growing far enough to break the row. Shrink-to-fit was tried here and
        removed — it re-sized the labels at the normal setting too, which
        changed how the cards looked when nothing was wrong.
      */}
      <Text style={styles.value} numberOfLines={1} maxFontSizeMultiplier={1.3}>
        {value || '0'}
      </Text>
      <Text style={styles.title} numberOfLines={1} maxFontSizeMultiplier={1.2}>
        {title || 'N/A'}
      </Text>
    </Container>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  iconContainer: {
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: isDark ? '#94A3B8' : '#64748B',
    textAlign: 'center',
  },
});