import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

export function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const styles = getStyles(isDark);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
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