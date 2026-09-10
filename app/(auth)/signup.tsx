// Create an account: Google in one tap, or email with a code sent to it.
//
// The email road has two steps on the one screen. The form posts to
// /auth/signup, which emails a six-digit code; the card then swaps to the
// code boxes, and /auth/verify-otp answers with a token so the person lands
// in the app signed in, rather than being sent back to type it all again.

import React, {useEffect, useRef, useState} from 'react'
import {
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {Link, router} from 'expo-router'
import {Check, Lock, Mail, MailCheck, User as UserIcon, X} from 'lucide-react-native'
import {useUser} from '@/hooks/useUser'
import {postJson} from '@/services/authApi'
import {GoogleSignInError, signInWithGoogle} from '@/services/googleSignIn'
import {track} from '@/services/analytics'
import AuthScreen from '@/components/auth/AuthScreen'
import AuthInput from '@/components/auth/AuthInput'
import PrimaryButton from '@/components/auth/PrimaryButton'
import GoogleButton from '@/components/auth/GoogleButton'
import OrDivider from '@/components/auth/OrDivider'
import OtpInput from '@/components/auth/OtpInput'
import FormError from '@/components/auth/FormError'
import {authPalette} from '@/components/auth/theme'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const RESEND_SECONDS = 30
const TERMS_URL = 'https://www.iposahayak.com/terms-conditions'
const PRIVACY_URL = 'https://www.iposahayak.com/privacy-policy'

interface Errors {
  name?: string
  email?: string
  password?: string
  confirm?: string
  terms?: string
  form?: string
}

export default function SignupScreen() {
  const c = authPalette(useColorScheme() === 'dark')
  const {setUserFromLogin} = useUser()

  const [step, setStep] = useState<'form' | 'code'>('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [code, setCode] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState<'email' | 'google' | 'code' | 'resend' | null>(null)
  const [resendIn, setResendIn] = useState(0)
  const [legalUrl, setLegalUrl] = useState<string | null>(null)

  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const confirmRef = useRef<TextInput>(null)

  // The resend countdown
  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  const clear = (key: keyof Errors) => {
    if (errors[key] || errors.form) setErrors((e) => ({...e, [key]: undefined, form: undefined}))
  }

  const finish = async (data: {token: string; user: any}, method: 'email' | 'google') => {
    await setUserFromLogin(data)
    track.signup(method)
    router.replace('/(tabs)')
  }

  // ---- step 1: the form -----------------------------------------------------

  const validate = () => {
    const next: Errors = {}
    if (!name.trim()) next.name = 'Enter your name'
    if (!email.trim()) next.email = 'Enter your email address'
    else if (!EMAIL.test(email.trim())) next.email = 'That does not look like an email address'
    if (!password) next.password = 'Choose a password'
    else if (password.length < 6) next.password = 'Use at least 6 characters'
    if (confirm !== password) next.confirm = 'Passwords do not match'
    if (!agreed) next.terms = 'Please accept the Terms and Privacy Policy to continue'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const sendCode = async (kind: 'email' | 'resend') => {
    setBusy(kind)
    const reply = await postJson('/auth/signup', {name: name.trim(), email: email.trim().toLowerCase(), password})
    setBusy(null)
    if (!reply.ok) {
      const taken = reply.status === 400 && /exists/i.test(reply.data?.message || '')
      setErrors(
        taken
          ? {email: 'An account with this email already exists', form: undefined}
          : {form: reply.data?.message || 'Could not send the code. Please try again.'}
      )
      if (taken) setStep('form')
      return false
    }
    setResendIn(RESEND_SECONDS)
    return true
  }

  const handleSignup = async () => {
    if (busy || !validate()) return
    if (await sendCode('email')) {
      setCode('')
      setErrors({})
      setStep('code')
    }
  }

  const handleGoogle = async () => {
    if (busy) return
    setErrors({})
    setBusy('google')
    try {
      const google = await signInWithGoogle()
      if (google.cancelled) return
      const reply = await postJson('/auth/google', {idToken: google.idToken})
      if (!reply.ok || !reply.data?.token) {
        setErrors({form: reply.data?.message || 'Google sign-in failed. Please try again.'})
        return
      }
      await finish(reply.data, 'google')
    } catch (error: any) {
      setErrors({form: error instanceof GoogleSignInError ? error.message : 'Google sign-in did not work. Please try again.'})
    } finally {
      setBusy(null)
    }
  }

  // ---- step 2: the code -----------------------------------------------------

  const handleVerify = async () => {
    if (busy || code.length !== 6) return
    setBusy('code')
    const reply = await postJson('/auth/verify-otp', {email: email.trim().toLowerCase(), otp: code})
    if (!reply.ok) {
      setBusy(null)
      const expired = /expired/i.test(reply.data?.message || '')
      setErrors({form: expired ? 'That code has expired. Send a new one.' : reply.data?.message || 'That code is not right'})
      return
    }
    if (reply.data?.token && reply.data?.user) {
      await finish(reply.data, 'email')
      return
    }
    // An older backend answers without the user; fall back to signing in
    setBusy(null)
    router.replace('/(auth)/login')
  }

  const openLegal = (url: string) => {
    if (Platform.OS === 'web') Linking.openURL(url)
    else setLegalUrl(url)
  }

  // ---- render ---------------------------------------------------------------

  // Keyed by step so switching form ↔ code replays the entrance animation
  if (step === 'code') {
    return (
      <AuthScreen
        key='code'
        title='Check your email'
        subtitle={`We sent a 6-digit code to ${email.trim()}.`}
        footer={
          <TouchableOpacity onPress={() => setStep('form')} hitSlop={8} disabled={!!busy}>
            <Text style={[styles.footerLink, {color: c.link}]}>Wrong email? Go back</Text>
          </TouchableOpacity>
        }
      >
        <View style={[styles.codeIcon, {backgroundColor: c.tint}]}>
          <MailCheck size={26} color={c.focus} />
        </View>

        <OtpInput
          value={code}
          onChange={(v) => {
            setCode(v)
            if (errors.form) setErrors({})
          }}
          error={!!errors.form}
          autoFocus
        />

        <FormError message={errors.form} style={{marginTop: 12, marginBottom: 0}} />

        <View style={{height: 14}} />
        <PrimaryButton title='Verify & Continue' onPress={handleVerify} loading={busy === 'code'} disabled={code.length !== 6 || busy === 'resend'} />

        <View style={styles.resendRow}>
          <Text style={[styles.footerText, {color: c.muted}]}>Didn't get it? </Text>
          {resendIn > 0 ? (
            <Text style={[styles.footerText, {color: c.faint}]}>Resend in {resendIn}s</Text>
          ) : (
            <TouchableOpacity onPress={() => sendCode('resend')} disabled={!!busy} hitSlop={8}>
              <Text style={[styles.footerLink, {color: c.link}]}>{busy === 'resend' ? 'Sending…' : 'Resend code'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </AuthScreen>
    )
  }

  return (
    <>
      <AuthScreen
        key='form'
        compact
        title='Create your account'
        subtitle='Free forever. GMP, allotment and alerts in one place.'
        footer={
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, {color: c.muted}]}>Already have an account? </Text>
            <Link href='/(auth)/login' asChild>
              <TouchableOpacity hitSlop={8}>
                <Text style={[styles.footerLink, {color: c.link}]}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        }
      >
        <GoogleButton onPress={handleGoogle} loading={busy === 'google'} disabled={busy === 'email'} />
        <OrDivider label='or sign up with email' />

        <AuthInput
          label='Full name'
          icon={<UserIcon size={19} color={c.muted} />}
          value={name}
          onChangeText={(t) => {
            setName(t)
            clear('name')
          }}
          error={errors.name}
          placeholder='Your name'
          autoCapitalize='words'
          autoComplete='name'
          textContentType='name'
          returnKeyType='next'
          onSubmitEditing={() => emailRef.current?.focus()}
          editable={!busy}
        />
        <AuthInput
          ref={emailRef}
          label='Email'
          icon={<Mail size={19} color={c.muted} />}
          value={email}
          onChangeText={(t) => {
            setEmail(t)
            clear('email')
          }}
          error={errors.email}
          placeholder='you@example.com'
          keyboardType='email-address'
          autoCapitalize='none'
          autoCorrect={false}
          autoComplete='email'
          textContentType='emailAddress'
          returnKeyType='next'
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!busy}
        />
        <AuthInput
          ref={passwordRef}
          label='Password'
          icon={<Lock size={19} color={c.muted} />}
          value={password}
          onChangeText={(t) => {
            setPassword(t)
            clear('password')
          }}
          error={errors.password}
          placeholder='At least 6 characters'
          secure
          autoCapitalize='none'
          autoComplete='new-password'
          textContentType='newPassword'
          returnKeyType='next'
          onSubmitEditing={() => confirmRef.current?.focus()}
          editable={!busy}
        />
        <AuthInput
          ref={confirmRef}
          label='Confirm password'
          icon={<Lock size={19} color={c.muted} />}
          value={confirm}
          onChangeText={(t) => {
            setConfirm(t)
            clear('confirm')
          }}
          error={errors.confirm}
          placeholder='Type it again'
          secure
          autoCapitalize='none'
          autoComplete='new-password'
          textContentType='newPassword'
          returnKeyType='go'
          onSubmitEditing={handleSignup}
          editable={!busy}
        />

        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => {
            setAgreed((a) => !a)
            clear('terms')
          }}
          activeOpacity={0.8}
          disabled={!!busy}
        >
          <View
            style={[
              styles.checkbox,
              {borderColor: errors.terms ? c.error : agreed ? c.focus : c.inputBorder, backgroundColor: agreed ? c.focus : 'transparent'},
            ]}
          >
            {agreed && <Check size={14} color='#FFFFFF' strokeWidth={3} />}
          </View>
          <Text style={[styles.termsText, {color: c.muted}]}>
            I agree to the{' '}
            <Text style={[styles.termsLink, {color: c.link}]} onPress={() => openLegal(TERMS_URL)}>
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text style={[styles.termsLink, {color: c.link}]} onPress={() => openLegal(PRIVACY_URL)}>
              Privacy Policy
            </Text>
          </Text>
        </TouchableOpacity>
        {!!errors.terms && <Text style={[styles.termsError, {color: c.error}]}>{errors.terms}</Text>}

        <FormError message={errors.form} style={{marginTop: 8}} />

        <PrimaryButton title='Create Account' onPress={handleSignup} loading={busy === 'email'} disabled={busy === 'google'} />
      </AuthScreen>

      <LegalModal url={legalUrl} onClose={() => setLegalUrl(null)} />
    </>
  )
}

/** Terms and Privacy open in a sheet instead of throwing the person out to a browser. */
function LegalModal({url, onClose}: {url: string | null; onClose: () => void}) {
  const c = authPalette(useColorScheme() === 'dark')
  // Required lazily: the web build has no WebView, and it is never shown there
  const WebView = url && Platform.OS !== 'web' ? require('react-native-webview').default : null
  return (
    <Modal visible={!!url} animationType='slide' onRequestClose={onClose}>
      <SafeAreaView style={[styles.legal, {backgroundColor: c.surface}]} edges={['top', 'bottom']}>
        <View style={[styles.legalBar, {borderBottomColor: c.cardBorder}]}>
          <Text style={[styles.legalTitle, {color: c.text}]}>{url === PRIVACY_URL ? 'Privacy Policy' : 'Terms of Service'}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <X size={22} color={c.muted} />
          </TouchableOpacity>
        </View>
        {WebView && url ? <WebView source={{uri: url}} style={{flex: 1}} /> : null}
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 2,
    marginBottom: 6,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  termsLink: {fontWeight: '700'},
  termsError: {
    fontSize: 12.5,
    fontWeight: '500',
    marginBottom: 8,
  },
  codeIcon: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {fontSize: 14},
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  legal: {flex: 1},
  legalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  legalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
})
