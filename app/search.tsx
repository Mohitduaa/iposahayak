import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Search, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { IPOCard } from '@/components/IPOCard';
import { useIPOData } from '@/hooks/useIPOData';
import { IPO } from '@/types';

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchQuery, setSearchQuery] = useState('');
  const [closedResults, setClosedResults] = useState<IPO[]>([]);
  const [searching, setSearching] = useState(false);
  const { ipos, fetchClosedIPOsWithSearch, mapAPIData } = useIPOData();

  // The app holds only the open and upcoming issues in memory; closed ones are
  // searched on the server, so the whole history stays searchable without
  // downloading it. Debounced, or every keystroke would be a request.
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setClosedResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    let cancelled = false;

    const timer = setTimeout(async () => {
      const result = await fetchClosedIPOsWithSearch(query, 1, 20);
      if (cancelled) return;
      setClosedResults(result.success ? mapAPIData(result.data) : []);
      setSearching(false);
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const filteredIPOs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const open = ipos.filter(
      (ipo) => ipo.companyName && ipo.companyName.toLowerCase().includes(query)
    );

    // Open and upcoming issues first, and never the same company twice
    const seen = new Set(open.map((ipo) => ipo.companyName.toLowerCase()));
    return [...open, ...closedResults.filter((ipo) => !seen.has(ipo.companyName.toLowerCase()))];
  }, [ipos, closedResults, searchQuery]);

  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={isDark ? '#F1F5F9' : '#1E293B'} />
        </TouchableOpacity>
        <TextInput
          style={styles.searchContainer}
          placeholder="Search IPOs..."
          placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
      </View>

      {/* Results */}
      <ScrollView style={styles.scrollView}>
        {searchQuery === '' ? (
          <View style={styles.emptyState}>
            <Search size={48} color={isDark ? '#64748B' : '#94A3B8'} />
            <Text style={styles.emptyText}>Start typing to search IPOs</Text>
          </View>
        ) : filteredIPOs.length === 0 ? (
          <View style={styles.emptyState}>
            {searching ? (
              <ActivityIndicator size="small" color="#1E40AF" />
            ) : (
              <Text style={styles.emptyText}>No IPOs found for "{searchQuery}"</Text>
            )}
          </View>
        ) : (
          <View style={styles.resultsList}>
            <Text style={styles.resultsCount}>
              {filteredIPOs.length} results found{searching ? ' — still searching…' : ''}
            </Text>
            {filteredIPOs.map((ipo) => (
              <IPOCard key={ipo.id} ipo={ipo} />
            ))}
          </View>
        )}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#E2E8F0',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: isDark ? '#F1F5F9' : '#1E293B',
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: isDark ? '#64748B' : '#94A3B8',
    marginTop: 16,
  },
  resultsList: {
    padding: 16,
    gap: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 8,
  },
});