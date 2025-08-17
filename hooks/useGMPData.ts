import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GMPData } from '@/types';

interface GMPChartData {
  labels: string[];
  datasets: [{
    data: number[];
    strokeWidth?: number;
  }];
}

interface IPOApiResponse {
  name: string;
  gmp: string;
  price: string;
  gain: string;
  date: string;
  subject: string;
  type: string;
}

interface GMPEntry {
  companyName: string;
  gmp: number;
  change: number;
  percentage: number;
  kostak: number;
  subject: number;
}

const CACHE_KEY = 'gmp_data_cache';
const CACHE_EXPIRY_MINUTES = 5;

export function useGMPData(timeRange: '7d' | '1m' | '3m' | '1y') {
  const [gmpData, setGMPData] = useState<GMPEntry[]>([]);
  const [chartData, setChartData] = useState<GMPChartData>({ labels: [], datasets: [{ data: [] }] });
  const [topGainers, setTopGainers] = useState<GMPEntry[]>([]);
  const [topLosers, setTopLosers] = useState<GMPEntry[]>([]);

  const isCacheExpired = (timestamp: number) => {
    const now = Date.now();
    return (now - timestamp) / (1000 * 60) > CACHE_EXPIRY_MINUTES;
  };

  const loadFromCache = async () => {
    try {
      const cache = await AsyncStorage.getItem(CACHE_KEY);
      if (cache) {
        const parsed = JSON.parse(cache);
        if (!isCacheExpired(parsed.timestamp)) {
          applyGMP(parsed.data);
        }
      }
    } catch (err) {
      console.warn('Failed to load GMP cache:', err);
    }
  };

  const applyGMP = (data: IPOApiResponse[]) => {
    const transformed: GMPEntry[] = data.map(item => {
      const parsedChange = parseGain(item.gain);

      return {
        companyName: item.name,
        gmp: parseRupee(item.gmp),
        change: parsedChange,
        percentage: parsedChange,
        kostak: 0,
        subject: parseRupee(item.subject),
      };
    });

    setGMPData(transformed);

    const mockChartData: GMPChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: transformed.slice(0, 7).map((item) => item.gmp),
        strokeWidth: 2,
      }],
    };
    setChartData(mockChartData);

    const gainers = transformed
      .filter(item => item.change > 0)
      .sort((a, b) => b.change - a.change)
      .slice(0, 3);

    const losers = transformed
      .filter(item => item.gmp <= 10)
      .sort((a, b) => a.gmp - b.gmp)
      .slice(0, 3);

    setTopGainers(gainers);
    setTopLosers(losers);
  };

  const fetchGMPData = async () => {
    try {
      const res = await fetch('https://rechat.sbs/upcoming-ipos');
      const json = await res.json();

      const data: IPOApiResponse[] = json.ipos?.slice(1) || [];

      // Update state
      applyGMP(data);

      // Cache it
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data,
      }));
    } catch (error) {
      console.error('Failed to fetch GMP data:', error);
    }
  };

  useEffect(() => {
    loadFromCache();      // instant
    fetchGMPData();       // silent refresh

    const interval = setInterval(() => {
      fetchGMPData();
    }, CACHE_EXPIRY_MINUTES * 60 * 1000);

    return () => clearInterval(interval);
  }, [timeRange]);

  return {
    gmpData,
    chartData,
    topGainers,
    topLosers,
  };
}

// Fixes invalid gain strings like '-%' or '-'
function parseGain(value: string): number {
  const cleaned = value.replace('%', '').trim();
  if (cleaned === '-' || cleaned === '') return 0;
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function parseRupee(value: string): number {
  if (!value || value.trim() === '₹-' || value === '-') return 0;
  return parseInt(value.replace(/[₹,]/g, '')) || 0;
}
