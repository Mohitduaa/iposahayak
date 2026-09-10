// Forgot password, in two steps on the one screen: the email a code goes
// to, then the code and the new password. Ends on a "done" card that
// leads back to sign in.

import React, {useEffect, useRef, useState} from 'react'
import {StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View} from 'react-native'
import {router} from 'expo-router'
import {CheckCircle2, KeyRound, Lock, Mail} from 'lucide-react-native'
import {postJson} from '@/services/authApi'
import AuthScreen from '@/components/auth/AuthScreen'
import AuthInput from '@/components/auth/AuthInput'
import PrimaryButton from '@/components/auth/PrimaryButton'
import OtpInput from '@/components/auth/OtpInput'
import FormError from '@/components/auth/FormError'
import {authPalette} from '@/components/auth/theme'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const RESEND_SECONDS = 30

interface Errors {
  email?: string
  password?: string
  confirm?: string
  form?: string
}

export default function ForgotResetPasswordScreen() {
  const c = authPalette(useColorScheme() === 'dark')

  const [step, setStep] = useState<'email' | 'reset' | 'done'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState<'send' | 'resend' | 'reset' | null>(null)
  const [resendIn, setResendIn] = useState(0)
  const confirmRef = useRef<TextInput>(null)

  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  const clear = (key: keyof Errors) => {
    if (errors[key] || errors.form) setErrors((e) => ({...e, [key]: undefined, form: undefined}))
  }

  const sendCode = async (kind: 'send' | 'resend') => {
    setBusy(kind)
    const reply = await postJson('/auth/forgot', {email: email.trim().toLowerCase()})
    setBusy(null)
    if (!reply.ok) {
      setErrors(
        reply.status === 404
          ? {email: 'No account with this email. Check the spelling, or create one.'}
          : {form: reply.data?.message || 'Could not send the code. Please try again.'}
      )
      return false
    }
    setResendIn(RESEND_SECONDS)
    return true
  }

  const handleSend = async () => {
    if (busy) return
    if (!email.trim()) return setErrors({email: 'Enter your email address'})
    if (!EMAIL.test(email.trim())) return setErrors({email: 'That does not look like an email address'})
    setErrors({})
    if (await sendCode('send')) {
      setCode('')
      setStep('reset')
    }
  }

  const handleReset = async () => {
    if (busy) return
    const next: Errors = {}
    if (code.length !== 6) next.form = 'Enter the 6-digit code from the email'
    if (!password) next.password = 'Choose a new password'
    else if (password.length < 6) next.password = 'Use at least 6 characters'
    if (confirm !== password) next.confirm = 'Passwords do not match'
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy('reset')
    const reply = await postJson('/auth/restpassword', {email: email.trim().toLowerCase(), otp: code, newPassword: password})
    setBusy(null)
    if (!reply.ok) {
      const bad = /otp|expired|invalid/i.test(reply.data?.message || '')
      setErrors({form: bad ? 'That code is wrong or has expired. Send a new one.' : reply.data?.message || 'Could not reset the password'})
      return
    }
    setStep('done')
  }

  if (step === 'done') {
    return (
      <AuthScreen title='Password updated' subtitle='Sign in with your new password.'>
        <View style={[styles.doneIcon, {backgroundColor: c.tint}]}>
          <CheckCircle2 size={30} color={c.up} />
        </View>
        <PrimaryButton title='Back to Sign In' onPress={() => router.replace('/(auth)/login')} />
      </AuthScreen>
    )
  }

  if (step === 'reset') {
    return (
      <AuthScreen
        compact
        title='Reset your password'
        subtitle={`Enter the code we sent to ${email.trim()} and choose a new password.`}
        footer={
          <TouchableOpacity onPress={() => setStep('email')} hitSlop={8} disabled={!!busy}>
            <Text style={[styles.footerLink, {color: c.link}]}>Wrong email? Go back</Text>
          </TouchableOpacity>
        }
      >
        <Text style={[styles.label, {color: c.text}]}>6-digit code</Text>
        <OtpInput
          value={code}
          onChange={(v) => {
            setCode(v)
            if (errors.form) setErrors((e) => ({...e, form: undefined}))
          }}
          error={!!errors.form && code.length !== 6}
          autoFocus
        />
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

        <AuthInput
          label='New password'
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
          label='Confirm new password'
          icon={<KeyRound size={19} color={c.muted} />}
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
          onSubmitEditing={handleReset}
          editable={!busy}
        />

        <FormError message={errors.form} />
        <PrimaryButton title='Update Password' onPress={handleReset} loading={busy === 'reset'} disabled={busy === 'resend'} />
      </AuthScreen>
    )
  }

  return (
    <AuthScreen
      title='Forgot your password?'
      subtitle="Enter the email on your account and we'll send a code to reset it."
      footer={
        <TouchableOpacity onPress={() => router.back()} hitSlop={8} disabled={!!busy}>
          <Text style={[styles.footerLink, {color: c.link}]}>Back to Sign In</Text>
        </TouchableOpacity>
      }
    >
      <AuthInput
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
        returnKeyType='send'
        onSubmitEditing={handleSend}
        editable={!busy}
        autoFocus
      />
      <FormError message={errors.form} />
      <PrimaryButton title='Send Code' onPress={handleSend} loading={busy === 'send'} />
    </AuthScreen>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  doneIcon: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
  },
  footerText: {fontSize: 14},
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
})
