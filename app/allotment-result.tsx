import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useSavedPANs } from '@/hooks/useSavedPANs';
import { useAllotmentCheck } from '@/hooks/useAllotmentCheck';
import { AllotmentStatus } from '@/types';
import { RegistrarType } from '@/services/registrar';
import { describeStatus } from '@/components/allotmentStatus';

/**
 * A screen of its own for allotment results.
 *
 * They used to render inside the IPO sheet and inside the allotment tab, which
 * is fine for one PAN and unreadable for the ten or fifteen a regular investor
 * keeps saved. A dedicated screen gives the list room, a summary of how the
 * applications went, and somewhere sensible to put a refresh.
 */
export default function AllotmentResultScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const params = useLocalSearchParams<{ name?: string; company?: string; type?: string }>();

  const ipoName = String(params.name || 'IPO');
  const companyValue = String(params.company || '');
  const companyType = String(params.type || '') as RegistrarType;

  const { savedPANs } = useSavedPANs();
  const { checkAllotment, loading } = useAllotmentCheck();
  const [results, setResults] = useState<AllotmentStatus[] | null>(null);
  const [note, setNote] = useState('');
  // Which row is open. The registrar returns the application number, the DP id
  // and the amounts as well as the verdict, and none of that fits on one line.
  const [expanded, setExpanded] = useState<string | null>(null);

  const run = useCallback(async () => {
    if (!companyValue || !companyType) {
      setNote('This issue is missing its registrar reference.');
      return;
    }
    if (savedPANs.length === 0) {
      setNote('No PAN saved yet. Add one on the Allotment tab.');
      return;
    }

    setNote('');
    const outcome = await checkAllotment(
      savedPANs.map((saved) => saved.pan),
      companyValue,
      companyType,
      ipoName
    );
    setResults(outcome);
    if (outcome.length === 0) setNote('The registrar returned no result. Try again shortly.');
  }, [companyValue, companyType, savedPANs]);

  useEffect(() => {
    // Wait until the saved PANs have loaded, or the first run checks nothing
    if (savedPANs.length > 0 && results === null && !loading) run();
  }, [savedPANs.length]);

  const rows = results || [];
  const counts = {
    allotted: rows.filter((row) => row.status === 'allotted').length,
    notAllotted: rows.filter((row) => row.status === 'not_allotted').length,
    noRecord: rows.filter((row) => row.status === 'no_record').length,
  };

  const styles = getStyles(isDark);

  const renderRow = ({ item, index }: { item: AllotmentStatus; index: number }) => {
    const allotted = item.status === 'allotted';
    const noRecord = item.status === 'no_record';
    const failed = item.status === 'error';
    const { label, tone } = describeStatus(item.status, isDark);

    const person =
      item.name || savedPANs.find((saved) => saved.pan === item.pan)?.name || 'Saved PAN';
    const masked =
      item.pan.length > 4 ? `${'X'.repeat(item.pan.length - 4)}${item.pan.slice(-4)}` : item.pan;

    const isOpen = expanded === item.pan;
    const details: { label: string; value: string }[] = [
      { label: 'PAN', value: item.pan },
      ...(item.applicationNo ? [{ label: 'Application no.', value: String(item.applicationNo) }] : []),
      ...(item.dpId ? [{ label: 'DP / Client ID', value: String(item.dpId) }] : []),
      ...(item.shares ? [{ label: 'Shares applied', value: String(item.shares) }] : []),
      ...(item.allottedShares ? [{ label: 'Shares allotted', value: String(item.allottedShares) }] : []),
      ...(item.amount ? [{ label: 'Amount adjusted', value: `₹${item.amount}` }] : []),
      ...(item.refundAmount ? [{ label: 'Refund', value: `₹${item.refundAmount}` }] : []),
    ];

    return (
      <Animated.View
        entering={index < 10 ? FadeInDown.duration(240).delay(index * 40) : undefined}
      >
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() => setExpanded(isOpen ? null : item.pan)}
      >
        <View style={styles.rowTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{String(person).charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.rowInfo}>
            <Text style={styles.rowName} numberOfLines={1}>{person}</Text>
            <Text style={styles.rowPan}>{isOpen ? item.pan : masked}</Text>
          </View>
          <View style={styles.rowRight}>
            <Text style={[styles.rowStatus, { color: tone }]}>{label}</Text>
            {allotted && !!item.allottedShares && (
              <Text style={styles.rowMeta}>{item.allottedShares} shares</Text>
            )}
            {!allotted && !!item.refundAmount && (
              <Text style={styles.rowMeta}>₹{item.refundAmount} refunded</Text>
            )}
          </View>
          {isOpen ? (
            <ChevronUp size={18} color={isDark ? '#64748B' : '#94A3B8'} />
          ) : (
            <ChevronDown size={18} color={isDark ? '#64748B' : '#94A3B8'} />
          )}
        </View>

        {isOpen && (
          <View style={styles.rowDetails}>
            {details.map((detail) => (
              <View style={styles.detailLine} key={detail.label}>
                <Text style={styles.detailLabel}>{detail.label}</Text>
                <Text style={styles.detailValue} selectable>{detail.value}</Text>
              </View>
            ))}
            {noRecord && (
              <Text style={styles.detailNote}>
                The registrar has no application against this PAN for this issue. If an
                application was made, allotment for it may not be published yet.
              </Text>
            )}
            {failed && (
              <Text style={styles.detailNote}>
                {item.message || 'The registrar did not answer.'} Tap refresh to try again.
              </Text>
            )}
            {item.status === 'unknown' && (
              <Text style={styles.detailNote}>
                The registrar returned this application but did not say whether shares were
                allotted. The fields above are exactly what it sent.
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={isDark ? '#F1F5F9' : '#1E293B'} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={1}>{ipoName}</Text>
          <Text style={styles.headerSubtitle}>Allotment status</Text>
        </View>
      </View>

      {rows.length > 0 && (
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>{counts.allotted}</Text>
            <Text style={styles.summaryLabel}>Allotted</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#EF4444' }]}>{counts.notAllotted}</Text>
            <Text style={styles.summaryLabel}>Not allotted</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              {counts.noRecord}
            </Text>
            <Text style={styles.summaryLabel}>No record</Text>
          </View>
        </View>
      )}

      {loading && rows.length === 0 ? (
        <View style={styles.centre}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.centreText}>Checking {savedPANs.length} PAN(s)…</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item, index) => `${item.pan}-${index}`}
          renderItem={renderRow}
          contentContainerStyle={styles.listContent}
          initialNumToRender={12}
          windowSize={9}
          removeClippedSubviews
          ListEmptyComponent={
            <View style={styles.centre}>
              <Text style={styles.centreText}>{note || 'Nothing to show yet.'}</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={[styles.refresh, loading && styles.refreshDisabled]}
        onPress={run}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <RefreshCw size={20} color="#FFFFFF" />
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#334155' : '#E2E8F0',
    },
    backButton: { padding: 4 },
    headerText: { flex: 1 },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#F1F5F9' : '#1E293B',
    },
    headerSubtitle: {
      fontSize: 13,
      color: isDark ? '#94A3B8' : '#64748B',
      marginTop: 2,
    },
    summary: {
      flexDirection: 'row',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 12,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
    },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryValue: { fontSize: 20, fontWeight: '700' },
    summaryLabel: {
      fontSize: 12,
      color: isDark ? '#94A3B8' : '#64748B',
      marginTop: 2,
    },
    listContent: { padding: 16, paddingBottom: 96 },
    row: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
    },
    rowTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    rowDetails: {
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#334155' : '#E2E8F0',
      gap: 8,
    },
    detailLine: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 16,
    },
    detailLabel: { fontSize: 13, color: isDark ? '#94A3B8' : '#64748B' },
    detailValue: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'right',
      color: isDark ? '#F1F5F9' : '#1E293B',
    },
    detailNote: {
      fontSize: 12,
      lineHeight: 18,
      color: isDark ? '#94A3B8' : '#64748B',
      marginTop: 4,
    },
    avatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: isDark ? '#334155' : '#EFF6FF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontSize: 16, fontWeight: '700', color: isDark ? '#93C5FD' : '#1E40AF' },
    rowInfo: { flex: 1 },
    rowName: { fontSize: 15, fontWeight: '600', color: isDark ? '#F1F5F9' : '#1E293B' },
    rowPan: { fontSize: 12, letterSpacing: 1, color: isDark ? '#94A3B8' : '#64748B', marginTop: 2 },
    rowRight: { alignItems: 'flex-end' },
    rowStatus: { fontSize: 14, fontWeight: '600' },
    rowMeta: { fontSize: 12, color: isDark ? '#94A3B8' : '#64748B', marginTop: 2 },
    centre: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 32, gap: 12 },
    centreText: { fontSize: 14, lineHeight: 20, textAlign: 'center', color: isDark ? '#94A3B8' : '#64748B' },
    refresh: {
      position: 'absolute',
      bottom: 28,
      alignSelf: 'center',
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#1E40AF',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
    },
    refreshDisabled: { opacity: 0.7 },
  });
