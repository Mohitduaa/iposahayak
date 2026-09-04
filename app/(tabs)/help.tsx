import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { 
  CircleHelp as HelpCircle, 
  ArrowLeft, 
  Mail, 
  Phone, 
  MessageCircle, 
  ChevronDown, 
  ChevronRight,
  Send,
  Book,
  Video,
  Users
} from 'lucide-react-native';
import { router } from 'expo-router';

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpSupportScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  // The header paints behind the status bar, so the bar keeps the header's
  // colour instead of showing a strip of the page background above it.
  const insets = useSafeAreaInsets();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const faqData: FAQItem[] = [
    {
      question: "How do I check my IPO allotment status?",
      answer: "Go to the Allotment tab, select the IPO you applied for, add your PAN card, and tap 'Check Allotment'. We'll fetch the status from the registrar's website."
    },
    {
      question: "What is GMP and how is it calculated?",
      answer: "Grey Market Premium (GMP) is the premium amount at which IPO shares are traded before listing. It's an unofficial indicator of market sentiment and potential listing gains."
    },
    {
      question: "How accurate are the allotment results?",
      answer: "Our allotment results are fetched directly from official registrar websites (KFintech, Link Intime, etc.), ensuring 100% accuracy."
    },
    {
      question: "Can I save multiple PAN cards?",
      answer: "Yes! You can save multiple PAN cards for family members or different accounts. Premium users can save unlimited PANs."
    },
    {
      question: "What are the benefits of Premium subscription?",
      answer: "Premium users get early GMP data, priority alerts, expert analysis, advanced filtering, unlimited PAN storage, and an ad-free experience."
    },
    {
      question: "Is my PAN card information secure?",
      answer: "Yes, your PAN card information is securely encrypted and stored only on your device’s local storage. It is used solely to check IPO allotment status and is never shared with third parties or sent to our servers, ensuring your privacy and security."
    },
    {
      question: "Why am I not receiving notifications?",
      answer: "Check your device notification settings and ensure notifications are enabled for the app."
    }
  ];

const [loading, setLoading] = useState(false);

const handleSendMessage = async () => {
  if (!contactEmail || !contactMessage) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }

  if (!contactEmail.includes('@')) {
    Alert.alert('Error', 'Please enter a valid email address');
    return;
  }

  setLoading(true); // Start loading
  try {
    const response = await fetch('https://api.iposahayak.com/auth/help', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: contactEmail,
        message: contactMessage,
      }),
    });

    const data = await response.json();

    if (data.success) {
      Alert.alert('Success', data.message, [
        { text: 'OK', onPress: () => {
            setContactEmail('');
            setContactMessage('');
          } 
        },
      ]);
    } else {
      Alert.alert('Error', data.message || 'Something went wrong');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    Alert.alert('Error', 'Unable to send message. Please try again later.');
  } finally {
    setLoading(false); // Stop loading
  }
};



  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={isDark ? '#F1F5F9' : '#1E293B'} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          {/* <HelpCircle size={24} color="#60A5FA" /> */}
          <Text style={styles.headerTitle}>Help & Support</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionCard}>
                <Book size={20} color="#60A5FA" />
                <Text style={styles.actionText}>User Guide</Text>
              </TouchableOpacity>
             
              <TouchableOpacity style={styles.actionCard}>
                <Users size={20} color="#F59E0B" />
                <Text style={styles.actionText}>Community</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {faqData.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                >
                  <Text style={styles.questionText}>{faq.question}</Text>
                  {expandedFAQ === index ? (
                    <ChevronDown size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                  ) : (
                    <ChevronRight size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                  )}
                </TouchableOpacity>
                {expandedFAQ === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.answerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Contact Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Support</Text>
            
            {/* Contact Methods */}
            <View style={styles.contactMethods}>
              <TouchableOpacity style={styles.contactMethod}>
                <Mail size={20} color="#60A5FA" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Email Support</Text>
                  <Text style={styles.contactDetail}>support@iposahayak.com</Text>
                  <Text style={styles.contactTime}>Response within 24 hours</Text>
                </View>
              </TouchableOpacity>

              {/* <TouchableOpacity style={styles.contactMethod}>
                <Phone size={20} color="#10B981" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>Phone Support</Text>
                  <Text style={styles.contactDetail}>+91 98765 43210</Text>
                  <Text style={styles.contactTime}>Mon-Fri, 9 AM - 6 PM IST</Text>
                </View>
              </TouchableOpacity> */}

             
            </View>

            {/* Contact Form */}
            <View style={styles.contactForm}>
              <Text style={styles.formTitle}>Send us a message</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Your Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={contactEmail}
                  onChangeText={setContactEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                  style={[styles.input, styles.messageInput]}
                  placeholder="Describe your issue or question..."
                  value={contactMessage}
                  onChangeText={setContactMessage}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                />
              </View>

              <TouchableOpacity
  style={[styles.sendButton, loading && { opacity: 0.6 }]}
  onPress={handleSendMessage}
  disabled={loading}
>
  <Send size={16} color="#FFFFFF" />
  <Text style={styles.sendButtonText}>
    {loading ? 'Sending...' : 'Send Message'}
  </Text>
</TouchableOpacity>

            </View>
          </View>

          {/* App Info */}
          
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
    paddingTop: 12,
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
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#F1F5F9' : '#1E293B',
    textAlign: 'center',
  },
  faqItem: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: isDark ? '#F1F5F9' : '#1E293B',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#334155' : '#F1F5F9',
  },
  answerText: {
    fontSize: 15,
    color: isDark ? '#94A3B8' : '#64748B',
    lineHeight: 22,
  },
  contactMethods: {
    gap: 12,
    marginBottom: 24,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
    gap: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 4,
  },
  contactDetail: {
    fontSize: 14,
    color: isDark ? '#60A5FA' : '#1E40AF',
    marginBottom: 2,
  },
  contactTime: {
    fontSize: 12,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  contactForm: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#F1F5F9' : '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: isDark ? '#334155' : '#F8FAFC',
    borderWidth: 1,
    borderColor: isDark ? '#475569' : '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E40AF',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  appInfo: {
    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#334155' : '#E2E8F0',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#334155' : '#F1F5F9',
  },
  infoLabel: {
    fontSize: 16,
    color: isDark ? '#94A3B8' : '#64748B',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: isDark ? '#F1F5F9' : '#1E293B',
  },
});