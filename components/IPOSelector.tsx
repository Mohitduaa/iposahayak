import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  useColorScheme,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { ChevronDown, Search } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadRegistrarCompanies, RegistrarCompany, RegistrarType } from '@/services/registrar';

interface IPOSelectorProps {
  selectedIPO: string;
  onSelect: (ipoId: string, companyType: RegistrarType, name?: string) => void;
  style?: ViewStyle;
}

export function IPOSelector({ selectedIPO, onSelect, style }: IPOSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isVisible, setIsVisible] = useState(false);
  const [companies, setCompanies] = useState<RegistrarCompany[]>([]);
  const [loading, setLoading] = useState(false);
  // Nine registrars between them list well over a hundred issues; nobody
  // should have to scroll past them all
  const [query, setQuery] = useState('');

  // This kept its own copy of the registrar lists, refetching both every five
  // minutes for as long as the screen was open and writing state whether or
  // not the component was still mounted. services/registrar.ts already loads
  // and caches them for the allotment lookup, so this reads from there — one
  // fetch, shared, and no timer to leak.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Show the last saved list immediately, then refresh
      try {
        const cached = await AsyncStorage.getItem('ipoCompaniesCache');
        if (!cancelled && cached) {
          const parsed = JSON.parse(cached);
          // Older caches held two registrars under other keys; only rows that
          // name a registrar the backend knows can still be looked up
          if (Array.isArray(parsed)) setCompanies(parsed.filter((row) => row?.registrar));
        }
      } catch (error) {
        console.warn('Could not read the cached company list:', error);
      }

      setLoading(true);
      const list = await loadRegistrarCompanies();
      if (cancelled) return;

      if (list.length) {
        setCompanies(list);
        AsyncStorage.setItem('ipoCompaniesCache', JSON.stringify(list)).catch(() => {});
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return companies;
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(needle) ||
        company.registrar.toLowerCase().includes(needle)
    );
  }, [companies, query]);

  const selectedIPOData = companies.find((ipo) => ipo.value === selectedIPO);
  const styles = getStyles(isDark);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={styles.selector} onPress={() => setIsVisible(true)}>
        <View style={styles.selectorContent}>
          <Search size={20} color={isDark ? '#94A3B8' : '#64748B'} />
          <Text style={styles.selectorText} numberOfLines={1}>
            {selectedIPOData?.name || 'Select IPO'}
          </Text>
        </View>
        <ChevronDown size={20} color={isDark ? '#94A3B8' : '#64748B'} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select IPO</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsVisible(false)}>
              <Text style={styles.closeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchBox}>
            <Search size={18} color={isDark ? '#94A3B8' : '#64748B'} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by company or registrar"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>

          {loading && companies.length === 0 ? (
            <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#1E40AF" />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => `${item.companyType}-${item.value}`}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={16}
              windowSize={7}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.ipoItem,
                    selectedIPO === item.value && styles.selectedIpoItem,
                  ]}
                  onPress={() => {
                    onSelect(item.value, item.companyType, item.name);
                    setIsVisible(false);
                  }}
                >
                  <View style={styles.ipoText}>
                    <Text style={styles.ipoName}>{item.name}</Text>
                    <Text style={styles.ipoRegistrar}>{item.registrar}</Text>
                  </View>
                  {selectedIPO === item.value && <View style={styles.selectedIndicator} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {companies.length === 0
                    ? 'No IPO has allotment published right now.'
                    : `Nothing matches "${query.trim()}".`}
                </Text>
              }
              style={styles.ipoList}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: { marginBottom: 8 },
    selector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    selectorContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    selectorText: {
      fontSize: 16,
      color: isDark ? '#F1F5F9' : '#1E293B',
      flex: 1,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#334155' : '#E2E8F0',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#F1F5F9' : '#1E293B',
    },
    closeButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: '#1E40AF',
      borderRadius: 8,
    },
    closeButtonText: { color: '#FFFFFF', fontWeight: '600' },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 8,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      paddingVertical: 12,
      color: isDark ? '#F1F5F9' : '#1E293B',
    },
    ipoList: { flex: 1 },
    ipoItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      marginHorizontal: 20,
      marginVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      gap: 12,
    },
    selectedIpoItem: {
      borderColor: '#1E40AF',
      backgroundColor: isDark ? '#1E3A8A20' : '#EFF6FF',
    },
    ipoText: { flex: 1 },
    ipoName: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#F1F5F9' : '#1E293B',
    },
    ipoRegistrar: {
      fontSize: 12,
      color: isDark ? '#94A3B8' : '#64748B',
      marginTop: 2,
    },
    selectedIndicator: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#1E40AF',
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 40,
      marginHorizontal: 32,
      fontSize: 14,
      lineHeight: 20,
      color: isDark ? '#94A3B8' : '#64748B',
    },
  });
