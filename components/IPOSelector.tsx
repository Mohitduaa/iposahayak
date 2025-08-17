import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  useColorScheme,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { ChevronDown, Search } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface IPOSelectorProps {
  selectedIPO: string;
  onSelect: (ipoId: string) => void;
  style?: ViewStyle;
}

interface IPOCompany {
  value: string;
  name: string;
}

export function IPOSelector({ selectedIPO, onSelect, style }: IPOSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isVisible, setIsVisible] = useState(false);
  const [companies, setCompanies] = useState<IPOCompany[]>([]);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  let intervalId: ReturnType<typeof setInterval>;

  const fetchAndCacheCompanies = async () => {
    setLoading(true);
    try {
      // Try fetching fresh data
      const [mufgRes, bigshareRes, kfintechRes] = await Promise.all([
        fetch('https://rechat.sbs/mufg-ipo-companies'),
        fetch('https://rechat.sbs/bigshare-ipo-companies'),
        fetch('https://rechat.sbs/kfintech-ipo-companies'),
      ]);

      const mufgData = await mufgRes.json();
      const bigshareData = await bigshareRes.json();
      const kfintechData = await kfintechRes.json();

      // Extract and filter companies
      const mufgCompanies = Array.isArray(mufgData?.companies)
        ? mufgData.companies.filter((c) => c.value !== '--Select Company--')
        : [];

      const bigshareCompanies = Array.isArray(bigshareData?.companies)
        ? bigshareData.companies.filter((c) => c.value !== '--Select Company--')
        : [];

      const kfintechCompanies = Array.isArray(kfintechData?.companies)
        ? kfintechData.companies.filter((c) => c.value !== '--Select Company--')
        : [];

      // Merge without duplicates
      const mergedCompanies: IPOCompany[] = [
        ...mufgCompanies,
        ...bigshareCompanies.filter(
          (b) => !mufgCompanies.some((m) => m.value === b.value)
        ),
        ...kfintechCompanies.filter(
          (k) =>
            !mufgCompanies.some((m) => m.value === k.value) &&
            !bigshareCompanies.some((b) => b.value === k.value)
        ),
      ];

      setCompanies(mergedCompanies);

      // Cache in AsyncStorage as string
      await AsyncStorage.setItem('ipoCompaniesCache', JSON.stringify(mergedCompanies));
      await AsyncStorage.setItem('ipoCompaniesCacheTimestamp', Date.now().toString());
    } catch (error) {
      console.error('Error fetching IPO companies:', error);

      // On error, try load cached data
      try {
        const cached = await AsyncStorage.getItem('ipoCompaniesCache');
        if (cached) {
          setCompanies(JSON.parse(cached));
        }
      } catch (cacheError) {
        console.error('Error reading cached IPO companies:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  };

  // On mount, load cached data first (if any)
  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem('ipoCompaniesCache');
      if (cached) {
        setCompanies(JSON.parse(cached));
      }
    } catch (cacheError) {
      console.error('Error reading cached IPO companies on mount:', cacheError);
    }
  };

  loadCachedData();
  fetchAndCacheCompanies();

  intervalId = setInterval(fetchAndCacheCompanies, 5 * 60 * 1000);

  return () => clearInterval(intervalId);
}, []);


  const selectedIPOData = companies.find((ipo) => ipo.value === selectedIPO);
  const styles = getStyles(isDark);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity style={styles.selector} onPress={() => setIsVisible(true)}>
        <View style={styles.selectorContent}>
          <Search size={20} color={isDark ? '#94A3B8' : '#64748B'} />
          <Text style={styles.selectorText}>
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

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#1E40AF" />
          ) : (
            <FlatList
              data={companies}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.ipoItem,
                    selectedIPO === item.value && styles.selectedIpoItem,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setIsVisible(false);
                  }}
                >
                  <Text style={styles.ipoName}>{item.name}</Text>
                  {selectedIPO === item.value && <View style={styles.selectedIndicator} />}
                </TouchableOpacity>
              )}
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
    container: {
      marginBottom: 8,
    },
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
    closeButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    ipoList: {
      flex: 1,
    },
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
    },
    selectedIpoItem: {
      borderColor: '#1E40AF',
      backgroundColor: isDark ? '#1E3A8A20' : '#EFF6FF',
    },
    ipoName: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#F1F5F9' : '#1E293B',
    },
    selectedIndicator: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#1E40AF',
    },
  });
