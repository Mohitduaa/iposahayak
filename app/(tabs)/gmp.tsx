import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LineChart } from 'react-native-chart-kit';
import { TrendingUp, TrendingDown, Crown, Calendar } from 'lucide-react-native';
import { GMPCard } from '@/components/GMPCard';
import { TimeRangeSelector } from '@/components/TimeRangeSelector';
import { useGMPData } from '@/hooks/useGMPData';

const screenWidth = Dimensions.get('window').width;

export default function GMPTracker() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '1m' | '3m' | '1y'>('1m');
  const [selectedIPO, setSelectedIPO] = useState<string>('');
  
  const { gmpData, chartData, topGainers, topLosers } = useGMPData(selectedTimeRange);

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
        <TouchableOpacity style={styles.premiumButton}>
          <Crown size={20} color="#F59E0B" />
          <Text style={styles.premiumText}>Premium</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Time Range Selector */}
        

        {/* Chart */}
        {chartData.labels.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>GMP Trend</Text>
            <LineChart
              data={chartData}
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
          {topGainers.map((item, index) => (
            <GMPCard key={`gainer-${index}`} data={item} />
          ))}
        </View>

        {/* Top Losers */}
       <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <TrendingDown size={20} color="#EF4444" />
        <Text style={styles.sectionTitle}>Top Losers</Text>
      </View>
      {topLosers.map((item, index) => (
        <GMPCard key={`loser-${index}`} data={item} />
      ))}
    </View>

        {/* All GMP Data */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#60A5FA" />
            <Text style={styles.sectionTitle}>All IPOs GMP</Text>
          </View>
          {gmpData.map((item, index) => (
            <GMPCard key={`all-${index}`} data={item} />
          ))}
        </View>
      </ScrollView>
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
    paddingBottom: 120,
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