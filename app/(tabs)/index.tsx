import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Calendar, TrendingUp, Users, Clock, Crown } from 'lucide-react-native';
import { IPOCard } from '@/components/IPOCard';
import { StatsCard } from '@/components/StatsCard';
import { FilterChips } from '@/components/FilterChips';
import { useIPOData } from '@/hooks/useIPOData';
import { IPO } from '@/types';

export default function IPODashboard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'closed'>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const { ipos, loading, refreshData } = useIPOData();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const filteredIPOs = ipos.filter(ipo => 
    selectedFilter === 'all' || ipo.status === selectedFilter
  );

  const stats = {
    upcoming: ipos.filter(ipo => ipo.status === 'upcoming').length,
    ongoing: ipos.filter(ipo => ipo.status === 'ongoing').length,
    avgGMP: Math.round(ipos.reduce((acc, ipo) => acc + (ipo.gmp || 0), 0) / ipos.length),
    totalSubscription: Math.round(ipos.reduce((acc, ipo) => acc + ipo.subscription.retail, 0) / ipos.length),
  };

  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>IPO Dashboard</Text>
          <Text style={styles.headerSubtitle}>Track live and upcoming IPOs</Text>
        </View>
        <TouchableOpacity style={styles.premiumButton}>
          <Crown size={20} color="#F59E0B" />
          <Text style={styles.premiumText}>Premium</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatsCard
            title="Upcoming"
            value={stats.upcoming.toString()}
            icon={<Calendar size={20} color="#60A5FA" />}
            color="#60A5FA"
          />
          <StatsCard
            title="Live IPOs"
            value={stats.ongoing.toString()}
            icon={<Clock size={20} color="#10B981" />}
            color="#10B981"
          />
          <StatsCard
            title="Avg GMP"
            value={`₹${stats.avgGMP}`}
            icon={<TrendingUp size={20} color="#F59E0B" />}
            color="#F59E0B"
          />
          {/* <StatsCard
            title="Avg Sub."
            value={`${stats.totalSubscription}x`}
            icon={<Users size={20} color="#EF4444" />}
            color="#EF4444"
          /> */}
        </View>

        {/* Filter Chips */}
        <FilterChips
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          style={styles.filterContainer}
        />

        {/* IPO List */}
        <View style={styles.ipoList}>
          {filteredIPOs.map((ipo) => (
            <IPOCard key={ipo.id} ipo={ipo} />
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
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  ipoList: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 16,
  },
});