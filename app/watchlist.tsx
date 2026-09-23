import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ArrowLeft, Star, Trash2, ChevronRight } from 'lucide-react-native';
import { apiUrl, fetchJson } from '@/services/api';
import { useWatchlist, WatchlistItem } from '@/hooks/useWatchlist';

interface RowQuote {
  currentPrice: number;
  change: number | null;
  changePct: number | null;
}

export default function WatchlistScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { watchlist, remove } = useWatchlist();

  const [quotes, setQuotes] = useState<Record<string, RowQuote>>({});
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const results = await Promise.all(
      watchlist.map(async (item) => {
        const data = await fetchJson<any>(apiUrl(`/api/quote/${item.id}`));
        return data?.success
          ? [item.id, { currentPrice: data.currentPrice, change: data.change, changePct: data.changePct }]
          : null;
      })
    );
    setQuotes(Object.fromEntries(results.filter(Boolean) as [string, RowQuote][]));
  }, [watchlist]);

  useEffect(() => {
    if (watchlist.length) load();
  }, [watchlist, load]);

  const styles = getStyles(isDark);

  const renderItem = ({ item }: { item: WatchlistItem }) => {
    const quote = quotes[item.id];
    const up = (quote?.change ?? 0) >= 0;
    const tone = up ? '#10B981' : '#EF4444';

    return (
      <TouchableOpacity
        style={styles.rowCard}
        onPress={() => router.push({ pathname: '/live/[id]', params: { id: item.id, name: item.name } })}
      >
        <View style={styles.rowLeft}>
          <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.rowSymbol}>{item.symbol}</Text>
        </View>
        <View style={styles.rowRight}>
          {quote ? (
            <>
              <Text style={styles.rowPrice}>₹{quote.currentPrice.toFixed(2)}</Text>
              <Text style={[styles.rowChange, { color: tone }]}>
                {quote.change != null && quote.change >= 0 ? '+' : ''}
                {quote.change ?? '—'} ({quote.changePct ?? '—'}%)
              </Text>
            </>
          ) : (
            <Text style={styles.rowSymbol}>…</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => remove(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Trash2 size={17} color={isDark ? '#64748B' : '#94A3B8'} />
        </TouchableOpacity>
        <ChevronRight size={18} color={isDark ? '#475569' : '#CBD5E1'} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color={isDark ? '#F1F5F9' : '#1E293B'} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>My Watchlist</Text>
          <Text style={styles.headerSubtitle}>
            {watchlist.length ? `${watchlist.length} share${watchlist.length > 1 ? 's' : ''}` : 'Live prices of shares you follow'}
          </Text>
        </View>
      </View>

      <FlatList
        data={watchlist}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
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
        ListEmptyComponent={
          <View style={styles.empty}>
            <Star size={40} color={isDark ? '#334155' : '#CBD5E1'} />
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyText}>
              Open any listed IPO's Watch Live screen and tap "Add to Watchlist" to track it here.
            </Text>
          </View>
        }
      />
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
    headerTitle: { fontSize: 20, fontWeight: '700', color: isDark ? '#F1F5F9' : '#1E293B' },
    headerSubtitle: { fontSize: 13, color: isDark ? '#94A3B8' : '#64748B', marginTop: 2 },
    listContent: { padding: 16, paddingBottom: 32, flexGrow: 1 },
    rowCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      padding: 14,
      marginBottom: 10,
    },
    rowLeft: { flex: 1, minWidth: 0 },
    rowName: { fontSize: 15, fontWeight: '600', color: isDark ? '#F1F5F9' : '#1E293B' },
    rowSymbol: { fontSize: 12, color: isDark ? '#94A3B8' : '#64748B', marginTop: 2 },
    rowRight: { alignItems: 'flex-end' },
    rowPrice: { fontSize: 15, fontWeight: '700', color: isDark ? '#F1F5F9' : '#1E293B' },
    rowChange: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    removeButton: { padding: 4 },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#F1F5F9' : '#1E293B',
      marginTop: 14,
      marginBottom: 6,
    },
    emptyText: {
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
      color: isDark ? '#94A3B8' : '#64748B',
    },
  });
