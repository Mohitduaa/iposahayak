// Sign in: Google first, email and password under it.
//
// Both roads end in the same place — setUserFromLogin with the token the
// backend hands back — so everything past this screen treats a Google
// account and an email account alike.

import React, {useEffect, useRef, useState} from 'react'
import {ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View} from 'react-native'
import {Link, router} from 'expo-router'
import {Lock, Mail} from 'lucide-react-native'
import {useUser} from '@/hooks/useUser'
import {postJson} from '@/services/authApi'
import {GoogleSignInError, signInWithGoogle} from '@/services/googleSignIn'
import {track} from '@/services/analytics'
import AuthScreen from '@/components/auth/AuthScreen'
import AuthInput from '@/components/auth/AuthInput'
import PrimaryButton from '@/components/auth/PrimaryButton'
import GoogleButton from '@/components/auth/GoogleButton'
import OrDivider from '@/components/auth/OrDivider'
import FormError from '@/components/auth/FormError'
import {authPalette} from '@/components/auth/theme'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

interface Errors {
  email?: string
  password?: string
  form?: string
}

export default function LoginScreen() {
  const c = authPalette(useColorScheme() === 'dark')
  const {user, loading: userLoading, setUserFromLogin} = useUser()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState<'email' | 'google' | null>(null)
  const passwordRef = useRef<TextInput>(null)

  // Already signed in on this device: straight through
  useEffect(() => {
    if (!userLoading && user) router.replace('/(tabs)')
  }, [userLoading, user])

  const finish = async (data: {token: string; user: any}, method: 'email' | 'google') => {
    await setUserFromLogin(data)
    track.login(method)
    router.replace('/(tabs)')
  }

  const validate = () => {
    const next: Errors = {}
    if (!email.trim()) next.email = 'Enter your email address'
    else if (!EMAIL.test(email.trim())) next.email = 'That does not look like an email address'
    if (!password) next.password = 'Enter your password'
    setErrors(next)
    return !next.email && !next.password
  }

  const handleEmail = async () => {
    if (busy || !validate()) return
    setBusy('email')
    const reply = await postJson('/auth/login', {email: email.trim(), password})
    if (!reply.ok || !reply.data?.token) {
      setBusy(null)
      setErrors({
        form: reply.status === 400 ? 'Email or password is incorrect' : reply.data?.message || 'Sign in failed. Please try again.',
      })
      return
    }
    await finish(reply.data, 'email')
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

  if (userLoading) {
    return (
      <AuthScreen title='Welcome back'>
        <ActivityIndicator color={c.focus} style={{marginVertical: 40}} />
      </AuthScreen>
    )
  }

  return (
    <AuthScreen
      title='Welcome back'
      subtitle='Sign in to track IPOs, GMP and your allotment.'
      footer={
        <View style={styles.footerRow}>
          <Text style={[styles.footerText, {color: c.muted}]}>New to IPO Sahayak? </Text>
          <Link href='/(auth)/signup' asChild>
            <TouchableOpacity hitSlop={8}>
              <Text style={[styles.footerLink, {color: c.link}]}>Create account</Text>
            </TouchableOpacity>
          </Link>
        </View>
      }
    >
      <GoogleButton onPress={handleGoogle} loading={busy === 'google'} disabled={busy === 'email'} />
      <OrDivider label='or sign in with email' />

      <AuthInput
        label='Email'
        icon={<Mail size={19} color={c.muted} />}
        value={email}
        onChangeText={(t) => {
          setEmail(t)
          if (errors.email || errors.form) setErrors((e) => ({...e, email: undefined, form: undefined}))
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
          if (errors.password || errors.form) setErrors((e) => ({...e, password: undefined, form: undefined}))
        }}
        error={errors.password}
        placeholder='Your password'
        secure
        autoCapitalize='none'
        autoComplete='password'
        textContentType='password'
        returnKeyType='go'
        onSubmitEditing={handleEmail}
        editable={!busy}
      />

      <Link href='/(auth)/ForgotResetPasswordScreen' asChild>
        <TouchableOpacity style={styles.forgot} hitSlop={8} disabled={!!busy}>
          <Text style={[styles.forgotText, {color: c.link}]}>Forgot password?</Text>
        </TouchableOpacity>
      </Link>

      <FormError message={errors.form} />

      <PrimaryButton title='Sign In' onPress={handleEmail} loading={busy === 'email'} disabled={busy === 'google'} />
    </AuthScreen>
  )
}

const styles = StyleSheet.create({
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 18,
  },
  forgotText: {
    fontSize: 13.5,
    fontWeight: '600',
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
})
