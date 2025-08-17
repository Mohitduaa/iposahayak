import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Bell, Plus, Crown, Settings, Trash2 } from 'lucide-react-native';
import { AlertCard } from '@/components/AlertCard';
import { CreateAlertModal } from '@/components/CreateAlertModal';
import { useAlerts } from '@/hooks/useAlerts';

export default function AlertsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  const { alerts, toggleAlert, deleteAlert, createAlert } = useAlerts();

  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Alerts</Text>
          <Text style={styles.headerSubtitle}>Manage your notifications</Text>
        </View>
        <TouchableOpacity style={styles.premiumButton}>
          <Crown size={20} color="#F59E0B" />
          <Text style={styles.premiumText}>Premium</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color={isDark ? '#60A5FA' : '#1E40AF'} />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingSubtitle}>Receive alerts on your device</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#374151', true: '#60A5FA' }}
              thumbColor={pushNotifications ? '#FFFFFF' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Active Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Alerts</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={16} color="#60A5FA" />
              <Text style={styles.addButtonText}>Add Alert</Text>
            </TouchableOpacity>
          </View>

          {alerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={48} color={isDark ? '#4B5563' : '#9CA3AF'} />
              <Text style={styles.emptyTitle}>No alerts set</Text>
              <Text style={styles.emptySubtitle}>
                Create alerts to get notified about IPO events
              </Text>
              <TouchableOpacity 
                style={styles.createFirstAlert}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createFirstAlertText}>Create Your First Alert</Text>
              </TouchableOpacity>
            </View>
          ) : (
            alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onToggle={() => toggleAlert(alert.id)}
                onDelete={() => deleteAlert(alert.id)}
              />
            ))
          )}
        </View>

        {/* Alert Types Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert Types</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Available Alert Types</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• New IPO Announcements</Text>
              <Text style={styles.infoItem}>• Allotment Status Updates</Text>
              <Text style={styles.infoItem}>• GMP Threshold Alerts</Text>
              <Text style={styles.infoItem}>• Listing Date Reminders</Text>
              <Text style={styles.infoItem}>• Subscription Status Updates</Text>
              <Text style={[styles.infoItem, styles.premiumItem]}>
                • Expert Analysis (Premium)
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <CreateAlertModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateAlert={createAlert}
      />
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1F2937' : '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  premiumText: {
    color: '#F59E0B',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 120,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  addButtonText: {
    color: '#60A5FA',
    fontWeight: '600',
    fontSize: 14,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: isDark ? '#94A3B8' : '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  createFirstAlert: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createFirstAlertText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
    lineHeight: 20,
  },
  premiumItem: {
    color: '#F59E0B',
  },
});