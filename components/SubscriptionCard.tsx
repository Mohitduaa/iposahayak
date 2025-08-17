import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  ViewStyle,
} from 'react-native';
import { Crown, Star, ArrowRight } from 'lucide-react-native';

interface SubscriptionCardProps {
  onUpgrade: () => void;
  style?: ViewStyle;
}

export function SubscriptionCard({ onUpgrade, style }: SubscriptionCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const features = [
    'Early GMP data access',
    'Priority allotment alerts',
    'Expert analysis & insights',
    'Advanced filtering options',
    'Ad-free experience',
  ];

  const styles = getStyles(isDark);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Crown size={24} color="#F59E0B" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>Unlock advanced features</Text>
        </View>
      </View>

      <View style={styles.features}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Star size={14} color="#F59E0B" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
        <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
        <ArrowRight size={16} color="#FFFFFF" />
      </TouchableOpacity>

      <Text style={styles.priceText}>Starting from ₹299/month</Text>
    </View>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F59E0B',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: isDark ? '#78350F' : '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  features: {
    gap: 8,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  priceText: {
    fontSize: 12,
    color: isDark ? '#94A3B8' : '#64748B',
    textAlign: 'center',
  },
});