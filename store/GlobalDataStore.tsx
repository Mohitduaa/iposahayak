import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useIPOData } from '@/hooks/useIPOData';
import { useGMPData } from '@/hooks/useGMPData';

interface GlobalDataContextType {
  ipoData: any[];
  gmpData: any[];
  chartData: any;
  topGainers: any[];
  topLosers: any[];
  isLoading: boolean;
}

const GlobalDataContext = createContext<GlobalDataContextType>({
  ipoData: [],
  gmpData: [],
  chartData: { labels: [], datasets: [] },
  topGainers: [],
  topLosers: [],
  isLoading: true,
});

export const useGlobalData = () => useContext(GlobalDataContext);

interface GlobalDataProviderProps {
  children: ReactNode;
}

export function GlobalDataProvider({ children }: GlobalDataProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  
  // Pre-load IPO data
  const { ipos, loading: ipoLoading } = useIPOData();
  
  // Pre-load GMP data
  const { gmpData, chartData, topGainers, topLosers, loading: gmpLoading } = useGMPData('1m');

  useEffect(() => {
    // Set loading to false when both data sources are loaded
    if (!ipoLoading && !gmpLoading) {
      setIsLoading(false);
    }
  }, [ipoLoading, gmpLoading]);

  const value = {
    ipoData: ipos,
    gmpData,
    chartData,
    topGainers,
    topLosers,
    isLoading,
  };

  return (
    <GlobalDataContext.Provider value={value}>
      {children}
    </GlobalDataContext.Provider>
  );
}