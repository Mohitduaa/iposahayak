import * as React from 'react';

import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Chrome as Home, TrendingUp, Bell, Settings, Search, User } from 'lucide-react-native';
import { GlobalDataProvider } from '@/store/GlobalDataStore';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  const tintColor = colorScheme === 'dark' ? '#60A5FA' : '#1E40AF';
  const backgroundColor = colorScheme === 'dark' ? '#111827' : '#FFFFFF';
  const inactiveTintColor = colorScheme === 'dark' ? '#6B7280' : '#9CA3AF';

  return (
    <GlobalDataProvider>
      <Tabs
        // Back used to jump to the first tab whatever had been open before it,
        // so Profile → Privacy → back landed on Home. It now retraces the tabs
        // actually visited, and Privacy and Help live outside the tabs as
        // pushed screens, so back from them returns to Profile.
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          lazy: false,
          unmountOnBlur: false,
          freezeOnBlur: false,
        }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'IPOs',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="gmp"
        options={{
          title: 'GMP',
          tabBarIcon: ({ size, color }) => (
            <TrendingUp size={size} color={color} />
          ),
        }}
      />
      
      
      <Tabs.Screen
        name="allotment"
        options={{
          title: 'Allotment',
          tabBarIcon: ({ size, color }) => (
            <Search size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
                    href: null, // Hide from tab bar

          // title: 'Alerts',
          // tabBarIcon: ({ size, color }) => (
          //   <Bell size={size} color={color} />
          // ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      </Tabs>
    </GlobalDataProvider>
  );
}