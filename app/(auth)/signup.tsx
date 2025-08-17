import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  useColorScheme,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, User, TrendingUp } from 'lucide-react-native';

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Signup form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP input and flow control
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  // Loading states
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Validate signup inputs
  const validateSignupInputs = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!agreeToTerms) {
      Alert.alert('Error', 'Please agree to the Terms of Service and Privacy Policy');
      return false;
    }
    return true;
  };

  // Call signup API to send OTP
  const handleSignup = async () => {
    if (!validateSignupInputs()) return;

    setLoading(true);

    try {
      const res = await fetch('https://ipo-backend-live.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      setLoading(false);

      if (res.ok) {
        Alert.alert('Success', data.message);
        setOtpSent(true);  // Show OTP input
      } else {
        Alert.alert('Error', data.message || 'Signup failed');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Network error');
    }
  };

  // Call verify OTP API
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);

    try {
      const res = await fetch('https://ipo-backend-live.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      setOtpLoading(false);

      if (res.ok) {
        Alert.alert('Success', data.message, [
          {
            text: 'OK',
            onPress: () => {
              // Save token and navigate to home/login screen
              // For example:
              // AsyncStorage.setItem('token', data.token);
              router.replace('/(auth)/login');
            },
          },
        ]);
      } else {
        Alert.alert('Error', data.message || 'OTP verification failed');
      }
    } catch (error) {
      setOtpLoading(false);
      Alert.alert('Error', 'Network error');
    }
  };

  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <TrendingUp size={40} color="#1E40AF" />
            </View>
            <Text style={styles.title}>
              {otpSent ? 'Verify OTP' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {otpSent
                ? `An OTP has been sent to ${email}. Please enter it below.`
                : 'Join thousands of IPO investors'}
            </Text>
          </View>

          {!otpSent ? (
            <>
              {/* Signup Form */}
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <User size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Mail size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                    ) : (
                      <Eye size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                    ) : (
                      <Eye size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms Agreement */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => setAgreeToTerms(!agreeToTerms)}
              >
                <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
                  {agreeToTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>

              {/* Signup Button */}
              <TouchableOpacity
                style={[styles.signupButton, loading && styles.signupButtonDisabled]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.signupButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* OTP Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter OTP</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, { letterSpacing: 10, textAlign: 'center' }]}
                    placeholder="6-digit OTP"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="numeric"
                    maxLength={6}
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  />
                </View>
              </View>

              {/* Verify OTP Button */}
              <TouchableOpacity
                style={[styles.signupButton, otpLoading && styles.signupButtonDisabled]}
                onPress={handleVerifyOtp}
                disabled={otpLoading}
              >
                {otpLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.signupButtonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {!otpSent && (
            <>
              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Signup */}
              <TouchableOpacity style={styles.socialButton}>
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity>
                    <Text style={styles.loginLink}>Sign In</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 40,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? '#1E293B' : '#EFF6FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#F1F5F9' : '#1E293B',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? '#94A3B8' : '#64748B',
      textAlign: 'center',
    },
    form: {
      gap: 20,
    },
    inputContainer: {
      gap: 8,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#F1F5F9' : '#1E293B',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: isDark ? '#F1F5F9' : '#1E293B',
    },
    eyeButton: {
      padding: 4,
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginTop: 8,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    },
    checkboxChecked: {
      backgroundColor: '#1E40AF',
      borderColor: '#1E40AF',
    },
    checkmark: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    },
    termsText: {
      flex: 1,
      fontSize: 14,
      color: isDark ? '#94A3B8' : '#64748B',
      lineHeight: 20,
    },
    termsLink: {
      color: '#1E40AF',
      fontWeight: '500',
    },
    signupButton: {
      backgroundColor: '#1E40AF',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    signupButtonDisabled: {
      opacity: 0.6,
    },
    signupButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
      gap: 16,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: isDark ? '#334155' : '#E2E8F0',
    },
    dividerText: {
      fontSize: 14,
      color: isDark ? '#94A3B8' : '#64748B',
    },
    socialButton: {
      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    socialButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: isDark ? '#F1F5F9' : '#1E293B',
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
    },
    loginText: {
      fontSize: 16,
      color: isDark ? '#94A3B8' : '#64748B',
    },
    loginLink: {
      fontSize: 16,
      color: '#1E40AF',
      fontWeight: '600',
    },
  });
