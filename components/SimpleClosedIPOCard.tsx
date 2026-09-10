import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { ClosedIPO } from '@/types';

interface SimpleClosedIPOCardProps {
  ipo: ClosedIPO;
}

export function SimpleClosedIPOCard({ ipo }: SimpleClosedIPOCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);

  const isValidUrl = (url: string) => {
    return /^https?:\/\/.+/.test(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.companyName}>{ipo.name || 'N/A'}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Closed</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Allotment Date:</Text>
          <Text style={styles.detailValue}>{ipo.allotmentDate || 'TBA'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Price:</Text>
          <Text style={styles.detailValue}>{ipo.price || 'N/A'}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>GMP:</Text>
          <Text style={styles.detailValue}>{ipo.gmp || '0'} ({ipo.gain || '0%'})</Text>
        </View>

        {isValidUrl(ipo.allotment) && (
          <TouchableOpacity style={styles.allotmentButton}>
            <Text style={styles.allotmentButtonText}>View Allotment</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#EF444420',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  allotmentButton: {
    backgroundColor: '#2cb756',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  allotmentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});