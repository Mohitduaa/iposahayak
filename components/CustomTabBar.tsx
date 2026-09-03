import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, useColorScheme } from 'react-native';
import { Chrome as Home, TrendingUp, Search, User } from 'lucide-react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CustomTabBar() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const pathname = usePathname();
  // The bar was a fixed 85px tall with 25px of bottom padding, which is the
  // gesture bar on one particular phone. Devices with hardware keys wasted
  // that strip, and taller indicators were cramped by it.
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: 'IPOs', route: '/', icon: Home },
    { name: 'GMP', route: '/gmp', icon: TrendingUp },
    { name: 'Allotment', route: '/allotment', icon: Search },
    { name: 'Profile', route: '/profile', icon: User },
  ];

  const styles = getStyles(isDark);

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.route;
        
        return (
          <TouchableOpacity
            key={tab.route}
            style={styles.tab}
            onPress={() => router.push(tab.route as never)}
          >
            <Icon 
              size={24} 
              color={isActive ? (isDark ? '#60A5FA' : '#1E40AF') : (isDark ? '#6B7280' : '#9CA3AF')} 
            />
            <Text style={[
              styles.tabText,
              { color: isActive ? (isDark ? '#60A5FA' : '#1E40AF') : (isDark ? '#6B7280' : '#9CA3AF') }
            ]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#111827' : '#FFFFFF',
    borderTopColor: isDark ? '#374151' : '#E5E7EB',
    borderTopWidth: 1,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },
});