import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { X, TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import type { GMPPoint } from '@/hooks/useGMPData';

// The GMP sheet.
//
// It used to show the premium twice, then a "Market Analysis" block whose
// sentiment, volatility and "Strong Buy" recommendation were made up from
// the one number on screen. That block is gone. What an investor wants from
// a premium is what it implies (the listing price and the profit on a lot)
// and where it has been going, so the sheet now shows the figures the
// premium leads to and the trend the backend records every time it moves.

interface GMPDetailsViewProps {
  data: {
    companyName: string;
    gmp: number;
    change: number;
    changePercent?: number;
    changedAt?: string;
    percentage?: number;
    issuePrice?: number;
    lotSize?: number;
    subject?: number;
    kostak?: number;
    isLive?: boolean;
    status?: string;
    dateRange?: string;
    openDate?: string;
    closeDate?: string;
    allotmentDate?: string;
    listingDate?: string;
    history?: GMPPoint[];
  };
  onClose: () => void;
}

const rupees = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

/** "6 Sep, 4:10 pm" from an ISO stamp; the stamp itself if it will not parse. */
function whenLabel(iso: string, withTime = true) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const day = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  if (!withTime) return day;
  const time = date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  return `${day}, ${time.toLowerCase()}`;
}

function tidyDate(value?: string) {
  if (!value || /announce|tba/i.test(value)) return 'TBA';
  return value;
}

/**
 * The GMP sheet's contents, rendered as a plain screen.
 *
 * Like the IPO sheet, this was a React Native `Modal`. On Android that opens a
 * separate dialog window which is drawn before it has been sized, so the sheet
 * flashed a small box in the top-left corner before snapping to full screen.
 * A pushed route has no second window and gets the normal screen transition.
 */
