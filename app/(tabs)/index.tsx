import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Search } from 'lucide-react-native';
import { router } from 'expo-router';
import { IPOCard } from '@/components/IPOCard';
import { FilterChips } from '@/components/FilterChips';
import { CustomTabBar } from '@/components/CustomTabBar';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import { useIPOData } from '@/hooks/useIPOData';
import { IPO } from '@/types';
import Loader from "@/components/Loader";

export default function IPODashboard() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedFilter, setSelectedFilter] = useState<'upcoming' | 'ongoing' | 'closed'>('ongoing');
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [boardType, setBoardType] = useState<'all' | 'mainboard' | 'sme'>('all');
  const [filterLoading, setFilterLoading] = useState(false);
  const [boardLoading, setBoardLoading] = useState(false);
  
  const { ipos, loading, refreshData, fetchClosedIPOsWithSearch, mapAPIData } = useIPOData();

  // Closed IPOs pagination state
  const [closedIPOs, setClosedIPOs] = useState<IPO[]>([]);
  const [closedPage, setClosedPage] = useState(1);
  const [closedTotalPages, setClosedTotalPages] = useState(0);
  const [closedLoading, setClosedLoading] = useState(false);
  const [closedLoadingMore, setClosedLoadingMore] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    if (selectedFilter === 'closed') {
      await fetchClosedPage(1, true);
    }
    setRefreshing(false);
  };

  const fetchClosedPage = useCallback(async (page: number, reset: boolean = false) => {
    if (reset) {
      setClosedLoading(true);
    } else {
      setClosedLoadingMore(true);
    }
    try {
      const typeParam = boardType === 'all' ? undefined : boardType === 'sme' ? 'sme' : 'mainboard';
      const result = await fetchClosedIPOsWithSearch('', page, 10, typeParam as any);
      if (result.success && result.data) {
        const mapped = mapAPIData(result.data).filter(ipo => ipo.status === 'closed');
        if (reset) {
          setClosedIPOs(mapped);
        } else {
          setClosedIPOs(prev => [...prev, ...mapped]);
        }
        setClosedPage(result.page || page);
        setClosedTotalPages(result.totalPages || 0);
      }
    } catch (error) {
      console.error('Error fetching closed IPOs:', error);
    } finally {
      setClosedLoading(false);
      setClosedLoadingMore(false);
    }
  }, [boardType, fetchClosedIPOsWithSearch, mapAPIData]);

  const loadMoreClosedIPOs = useCallback(() => {
    if (closedPage < closedTotalPages && !closedLoadingMore) {
      fetchClosedPage(closedPage + 1, false);
    }
  }, [closedPage, closedTotalPages, closedLoadingMore, fetchClosedPage]);

  // Fetch closed IPOs when filter switches to 'closed' or boardType changes
  useEffect(() => {
    if (selectedFilter === 'closed') {
      setClosedPage(1);
      fetchClosedPage(1, true);
    }
  }, [selectedFilter, boardType]);

  // FlatList calls this near the end of the list; the old version measured
  // scroll offsets by hand on every frame, which is work the list already does.
  const handleEndReached = useCallback(() => {
    if (selectedFilter !== 'closed') return;
    loadMoreClosedIPOs();
  }, [selectedFilter, loadMoreClosedIPOs]);

  const { mainboardIPOs, smeIPOs, allIPOs } = useMemo(() => {
    const mainboard = ipos.filter(ipo => ipo.category !== 'SME');
    const sme = ipos.filter(ipo => ipo.category === 'SME');
    return { mainboardIPOs: mainboard, smeIPOs: sme, allIPOs: ipos };
  }, [ipos]);

  const { filteredIPOs, stats } = useMemo(() => {
    const currentIPOs = boardType === 'mainboard' ? mainboardIPOs : 
                       boardType === 'sme' ? smeIPOs : allIPOs;

    const filtered = currentIPOs.filter(ipo => {
      const matchesFilter = ipo.status === selectedFilter;
      const matchesSearch = searchQuery === '' || 
        (ipo.companyName && ipo.companyName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });

    const statsData = {
      upcoming: currentIPOs.filter(ipo => ipo.status === 'upcoming').length,
      ongoing: currentIPOs.filter(ipo => ipo.status === 'ongoing').length,
      avgGMP: currentIPOs.length > 0 ? Math.round(currentIPOs.reduce((acc, ipo) => acc + (ipo.gmp || 0), 0) / currentIPOs.length) : 0,
      totalSubscription: currentIPOs.length > 0 ? Math.round(currentIPOs.reduce((acc, ipo) => acc + (ipo.subscription.retail || 0), 0) / currentIPOs.length) : 0,
    };

    return { filteredIPOs: filtered, stats: statsData };
  }, [mainboardIPOs, smeIPOs, allIPOs, boardType, selectedFilter, searchQuery]);

  // Closed IPOs are paged in from the server; the other tabs come from the
  // shared store the whole app already holds.
  const listData = selectedFilter === 'closed' ? closedIPOs : filteredIPOs;
  const showingSkeleton =
    filterLoading || boardLoading || (selectedFilter === 'closed' && closedLoading);

  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>IPO Dashboard</Text>
          <Text style={styles.headerSubtitle}>Track live and upcoming IPOs</Text>
        </View>
        <TouchableOpacity style={styles.searchIconCorner} onPress={() => router.push('/search')}>
          <Search size={24} color={isDark ? '#94A3B8' : '#64748B'} />
        </TouchableOpacity>
      </View>

       {loading ? (
        <ScrollView style={styles.scrollView}>
          <SkeletonLoader type="stats" />
          <SkeletonLoader type="card" count={5} />
        </ScrollView>
      ) : (
        <FlatList
          style={styles.scrollView}
          data={listData}
          keyExtractor={(ipo, index) => `${ipo.id}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.listRow}>
              <IPOCard ipo={item} />
            </View>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.6}
          // Keeps a long closed list from mounting every card at once
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            showingSkeleton ? (
              <SkeletonLoader type="card" count={3} />
            ) : (
              // An empty Live tab is worth little on its own; what the reader
              // wants next is the issues that are still to come.
              <EmptyState
                type={selectedFilter}
                onRefresh={onRefresh}
                upcomingCount={stats.upcoming}
                onGoToUpcoming={() => setSelectedFilter('upcoming')}
              />
            )
          }
          ListFooterComponent={
            closedLoadingMore ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#1E40AF" />
              </View>
            ) : null
          }
          ListHeaderComponent={
            <>
        {/* Board filter.
            Two buttons that each toggled themselves off left "All" as a state
            with nothing selected, so the control never showed where you were.
            Three options, one of them always on. */}
        <View style={styles.toggleWrapper}>
          <View style={styles.toggleContainer}>
            {(['all', 'mainboard', 'sme'] as const).map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.toggleOption, boardType === option && styles.toggleOptionActive]}
                onPress={() => {
                  if (boardType === option) return;
                  setBoardLoading(true);
                  setBoardType(option);
                  setTimeout(() => setBoardLoading(false), 150);
                }}
              >
                <Text
                  style={[
                    styles.toggleOptionText,
                    boardType === option && styles.toggleOptionTextActive,
                  ]}
                >
                  {option === 'all' ? 'All' : option === 'sme' ? 'SME' : 'Mainboard'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* The counts used to sit in a row of cards directly above tabs that
            said the same words, so the screen showed "Upcoming 10" twice and
            spent a third of its height doing it. They live on the tabs now.
            "Avg GMP" is gone: an average of premiums across issues priced from
            ₹59 to ₹1,080 is not a number anyone can use. */}
        <FilterChips
          selectedFilter={selectedFilter}
          counts={{ upcoming: stats.upcoming, ongoing: stats.ongoing }}
          onFilterChange={(filter) => {
            setFilterLoading(true);
            setSelectedFilter(filter);
            setTimeout(() => setFilterLoading(false), 100);
          }}
          style={styles.filterContainer}
        />

            </>
          }
        />
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
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchIconCorner: {
    position: 'absolute',
    top: 70,
    right: 20,
    padding: 8,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
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
  // No horizontal padding here: the header block brings its own, and each row
  // is padded individually so both line up.
  listContent: {
    paddingBottom: 24,
  },
  listRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  toggleWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
    borderRadius: 8,
    padding: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  // One selected style for all three, so the control looks like one control
  // rather than changing colour depending on which option is on
  toggleOptionActive: {
    backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#94A3B8' : '#64748B',
  },
  toggleOptionTextActive: {
    color: isDark ? '#F1F5F9' : '#1E293B',
    fontWeight: '600',
  },

  miniLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});