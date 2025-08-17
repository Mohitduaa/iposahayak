import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  ViewStyle,
  Platform,
} from 'react-native';
import { CreditCard, X, Pencil } from 'lucide-react-native';
import { SavedPAN } from '@/hooks/useSavedPANs';

interface SavedPANSelectorProps {
  savedPANs: SavedPAN[];
  onSelectPAN: (pan: string) => void;
  onRemovePAN: (pan: string) => void;
  onEditPAN?: (pan: string, name: string) => void;
  style?: ViewStyle;
}

export function SavedPANSelector({
  savedPANs,
  onSelectPAN,
  onRemovePAN,
  onEditPAN,
  style,
}: SavedPANSelectorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = getStyles(isDark);

  if (savedPANs.length === 0) return null;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Saved PAN Cards</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {savedPANs.map((savedPAN, index) => (
          <View key={index} style={styles.panCard}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.panButton}
              onPress={() => onSelectPAN(savedPAN.pan)}
            >
              <CreditCard size={18} color={isDark ? '#60A5FA' : '#2563EB'} />
              <View style={styles.panInfo}>
                <Text style={styles.panName} numberOfLines={1}>
                  {savedPAN.name}
                </Text>
                <Text style={styles.panNumber}>{savedPAN.pan}</Text>
              </View>
            </TouchableOpacity>

            {/* Action buttons */}
            <View style={styles.panActions}>
              {onEditPAN && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => onEditPAN(savedPAN.pan, savedPAN.name)}
                  hitSlop={8}
                >
                  <Pencil size={12} color={isDark ? '#60A5FA' : '#2563EB'} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemovePAN(savedPAN.pan)}
                hitSlop={8}
              >
                <X size={12} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: isDark ? '#E2E8F0' : '#1E293B',
      marginBottom: 10,
      paddingHorizontal: 4,
    },
    scrollContent: {
      paddingTop: 8,
      paddingHorizontal: 4,
      gap: 12,
    },
    panCard: {
      position: 'relative',
    },
    panButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      gap: 10,
      minWidth: 160,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    panInfo: {
      flex: 1,
    },
    panName: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#F8FAFC' : '#1E293B',
      marginBottom: 2,
    },
    panNumber: {
      fontSize: 12,
      color: isDark ? '#94A3B8' : '#64748B',
    },
    panActions: {
      position: 'absolute',
      top: -6,
      right: -6,
      flexDirection: 'row',
      gap: 6,
    },
    editButton: {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderRadius: 10,
      width: 22,
      height: 22,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#60A5FA' : '#2563EB',
    },
    removeButton: {
      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
      borderRadius: 10,
      width: 22,
      height: 22,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#EF4444',
    },
  });
