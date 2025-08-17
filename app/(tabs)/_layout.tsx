import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Chrome as Home, TrendingUp, Bell, Settings, Search, User } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  const tintColor = colorScheme === 'dark' ? '#60A5FA' : '#1E40AF';
  const backgroundColor = colorScheme === 'dark' ? '#111827' : '#FFFFFF';
  const inactiveTintColor = colorScheme === 'dark' ? '#6B7280' : '#9CA3AF';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: inactiveTintColor,
        tabBarStyle: {
          backgroundColor,
          borderTopColor: colorScheme === 'dark' ? '#374151' : '#E5E7EB',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 5,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
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
          title: 'Alerts',
          tabBarIcon: ({ size, color }) => (
            <Bell size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="privacy"
        options={{
          href: null, // Hide from tab bar
        }}
      />
  <Tabs.Screen
        name="help"
        options={{
          href: null, // Hide from tab bar
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
    
    
  );
}