import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// One list of saved PANs, shared by every screen that reads it.
//
// Each screen used to keep its own copy, loaded once when it mounted. A PAN
// added on the Allotment tab reached storage but not the IPO sheet's copy,
// which had been mounted earlier — so "Check allotment" kept saying there was
// no PAN until the app was killed and reopened. Now there is a single list,
// every screen subscribes to it, and a change anywhere shows up everywhere.

const SAVED_PANS_KEY = 'saved_pans';

export interface SavedPAN {
  pan: string;
  name: string;
  addedDate: string;
}

let savedPANs: SavedPAN[] = [];
let loaded = false;
let loading: Promise<void> | null = null;
const listeners = new Set<(pans: SavedPAN[]) => void>();

function publish(next: SavedPAN[]) {
  savedPANs = next;
  listeners.forEach((listener) => listener(savedPANs));
}

async function persist(pans: SavedPAN[]) {
  try {
    await AsyncStorage.setItem(SAVED_PANS_KEY, JSON.stringify(pans));
  } catch (error) {
    console.error('Error saving PANs:', error);
  }
}

async function load() {
  if (loaded) return;
  if (loading) return loading;

  loading = (async () => {
    try {
      const saved = await AsyncStorage.getItem(SAVED_PANS_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (typeof parsed[0] === 'string') {
          // The first release stored bare PAN strings
          const converted = parsed.map((pan: string, index: number) => ({
            pan,
            name: `Account ${index + 1}`,
            addedDate: new Date().toISOString(),
          }));
          publish(converted);
          persist(converted);
        } else {
          publish(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading saved PANs:', error);
    } finally {
      loaded = true;
      loading = null;
    }
  })();

  return loading;
}

export function addPAN(pan: string, name?: string): boolean {
  const clean = String(pan || '').trim().toUpperCase();
  if (clean.length !== 10 || savedPANs.some((saved) => saved.pan === clean)) return false;

  publish([
    ...savedPANs,
    { pan: clean, name: name || `Account ${savedPANs.length + 1}`, addedDate: new Date().toISOString() },
  ]);
  persist(savedPANs);
  return true;
}

export function removePAN(pan: string) {
  publish(savedPANs.filter((saved) => saved.pan !== pan));
  persist(savedPANs);
}

export function updatePANName(pan: string, newName: string) {
  publish(savedPANs.map((saved) => (saved.pan === pan ? { ...saved, name: newName } : saved)));
  persist(savedPANs);
}

export function useSavedPANs() {
  const [pans, setPans] = useState<SavedPAN[]>(savedPANs);

  useEffect(() => {
    listeners.add(setPans);
    setPans(savedPANs);
    load();
    return () => {
      listeners.delete(setPans);
    };
  }, []);

  return { savedPANs: pans, addPAN, removePAN, updatePANName };
}
