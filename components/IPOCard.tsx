import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Calendar, TrendingUp, Users, Crown, Clock } from 'lucide-react-native';
import { IPO } from '@/types';
import { IPODetailsModal } from '@/components/IPODetailsModal';

interface IPOCardProps {
  ipo: IPO;
}

export function IPOCard({ ipo }: IPOCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showDetails, setShowDetails] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(ipo.timeLeft || null);

useEffect(() => {
  if (ipo.status !== 'ongoing') return;

  const closeDate = new Date(ipo.closeDate);
  closeDate.setHours(17, 0, 0, 0); // assuming 5 PM cut-off

  const updateCountdown = () => {
    const now = new Date();
    const diffMs = closeDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      setCountdown(null);
      return;
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 1) {
      setCountdown(`${diffDays} days left`);
    } else if (diffDays === 1 && diffHours === 0) {
      setCountdown('Last day');
    } else if (diffDays === 0 && diffHours === 0 && diffMinutes <= 59) {
      setCountdown(`Last ${diffMinutes} min`);
    } else if (diffDays === 0) {
      setCountdown(`${diffHours}h ${diffMinutes}m left`);
    } else {
      setCountdown('Last day');
    }
  };

  updateCountdown(); // run immediately
  const interval = setInterval(updateCountdown, 60000); // update every minute

  return () => clearInterval(interval);
}, [ipo.closeDate, ipo.status]);



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
      year: 'numeric',
    });
  };

  const styles = getStyles(isDark);

  return (
    <>
    
      <TouchableOpacity style={styles.container} onPress={() => setShowDetails(true)}>
        {ipo.status === 'ongoing' && countdown && (
  <View style={styles.detailRoww}>
    <Clock size={16} color="red" />
    <Text
      style={[
        styles.countdownText,
        countdown === 'Last day' && { fontWeight: 'bold', color: '#DC2626' },
      ]}
    >
      {countdown}
    </Text>
  </View>
)}

        <View style={styles.header}>
          
          <View style={styles.companyInfo}>
            <Text style={styles.companyName} numberOfLines={1}>{ipo.companyName}</Text>
            <Text style={styles.category}>{ipo.category}</Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ipo.status) + '20' }]}>
            
            <Text style={[styles.statusText, { color: getStatusColor(ipo.status) }]}>
              {getStatusText(ipo.status)}
            </Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Calendar size={16} color={isDark ? '#94A3B8' : '#64748B'} />
            <Text style={styles.detailText}>
              {formatDate(ipo.openDate)} - {formatDate(ipo.closeDate)}
            </Text>
          </View>

          

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Issue Price:</Text>
            <Text style={styles.detailValue}>{ipo.issuePrice}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Lot Size:</Text>
            <Text style={styles.detailValue}>{ipo.lotSize} shares</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.gmpSection}>
            <TrendingUp size={16} color={ipo.gmp && ipo.gmp > 0 ? '#10B981' : '#EF4444'} />
            <Text style={styles.gmpLabel}>GMP:</Text>
            <Text style={[styles.gmpValue, { color: ipo.gmp && ipo.gmp > 0 ? '#10B981' : '#EF4444' }]}>
              ₹{ipo.gmp || 0}
              {/* {ipo.gmpChange && (
                <Text style={styles.gmpChange}>
                  ({ipo.gmpChange > 0 ? '+' : ''}{ipo.gmpChange})
                </Text>
              )} */}
            </Text>
          </View>

          <View style={styles.subscriptionSection}>
            <Users size={16} color={isDark ? '#94A3B8' : '#64748B'} />
            <Text style={styles.subscriptionText}>
              {(ipo.subscription?.retail ?? 0).toFixed(1)}x
            </Text>
            {ipo.subscription.retail > 50 && (
              <Crown size={14} color="#F59E0B" />
            )}
          </View>
        </View>
      </TouchableOpacity>

      <IPODetailsModal
        ipo={ipo}
        visible={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyInfo: {
    flex: 1,
    marginRight: 12,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  details: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  detailLabel: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginLeft: 'auto',
  },
  countdownText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'red',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#334155' : '#E2E8F0',
  },
  gmpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gmpLabel: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  gmpValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  gmpChange: {
    fontSize: 12,
    opacity: 0.7,
  },
  subscriptionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subscriptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  detailRoww: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6, // only works in RN 0.71+
  marginTop: 4,
},
});
