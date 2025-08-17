import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IPO } from '@/types';

export function useIPOData() {
  const [ipos, setIPOs] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(false);

  const CACHE_KEY = 'ipo_data_cache';
  const CACHE_EXPIRY_MINUTES = 5;

  const monthMap: Record<string, string> = {
    January: '01', February: '02', March: '03', April: '04',
    May: '05', June: '06', July: '07', August: '08',
    September: '09', October: '10', November: '11', December: '12'
  };

  const parseDateRange = (range: string) => {
    const currentYear = new Date().getFullYear();
    const match = range.match(/(\d{1,2})-(\d{1,2})\s+([A-Za-z]+)/);
    if (!match) {
      return {
        open: `${currentYear}-08-01`,
        close: `${currentYear}-08-03`,
      };
    }
    const [, start, end, month] = match;
    const monthNumber = monthMap[month] || '08';

    let openMonth = monthNumber;
    let closeMonth = monthNumber;

    if (parseInt(start) > parseInt(end)) {
      const prevMonth = (parseInt(monthNumber) - 1).toString().padStart(2, '0');
      openMonth = prevMonth;
    }

    return {
      open: `${currentYear}-${openMonth}-${start.padStart(2, '0')}`,
      close: `${currentYear}-${closeMonth}-${end.padStart(2, '0')}`,
    };
  };

  const getStatus = (openDate: string, closeDate: string) => {
    const now = new Date();
    const open = new Date(openDate);
    const close = new Date(closeDate);

    const closeAtFivePM = new Date(close);
    closeAtFivePM.setHours(17, 0, 0, 0);

    if (now > closeAtFivePM) return 'closed';
    if (now >= open && now <= closeAtFivePM) return 'ongoing';
    return 'upcoming';
  };

  const mapAPIData = (data: any[]): IPO[] => {
    return data
      .filter((item: any) => item.name && item.name !== 'Stock / IPO')
      .map((item: any, index: number) => {
        const { open, close } = parseDateRange(item.date || '');
        const gmpRaw = item.gmp || '0';
        const gmpValue = parseInt(gmpRaw.replace(/[₹,+-]/g, '')) || 0;

        return {
          id: `${index + 1}`,
          companyName: item.name || 'N/A',
          openDate: open,
          closeDate: close,
          issuePrice: item.price || 'N/A',
          lotSize: 0,
          status: getStatus(open, close),
          registrar: '',
          gmp: gmpValue,
          gmpChange: 0,
          subscription: { retail: 0, qib: 0, hni: 0 },
          category: item.type || 'Mainboard',
          totalIssueSize: item.subject || 'N/A',
          faceValue: 10,
          priceRange: item.price || '',
        };
      })
      .sort((a, b) => {
        const statusOrder = { ongoing: 1, upcoming: 2, closed: 3 };
        return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
      });
  };

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
          setIPOs(parsed.data);
        }
      }
    } catch (error) {
      console.warn('Failed to load IPO cache:', error);
    }
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://rechat.sbs/upcoming-ipos');
      const data = await response.json();

      if (data?.ipos && Array.isArray(data.ipos)) {
        const mapped = mapAPIData(data.ipos);
        setIPOs(mapped);
        await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
          timestamp: Date.now(),
          data: mapped,
        }));
      }
    } catch (error) {
      console.error('Error fetching IPOs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load from cache first for instant UI
    loadFromCache();

    // Always refresh in background
    refreshData();

    // Set interval to refresh every X minutes
    const interval = setInterval(() => {
      refreshData();
    }, CACHE_EXPIRY_MINUTES * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    ipos,
    loading,
    refreshData,
  };
}
