import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { User, Crown, CreditCard, Bell, Moon, Sun, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, Star } from 'lucide-react-native';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { useUser } from '@/hooks/useUser';
import { useSavedPANs } from '@/hooks/useSavedPANs';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [darkMode, setDarkMode] = useState(isDark);
  const { savedPANs, addPAN, removePAN, updatePANName } = useSavedPANs();

  const { user, logout, updateSubscription } = useUser();

  const handleSubscriptionUpgrade = () => {
    // Navigate to subscription plans
    Alert.alert('Upgrade to Premium', 'Unlock advanced features with premium subscription');
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
      onPress: () => {},
    },
    {
      icon: <Shield size={20} color={isDark ? '#94A3B8' : '#64748B'} />,
      title: 'Privacy Policy',
      subtitle: 'View privacy policy',
      onPress: () => router.push('/(tabs)/privacy'),
    },
    {
      icon: <HelpCircle size={20} color={isDark ? '#94A3B8' : '#64748B'} />,
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      onPress: () => router.push('/(tabs)/help'),
    },
    {
      icon: <Star size={20} color={isDark ? '#94A3B8' : '#64748B'} />,
      title: 'Rate App',
      subtitle: 'Rate us on the app store',
      onPress: () => {},
    },
  ];

  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
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
            <View style={styles.userStatus}>
              <Crown size={16} color={user?.isPremium ? '#F59E0B' : '#9CA3AF'} />
              <Text style={[styles.statusText, user?.isPremium && styles.premiumStatus]}>
                {user?.isPremium ? 'Premium Member' : 'Free User'}
              </Text>
            </View>
          </View>
        </View>

        {/* Subscription Card */}
        {!user?.isPremium && (
          <SubscriptionCard
            onUpgrade={handleSubscriptionUpgrade}
            style={styles.subscriptionCard}
          />
        )}

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
<Text style={styles.statValue}>{savedPANs.length}</Text>
            <Text style={styles.statLabel}>PANs Added</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Active Alerts</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuLeft}>
                {item.icon}
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <ChevronRight size={20} color={isDark ? '#64748B' : '#94A3B8'} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#E2E8F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 120,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDark ? '#334155' : '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: isDark ? '#94A3B8' : '#64748B',
    marginBottom: 8,
  },
  userStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    color: isDark ? '#9CA3AF' : '#6B7280',
    fontWeight: '500',
  },
  premiumStatus: {
    color: '#F59E0B',
  },
  subscriptionCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  statsSection: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: isDark ? '#60A5FA' : '#1E40AF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#F1F5F9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: isDark ? '#64748B' : '#94A3B8',
    fontSize: 14,
    marginTop: 24,
    marginBottom: 20,
  },
});