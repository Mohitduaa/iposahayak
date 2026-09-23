import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Platform, Appearance } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { OneSignal, LogLevel } from 'react-native-onesignal';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useScreenTracking } from '@/hooks/useScreenTracking';
import OfflineNotice from '@/components/OfflineNotice';
import { UpdatePrompt } from '@/components/UpdatePrompt';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Hold the native splash until index.tsx has decided where to send the user.
// Commented out, the splash hid the moment the activity drew, so the app showed
// a bare spinner on a different background for the length of the auth check —
// two loading screens back to back instead of one.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden, or the module is unavailable; nothing to hold.
});

export default function RootLayout() {
  useFrameworkReady();
  useScreenTracking();

  // Hiding the splash belongs here, not in app/index.tsx. index only runs when
  // the app is opened at "/", so a deep link — or anything else that lands on
  // another route first — never reached the hideAsync call and the app sat on
  // the splash screen forever. The root layout mounts on every entry path.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Re-apply the Profile screen's dark-mode choice before anything renders
  // twice; without this the app opens in the system theme and snaps to the
  // chosen one only after visiting Profile.
  useEffect(() => {
    AsyncStorage.getItem('themeOverride')
      .then((stored) => {
        if (stored === 'dark' || stored === 'light') Appearance.setColorScheme(stored);
      })
      .catch(() => {});
  }, []);

  // 🔹 OneSignal init
  //
  // The native module is missing in Expo Go and in any dev client built
  // without it, and initialising it there threw on every launch — the red
  // "OneSignal native module not loaded" banner sat over the UI. Push is a
  // nice-to-have; the app runs perfectly well without it, so a failure here
  // stays in the log. Verbose logging is for development only.
  useEffect(() => {
    // There is no native module on the web at all, and requestPermission
    // fails asynchronously, past the reach of a try/catch
    if (Platform.OS === 'web') return;
    try {
      if (!OneSignal?.initialize) return;

      if (__DEV__) OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      OneSignal.initialize('96170c8b-bb38-41d0-a04e-79a09ead88a7');
      Promise.resolve(OneSignal.Notifications.requestPermission(true)).catch((error: any) => {
        console.warn('Push permission unavailable:', error?.message || error);
      });
    } catch (error: any) {
      console.warn('Push notifications unavailable:', error?.message || error);
    }
  }, []);

  // 🔹 Hide splash screen
  // useEffect(() => {
  //   async function hideSplash() {
  //     await SplashScreen.hideAsync();
  //   }
  //   hideSplash();
  // }, []);

useEffect(() => {
  console.log("🚀 useEffect triggered - DailyActive check start");

  const callDailyActive = async () => {
    console.log("⚡ callDailyActive function entered");

    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log("🔑 Token from AsyncStorage:", token);

      if (!token) {
        console.log('⚠️ Skipping daily active call (no token)');
        return;
      }

      const res = await axios.post(
        'https://api.iposahayak.com/auth/dailyactive',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Daily Active API Response:', res.data);
    } catch (error: any) {
      console.error('❌ Daily Active API Error:', error.response?.data || error.message);
    }
  };

  callDailyActive();
}, []);




  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OfflineNotice />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      {/* Sits above every screen so a published update can be applied from
          wherever the reader happens to be */}
      <UpdatePrompt />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
