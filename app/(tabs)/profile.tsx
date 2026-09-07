import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Switch,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { User, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Star, Bell } from 'lucide-react-native';
import { CustomTabBar } from '@/components/CustomTabBar';
import { useUser } from '@/hooks/useUser';
import { useSavedPANs } from '@/hooks/useSavedPANs';
import * as Notifications from 'expo-notifications';
import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  // The header paints behind the status bar, so the bar keeps the header's
  // colour instead of showing a strip of the page background above it.
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);


  useEffect(() => {
  (async () => {
    const storedValue = await AsyncStorage.getItem('notificationsEnabled');
    if (storedValue === 'true') {
      setNotificationsEnabled(true);
    } else {
      setNotificationsEnabled(false);
    }
  })();
}, []);

const toggleNotifications = async () => {
  if (!notificationsEnabled) {
    const { status } = await Notifications.requestPermissionsAsync();

    if (status === 'granted') {
      Alert.alert('Notifications Enabled', 'You will receive notifications.');
      setNotificationsEnabled(true);
      await AsyncStorage.setItem('notificationsEnabled', 'true');
    } else {
      Alert.alert('Permission Denied', 'Notifications permission was not granted.');
      setNotificationsEnabled(false);
      await AsyncStorage.setItem('notificationsEnabled', 'false');
    }
  } else {
    Alert.alert('Notifications Disabled', 'You will no longer receive notifications.');
    setNotificationsEnabled(false);
    await AsyncStorage.setItem('notificationsEnabled', 'false');
    // Optionally: cancel scheduled notifications here
  }
};

  const { savedPANs } = useSavedPANs();
  const { user, logout } = useUser();

  // "Rate App" had an empty onPress, so tapping it did nothing at all.
  //
  // Play's in-app review shows the rating sheet over the app, so nobody is
  // thrown out to the Store to leave a review. It is only available in a build
  // installed by Play, and Play itself decides whether to show the sheet — it
  // quietly does nothing if the user has already reviewed or has been asked
  // recently — so the Store listing stays as the fallback.
  const openStoreListing = async () => {
    const packageName = 'com.iposahayak';
    const appUrl = `market://details?id=${packageName}`;
    const webUrl = `https://play.google.com/store/apps/details?id=${packageName}`;

    // Play's in-app sheet only appears in a build Play installed, and Play
    // decides whether to show it at all: it shows once, then quietly does
    // nothing for weeks, and requestReview() resolves the same way either
    // time. So the sheet is asked for on the first tap only; every tap after
    // that goes to the store listing, where a rating can always be given or
    // changed.
    const ASKED_KEY = 'inAppReviewAskedAt';
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      try {
        const askedBefore = await AsyncStorage.getItem(ASKED_KEY);
        if (!askedBefore && (await StoreReview.isAvailableAsync())) {
          await AsyncStorage.setItem(ASKED_KEY, String(Date.now()));
          await StoreReview.requestReview();
          return;
        }
      } catch (error: any) {
        console.warn('In-app review unavailable:', error?.message || error);
      }
    }

    // canOpenURL is not used for market:// — on Android 11 and later it
    // answers false for any scheme missing from the manifest's <queries>,
    // even when the intent would resolve, which sent every device to the
    // browser instead of the Play app.
    try {
      await Linking.openURL(appUrl);
    } catch {
      try {
        await Linking.openURL(webUrl);
      } catch {
        Alert.alert('Could not open the Play Store', webUrl);
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const menuItems = [
    {
      icon: <Bell size={20} color={isDark ? '#94A3B8' : '#64748B'} />,
      title: 'Notification Settings',
      subtitle: 'Manage alerts and notifications',
      isSwitch: true,
      switchValue: notificationsEnabled,
      onToggle: toggleNotifications,
    },
    {
      icon: <Shield size={20} color={isDark ? '#94A3B8' : '#64748B'} />,
      title: 'Privacy Policy',
      subtitle: 'View privacy policy',
      onPress: () => router.push('/privacy'),
    },
    {
      icon: <HelpCircle size={20} color={isDark ? '#94A3B8' : '#64748B'} />,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => router.push('/help'),
    },
    {
      icon: <Star size={20} color={isDark ? '#94A3B8' : '#64748B'} />,
      title: 'Rate App',
      subtitle: 'Rate us on the Play store',
      onPress: openStoreListing,
    },
  ];

  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <User size={32} color="#60A5FA" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          </View>
        </View>


        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{savedPANs.length}</Text>
            <Text style={styles.statLabel}>PANs Added</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            item.isSwitch ? (
              <View key={index} style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  {item.icon}
                  <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Switch
                  value={item.switchValue}
                  onValueChange={item.onToggle}
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={item.switchValue ? "#60A5FA" : "#f4f3f4"}
                />
              </View>
            ) : (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuLeft}>
                  {item.icon}
                  <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={isDark ? '#64748B' : '#94A3B8'} />
              </TouchableOpacity>
            )
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.1.0</Text>
      </ScrollView>
      <CustomTabBar />
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderBottomWidth: 1, borderBottomColor: isDark ? '#334155' : '#E2E8F0' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: isDark ? '#F1F5F9' : '#1E293B' },
  scrollView: { flex: 1, paddingBottom: 120 },
  userSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1E293B' : '#FFFFFF', marginHorizontal: 16, marginTop: 20, padding: 20, borderRadius: 16, gap: 16 },
  userAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: isDark ? '#334155' : '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  userInfo: { flex: 1 },
  userName: { fontSize: 20, fontWeight: '600', color: isDark ? '#F1F5F9' : '#1E293B', marginBottom: 4 },
  userEmail: { fontSize: 16, color: isDark ? '#94A3B8' : '#64748B', marginBottom: 8 },
  userStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 14, color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '500' },
  premiumStatus: { color: '#F59E0B' },
  subscriptionCard: { marginHorizontal: 16, marginTop: 16 },
  statsSection: { flexDirection: 'row', backgroundColor: isDark ? '#1E293B' : '#FFFFFF', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: isDark ? '#60A5FA' : '#1E40AF', marginBottom: 4 },
  statLabel: { fontSize: 14, color: isDark ? '#94A3B8' : '#64748B', textAlign: 'center' },
  menuSection: { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', marginHorizontal: 16, marginTop: 24, borderRadius: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: isDark ? '#334155' : '#F1F5F9' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '500', color: isDark ? '#F1F5F9' : '#1E293B', marginBottom: 2 },
  menuSubtitle: { fontSize: 14, color: isDark ? '#94A3B8' : '#64748B' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#1E293B' : '#FFFFFF', marginHorizontal: 16, marginTop: 24, padding: 16, borderRadius: 12, gap: 8, borderWidth: 1, borderColor: '#EF4444' },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },
  versionText: { textAlign: 'center', color: isDark ? '#64748B' : '#94A3B8', fontSize: 14, marginTop: 24, marginBottom: 20 },
});
