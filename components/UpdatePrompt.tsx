import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AppState, useColorScheme, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';
import { Download, X } from 'lucide-react-native';

/**
 * Offers an over-the-air update instead of waiting for one to appear.
 *
 * expo-updates was configured but never called, so a published update only
 * arrived after the app happened to be launched cold twice — once to download
 * it in the background, once to run it. This checks on launch and whenever the
 * app returns to the foreground, downloads in the background, and then asks
 * before restarting: reloading under someone mid-way through an allotment
 * check would lose their place.
 *
 * Nothing here runs in development or in Expo Go, where there is no update
 * channel to check.
 */
export function UpdatePrompt() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [ready, setReady] = useState(false);
  const [applying, setApplying] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    let cancelled = false;

    const check = async () => {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (cancelled || !result.isAvailable) return;

        await Updates.fetchUpdateAsync();
        if (!cancelled) setReady(true);
      } catch (error: any) {
        // No channel, no network, or a rollback in progress — none of it is
        // worth interrupting anyone over.
        console.warn('Update check skipped:', error?.message || error);
      }
    };

    check();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !ready) check();
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [ready]);

  if (!ready || dismissed) return null;

  const styles = getStyles(isDark);

  const apply = async () => {
    setApplying(true);
    try {
      await Updates.reloadAsync();
    } catch (error: any) {
      console.warn('Could not restart for the update:', error?.message || error);
      setApplying(false);
    }
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.banner}>
        <View style={styles.iconTile}>
          <Download size={18} color="#FFFFFF" />
        </View>

        <View style={styles.text}>
          <Text style={styles.title}>Update ready</Text>
          <Text style={styles.body}>Restart to get the latest version.</Text>
        </View>

        <TouchableOpacity style={styles.action} onPress={apply} disabled={applying}>
          {applying ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.actionText}>Restart</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setDismissed(true)}
          style={styles.dismiss}
          accessibilityLabel="Dismiss update"
        >
          <X size={16} color={isDark ? '#94A3B8' : '#64748B'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: 0,
      right: 0,
      // Clear of the tab bar
      bottom: 96,
      paddingHorizontal: 16,
      zIndex: 50,
    },
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      paddingVertical: 12,
      paddingHorizontal: 14,
      elevation: 6,
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    iconTile: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: '#1E40AF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: { flex: 1 },
    title: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#F1F5F9' : '#1E293B',
    },
    body: {
      fontSize: 12,
      color: isDark ? '#94A3B8' : '#64748B',
      marginTop: 1,
    },
    action: {
      backgroundColor: '#1E40AF',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 9,
      minWidth: 74,
      alignItems: 'center',
    },
    actionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
    dismiss: { padding: 4 },
  });
