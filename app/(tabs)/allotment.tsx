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
import { Crown, Search, Plus } from 'lucide-react-native';
import { useSavedPANs } from '@/hooks/useSavedPANs';
import { useAllotmentCheck } from '@/hooks/useAllotmentCheck';
import { useIPOData } from '@/hooks/useIPOData';
import { IPOSelector } from '@/components/IPOSelector';
import { SavedPANSelector } from '@/components/SavedPANSelector';
import { AddPANModal } from '@/components/AddPANModal';
import { AllotmentResultsModal } from '@/components/AllotmentResultsModal';
import { AllotmentStatus } from '@/types';

export default function AllotmentScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [selectedIPOId, setSelectedIPOId] = useState<string>('');
  const [showAddPANModal, setShowAddPANModal] = useState(false);
  const [editingPAN, setEditingPAN] = useState<{ pan: string; name: string } | undefined>(undefined);
  const [allotmentResults, setAllotmentResults] = useState<AllotmentStatus[]>([]);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const { savedPANs, addPAN, removePAN, updatePANName } = useSavedPANs();
  const { checkAllotment, loading } = useAllotmentCheck();
  const { ipos } = useIPOData();

  const selectedIPO = ipos.find(ipo => ipo.id === selectedIPOId);

  const handleCheckAllotment = async () => {
    if (!selectedIPOId) {
      Alert.alert('Error', 'Please select an IPO first.');
      return;
    }

    if (savedPANs.length === 0) {
      Alert.alert('Error', 'Please add at least one PAN card to check allotment.');
      return;
    }

    const pansToCheck = savedPANs.map(p => p.pan);
    const results = await checkAllotment(pansToCheck, selectedIPOId);
    setAllotmentResults(results);
    setShowResultsModal(true);
  };

  const handleAddPAN = (pan: string, name: string) => {
    const success = addPAN(pan, name);
    if (success) {
      setShowAddPANModal(false);
      setEditingPAN(undefined);
    }
    return success;
  };

  const handleEditPAN = (pan: string, name: string) => {
    setEditingPAN({ pan, name });
    setShowAddPANModal(true);
  };

  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Allotment Status</Text>
          <Text style={styles.headerSubtitle}>Check your IPO allotment</Text>
        </View>
        <TouchableOpacity style={styles.premiumButton}>
          <Crown size={20} color="#F59E0B" />
          <Text style={styles.premiumText}>Premium</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 120 }}>
        <IPOSelector
          selectedIPO={selectedIPOId}
          onSelect={setSelectedIPOId}
          style={styles.section}
        />

        <SavedPANSelector
          savedPANs={savedPANs}
          onSelectPAN={() => {}}
          onRemovePAN={removePAN}
          onEditPAN={handleEditPAN}
          style={styles.section}
        />

        <TouchableOpacity
          style={styles.addPanButton}
          onPress={() => {
            setEditingPAN(undefined);
            setShowAddPANModal(true);
          }}
        >
          <Plus size={20} color="#FFFFFF" />
          <Text style={styles.addPanButtonText}>Add New PAN</Text>
        </TouchableOpacity>

        {savedPANs.length > 0 && selectedIPOId && (
          <TouchableOpacity
            style={[styles.checkButton, loading && styles.checkButtonDisabled]}
            onPress={handleCheckAllotment}
            disabled={loading}
          >
            <Search size={20} color="#FFFFFF" />
            <Text style={styles.checkButtonText}>
              {loading ? 'Checking...' : `Quick Check All ${savedPANs.length} PANs`}
            </Text>
          </TouchableOpacity>
        )}

        {savedPANs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No PAN Cards Saved</Text>
            <Text style={styles.emptySubtitle}>
              Add your PAN cards to quickly check allotment status for any IPO.
            </Text>
          </View>
        )}
      </ScrollView>

      <AddPANModal
        visible={showAddPANModal}
        onClose={() => {
          setShowAddPANModal(false);
          setEditingPAN(undefined);
        }}
        onAddPAN={handleAddPAN}
        editingPAN={editingPAN}
      />

      <AllotmentResultsModal
        visible={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        results={allotmentResults}
        ipoName={selectedIPO?.companyName || 'Selected IPO'}
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
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  addPanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E40AF',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  addPanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  checkButtonDisabled: {
    opacity: 0.6,
  },
  checkButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
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
});