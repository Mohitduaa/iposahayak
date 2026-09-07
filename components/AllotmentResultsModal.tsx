import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { X, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, TrendingUp } from 'lucide-react-native';
import { AllotmentStatus } from '@/types';

interface AllotmentResultsModalProps {
  visible: boolean;
  onClose: () => void;
  results: AllotmentStatus[];
  ipoName: string;
}

export function AllotmentResultsModal({ visible, onClose, results, ipoName }: AllotmentResultsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'allotted':
        return {
          icon: <CheckCircle size={24} color="#10B981" />,
          text: 'Allotted',
          color: '#10B981',
          bgColor: isDark ? '#064E3B' : '#ECFDF5',
        };
      case 'not_allotted':
        return {
          icon: <XCircle size={24} color="#EF4444" />,
          text: 'Not Allotted',
          color: '#EF4444',
          bgColor: isDark ? '#7F1D1D' : '#FEF2F2',
        };
      case 'error':
        return {
          icon: <AlertCircle size={24} color="#F59E0B" />,
          text: 'Could not check',
          color: '#F59E0B',
          bgColor: isDark ? '#78350F' : '#FFFBEB',
        };
      case 'unknown':
        return {
          icon: <AlertCircle size={24} color="#F59E0B" />,
          text: 'Record found',
          color: '#F59E0B',
          bgColor: isDark ? '#78350F' : '#FFFBEB',
        };
      default:
        return {
          icon: <AlertCircle size={24} color="#F59E0B" />,
          text: 'No Record',
          color: '#F59E0B',
          bgColor: isDark ? '#78350F' : '#FFFBEB',
        };
    }
  };

  const allottedCount = results.filter(r => r.status === 'allotted').length;
  const totalShares = results.reduce((sum, r) => sum + (r.allottedShares || 0), 0);
  const totalAmount = results.reduce((sum, r) => sum + (r.amount || 0), 0);

  const styles = getStyles(isDark);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Allotment Results</Text>
            <Text style={styles.subtitle}>{ipoName}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={isDark ? '#F1F5F9' : '#1E293B'} />
          </TouchableOpacity>
        </View>

        {/* Summary Stats */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <TrendingUp size={20} color="#10B981" />
            <Text style={styles.summaryLabel}>Allotted Accounts</Text>
            <Text style={styles.summaryValue}>{allottedCount} / {results.length}</Text>
          </View>
          {totalShares > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Shares</Text>
              <Text style={styles.summaryValue}>{totalShares}</Text>
            </View>
          )}
          {totalAmount > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>₹{totalAmount.toLocaleString()}</Text>
            </View>
          )}
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {results.map((result, index) => {
            const statusInfo = getStatusInfo(result.status);
            return (
              <View key={index} style={[styles.resultCard, { backgroundColor: statusInfo.bgColor }]}>
                <View style={styles.resultHeader}>
                  <View style={styles.statusSection}>
                    {statusInfo.icon}
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                      {statusInfo.text}
                    </Text>
                  </View>
                  <Text style={styles.panText}>{result.pan}</Text>
                </View>

                {result.status === 'allotted' && !!(result.allottedShares || result.shares) && (
                  <View style={styles.allotmentDetails}>

                    <Text style={styles.detailLabel}>{result.name}</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Shares Allotted:</Text>
                      <Text style={styles.detailValue}>{result.allottedShares ?? result.shares}</Text>
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
          })}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#E2E8F0',
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  closeButton: {
    padding: 4,
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  summaryLabel: {
    fontSize: 12,
    color: isDark ? '#94A3B8' : '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  resultHeader: {
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
  footer: {
    padding: 20,
  },
  doneButton: {
    backgroundColor: '#1E40AF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});