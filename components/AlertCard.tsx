import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  useColorScheme,
} from 'react-native';
import { Bell, TrendingUp, Calendar, Award, Trash2 } from 'lucide-react-native';
import { AlertPreference } from '@/types';

interface AlertCardProps {
  alert: AlertPreference;
  onToggle: () => void;
  onDelete: () => void;
}

export function AlertCard({ alert, onToggle, onDelete }: AlertCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getAlertIcon = (type: AlertPreference['type']) => {
    switch (type) {
      case 'new_ipo':
        return <Bell size={20} color="#60A5FA" />;
      case 'gmp_threshold':
        return <TrendingUp size={20} color="#10B981" />;
      case 'listing':
        return <Calendar size={20} color="#F59E0B" />;
      case 'allotment':
        return <Award size={20} color="#8B5CF6" />;
      default:
        return <Bell size={20} color="#94A3B8" />;
    }
  };

  const getAlertTitle = (type: AlertPreference['type']) => {
    switch (type) {
      case 'new_ipo':
        return 'New IPO Alerts';
      case 'gmp_threshold':
        return 'GMP Threshold Alert';
      case 'listing':
        return 'Listing Reminders';
      case 'allotment':
        return 'Allotment Updates';
      default:
        return 'Alert';
    }
  };

  const getAlertDescription = (alert: AlertPreference) => {
    switch (alert.type) {
      case 'new_ipo':
        return 'Get notified when new IPOs are announced';
      case 'gmp_threshold':
        return `Alert when GMP crosses ₹${alert.threshold || 0}`;
      case 'listing':
        return 'Reminders for upcoming listing dates';
      case 'allotment':
        return 'Updates on allotment status';
      default:
        return 'Custom alert';
    }
  };

  const styles = getStyles(isDark);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          <View style={styles.iconContainer}>{getAlertIcon(alert.type)}</View>
          <View style={styles.textSection}>
            <Text style={styles.title}>{getAlertTitle(alert.type)}</Text>
            <Text style={styles.description}>
              {getAlertDescription(alert)}
            </Text>
          </View>
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          <Switch
            value={alert.enabled}
            onValueChange={onToggle}
            trackColor={{ false: '#374151', true: '#60A5FA' }}
            thumbColor={alert.enabled ? '#FFFFFF' : '#9CA3AF'}
          />
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Trash2 size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? '#334155' : '#F1F5F9',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    textSection: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#F1F5F9' : '#1E293B',
      marginBottom: 4,
    },
    description: {
      fontSize: 14,
      color: isDark ? '#94A3B8' : '#64748B',
    },
    rightSection: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    deleteButton: {
      padding: 6,
    },
  });
