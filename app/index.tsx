import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFlow = async () => {
      try {
        const introSeen = await AsyncStorage.getItem('introSeen');
        let token = await AsyncStorage.getItem('authToken');
        const user = await AsyncStorage.getItem('user');

        // Builds before 1.2.4 saved the token under "token"; carry it over
        // so nobody is asked to sign in again after updating
        if (!token) {
          const legacy = await AsyncStorage.getItem('token');
          if (legacy) {
            await AsyncStorage.setItem('authToken', legacy);
            await AsyncStorage.removeItem('token');
            token = legacy;
          }
        }

        const isAuthenticated = !!(token && user);

        if (!introSeen) {
          router.replace('/onboarding/screen1');
        } else if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.replace('/(auth)/login');
      } finally {
        setLoading(false);
      }
    };

    checkFlow();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E40AF" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Matches the native splash background (colors.xml splashscreen_background)
    // so the handover from splash to app is invisible rather than a flash.
    backgroundColor: '#FFFFFF',
  },
});
