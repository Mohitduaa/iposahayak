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
import { ArrowLeft, TrendingUp, TrendingDown, Star } from 'lucide-react-native';
import { apiUrl, fetchJson } from '@/services/api';
import { useWatchlist } from '@/hooks/useWatchlist';

interface ExchangeQuote {
  exchange: 'NSE' | 'BSE';
  symbol: string;
  currentPrice: number;
  prevClose: number | null;
  open: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  high52w: number | null;
  low52w: number | null;
  tradedAt: string | null;
  listingPrice: number | null;
  change: number | null;
  changePct: number | null;
  listingGainPct: number | null;
  currentGainPct: number | null;
}

interface DepthLevel {
  price: number;
  qty: number;
}

interface MarketDepth {
  exchange: 'NSE' | 'BSE';
  bid: DepthLevel[];
  ask: DepthLevel[];
  totalBuyQty: number;
  totalSellQty: number;
  asOf: string | null;
}

interface LiveQuote extends ExchangeQuote {
  success: boolean;
  name: string;
  issuePrice: number | null;
  exchanges?: ExchangeQuote[];
  depth?: MarketDepth | null;
  depths?: Partial<Record<'NSE' | 'BSE', MarketDepth>>;
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
  const [exchange, setExchange] = useState<'NSE' | 'BSE' | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { has, toggle } = useWatchlist();

