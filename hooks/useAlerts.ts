import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AlertType = 'new_ipo' | 'gmp_threshold';

export interface AlertPreference {
  id: string;
  type: AlertType;
  enabled: boolean;
  threshold?: number;
}

const ALERTS_KEY = 'user_alerts';

export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertPreference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const json = await AsyncStorage.getItem(ALERTS_KEY);
      if (json) setAlerts(JSON.parse(json));
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(ALERTS_KEY, JSON.stringify(alerts));
  }, [alerts]);

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const createAlert = (newAlert: Omit<AlertPreference, 'id'>) => {
    const exists = alerts.find(
      a => a.type === newAlert.type &&
        (a.threshold === newAlert.threshold || newAlert.type !== 'gmp_threshold')
    );
    if (exists) return;

    const alert: AlertPreference = {
      ...newAlert,
      id: Date.now().toString(),
    };
    setAlerts(prev => [...prev, alert]);
  };

  return { alerts, loading, toggleAlert, deleteAlert, createAlert };
}