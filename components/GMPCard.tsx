import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import { GMPDetailsModal } from '@/components/GMPDetailsModal';

interface GMPCardProps {
  data: {
    companyName: string;
    gmp: number;
    change: number;
    percentage?: number;
    kostak?: number;
    subject?: number;
  };
}

export function GMPCard({ data }: GMPCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showDetails, setShowDetails] = useState(false);

  const isPositive = data.change > 0;
  const isNeutral = data.change === 0;
  const changeColor = isNeutral ? '#6B7280' : isPositive ? '#10B981' : '#EF4444';

  const getTrendIcon = () => {
    if (isNeutral) return <Minus size={16} color="#6B7280" />;
    return isPositive ? 
      <TrendingUp size={16} color="#10B981" /> : 
      <TrendingDown size={16} color="#EF4444" />;
  };

  const styles = getStyles(isDark);

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={() => setShowDetails(true)}>
      <View style={styles.header}>
        <Text style={styles.companyName} numberOfLines={1}>
          {data.companyName}
        </Text>
        <View style={styles.changeContainer}>
          {getTrendIcon()}
          <Text style={[styles.changeText, { color: changeColor }]}>
            {isPositive ? '+' : ''}{data.change}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.gmpSection}>
          <Text style={styles.gmpLabel}>GMP</Text>
          <Text style={styles.gmpValue}>₹{data.gmp}</Text>
        </View>

        {data.percentage !== undefined && (
          <View style={styles.percentageSection}>
            <Text style={styles.percentageLabel}>Change</Text>
            <Text style={[styles.percentageValue, { color: changeColor }]}>
              {isPositive ? '+' : ''}{data.percentage.toFixed(1)}%
            </Text>
          </View>
        )}

        {(data.kostak !== undefined || data.subject !== undefined) && (
          <View style={styles.additionalInfo}>
            {data.kostak !== undefined && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Kostak</Text>
                <Text style={styles.infoValue}>₹{data.kostak}</Text>
              </View>
            )}
            {data.subject !== undefined && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Subject</Text>
                <Text style={styles.infoValue}>₹{data.subject}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>

      <GMPDetailsModal
        data={data}
        visible={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gmpSection: {
    alignItems: 'flex-start',
  },
  gmpLabel: {
    fontSize: 12,
    color: isDark ? '#94A3B8' : '#64748B',
    marginBottom: 2,
  },
  gmpValue: {
    fontSize: 18,
    fontWeight: '700',
    color: isDark ? '#60A5FA' : '#1E40AF',
  },
  percentageSection: {
    alignItems: 'center',
  },
  percentageLabel: {
    fontSize: 12,
    color: isDark ? '#94A3B8' : '#64748B',
    marginBottom: 2,
  },
  percentageValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  additionalInfo: {
    alignItems: 'flex-end',
    gap: 4,
  },
  infoItem: {
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 10,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '500',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
});