  const load = async () => {
    const data = await fetchJson<LiveQuote>(apiUrl(`/api/quote/${id}`));
    if (data?.success) {
      setQuote(data);
      setFailed(false);
      // First load decides the tab; later polls must not yank the user off
      // the exchange they chose.
      setExchange((chosen) => chosen || (data.exchanges?.[0]?.exchange ?? data.exchange ?? 'NSE'));
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

  const tabs: ExchangeQuote[] = quote?.exchanges?.length ? quote.exchanges : quote ? [quote] : [];
  const shown: ExchangeQuote | null =
    tabs.find((tab) => tab.exchange === exchange) || tabs[0] || null;

  const up = (shown?.change ?? 0) >= 0;
  const tone = up ? '#10B981' : '#EF4444';

  const rangePosition = (() => {
    if (!shown || shown.dayLow == null || shown.dayHigh == null) return 0;
    const span = shown.dayHigh - shown.dayLow;
    if (span <= 0) return 1;
    return Math.min(1, Math.max(0, (shown.currentPrice - shown.dayLow) / span));
  })();

  const signed = (value: number | null | undefined, suffix = '') =>
    value == null ? '—' : `${value >= 0 ? '+' : ''}${value}${suffix}`;

  // The selected tab's own book: NSE tab shows NSE's, BSE tab BSE's. The
  // flat `depth` is what older backend responses carried.
  const depthShown = shown
    ? quote?.depths?.[shown.exchange] ??
      (quote?.depth && quote.depth.exchange === shown.exchange ? quote.depth : null)
    : null;

  const baseSymbol = (symbol?: string) => String(symbol || '').replace(/\.(NS|BO)$/, '');

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
          {!!shown?.symbol && <Text style={styles.headerSubtitle}>{shown.symbol}</Text>}
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

        {quote && shown && (
          <>
            {/* One card per exchange the share trades on; the selected one
                drives everything below. */}
            {tabs.length > 1 && (
              <View style={styles.exchangeRow}>
                {tabs.map((tab) => {
                  const active = tab.exchange === shown.exchange;
                  const tabUp = (tab.change ?? 0) >= 0;
                  const tabTone = tabUp ? '#10B981' : '#EF4444';
                  return (
                    <TouchableOpacity
                      key={tab.exchange}
                      style={[styles.exchangeTab, active && styles.exchangeTabActive]}
                      onPress={() => setExchange(tab.exchange)}
                    >
                      <Text style={[styles.exchangeSymbol, !active && styles.exchangeMuted]}>
                        {baseSymbol(tab.symbol)}
                      </Text>
                      <Text style={[styles.exchangeName, !active && styles.exchangeMuted]}>
                        {tab.exchange}
                      </Text>
                      <Text style={[styles.exchangePrice, { color: tabTone }]}>
                        {tab.currentPrice.toFixed(2)}
                      </Text>
                      <Text style={[styles.exchangeChange, { color: tabTone }]}>
                        {signed(tab.change)} ({signed(tab.changePct, '%')})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <TouchableOpacity
              style={[styles.watchlistBar, has(String(id)) && styles.watchlistBarActive]}
              onPress={() =>
                toggle({
                  id: String(id),
                  name: quote.name || String(name || ''),
                  symbol: baseSymbol(shown.symbol),
                })
              }
            >
              <Star
                size={18}
                color="#FFFFFF"
                fill={has(String(id)) ? '#FFFFFF' : 'transparent'}
              />
              <Text style={styles.watchlistBarText}>
                {has(String(id)) ? 'In Watchlist' : 'Add to Watchlist'}
              </Text>
            </TouchableOpacity>

            <View style={styles.priceCard}>
              <Text style={styles.bigPrice}>₹{shown.currentPrice.toFixed(2)}</Text>
              <View style={[styles.changeChip, { backgroundColor: `${tone}22` }]}>
                {up ? <TrendingUp size={16} color={tone} /> : <TrendingDown size={16} color={tone} />}
                <Text style={[styles.changeText, { color: tone }]}>
                  {signed(shown.change)} ({signed(shown.changePct, '%')}) today
                </Text>
              </View>
              {shown.currentGainPct != null && (
                <Text style={styles.sinceIssue}>
                  {signed(shown.currentGainPct, '%')} since issue
                  {quote.issuePrice != null ? ` (₹${quote.issuePrice})` : ''}
                </Text>
              )}
            </View>

            {/* BSE's 5-level order book: buy side left in blue, sell side
                right in red, totals at the foot — the reading order every
                trading terminal has taught. */}
            {depthShown && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Market Depth — {depthShown.exchange}</Text>
                <View style={styles.depthHead}>
                  <Text style={[styles.depthHeadCell, styles.depthLeft]}>Qty</Text>
                  <Text style={[styles.depthHeadCell, styles.depthRightAlign]}>BUY</Text>
                  <Text style={[styles.depthHeadCell, styles.depthLeftPad]}>SELL</Text>
                  <Text style={[styles.depthHeadCell, styles.depthRightAlign]}>Qty</Text>
                </View>
                {[0, 1, 2, 3, 4].map((i) => (
                  <View style={styles.depthRow} key={i}>
                    <Text style={[styles.depthCell, styles.depthLeft, styles.depthBuy]}>
                      {depthShown.bid[i]?.qty?.toLocaleString('en-IN') ?? '0'}
                    </Text>
                    <Text style={[styles.depthCell, styles.depthRightAlign, styles.depthBuy]}>
                      {(depthShown.bid[i]?.price ?? 0).toFixed(2)}
                    </Text>
                    <Text style={[styles.depthCell, styles.depthLeftPad, styles.depthSell]}>
                      {(depthShown.ask[i]?.price ?? 0).toFixed(2)}
                    </Text>
                    <Text style={[styles.depthCell, styles.depthRightAlign, styles.depthSell]}>
                      {depthShown.ask[i]?.qty?.toLocaleString('en-IN') ?? '0'}
                    </Text>
                  </View>
                ))}
                <View style={[styles.depthRow, styles.depthTotalRow]}>
                  <Text style={[styles.depthCell, styles.depthLeft, styles.depthBuy, styles.depthTotal]}>
                    {depthShown.totalBuyQty.toLocaleString('en-IN')}
                  </Text>
                  <Text style={[styles.depthCell, styles.depthRightAlign, styles.depthTotal, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>
                    Total
                  </Text>
                  <Text style={[styles.depthCell, styles.depthLeftPad, styles.depthTotal, { color: isDark ? '#F1F5F9' : '#1E293B' }]}>
                    Shares
                  </Text>
                  <Text style={[styles.depthCell, styles.depthRightAlign, styles.depthSell, styles.depthTotal]}>
                    {depthShown.totalSellQty.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Day's Range — {shown.exchange}</Text>
              <View style={styles.rangeLabels}>
                <Text style={styles.rangeValue}>₹{shown.dayLow?.toFixed(2) ?? '—'}</Text>
                <Text style={styles.rangeValue}>₹{shown.dayHigh?.toFixed(2) ?? '—'}</Text>
              </View>
              <View style={styles.rangeTrack}>
                <View style={[styles.rangeFill, { flex: rangePosition }]} />
                <View style={styles.rangeDot} />
                <View style={{ flex: 1 - rangePosition }} />
              </View>
            </View>

            <View style={styles.card}>
              {[
                ['Open', shown.open != null ? `₹${shown.open.toFixed(2)}` : '—'],
                ['Previous Close', shown.prevClose != null ? `₹${shown.prevClose.toFixed(2)}` : '—'],
                ['Listing Price', shown.listingPrice != null ? `₹${shown.listingPrice.toFixed(2)}` : '—'],
                [
                  'Listing Gain',
                  shown.listingGainPct != null ? signed(shown.listingGainPct, '%') : '—',
                ],
                ['Volume', shown.volume != null ? shown.volume.toLocaleString('en-IN') : '—'],
                ['52W High', shown.high52w != null ? `₹${shown.high52w.toFixed(2)}` : '—'],
                ['52W Low', shown.low52w != null ? `₹${shown.low52w.toFixed(2)}` : '—'],
                [
                  'Last Traded',
                  shown.tradedAt
                    ? new Date(shown.tradedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : '—',
                ],
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
    exchangeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    exchangeTab: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: 14,
      borderWidth: 2,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      paddingVertical: 12,
    },
    exchangeTabActive: { borderColor: '#3B82F6' },
    exchangeSymbol: {
      fontSize: 14,
      fontWeight: '700',
      color: isDark ? '#F1F5F9' : '#1E293B',
    },
    exchangeName: { fontSize: 12, color: isDark ? '#94A3B8' : '#64748B', marginTop: 1 },
    exchangePrice: { fontSize: 17, fontWeight: '700', marginTop: 4 },
    exchangeChange: { fontSize: 12, fontWeight: '600', marginTop: 1 },
    exchangeMuted: { opacity: 0.55 },
    watchlistBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: '#16A34A',
      borderRadius: 12,
      paddingVertical: 13,
      marginBottom: 14,
    },
    watchlistBarActive: { backgroundColor: '#15803D' },
    watchlistBarText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
    depthHead: {
      flexDirection: 'row',
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#334155' : '#E2E8F0',
    },
    depthHeadCell: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: isDark ? '#94A3B8' : '#64748B',
    },
    depthRow: {
      flexDirection: 'row',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1E293B' : '#F1F5F9',
    },
    depthCell: { flex: 1, fontSize: 13, fontWeight: '600' },
    depthLeft: { textAlign: 'left' },
    depthRightAlign: { textAlign: 'right' },
    depthLeftPad: { textAlign: 'left', paddingLeft: 14 },
    depthBuy: { color: '#3B82F6' },
    depthSell: { color: '#EF4444' },
    depthTotalRow: { borderBottomWidth: 0, paddingTop: 10 },
    depthTotal: { fontWeight: '700', fontSize: 13 },
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
