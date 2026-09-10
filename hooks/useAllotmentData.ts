import { useState, useEffect } from 'react';

export function useAllotmentData() {
  const [allotmentData, setAllotmentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'mainboard' | 'sme'>('all');

  const ITEMS_PER_PAGE = 10;

  const fetchAllotmentData = async (page: number = 1, search: string = '', type: 'all' | 'mainboard' | 'sme' = 'all', reset: boolean = false) => {
    try {
      setLoading(true);
      
      const searchParam = search ? `search=${encodeURIComponent(search)}&` : '';
      const typeParam = type !== 'all' ? `type=${type}&` : '';
      const url = `https://api.iposahayak.com/api/closed-iposs/app?${searchParam}${typeParam}page=${page}&limit=${ITEMS_PER_PAGE}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn('API response not ok:', response.status);
        return;
      }
      
      const responseText = await response.text();
      
      if (responseText.trim().startsWith('<')) {
        console.warn('Received HTML response instead of JSON');
        return;
      }
      
      const result = JSON.parse(responseText);
      
      if (result?.success && result?.data) {
        if (reset || page === 1) {
          setAllotmentData(result.data);
        } else {
          setAllotmentData(prev => [...prev, ...result.data]);
        }
        
        setTotalPages(result.totalPages || 0);
        setHasMore(page < (result.totalPages || 0));
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching allotment data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllotmentData(1, searchQuery, selectedType, true);
  }, []);

  const loadMore = async () => {
    if (!hasMore || loading) return;
    const nextPage = currentPage + 1;
    await fetchAllotmentData(nextPage, searchQuery, selectedType, false);
  };

  const searchIPOs = async (query: string) => {
    setSearchQuery(query);
    await fetchAllotmentData(1, query, selectedType, true);
  };

  const filterByType = async (type: 'all' | 'mainboard' | 'sme') => {
    setSelectedType(type);
    await fetchAllotmentData(1, searchQuery, type, true);
  };

  const refreshData = async () => {
    await fetchAllotmentData(1, searchQuery, selectedType, true);
  };

  const onItemReached = (index: number) => {
    if (index >= allotmentData.length - 3 && hasMore && !loading) {
      loadMore();
    }
  };

  return { 
    allotmentData, 
    loading, 
    hasMore,
    currentPage,
    totalPages,
    searchQuery,
    selectedType,
    onItemReached,
    loadMore,
    searchIPOs,
    filterByType,
    refreshAllotment: refreshData
  };
}