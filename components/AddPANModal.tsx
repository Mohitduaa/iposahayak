import React, { useEffect, useState } from 'react';
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
import { X, CreditCard, Plus } from 'lucide-react-native';

interface AddPANModalProps {
  visible: boolean;
  onClose: () => void;
  onAddPAN: (pan: string, name: string) => boolean;
  editingPAN?: { pan: string; name: string };
}

export function AddPANModal({ visible, onClose, onAddPAN, editingPAN }: AddPANModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [pan, setPAN] = useState(editingPAN?.pan || '');
  const [name, setName] = useState(editingPAN?.name || '');

  // The modal stays mounted and is only toggled via `visible`, so its state
  // was seeded once on first mount and never again — editing PAN B after
  // having edited PAN A first could still show A's saved name. Re-sync
  // whenever the sheet opens for a (possibly different) target.
  useEffect(() => {
    if (visible) {
      setPAN(editingPAN?.pan || '');
      setName(editingPAN?.name || '');
    }
  }, [visible, editingPAN]);

  const handleSave = () => {
    if (pan.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit PAN number');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for this PAN');
      return;
    }

    const success = onAddPAN(pan.toUpperCase(), name.trim());
    if (success) {
      setPAN('');
      setName('');
      onClose();
    } else {
      Alert.alert('Error', 'This PAN is already saved');
    }
  };

  const handleClose = () => {
    setPAN(editingPAN?.pan || '');
    setName(editingPAN?.name || '');
    onClose();
  };

  const styles = getStyles(isDark);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {editingPAN ? 'Edit PAN Card' : 'Add PAN Card'}
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <X size={24} color={isDark ? '#F1F5F9' : '#1E293B'} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.inputSection}>
            <Text style={styles.label}>Account Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., My Account, Wife's Account"
              value={name}
              onChangeText={setName}
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>PAN Number</Text>
            <TextInput
              style={styles.input}
              placeholder="ABCDE1234F"
              value={pan}
              onChangeText={(text) => setPAN(text.toUpperCase())}
              maxLength={10}
              autoCapitalize="characters"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            />
          </View>

          <View style={styles.previewSection}>
            <Text style={styles.previewLabel}>Preview</Text>
            <View style={styles.previewCard}>
              <CreditCard size={20} color="#60A5FA" />
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>
                  {name || 'Account Name'}
                </Text>
                <Text style={styles.previewPAN}>
                  {pan || 'ABCDE1234F'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>
              {editingPAN ? 'Update' : 'Save PAN'}
            </Text>
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
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  previewSection: {
    marginTop: 20,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 12,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#DBEAFE',
    gap: 8,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 2,
  },
  previewPAN: {
    fontSize: 12,
    color: isDark ? '#94A3B8' : '#64748B',
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
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});