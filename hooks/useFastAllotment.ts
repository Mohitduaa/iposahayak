import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_ALLOTMENT_DATA = [
  { id: '1', companyName: 'Reliance Industries', status: 'Allotted', allotmentDate: '2024-01-15', registrar: 'KFin Technologies' },
  { id: '2', companyName: 'HDFC Bank', status: 'Not Allotted', allotmentDate: '2024-01-14', registrar: 'Link Intime' },
  { id: '3', companyName: 'TCS Limited', status: 'Allotted', allotmentDate: '2024-01-13', registrar: 'Computershare' },
  { id: '4', companyName: 'Infosys Limited', status: 'Pending', allotmentDate: '2024-01-12', registrar: 'KFin Technologies' },
  { id: '5', companyName: 'ICICI Bank', status: 'Allotted', allotmentDate: '2024-01-11', registrar: 'Link Intime' },
];

export function useFastAllotment() {
  const [allotmentData, setAllotmentData] = useState<any[]>(MOCK_ALLOTMENT_DATA);
  const [loading, setLoading] = useState(false);

  const CACHE_KEY = 'instant_allotment_cache';
  const CACHE_EXPIRY_MINUTES = 10;

  const loadInstantData = async () => {
    try {
      const cache = await AsyncStorage.getItem(CACHE_KEY);
      if (cache) {
        const parsed = JSON.parse(cache);
        setAllotmentData(parsed.data || MOCK_ALLOTMENT_DATA);
        return true;
      }
      // Always show mock data first
      setAllotmentData(MOCK_ALLOTMENT_DATA);
      return false;
    } catch (error) {
      setAllotmentData(MOCK_ALLOTMENT_DATA);
      return false;
    }
  };

  const fetchAllotmentData = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('https://api.iposahayak.com/api/allotment-status', {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const result = await response.json();
      
      if (result?.success && result?.data) {
        const limitedData = result.data.slice(0, 20);
        setAllotmentData(limitedData);
        
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: limitedData,
        }));
      }
    } catch (error) {
      console.warn('API timeout or failed, using cached/mock data');
      // Keep existing data (mock or cached)
    }
  };

  useEffect(() => {
    const initData = async () => {
      // Always load instantly (mock or cache)
      await loadInstantData();
      
      // Try API in background with timeout
      setTimeout(() => {
        fetchAllotmentData();
      }, 2000);
    };
    
    initData();
  }, []);

  return { allotmentData, loading };
}