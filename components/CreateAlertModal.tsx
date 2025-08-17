import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  useColorScheme,
} from 'react-native';
import { X, Bell, TrendingUp, Calendar, Award } from 'lucide-react-native';
import { AlertPreference } from '@/types';

interface CreateAlertModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateAlert: (alert: Omit<AlertPreference, 'id'>) => void;
}

export function CreateAlertModal({ visible, onClose, onCreateAlert }: CreateAlertModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedType, setSelectedType] = useState<AlertPreference['type']>('new_ipo');
  const [threshold, setThreshold] = useState('');

  const alertTypes = [
    {
      type: 'new_ipo' as const,
      title: 'New IPO Alerts',
      description: 'Get notified when new IPOs are announced',
      icon: <Bell size={20} color="#60A5FA" />,
    },
    {
      type: 'gmp_threshold' as const,
      title: 'GMP Threshold',
      description: 'Alert when GMP crosses a threshold',
      icon: <TrendingUp size={20} color="#10B981" />,
    },
    {
      type: 'listing' as const,
      title: 'Listing Reminders',
      description: 'Reminders for upcoming listing dates',
      icon: <Calendar size={20} color="#F59E0B" />,
    },
    {
      type: 'allotment' as const,
      title: 'Allotment Updates',
      description: 'Updates on allotment status',
      icon: <Award size={20} color="#8B5CF6" />,
    },
  ];

  const handleCreate = () => {
    if (selectedType === 'gmp_threshold' && (!threshold || isNaN(Number(threshold)))) {
      Alert.alert('Error', 'Please enter a valid threshold amount');
      return;
    }

    const newAlert: Omit<AlertPreference, 'id'> = {
      type: selectedType,
      enabled: true,
      threshold: selectedType === 'gmp_threshold' ? Number(threshold) : undefined,
    };

    onCreateAlert(newAlert);
    setThreshold('');
    setSelectedType('new_ipo');
    onClose();
  };

  const styles = getStyles(isDark);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Alert</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={isDark ? '#F1F5F9' : '#1E293B'} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Alert Type</Text>
          
          {alertTypes.map((type) => (
            <TouchableOpacity
              key={type.type}
              style={[
                styles.typeOption,
                selectedType === type.type && styles.selectedTypeOption,
              ]}
              onPress={() => setSelectedType(type.type)}
            >
              <View style={styles.typeLeft}>
                <View style={styles.typeIcon}>
                  {type.icon}
                </View>
                <View>
                  <Text style={styles.typeTitle}>{type.title}</Text>
                  <Text style={styles.typeDescription}>{type.description}</Text>
                </View>
              </View>
              {selectedType === type.type && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          ))}

          {selectedType === 'gmp_threshold' && (
            <View style={styles.thresholdSection}>
              <Text style={styles.thresholdLabel}>Threshold Amount (₹)</Text>
              <TextInput
                style={styles.thresholdInput}
                placeholder="Enter amount (e.g., 100)"
                value={threshold}
                onChangeText={setThreshold}
                keyboardType="numeric"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              />
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Text style={styles.createButtonText}>Create Alert</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    alignItems: 'center',
    padding: 20,
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#E2E8F0',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 16,
  },
  typeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  selectedTypeOption: {
    borderColor: '#1E40AF',
    backgroundColor: isDark ? '#1E3A8A20' : '#EFF6FF',
  },
  typeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? '#334155' : '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 2,
  },
  typeDescription: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1E40AF',
  },
  thresholdSection: {
    marginTop: 20,
    padding: 16,
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  thresholdLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 12,
  },
  thresholdInput: {
    backgroundColor: isDark ? '#334155' : '#F8FAFC',
    borderWidth: 1,
    borderColor: isDark ? '#475569' : '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: isDark ? '#374151' : '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  createButton: {
    flex: 1,
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});