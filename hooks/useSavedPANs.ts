import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_PANS_KEY = 'saved_pans';

export interface SavedPAN {
  pan: string;
  name: string;
  addedDate: string;
}

export function useSavedPANs() {
  const [savedPANs, setSavedPANs] = useState<SavedPAN[]>([]);

  useEffect(() => {
    loadSavedPANs();
  }, []);

  const loadSavedPANs = async () => {
    try {
      const saved = await AsyncStorage.getItem(SAVED_PANS_KEY);
      if (saved) {
        const parsedData = JSON.parse(saved);
        // Handle backward compatibility with old string array format
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          if (typeof parsedData[0] === 'string') {
            // Convert old format to new format
            const converted = parsedData.map((pan: string, index: number) => ({
              pan,
              name: `Account ${index + 1}`,
              addedDate: new Date().toISOString(),
            }));
            setSavedPANs(converted);
            savePANsToStorage(converted);
          } else {
            setSavedPANs(parsedData);
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved PANs:', error);
    }
  };

  const savePANsToStorage = async (pans: SavedPAN[]) => {
    try {
      await AsyncStorage.setItem(SAVED_PANS_KEY, JSON.stringify(pans));
    } catch (error) {
      console.error('Error saving PANs:', error);
    }
  };

  const addPAN = (pan: string, name?: string) => {
    if (pan.length === 10 && !savedPANs.find(p => p.pan === pan)) {
      const newPAN: SavedPAN = {
        pan,
        name: name || `Account ${savedPANs.length + 1}`,
        addedDate: new Date().toISOString(),
      };
      const newPANs = [...savedPANs, newPAN];
      setSavedPANs(newPANs);
      savePANsToStorage(newPANs);
      return true;
    }
    return false;
  };

  const removePAN = (pan: string) => {
    const newPANs = savedPANs.filter(p => p.pan !== pan);
    setSavedPANs(newPANs);
    savePANsToStorage(newPANs);
  };

  const updatePANName = (pan: string, newName: string) => {
    const newPANs = savedPANs.map(p => 
      p.pan === pan ? { ...p, name: newName } : p
    );
    setSavedPANs(newPANs);
    savePANsToStorage(newPANs);
  };

  return {
    savedPANs,
    addPAN,
    removePAN,
    updatePANName,
  };
}