import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Crown, Search, Plus } from 'lucide-react-native';
import { useSavedPANs } from '@/hooks/useSavedPANs';
import { useAllotmentCheck } from '@/hooks/useAllotmentCheck';
import { IPOSelector } from '@/components/IPOSelector';
import { SavedPANSelector } from '@/components/SavedPANSelector';
import { AddPANModal } from '@/components/AddPANModal';
import { AllotmentResultsModal } from '@/components/AllotmentResultsModal';
import { CustomTabBar } from '@/components/CustomTabBar';
import { AllotmentStatus } from '@/types';
import { RegistrarType } from '@/services/registrar';
import { describeStatus } from '@/components/allotmentStatus';

export default function AllotmentScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  // The header paints behind the status bar, so the bar keeps the header's
  // colour instead of showing a strip of the page background above it.
  const insets = useSafeAreaInsets();

  const [selectedIPO, setSelectedIPO] = useState<{ id: string; companyType: RegistrarType | ''; name?: string }>({
    id: '',
    companyType: '',
    name: '',
  });

  const [showAddPANModal, setShowAddPANModal] = useState(false);
  const [editingPAN, setEditingPAN] = useState<{ pan: string; name: string } | undefined>(undefined);
  const [allotmentResults, setAllotmentResults] = useState<AllotmentStatus[]>([]);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const { savedPANs, addPAN, removePAN, updatePANName } = useSavedPANs();
  const { checkAllotment, loading } = useAllotmentCheck();

  const handleCheckAllotment = async () => {
    if (!selectedIPO.id || !selectedIPO.companyType) {
      Alert.alert('Error', 'Please select an IPO first.');
      return;
    }

    if (savedPANs.length === 0) {
      Alert.alert('Error', 'Please add at least one PAN card to check allotment.');
      return;
    }

    const pansToCheck = savedPANs.map((p) => p.pan);

    const results = await checkAllotment(
      pansToCheck,
      selectedIPO.id,
      selectedIPO.companyType as RegistrarType,
      selectedIPO.name
    );

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
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.headerTitle}>Allotment Check</Text>
          <Text style={styles.headerSubtitle}>Check your IPO allotment</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <IPOSelector
          selectedIPO={selectedIPO.id}
          onSelect={(id, companyType, name) => setSelectedIPO({ id, companyType, name })}
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

        {savedPANs.length > 0 && selectedIPO.id ? (
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
        ) : null}

        {savedPANs.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No PAN Cards Saved</Text>
            <Text style={styles.emptySubtitle}>
              Add your PAN cards to quickly check allotment status for any IPO.
            </Text>
          </View>
        )}

        {/* The results only existed inside a modal, so the screen sat empty and
            the answer disappeared the moment the sheet was dismissed. They stay
            here until the next check. */}
        {allotmentResults.length > 0 && (
          <View style={styles.section}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsTitle}>
                Result{allotmentResults.length > 1 ? 's' : ''}
                {selectedIPO.name ? ` — ${selectedIPO.name}` : ''}
              </Text>
              <TouchableOpacity onPress={() => setShowResultsModal(true)}>
                <Text style={styles.resultsLink}>Details</Text>
              </TouchableOpacity>
            </View>

            {allotmentResults.map((result, index) => {
              const allotted = result.status === 'allotted';
              const { label, tone } = describeStatus(result.status, isDark);

              // Prefer the name the registrar returned, then the saved label —
              // a bare PAN tells you nothing when several are saved.
              const person =
                result.name ||
                savedPANs.find((saved) => saved.pan === result.pan)?.name ||
                'Saved PAN';
              const masked =
                result.pan.length > 4
                  ? `${'X'.repeat(result.pan.length - 4)}${result.pan.slice(-4)}`
                  : result.pan;

              return (
                <View style={styles.resultRow} key={`${result.pan}-${index}`}>
                  <View style={styles.resultAvatar}>
                    <Text style={styles.resultAvatarText}>
                      {String(person).charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.resultLeft}>
                    <Text style={styles.resultName} numberOfLines={1}>{person}</Text>
                    <Text style={styles.resultPan}>{masked}</Text>
                  </View>
                  <View style={styles.resultRight}>
                    <Text style={[styles.resultStatus, { color: tone }]}>{label}</Text>
                    {allotted && !!result.allottedShares && (
                      <Text style={styles.resultMeta}>{result.allottedShares} shares</Text>
                    )}
                    {result.status === 'error' && !!result.message && (
                      <Text style={styles.resultMeta} numberOfLines={2}>{result.message}</Text>
                    )}
                  </View>
                </View>
              );
            })}
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
        ipoName={selectedIPO?.name || 'Selected IPO'}
      />
      <CustomTabBar />
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 20,
      paddingTop: 12,
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
    scrollView: { flex: 1, paddingHorizontal: 16, paddingVertical: 20 },
    scrollContent: { paddingBottom: 24 },
  section: { marginBottom: 20 },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  resultsLink: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#60A5FA' : '#1E40AF',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
    gap: 12,
  },
  resultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDark ? '#334155' : '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultAvatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: isDark ? '#93C5FD' : '#1E40AF',
  },
  resultLeft: { flex: 1 },
  resultRight: { alignItems: 'flex-end' },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  resultPan: {
    fontSize: 12,
    letterSpacing: 1,
    color: isDark ? '#94A3B8' : '#64748B',
    marginTop: 2,
  },
  resultMeta: {
    fontSize: 12,
    color: isDark ? '#94A3B8' : '#64748B',
    marginTop: 2,
  },
  resultStatus: { fontSize: 14, fontWeight: '600' },
  hintBox: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  hintTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 6,
  },
  hintText: {
    fontSize: 13,
    lineHeight: 20,
    color: isDark ? '#94A3B8' : '#64748B',
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
    addPanButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
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
    checkButtonDisabled: { opacity: 0.6 },
    checkButtonText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    emptyState: { alignItems: 'center', paddingVertical: 48 },
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
