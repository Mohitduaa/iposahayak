import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Shield, ArrowLeft, Mail, Phone, Globe } from 'lucide-react-native';
import { router } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={isDark ? '#F1F5F9' : '#1E293B'} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          {/* <Shield size={24} color="#60A5FA" /> */}
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last updated: August 2025</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.sectionText}>
              We collect information you provide directly to us, such as when you create an account, 
              use our services, or contact us for support. This includes:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Email address and name</Text>
              <Text style={styles.bulletItem}>• PAN card numbers for allotment checking</Text>
              <Text style={styles.bulletItem}>• Alert preferences and settings</Text>
              <Text style={styles.bulletItem}>• Usage data and app interactions</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.sectionText}>
              We use the information we collect to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Provide IPO tracking and allotment checking services</Text>
              <Text style={styles.bulletItem}>• Send you relevant alerts and notifications</Text>
              <Text style={styles.bulletItem}>• Improve our app and develop new features</Text>
              <Text style={styles.bulletItem}>• Communicate with you about updates and support</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Information Sharing</Text>
            <Text style={styles.sectionText}>
              We do not sell, trade, or otherwise transfer your personal information to third parties. 
              We may share information only in the following circumstances:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• With registrars for allotment status checking</Text>
              <Text style={styles.bulletItem}>• When required by law or legal process</Text>
              <Text style={styles.bulletItem}>• To protect our rights and prevent fraud</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.sectionText}>
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. Your PAN numbers are encrypted 
              and stored securely.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Data Retention</Text>
            <Text style={styles.sectionText}>
              We retain your information for as long as your account is active or as needed to provide 
              services. You may delete your account and data at any time through the app settings.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Your Rights</Text>
            <Text style={styles.sectionText}>
              You have the right to:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Access and update your personal information</Text>
              <Text style={styles.bulletItem}>• Delete your account and associated data</Text>
              <Text style={styles.bulletItem}>• Opt-out of marketing communications</Text>
              <Text style={styles.bulletItem}>• Request data portability</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Contact Us</Text>
            <Text style={styles.sectionText}>
              If you have any questions about this Privacy Policy, please contact us:
            </Text>
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Mail size={16} color="#60A5FA" />
                <Text style={styles.contactText}>privacy@iposhayak.com</Text>
              </View>
              <View style={styles.contactItem}>
                <Globe size={16} color="#60A5FA" />
                <Text style={styles.contactText}>www.iposhayak.com/privacy</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#E2E8F0',
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: isDark ? '#94A3B8' : '#64748B',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: isDark ? '#94A3B8' : '#64748B',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletList: {
    paddingLeft: 16,
    gap: 8,
  },
  bulletItem: {
    fontSize: 16,
    color: isDark ? '#94A3B8' : '#64748B',
    lineHeight: 24,
  },
  contactInfo: {
    marginTop: 12,
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 16,
    color: isDark ? '#60A5FA' : '#1E40AF',
  },
});