export function GMPDetailsView({ data, onClose }: GMPDetailsViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const gmp = data.gmp || 0;
  const issuePrice = data.issuePrice || 0;
  const lotSize = data.lotSize || 0;
  const change = data.change || 0;
  const up = change > 0;
  const flat = change === 0;
  const moveColor = flat ? (isDark ? '#94A3B8' : '#64748B') : up ? '#10B981' : '#EF4444';
  const gmpColor = gmp > 0 ? '#10B981' : gmp < 0 ? '#EF4444' : isDark ? '#F1F5F9' : '#1E293B';

  const listingPrice = issuePrice + gmp;
  const gainPercent = issuePrice > 0 ? (gmp / issuePrice) * 100 : data.percentage || 0;
  const perLot = gmp * lotSize;

  const history = data.history || [];

  // Newest first for the list; the chart keeps time order
  const changes = useMemo(() => {
    const rows = history.map((point, index) => ({
      ...point,
      delta: index > 0 ? point.gmp - history[index - 1].gmp : 0,
      first: index === 0,
    }));
    return rows.reverse();
  }, [history]);

  const chart = useMemo(() => {
    if (history.length < 2) return null;
    // At most eight labels, or the axis turns to soup
    const step = Math.max(1, Math.ceil(history.length / 8));
    return {
      labels: history.map((point, index) =>
        index % step === 0 || index === history.length - 1 ? whenLabel(point.at, false) : ''
      ),
      datasets: [{ data: history.map((point) => point.gmp), strokeWidth: 2 }],
    };
  }, [history]);

  const styles = getStyles(isDark);
  const status = data.isLive ? 'live' : String(data.status || '').toLowerCase();
  const statusLabel = status === 'live' ? 'Open now' : status === 'closed' ? 'Closed' : status ? 'Upcoming' : '';

  return (
    <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View style={styles.headerText}>
            <Text style={styles.companyName} numberOfLines={2}>{data.companyName}</Text>
            {!!statusLabel && (
              <View style={[styles.statusPill, status === 'live' && styles.statusPillLive]}>
                {status === 'live' && <View style={styles.liveDot} />}
                <Text style={[styles.statusText, status === 'live' && styles.statusTextLive]}>{statusLabel}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Close">
            <X size={22} color={isDark ? '#F1F5F9' : '#1E293B'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* The premium and its last move */}
          <View style={styles.hero}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>Grey market premium</Text>
              <Text style={[styles.heroValue, { color: gmpColor }]}>{rupees(gmp)}</Text>
              <View style={styles.moveRow}>
                {flat ? (
                  <Minus size={14} color={moveColor} />
                ) : up ? (
                  <TrendingUp size={14} color={moveColor} />
                ) : (
                  <TrendingDown size={14} color={moveColor} />
                )}
                <Text style={[styles.moveText, { color: moveColor }]}>
                  {flat
                    ? 'No change recorded yet'
                    : `${up ? '+' : '-'}${rupees(Math.abs(change))}${
                        data.changePercent ? ` (${up ? '+' : ''}${data.changePercent.toFixed(1)}%)` : ''
                      }`}
                </Text>
              </View>
              {!flat && !!data.changedAt && (
                <Text style={styles.moveWhen}>since {whenLabel(data.changedAt)}</Text>
              )}
            </View>
            <View style={styles.heroRight}>
              <Text style={styles.heroLabel}>Expected listing</Text>
              <Text style={styles.heroSecondary}>{issuePrice > 0 ? rupees(listingPrice) : '—'}</Text>
              <Text style={[styles.heroGain, { color: gmpColor }]}>
                {issuePrice > 0 ? `${gainPercent >= 0 ? '+' : ''}${gainPercent.toFixed(1)}% on issue price` : ''}
              </Text>
            </View>
          </View>

          {/* What the premium works out to */}
          <View style={styles.grid}>
            <View style={styles.tile}>
              <Text style={styles.tileLabel}>Issue price</Text>
              <Text style={styles.tileValue}>{issuePrice > 0 ? rupees(issuePrice) : '—'}</Text>
            </View>
            <View style={styles.tile}>
              <Text style={styles.tileLabel}>Lot size</Text>
              <Text style={styles.tileValue}>{lotSize > 0 ? `${lotSize} shares` : '—'}</Text>
            </View>
            <View style={styles.tile}>
              <Text style={styles.tileLabel}>Est. profit per lot</Text>
              <Text style={[styles.tileValue, { color: perLot > 0 ? '#10B981' : perLot < 0 ? '#EF4444' : styles.tileValue.color }]}>
                {lotSize > 0 ? `${perLot < 0 ? '-' : ''}${rupees(Math.abs(perLot))}` : '—'}
              </Text>
            </View>
            <View style={styles.tile}>
              <Text style={styles.tileLabel}>Subject to sauda</Text>
              <Text style={styles.tileValue}>{data.subject && data.subject > 0 ? rupees(data.subject) : '—'}</Text>
            </View>
          </View>

          {/* Where the premium has been */}
          <Text style={styles.sectionTitle}>GMP trend</Text>
          <View style={styles.card}>
            {chart ? (
              <>
                <LineChart
                  data={chart}
                  width={width - 40 - 2}
                  height={200}
                  withInnerLines
                  withOuterLines={false}
                  withVerticalLines={false}
                  withShadow
                  bezier
                  segments={4}
                  fromZero={history.every((point) => point.gmp >= 0)}
                  yAxisLabel="₹"
                  chartConfig={{
                    backgroundGradientFrom: isDark ? '#1E293B' : '#FFFFFF',
                    backgroundGradientTo: isDark ? '#1E293B' : '#FFFFFF',
                    decimalPlaces: 0,
                    // The line and the area under it share a hue; the area is
                    // faint so the guides stay readable through it.
                    color: (opacity = 1) =>
                      up || flat
                        ? `rgba(16, 185, 129, ${opacity})`
                        : `rgba(239, 68, 68, ${opacity})`,
                    fillShadowGradientFrom: up || flat ? '#10B981' : '#EF4444',
                    fillShadowGradientFromOpacity: 0.18,
                    fillShadowGradientTo: isDark ? '#1E293B' : '#FFFFFF',
                    fillShadowGradientToOpacity: 0,
                    labelColor: () => (isDark ? '#94A3B8' : '#64748B'),
                    propsForBackgroundLines: {
                      strokeDasharray: '4 6',
                      stroke: isDark ? '#334155' : '#E2E8F0',
                      strokeWidth: 1,
                    },
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: isDark ? '#1E293B' : '#FFFFFF',
                    },
                    propsForLabels: { fontSize: 10 },
                  }}
                  style={styles.chart}
                />
                <View style={styles.divider} />
              </>
            ) : null}

            {changes.length === 0 ? (
              <Text style={styles.emptyText}>
                The premium is tracked from now on. Every time it moves, the change shows here.
              </Text>
            ) : (
              changes.map((row, index) => {
                const rowUp = row.delta > 0;
                const rowFlat = row.delta === 0;
                const rowColor = rowFlat ? (isDark ? '#94A3B8' : '#64748B') : rowUp ? '#10B981' : '#EF4444';
                return (
                  <View
                    key={`${row.at}-${index}`}
                    style={[styles.changeRow, index === changes.length - 1 && styles.changeRowLast]}
                  >
                    <View style={styles.changeWhen}>
                      <Text style={styles.changeDate}>{whenLabel(row.at)}</Text>
                      {row.first && <Text style={styles.changeNote}>first recorded</Text>}
                    </View>
                    <Text style={styles.changeValue}>{rupees(row.gmp)}</Text>
                    <View style={styles.changeDelta}>
                      {!row.first &&
                        (rowFlat ? null : rowUp ? (
                          <ArrowUpRight size={14} color={rowColor} />
                        ) : (
                          <ArrowDownRight size={14} color={rowColor} />
                        ))}
                      <Text style={[styles.changeDeltaText, { color: rowColor }]}>
                        {row.first ? '' : rowFlat ? '0' : `${rowUp ? '+' : '-'}${rupees(Math.abs(row.delta))}`}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* The dates the premium is heading towards */}
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.card}>
            {[
              { label: 'Issue window', value: tidyDate(data.dateRange || (data.openDate && data.closeDate ? `${data.openDate} - ${data.closeDate}` : '')) },
              { label: 'Allotment', value: tidyDate(data.allotmentDate) },
              { label: 'Listing', value: tidyDate(data.listingDate) },
            ].map((row, index, all) => (
              <View key={row.label} style={[styles.timelineRow, index === all.length - 1 && styles.changeRowLast]}>
                <Text style={styles.timelineLabel}>{row.label}</Text>
                <Text style={styles.timelineValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.disclaimer}>
            The grey market premium is an unofficial figure quoted by dealers, not by the exchange or
            the company. It changes through the day and does not guarantee the listing price. It is
            shown for information only and is not investment advice.
          </Text>
        </ScrollView>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#334155' : '#E2E8F0',
    },
    headerText: { flex: 1, marginRight: 12, gap: 8 },
    companyName: { fontSize: 20, fontWeight: '700', color: isDark ? '#F1F5F9' : '#1E293B' },
    statusPill: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: isDark ? '#334155' : '#F1F5F9',
    },
    statusPillLive: { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5' },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
    statusText: { fontSize: 12, fontWeight: '600', color: isDark ? '#CBD5E1' : '#475569' },
    statusTextLive: { color: '#10B981' },
    closeButton: { padding: 4, marginTop: 2 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 40 },

    hero: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      borderRadius: 16,
      padding: 18,
      gap: 12,
    },
    heroLeft: { flex: 1.2 },
    heroRight: { flex: 1, alignItems: 'flex-end' },
    heroLabel: { fontSize: 12, color: isDark ? '#94A3B8' : '#64748B', marginBottom: 4 },
    heroValue: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
    heroSecondary: { fontSize: 22, fontWeight: '700', color: isDark ? '#F1F5F9' : '#1E293B', marginTop: 6 },
    heroGain: { fontSize: 12, fontWeight: '600', marginTop: 4, textAlign: 'right' },
    moveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
    moveText: { fontSize: 14, fontWeight: '600' },
    moveWhen: { fontSize: 12, color: isDark ? '#94A3B8' : '#64748B', marginTop: 2 },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
    // A plain width, not flexBasis. The basis was being treated as a starting
    // size the four tiles could still shrink below, so all four sat on one line
    // at ~70dp each and their values broke mid-word ("185 s / hares",
    // "₹3,33 / 0"). A width plus wrap gives the two-by-two grid this was meant
    // to be, with room for the figures.
    tile: {
      width: '47%',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      borderRadius: 14,
      padding: 14,
    },
    tileLabel: { fontSize: 12, color: isDark ? '#94A3B8' : '#64748B', marginBottom: 6 },
    tileValue: { fontSize: 17, fontWeight: '700', color: isDark ? '#F1F5F9' : '#1E293B' },

    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: isDark ? '#F1F5F9' : '#1E293B',
      marginTop: 24,
      marginBottom: 10,
    },
    card: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      borderRadius: 14,
      overflow: 'hidden',
    },
    chart: { marginLeft: -8, marginTop: 8 },
    divider: { height: 1, backgroundColor: isDark ? '#334155' : '#E2E8F0' },
    emptyText: {
      padding: 16,
      fontSize: 13,
      lineHeight: 19,
      color: isDark ? '#94A3B8' : '#64748B',
    },
    changeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#334155' : '#F1F5F9',
      gap: 12,
    },
    changeRowLast: { borderBottomWidth: 0 },
    changeWhen: { flex: 1 },
    changeDate: { fontSize: 13, color: isDark ? '#CBD5E1' : '#334155' },
    changeNote: { fontSize: 11, color: isDark ? '#64748B' : '#94A3B8', marginTop: 2 },
    changeValue: { fontSize: 15, fontWeight: '700', color: isDark ? '#F1F5F9' : '#1E293B', minWidth: 64, textAlign: 'right' },
    changeDelta: { flexDirection: 'row', alignItems: 'center', gap: 2, minWidth: 64, justifyContent: 'flex-end' },
    changeDeltaText: { fontSize: 13, fontWeight: '600' },

    timelineRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 13,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#334155' : '#F1F5F9',
    },
    timelineLabel: { fontSize: 14, color: isDark ? '#94A3B8' : '#64748B' },
    timelineValue: { fontSize: 14, fontWeight: '600', color: isDark ? '#F1F5F9' : '#1E293B' },

    disclaimer: {
      marginTop: 24,
      fontSize: 12,
      lineHeight: 18,
      color: isDark ? '#64748B' : '#94A3B8',
    },
  });
