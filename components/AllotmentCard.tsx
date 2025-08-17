import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import { AllotmentStatus } from '@/types';

interface AllotmentCardProps {
  result: AllotmentStatus;
}

export function AllotmentCard({ result }: AllotmentCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'allotted':
        return {
          icon: <CheckCircle size={20} color="#10B981" />,
          text: 'Allotted',
          color: '#10B981',
          bgColor: isDark ? '#064E3B' : '#ECFDF5',
        };
      case 'not_allotted':
        return {
          icon: <XCircle size={20} color="#EF4444" />,
          text: 'Not Allotted',
          color: '#EF4444',
          bgColor: isDark ? '#7F1D1D' : '#FEF2F2',
        };
      default:
        return {
          icon: <AlertCircle size={20} color="#F59E0B" />,
          text: 'No Record',
          color: '#F59E0B',
          bgColor: isDark ? '#78350F' : '#FFFBEB',
        };
    }
  };

  const statusInfo = getStatusInfo(result.status);
  const styles = getStyles(isDark);

  return (
    <View style={[styles.container, { backgroundColor: statusInfo.bgColor }]}>
      <View style={styles.header}>
        <View style={styles.statusSection}>
          {statusInfo.icon}
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
        <Text style={styles.panText}>{result.pan}</Text>
      </View>

      {result.status === 'allotted' && result.shares && (
        <View style={styles.allotmentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Shares Allotted:</Text>
            <Text style={styles.detailValue}>{result.shares}</Text>
          </View>
          {result.amount && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount:</Text>
              <Text style={styles.detailValue}>₹{result.amount.toLocaleString()}</Text>
            </View>
          )}
        </View>
      )}

      {result.refundAmount && result.refundAmount > 0 && (
        <View style={styles.refundSection}>
          <Text style={styles.refundLabel}>Refund Amount:</Text>
          <Text style={styles.refundValue}>₹{result.refundAmount.toLocaleString()}</Text>
        </View>
      )}
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  panText: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#94A3B8' : '#64748B',
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  allotmentDetails: {
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
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  refundSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#334155' : '#E2E8F0',
  },
  refundLabel: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  refundValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
});