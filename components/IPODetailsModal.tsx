import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { X, Calendar, TrendingUp, Users, Crown, Building, DollarSign, Target, Clock } from 'lucide-react-native';
import { IPO } from '@/types';

interface IPODetailsModalProps {
  ipo: IPO;
  visible: boolean;
  onClose: () => void;
}

const screenWidth = Dimensions.get('window').width;

export function IPODetailsModal({ ipo, visible, onClose }: IPODetailsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return '#F59E0B';
      case 'ongoing': return '#10B981';
      case 'closed': return '#EF4444';
      case 'listed': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'ongoing': return 'Live';
      case 'closed': return 'Closed';
      case 'listed': return 'Listed';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  const styles = getStyles(isDark);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName} numberOfLines={2}>
              {ipo.companyName}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ipo.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(ipo.status) }]}>
                {getStatusText(ipo.status)}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={isDark ? '#F1F5F9' : '#1E293B'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Key Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Information</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <DollarSign size={20} color="#10B981" />
                <Text style={styles.statLabel}>Issue Price</Text>
                <Text style={styles.statValue}>{ipo.issuePrice}</Text>
              </View>
              <View style={styles.statCard}>
                <Target size={20} color="#F59E0B" />
                <Text style={styles.statLabel}>Lot Size</Text>
                <Text style={styles.statValue}>{ipo.lotSize}</Text>
              </View>
              <View style={styles.statCard}>
                <Building size={20} color="#8B5CF6" />
                <Text style={styles.statLabel}>Category</Text>
                <Text style={styles.statValue}>{ipo.category}</Text>
              </View>
              <View style={styles.statCard}>
                <TrendingUp size={20} color={ipo.gmp && ipo.gmp > 0 ? '#10B981' : '#EF4444'} />
                <Text style={styles.statLabel}>GMP</Text>
                <Text style={[styles.statValue, { color: ipo.gmp && ipo.gmp > 0 ? '#10B981' : '#EF4444' }]}>
                  ₹{ipo.gmp || 0}
                </Text>
              </View>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={styles.timelineContainer}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineIcon}>
                  <Calendar size={16} color="#60A5FA" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Open Date</Text>
                  <Text style={styles.timelineDate}>{formatDate(ipo.openDate)}</Text>
                </View>
              </View>
              <View style={styles.timelineItem}>
                <View style={styles.timelineIcon}>
                  <Clock size={16} color="#F59E0B" />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>Close Date</Text>
                  <Text style={styles.timelineDate}>{formatDate(ipo.closeDate)}</Text>
                </View>
              </View>
              {ipo.listingDate && (
                <View style={styles.timelineItem}>
                  <View style={styles.timelineIcon}>
                    <TrendingUp size={16} color="#10B981" />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>Listing Date</Text>
                    <Text style={styles.timelineDate}>{formatDate(ipo.listingDate)}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Subscription Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription Status</Text>
            <View style={styles.subscriptionGrid}>
              <View style={styles.subscriptionCard}>
                <Text style={styles.subscriptionLabel}>Retail</Text>
                <Text style={styles.subscriptionValue}>{ipo.subscription.retail.toFixed(1)}x</Text>
                <View style={[styles.subscriptionBar, { width: Math.min(ipo.subscription.retail * 10, 100) + '%' }]} />
              </View>
              <View style={styles.subscriptionCard}>
                <Text style={styles.subscriptionLabel}>QIB</Text>
                <Text style={styles.subscriptionValue}>{ipo.subscription.qib.toFixed(1)}x</Text>
                <View style={[styles.subscriptionBar, { width: Math.min(ipo.subscription.qib * 10, 100) + '%' }]} />
              </View>
              <View style={styles.subscriptionCard}>
                <Text style={styles.subscriptionLabel}>HNI</Text>
                <Text style={styles.subscriptionValue}>{ipo.subscription.hni.toFixed(1)}x</Text>
                <View style={[styles.subscriptionBar, { width: Math.min(ipo.subscription.hni * 10, 100) + '%' }]} />
              </View>
            </View>
          </View>

          {/* Additional Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>
            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Issue Size</Text>
                <Text style={styles.detailValue}>{ipo.totalIssueSize}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Face Value</Text>
                <Text style={styles.detailValue}>₹{ipo.faceValue}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Price Range</Text>
                <Text style={styles.detailValue}>{ipo.priceRange}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Registrar</Text>
                <Text style={styles.detailValue}>
                  {ipo.registrar === 'kfintech' ? 'KFintech' : 
                   ipo.registrar === 'linkintime' ? 'Link Intime' : 'Other'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (screenWidth - 64) / 2,
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  statLabel: {
    fontSize: 12,
    color: isDark ? '#94A3B8' : '#64748B',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  timelineContainer: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? '#334155' : '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  subscriptionGrid: {
    gap: 12,
  },
  subscriptionCard: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  subscriptionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#94A3B8' : '#64748B',
    marginBottom: 8,
  },
  subscriptionValue: {
    fontSize: 20,
    fontWeight: '700',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 8,
  },
  subscriptionBar: {
    height: 4,
    backgroundColor: '#60A5FA',
    borderRadius: 2,
  },
  detailsList: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#F1F5F9',
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
});