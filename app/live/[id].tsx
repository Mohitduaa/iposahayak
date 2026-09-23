import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react-native';
import { apiUrl, fetchJson } from '@/services/api';

interface LiveQuote {
  success: boolean;
  name: string;
  symbol: string;
  currentPrice: number;
  prevClose: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  listingPrice: number | null;
  change: number | null;
  changePct: number | null;
  listingGainPct: number | null;
  currentGainPct: number | null;
  issuePrice: number | null;
}

const POLL_MS = 15000;

export default function WatchLiveScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [quote, setQuote] = useState<LiveQuote | null>(null);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async () => {
    const data = await fetchJson<LiveQuote>(apiUrl(`/api/quote/${id}`));
    if (data?.success) {
      setQuote(data);
      setFailed(false);
    } else if (!quote) {
      setFailed(true);
    }
  };

  useEffect(() => {
    if (!id) return;
    load();
    timer.current = setInterval(load, POLL_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [id]);

  const styles = getStyles(isDark);
  const up = (quote?.change ?? 0) >= 0;
  const tone = up ? '#10B981' : '#EF4444';

  const rangePosition = (() => {
    if (!quote || quote.dayLow == null || quote.dayHigh == null) return 0;
    const span = quote.dayHigh - quote.dayLow;
    if (span <= 0) return 1;
    return Math.min(1, Math.max(0, (quote.currentPrice - quote.dayLow) / span));
  })();

  const signed = (value: number | null | undefined, suffix = '') =>
    value == null ? '—' : `${value >= 0 ? '+' : ''}${value}${suffix}`;

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color={isDark ? '#F1F5F9' : '#1E293B'} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {quote?.name || name || 'Live Price'}
          </Text>
          {!!quote?.symbol && <Text style={styles.headerSubtitle}>{quote.symbol}</Text>}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor={isDark ? '#94A3B8' : '#64748B'}
          />
        }
      >
        {!quote && !failed && <ActivityIndicator style={{ marginTop: 60 }} size="large" color="#1E40AF" />}

        {failed && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Price not available</Text>
            <Text style={styles.errorText}>
              This share's live price could not be loaded right now. Pull down to try again.
            </Text>
          </View>
        )}

        {quote && (
          <>
            <View style={styles.priceCard}>
              <Text style={styles.bigPrice}>₹{quote.currentPrice.toFixed(2)}</Text>
              <View style={[styles.changeChip, { backgroundColor: `${tone}22` }]}>
                {up ? <TrendingUp size={16} color={tone} /> : <TrendingDown size={16} color={tone} />}
                <Text style={[styles.changeText, { color: tone }]}>
                  {signed(quote.change)} ({signed(quote.changePct, '%')}) today
                </Text>
              </View>
              {quote.currentGainPct != null && (
                <Text style={styles.sinceIssue}>
                  {signed(quote.currentGainPct, '%')} since issue
                  {quote.issuePrice != null ? ` (₹${quote.issuePrice})` : ''}
                </Text>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Day's Range</Text>
              <View style={styles.rangeLabels}>
                <Text style={styles.rangeValue}>₹{quote.dayLow?.toFixed(2) ?? '—'}</Text>
                <Text style={styles.rangeValue}>₹{quote.dayHigh?.toFixed(2) ?? '—'}</Text>
              </View>
              <View style={styles.rangeTrack}>
                <View style={[styles.rangeFill, { flex: rangePosition }]} />
                <View style={styles.rangeDot} />
                <View style={{ flex: 1 - rangePosition }} />
              </View>
            </View>

            <View style={styles.card}>
              {[
                ['Previous Close', quote.prevClose != null ? `₹${quote.prevClose.toFixed(2)}` : '—'],
                ['Listing Price', quote.listingPrice != null ? `₹${quote.listingPrice.toFixed(2)}` : '—'],
                [
                  'Listing Gain',
                  quote.listingGainPct != null ? signed(quote.listingGainPct, '%') : '—',
                ],
                ['Volume', quote.volume != null ? quote.volume.toLocaleString('en-IN') : '—'],
              ].map(([label, value]) => (
                <View style={styles.row} key={String(label)}>
                  <Text style={styles.rowLabel}>{label}</Text>
                  <Text style={styles.rowValue}>{value}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.disclaimer}>
              Price data may be delayed by a few minutes. Not investment advice.
            </Text>
          </>
        )}
      </ScrollView>
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
      paddingBottom: 14,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#334155' : '#E2E8F0',
    },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#334155' : '#F1F5F9',
    },
    headerTextWrap: { flex: 1 },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#F1F5F9' : '#1E293B',
    },
    headerSubtitle: { fontSize: 13, color: isDark ? '#94A3B8' : '#64748B', marginTop: 2 },
    scroll: { flex: 1 },
    scrollContent: { padding: 16, paddingBottom: 32 },
    priceCard: {
      alignItems: 'center',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      paddingVertical: 28,
      marginBottom: 14,
    },
    bigPrice: {
      fontSize: 40,
      fontWeight: '800',
      color: isDark ? '#F1F5F9' : '#0F172A',
    },
    changeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 10,
    },
    changeText: { fontSize: 14, fontWeight: '700' },
    sinceIssue: { fontSize: 13, color: isDark ? '#94A3B8' : '#64748B', marginTop: 10 },
    card: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      padding: 16,
      marginBottom: 14,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#F1F5F9' : '#1E293B',
      marginBottom: 12,
    },
    rangeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    rangeValue: { fontSize: 13, fontWeight: '600', color: isDark ? '#CBD5E1' : '#334155' },
    rangeTrack: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 6,
      borderRadius: 3,
      backgroundColor: isDark ? '#334155' : '#E2E8F0',
      overflow: 'visible',
    },
    rangeFill: { height: 6, borderRadius: 3, backgroundColor: '#10B981' },
    rangeDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#10B981',
      borderWidth: 2,
      borderColor: isDark ? '#1E293B' : '#FFFFFF',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
    },
    rowLabel: { fontSize: 14, color: isDark ? '#94A3B8' : '#64748B' },
    rowValue: { fontSize: 14, fontWeight: '600', color: isDark ? '#F1F5F9' : '#1E293B' },
    disclaimer: {
      fontSize: 12,
      textAlign: 'center',
      color: isDark ? '#64748B' : '#94A3B8',
      marginTop: 4,
    },
    errorBox: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
    errorTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#F1F5F9' : '#1E293B',
      marginBottom: 8,
    },
    errorText: { fontSize: 14, textAlign: 'center', color: isDark ? '#94A3B8' : '#64748B' },
  });
