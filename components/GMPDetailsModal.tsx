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
import { X, TrendingUp, TrendingDown, Minus, ChartBar as BarChart3, Target, DollarSign } from 'lucide-react-native';

interface GMPDetailsModalProps {
  data: {
    companyName: string;
    gmp: number;
    change: number;
    percentage?: number;
    kostak?: number;
    subject?: number;
    openDate?: string;
    closeDate?: string;
    allotmentDate?: string;
    listingDate?: string;
  };
  visible: boolean;
  onClose: () => void;
}


const formatDate = (dateString: string) => {
  if (!dateString || dateString === 'Will be announced soon') {
    return 'TBA';
  }
  
  // Handle formats like "15 Jan" by adding current year
  if (dateString.match(/^\d{1,2}\s+[A-Za-z]{3}$/)) {
    dateString = `${dateString} ${new Date().getFullYear()}`;
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString; // Return original if can't parse
  }
  
  return date.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short',
    year: 'numeric'
  });
};

export function GMPDetailsModal({ data, visible, onClose }: GMPDetailsModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const isPositive = data.change > 0;
  const isNeutral = data.change === 0;
  const changeColor = isNeutral ? '#6B7280' : isPositive ? '#10B981' : '#EF4444';

  const getTrendIcon = () => {
    if (isNeutral) return <Minus size={24} color="#6B7280" />;
    return isPositive ? 
      <TrendingUp size={24} color="#10B981" /> : 
      <TrendingDown size={24} color="#EF4444" />;
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
              {data.companyName}
            </Text>
            <View style={styles.gmpHeader}>
              {getTrendIcon()}
              <Text style={styles.currentGMP}>₹{data.gmp}</Text>
              <Text style={[styles.changeText, { color: changeColor }]}>
                {isPositive ? '+' : ''}{data.change} ({isPositive ? '+' : ''}{data.percentage?.toFixed(1)}%)
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={isDark ? '#F1F5F9' : '#1E293B'} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Current Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Market Data</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
<Text style={{ fontSize: 20, color: '#10B981', fontWeight: 'bold' }}>₹</Text>
                <Text style={styles.statLabel}>GMP</Text>
                <Text style={[styles.statValue, { color: changeColor }]}>₹{data.gmp}</Text>
              </View>
              <View style={styles.statCard}>
                <TrendingUp size={20} color={changeColor} />
                <Text style={styles.statLabel}>Change</Text>
                <Text style={[styles.statValue, { color: changeColor }]}>
                  {isPositive ? '+' : ''}₹{data.change}
                </Text>
              </View>
              {/* {data.kostak !== undefined && (
                <View style={styles.statCard}>
                  <Target size={20} color="#F59E0B" />
                  <Text style={styles.statLabel}>Kostak</Text>
                  <Text style={styles.statValue}>₹{data.kostak}</Text>
                </View>
              )} */}
              {data.subject !== undefined && data.subject > 0 && (
                <View style={styles.statCard}>
                  <BarChart3 size={20} color="#8B5CF6" />
                  <Text style={styles.statLabel}>Subject Profit</Text>
                  <Text style={styles.statValue}>₹{data.subject.toLocaleString('en-IN')}</Text>
                </View>
              )}
            </View>
          </View>

          

          {/* Market Analysis */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Market Analysis</Text>
            <View style={styles.analysisCard}>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Market Sentiment</Text>
                <Text style={[styles.analysisValue, { color: changeColor }]}>
                  {isPositive ? 'Bullish' : isNeutral ? 'Neutral' : 'Bearish'}
                </Text>
              </View>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Volatility</Text>
                <Text style={styles.analysisValue}>
                  {Math.abs(data.change) > 10 ? 'High' : Math.abs(data.change) > 5 ? 'Medium' : 'Low'}
                </Text>
              </View>
              <View style={styles.analysisItem}>
                <Text style={styles.analysisLabel}>Recommendation</Text>
                <Text style={styles.analysisValue}>
                  {data.gmp > 20 ? 'Strong Buy' : data.gmp > 10 ? 'Buy' : data.gmp > 0 ? 'Hold' : 'Avoid'}
                </Text>
              </View>
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerSection}>
            <Text style={styles.disclaimerTitle}>Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              Grey Market Premium (GMP) is an unofficial market indicator and should not be considered as investment advice. 
              Please consult with financial advisors before making investment decisions.
            </Text>
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
    marginBottom: 12,
  },
  gmpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentGMP: {
    fontSize: 24,
    fontWeight: '700',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  changeText: {
    fontSize: 16,
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
    // Sized against its row rather than against a window width measured once
    // at import, so it holds up on a tablet, in split screen and on rotation.
    flexBasis: '47%',
    minWidth: 130,
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
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
    overflow: 'hidden',
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#F1F5F9',
  },
  timelineLabel: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  timelineValue: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  analysisCard: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
    gap: 12,
  },
  analysisItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisLabel: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  analysisValue: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  disclaimerSection: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 40,
    padding: 16,
    backgroundColor: isDark ? '#1E293B' : '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#FDE68A',
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#F59E0B' : '#92400E',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: isDark ? '#94A3B8' : '#78350F',
    lineHeight: 16,
  },
});