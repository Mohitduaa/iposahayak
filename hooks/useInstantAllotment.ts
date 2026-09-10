import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const INSTANT_DATA = [
  { id: '1', name: 'Bajaj Housing Finance', status: 'Allotted', date: '2024-01-15', registrar: 'KFin Technologies' },
  { id: '2', name: 'Hyundai Motor India', status: 'Not Allotted', date: '2024-01-14', registrar: 'Link Intime' },
  { id: '3', name: 'NTPC Green Energy', status: 'Pending', date: '2024-01-13', registrar: 'Computershare' },
  { id: '4', name: 'Swiggy Limited', status: 'Allotted', date: '2024-01-12', registrar: 'KFin Technologies' },
  { id: '5', name: 'Ola Electric', status: 'Not Allotted', date: '2024-01-11', registrar: 'Link Intime' },
  { id: '6', name: 'Zomato Limited', status: 'Allotted', date: '2024-01-10', registrar: 'Computershare' },
  { id: '7', name: 'Paytm', status: 'Pending', date: '2024-01-09', registrar: 'KFin Technologies' },
  { id: '8', name: 'Nykaa', status: 'Allotted', date: '2024-01-08', registrar: 'Link Intime' },
];

export function useInstantAllotment() {
  const [data, setData] = useState(INSTANT_DATA);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show instant data immediately
    setData(INSTANT_DATA);
    
    // Try to load real data in background (with timeout)
    const loadRealData = async () => {
      try {
        const cache = await AsyncStorage.getItem('instant_allotment_cache');
        if (cache) {
          const parsed = JSON.parse(cache);
          const now = Date.now();
          const cacheAge = (now - parsed.timestamp) / (1000 * 60); // minutes
          
          if (cacheAge < 15) { // Use cache if less than 15 minutes old
            setData(parsed.data);
            return;
          }
        }
        
        // Try API with 3 second timeout
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('https://api.iposahayak.com/api/allotment-status', {
          signal: controller.signal
        });
        
        const result = await response.json();
        if (result?.success && result?.data) {
          const apiData = result.data.slice(0, 15);
          setData(apiData);
          
          await AsyncStorage.setItem('instant_allotment_cache', JSON.stringify({
            timestamp: Date.now(),
            data: apiData
          }));
        }
      } catch (error) {
        // Keep showing instant data if API fails
        console.log('Using instant data due to API timeout');
      }
    };
    
    // Load real data after 1 second
    setTimeout(loadRealData, 1000);
  }, []);

  return { data, loading };
}