import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

export default function Index() {
  useEffect(() => {
    // Simple timeout to ensure navigation is ready
    const timer = setTimeout(() => {
      // Check if user is authenticated
      const isAuthenticated = false; // Replace with actual auth check
      
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }

      // Hide splash screen after navigation
      SplashScreen.hideAsync();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1E40AF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});