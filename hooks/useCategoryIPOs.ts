import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IPO } from '@/types';

export function useCategoryIPOs() {
  const [mainboardIPOs, setMainboardIPOs] = useState<IPO[]>([]);
  const [smeIPOs, setSMEIPOs] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(false);

  const CACHE_KEY = 'category_ipos_cache';
  const CACHE_EXPIRY_MINUTES = 30;

  const isCacheExpired = (timestamp: number) => {
    const now = Date.now();
    const diffInMinutes = (now - timestamp) / (1000 * 60);
    return diffInMinutes > CACHE_EXPIRY_MINUTES;
  };

  const loadFromCache = async () => {
    try {
      const cache = await AsyncStorage.getItem(CACHE_KEY);
      if (cache) {
        const parsed = JSON.parse(cache);
        if (!isCacheExpired(parsed.timestamp)) {
          setMainboardIPOs(parsed.mainboard || []);
          setSMEIPOs(parsed.sme || []);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.warn('Failed to load category cache:', error);
      return false;
    }
  };

  const fetchAndCategorizeData = async () => {
    try {
      setLoading(true);
      
      const [upcomingResponse, closedResponse] = await Promise.all([
        fetch('https://api.iposahayak.com/upcoming-ipos'),
        fetch('https://api.iposahayak.com/api/closed-ipos')
      ]);
      
      const [upcomingData, closedData] = await Promise.all([
        upcomingResponse.json(),
        closedResponse.json()
      ]);
      
      let allIPOs: any[] = [];
      
      if (closedData?.success && closedData?.data) {
        allIPOs = [...closedData.data.map((item: any) => ({ ...item, status: 'closed' }))];
      }
      
      if (upcomingData?.ipos) {
        allIPOs = [...allIPOs, ...upcomingData.ipos];
      }
      
      // Separate by category immediately
      const mainboard = allIPOs.filter(item => 
        item.type === 'Mainboard' || !item.type || item.category === 'Mainboard'
      );
      const sme = allIPOs.filter(item => 
        item.type === 'SME' || item.category === 'SME'
      );
      
      setMainboardIPOs(mainboard);
      setSMEIPOs(sme);
      
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        mainboard,
        sme,
      }));
      
    } catch (error) {
      console.error('Error fetching category data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const cacheLoaded = await loadFromCache();
      
      if (cacheLoaded) {
        setTimeout(() => fetchAndCategorizeData(), 1000);
      } else {
        fetchAndCategorizeData();
      }
    };
    
    initializeData();
  }, []);

  return {
    mainboardIPOs,
    smeIPOs,
    loading,
    refreshData: fetchAndCategorizeData
  };
}