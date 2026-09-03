import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LineChart } from 'react-native-chart-kit';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react-native';
import { GMPCard } from '@/components/GMPCard';
import { TimeRangeSelector } from '@/components/TimeRangeSelector';
import { CustomTabBar } from '@/components/CustomTabBar';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useGlobalData } from '@/store/GlobalDataStore';
import { useGMPData } from '@/hooks/useGMPData';
import Loader from '@/components/Loader';

export default function GMPTracker() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  // Read per render, so the chart is right after a rotation or in split screen.
  // Measured once at import it kept the width the app started with.
  const { width: screenWidth } = useWindowDimensions();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '1m' | '3m' | '1y'>('1m');
  const [selectedIPO, setSelectedIPO] = useState<string>('');
  
  const { gmpData: globalGMPData, chartData: globalChartData, topGainers: globalTopGainers, topLosers: globalTopLosers, isLoading: globalLoading } = useGlobalData();
  const { gmpData, chartData, topGainers, topLosers, loading: gmpLoading, refreshGMPData } = useGMPData(selectedTimeRange);
  const [refreshing, setRefreshing] = useState(false);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshGMPData();
    setRefreshing(false);
  };
  
  // Use global data if available, otherwise use hook data
  const displayGMPData = gmpData.length > 0 ? gmpData : globalGMPData;
  const displayChartData = chartData.labels.length > 0 ? chartData : globalChartData;
  const displayTopGainers = topGainers.length > 0 ? topGainers : globalTopGainers;
  const displayTopLosers = topLosers.length > 0 ? topLosers : globalTopLosers;

  const chartConfig = {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    backgroundGradientFrom: isDark ? '#1E293B' : '#FFFFFF',
    backgroundGradientTo: isDark ? '#1E293B' : '#FFFFFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(96, 165, 250, ${opacity})`,
    labelColor: (opacity = 1) => isDark ? `rgba(241, 245, 249, ${opacity})` : `rgba(30, 41, 59, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#60A5FA',
    },
  };

  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>GMP Tracker</Text>
          <Text style={styles.headerSubtitle}>Grey Market Premium trends</Text>
        </View>
      </View>
{(!displayGMPData.length && !displayChartData.labels.length && (globalLoading || gmpLoading)) ? (
      <ScrollView style={styles.scrollView}>
        <SkeletonLoader type="card" count={6} />
      </ScrollView>
    ) : (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Chart */}
        {displayChartData.labels.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Live & Top IPOs GMP</Text>
            <LineChart
              data={displayChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Top Gainers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={20} color="#10B981" />
            <Text style={styles.sectionTitle}>Top Gainers</Text>
          </View>
          {displayTopGainers.map((item, index) => (
            <GMPCard key={`gainer-${index}`} data={item} />
          ))}
        </View>

        {/* Only shown when something is actually trading below issue price */}
        {displayTopLosers.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingDown size={20} color="#EF4444" />
              <Text style={styles.sectionTitle}>Top Losers</Text>
            </View>
            {displayTopLosers.map((item, index) => (
              <GMPCard key={`loser-${index}`} data={item} />
            ))}
          </View>
        )}

        {/* All GMP Data */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#60A5FA" />
            <Text style={styles.sectionTitle}>All IPOs GMP</Text>
          </View>
          {displayGMPData.map((item, index) => (
            <GMPCard key={`all-${index}`} data={item} />
          ))}
        </View>
      </ScrollView>
    )}
      <CustomTabBar />
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
    paddingTop: 35,
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
  // paddingBottom belongs on the content, not on the ScrollView itself: as a
  // style it shrank the viewport by 120px and left a dead band above the tab
  // bar that content could never scroll into.
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  timeRangeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  chartContainer: {
    marginTop:25,
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 16,
  },
  chart: {
    
    marginVertical: 8,
    borderRadius: 16,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
});