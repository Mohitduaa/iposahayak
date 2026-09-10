import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

// Only the first screenful cascades in; see IPOCard for why
const STAGGERED_CARDS = 8;

interface GMPCardProps {
  data: {
    companyName: string;
    gmp: number;
    change: number;
    percentage?: number;
    kostak?: number;
    subject?: number;
    openDate?: string;
    closeDate?: string;
    allotmentDate?: string;
    listingDate?: string;
  };
  /** Position in its list, for the staggered entrance. */
  index?: number;
}

export function GMPCard({ data, index = 0 }: GMPCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isPositive = data.change > 0;
  const isNeutral = data.change === 0;
  const changeColor = isNeutral ? '#6B7280' : isPositive ? '#10B981' : '#EF4444';

  const getTrendIcon = () => {
    if (isNeutral) return <Minus size={16} color="#6B7280" />;
    return isPositive ? 
      <TrendingUp size={16} color="#10B981" /> : 
      <TrendingDown size={16} color="#EF4444" />;
  };

  const styles = getStyles(isDark);

  return (
    <>
      <Animated.View
        entering={
          index < STAGGERED_CARDS ? FadeInDown.duration(260).delay(index * 45) : undefined
        }
      >
      <TouchableOpacity style={styles.container} onPress={() =>
          router.push({
            pathname: '/gmp-detail/[name]',
            params: { name: data.companyName, data: JSON.stringify(data) },
          })
        } activeOpacity={0.9}>
      <View style={styles.header}>
        <Text style={styles.companyName} numberOfLines={1}>
          {data.companyName || 'N/A'}
        </Text>
        {/* The move since the premium last changed, in rupees */}
        <View style={styles.changeContainer}>
          {getTrendIcon()}
          <Text style={[styles.changeText, { color: changeColor }]}>
            {isNeutral ? 'No change' : `${isPositive ? '+' : '-'}₹${Math.abs(data.change)}`}
          </Text>
        </View>
      </View>

        <View style={styles.content}>
          <View style={styles.gmpContainer}>
            <View style={styles.gmpSection}>
              <Text style={styles.gmpLabel}>GMP</Text>
              <Text style={styles.gmpValue}>₹{data.gmp || 0}</Text>
            </View>
            {(data as any).isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
          </View>

        {data.percentage !== undefined && (
          <View style={styles.percentageSection}>
            {/* The premium as a share of the issue price — the listing gain it
                implies. It was labelled "Change", which reads as a move since
                yesterday and is a different number entirely. */}
            <Text style={styles.percentageLabel}>Est. listing gain</Text>
            <Text style={[styles.percentageValue, { color: changeColor }]}>
              {isPositive ? '+' : ''}{(data.percentage || 0).toFixed(1)}%
            </Text>
          </View>
        )}

        {(data.kostak !== undefined || data.subject !== undefined) && (
          <View style={styles.additionalInfo}>
            {/* {data.kostak !== undefined && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Kostak</Text>
                <Text style={styles.infoValue}>₹{data.kostak}</Text>
              </View>
            )} */}
            {data.subject !== undefined && data.subject > 0 && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Sub. Profit</Text>
                <Text style={styles.infoValue}>₹{data.subject.toLocaleString('en-IN')}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
      </Animated.View>
    </>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gmpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
  },
  gmpSection: {
    alignItems: 'flex-start',
  },
  gmpLabel: {
    fontSize: 12,
    color: isDark ? '#94A3B8' : '#64748B',
    marginBottom: 2,
  },
  gmpValue: {
    fontSize: 18,
    fontWeight: '700',
    color: isDark ? '#60A5FA' : '#1E40AF',
  },
  percentageSection: {
    alignItems: 'center',
  },
  percentageLabel: {
    fontSize: 12,
    color: isDark ? '#94A3B8' : '#64748B',
    marginBottom: 2,
  },
  percentageValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  additionalInfo: {
    alignItems: 'flex-end',
    gap: 4,
  },
  infoItem: {
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 10,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '500',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
});