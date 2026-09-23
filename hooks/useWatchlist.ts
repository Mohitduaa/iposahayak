import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WatchlistItem {
  /** The IPO document id — /api/quote/:id takes this. */
  id: string;
  name: string;
  symbol: string;
}

const KEY = 'watchlist';

// Module-level store so every mounted hook shows the same list the moment
// any screen changes it, without a round trip through storage.
let items: WatchlistItem[] = [];
let loaded = false;
const listeners = new Set<(next: WatchlistItem[]) => void>();

async function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) items = parsed;
    }
  } catch {
    // Unreadable storage: start empty rather than crash.
  }
  listeners.forEach((fn) => fn(items));
}

function commit(next: WatchlistItem[]) {
  items = next;
  listeners.forEach((fn) => fn(items));
  AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
}

export function useWatchlist() {
  const [list, setList] = useState<WatchlistItem[]>(items);

  useEffect(() => {
    listeners.add(setList);
    ensureLoaded();
    return () => {
      listeners.delete(setList);
    };
  }, []);

  const has = useCallback((id: string) => list.some((item) => item.id === id), [list]);

  const toggle = useCallback((item: WatchlistItem) => {
    if (items.some((row) => row.id === item.id)) {
      commit(items.filter((row) => row.id !== item.id));
    } else {
      commit([item, ...items]);
    }
  }, []);

  const remove = useCallback((id: string) => {
    commit(items.filter((row) => row.id !== id));
  }, []);

  return { watchlist: list, has, toggle, remove };
}
